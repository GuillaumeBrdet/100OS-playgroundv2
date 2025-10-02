/* 1) Inline SVG loader:
   Replaces any element with class 'svg-inline' + data-src by fetching SVG text and inserting it.
   This gives you style control over the svg (stroke/fill) via CSS after inlining.
*/
async function inlineSvgs() {
  const nodes = document.querySelectorAll('.svg-inline[data-src]');
  await Promise.all(Array.from(nodes).map(async node => {
    const url = node.dataset.src;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed ' + url);
      const text = await res.text();
      node.innerHTML = text;
      node.querySelectorAll('[tabindex]').forEach(el => el.removeAttribute('tabindex'));
    } catch (err) {
      console.error('Failed to inline SVG', url, err);
    }
  }));
}

/* 2) Fetch and apply Unsplash background */
async function loadUnsplashBackground(query = 'nature,landscape') {
  const accessKey = 'hNW7fCcfsZNDJ9QFYa_bro9LdQPVksJmKq2R9l3I6tc';
  const stage = document.getElementById('stage');

  const existingAttribution = stage.querySelector('.unsplash-attribution');
  if (existingAttribution) {
    existingAttribution.remove();
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`
        }
      }
    );

    if (!response.ok) throw new Error('Failed to fetch from Unsplash');

    const data = await response.json();
    const imageUrl = data.urls.regular;
    const photographerName = data.user.name;
    const photographerUrl = data.user.links.html;
    const photoUrl = data.links.html;

    stage.style.backgroundImage = `url('${imageUrl}'), linear-gradient(180deg, #f9f8f5 0%, #fef5f6 100%)`;
    stage.style.backgroundSize = 'cover, 100% 100%';
    stage.style.backgroundPosition = 'center, center';

    const attribution = document.createElement('div');
    attribution.className = 'unsplash-attribution';
    attribution.innerHTML = `
      <span>Photo by <a href="${photographerUrl}?utm_source=100school_extension&utm_medium=referral" target="_blank" rel="noopener">${photographerName}</a> on <a href="${photoUrl}?utm_source=100school_extension&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a></span>
    `;
    stage.appendChild(attribution);

  } catch (err) {
    console.error('Failed to load Unsplash background:', err);
  }
}

function setupBackgroundControls() {
  const searchContainer = document.getElementById('search-container');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const toggleSearchBtn = document.getElementById('toggle-search-btn');
  const randomBtn = document.getElementById('random-bg-btn');

  toggleSearchBtn.addEventListener('click', () => {
    const isActive = searchContainer.classList.contains('active');
    if (isActive) {
      searchContainer.classList.remove('active');
      toggleSearchBtn.classList.remove('active');
    } else {
      searchContainer.classList.add('active');
      toggleSearchBtn.classList.add('active');
      searchInput.focus();
    }
  });

  const performSearch = () => {
    const query = searchInput.value.trim();
    if (query) {
      loadUnsplashBackground(query);
      searchInput.value = '';
      searchContainer.classList.remove('active');
      toggleSearchBtn.classList.remove('active');
    }
  };

  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  randomBtn.addEventListener('click', () => {
    loadUnsplashBackground('nature,landscape');
  });
}

/* 3) Minimal keyboard handling for icon buttons (optional): activate with Enter/Space */
function wireIconButtons() {
  const btns = document.querySelectorAll('.icon-btn');
  btns.forEach(b => {
    b.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        b.click();
      }
    });
    b.addEventListener('click', () => {
      console.log('icon clicked:', b.getAttribute('aria-label'));
    });
  });
}

/* Initialize everything once DOM is ready */
document.addEventListener('DOMContentLoaded', () => {
  inlineSvgs().then(()=>{});
  loadUnsplashBackground();
  setupBackgroundControls();
  wireIconButtons();
});


