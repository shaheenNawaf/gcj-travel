/**
 * Interactive Client Search Auto-Complete Engine for index.astro
 */
export function initHomepageSearch(regions, tourTypes) {
  const input = document.getElementById('hero-search-input');
  const suggestions = document.getElementById('suggestions');
  const sugDestinations = document.getElementById('sug-destinations');
  const sugTypes = document.getElementById('sug-types');
  const durationSelect = document.getElementById('hero-duration-select');
  const budgetSelect = document.getElementById('hero-budget-select');
  const searchBtn = document.getElementById('hero-search-btn');
  const tabs = document.querySelectorAll('.stab');

  if (!input || !suggestions || !searchBtn) return;

  let activeTab = 'all';

  // Toggle Search Category Tabs with explicit Tailwind colors
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        // Reset inactive styles
        t.classList.remove('text-teal', 'border-teal');
        t.classList.add('text-ink-muted/60', 'border-transparent');
      });
      // Set active styles
      tab.classList.add('text-teal', 'border-teal');
      tab.classList.remove('text-ink-muted/60', 'border-transparent');
      activeTab = tab.dataset.tab;
    });
  });

  // Suggestion Dropdown Filtering
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!q) { suggestions.hidden = true; return; }

    const matchDest = regions.filter(r => r.toLowerCase().includes(q));
    const matchType = tourTypes.filter(t => t.toLowerCase().includes(q));

    if (!matchDest.length && !matchType.length) { suggestions.hidden = true; return; }

    sugDestinations.innerHTML = '<p class="text-[9px] font-bold tracking-widest uppercase text-ink-muted/50 p-2 m-0">Destinations</p>';
    matchDest.slice(0, 5).forEach(r => {
      const btn = document.createElement('button');
      btn.className = 'w-full text-left p-2 hover:bg-sand hover:text-teal font-sans text-xs transition-colors border-none bg-none cursor-pointer';
      btn.textContent = r;
      btn.addEventListener('click', () => { input.value = r; suggestions.hidden = true; });
      sugDestinations.appendChild(btn);
    });

    sugTypes.innerHTML = '<p class="text-[9px] font-bold tracking-widest uppercase text-ink-muted/50 p-2 m-0">Tour Types</p>';
    matchType.slice(0, 4).forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'w-full text-left p-2 hover:bg-sand hover:text-teal font-sans text-xs transition-colors border-none bg-none cursor-pointer';
      btn.textContent = t;
      btn.addEventListener('click', () => { input.value = t; suggestions.hidden = true; });
      sugTypes.appendChild(btn);
    });

    suggestions.hidden = false;
  });

  // Close dropdown on outside click
  document.addEventListener('click', e => {
    if (!document.getElementById('hero-search-card')?.contains(e.target)) {
      suggestions.hidden = true;
    }
  });

  // Quick Tags Pre-fill selection
  document.querySelectorAll('.qt').forEach(qt => {
    qt.addEventListener('click', () => {
      input.value = qt.dataset.type;
      suggestions.hidden = true;
    });
  });

  function buildSearchURL() {
    const q = input.value.trim();
    const duration = durationSelect.value;
    const budget = budgetSelect.value;
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (duration) params.set('duration', duration);
    if (budget) params.set('budget', budget);
    if (activeTab !== 'all') params.set('type', activeTab);
    const base = activeTab === 'domestic' ? '/domestic' : activeTab === 'international' ? '/international' : '/packages';
    return `${base}${params.toString() ? '?' + params.toString() : ''}`;
  }

  searchBtn.addEventListener('click', () => { window.location.href = buildSearchURL(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { suggestions.hidden = true; window.location.href = buildSearchURL(); }
  });
}