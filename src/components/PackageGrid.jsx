import React, { useState, useEffect, useMemo } from 'react';
import InquireButton from './InquireButton';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border" aria-hidden="true">
      <div className="w-full aspect-[4/3] bg-surface-alt animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="w-2/5 h-2.5 bg-surface-alt rounded animate-pulse" />
        <div className="w-5/6 h-5.5 bg-surface-alt rounded animate-pulse" />
        <div className="w-3/5 h-3.5 bg-surface-alt rounded animate-pulse" />
        <div className="flex gap-1.5 pt-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-[60px] h-[22px] bg-surface-alt rounded animate-pulse" />
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
          <div className="w-20 h-5 bg-surface-alt rounded animate-pulse" />
          <div className="w-[70px] h-9 bg-surface-alt rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ query, filter, onReset }) {
  const hasActiveFilters = query || filter !== 'All';
  return (
    <div className="text-center py-18 px-6 bg-surface border-2 border-dashed border-border rounded-2xl">
      <div className="text-5xl mb-4">{hasActiveFilters ? '🔍' : '🗺️'}</div>
      <h3 className="font-serif text-3xl text-ink mb-3 font-normal">
        {hasActiveFilters ? 'No packages found' : 'No packages available yet'}
      </h3>
      <p className="text-ink-muted text-sm max-w-[420px] mx-auto mb-7 leading-relaxed">
        {hasActiveFilters
          ? `We couldn't find any packages matching "${query || filter}". Try a different keyword or browse all destinations.`
          : 'Our team is putting together amazing packages. Check back soon or reach out directly.'}
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        {hasActiveFilters && (
          <button 
            className="px-7 py-3 bg-teal hover:bg-teal-dark text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            onClick={onReset}
          >
            Clear Search
          </button>
        )}
        <a 
          className="px-7 py-3 bg-white hover:text-teal border border-border hover:border-teal text-ink-muted text-xs font-bold rounded-xl transition-all"
          href="/contact"
        >
          Ask a Specialist
        </a>
      </div>
    </div>
  );
}

/**
 * Dynamic Tour Catalog Package Grid Component
 * @param {Object} props
 * @param {any[]} [props.initialPackages] - List of tour packages to display
 * @param {string[]} [props.regions] - Filter categories to display
 * @param {boolean} [props.loading] - Pre-loader indicator flag
 */

export default function PackageGrid({ initialPackages = [], regions = ['All'], loading = false }) {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [draftQuery, setDraftQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [durationFilter, setDurationFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const dur = params.get('duration') || '';
    const bud = params.get('budget') || '';
    const typ = params.get('type');

    if (q) { setQuery(q); setDraftQuery(q); }
    if (dur) setDurationFilter(dur);
    if (bud) setBudgetFilter(bud);
    if (typ && regions.includes(typ)) setFilter(typ);

    const timer = setTimeout(() => setIsLoading(false), initialPackages.length === 0 ? 900 : 300);
    return () => clearTimeout(timer);
  }, []);

  const filteredPackages = useMemo(() => {
    let list = [...initialPackages];

    if (filter !== 'All') {
      list = list.filter(p => p.region?.trim().toLowerCase() === filter.toLowerCase());
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p => {
        return (
          p.title?.toLowerCase().includes(q) ||
          p.region?.toLowerCase().includes(q) ||
          p.tour_type?.toLowerCase().includes(q) ||
          p.inclusions?.some(inc => inc.toLowerCase().includes(q)) ||
          String(p.days).includes(q) ||
          `${p.days} day`.includes(q)
        );
      });
    }

    if (durationFilter) {
      list = list.filter(p => {
        const d = p.days || 0;
        if (durationFilter === '1-3') return d >= 1 && d <= 3;
        if (durationFilter === '4-6') return d >= 4 && d <= 6;
        if (durationFilter === '7-10') return d >= 7 && d <= 10;
        if (durationFilter === '11+') return d >= 11;
        return true;
      });
    }

    if (budgetFilter) {
      list = list.filter(p => {
        const price = p.price || 0;
        if (budgetFilter === '0-5000') return price < 5000;
        if (budgetFilter === '5000-15000') return price >= 5000 && price < 15000;
        if (budgetFilter === '15000-30000') return price >= 15000 && price < 30000;
        if (budgetFilter === '30000+') return price >= 30000;
        return true;
      });
    }

    if (sortBy === 'price-asc') list.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === 'price-desc') list.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sortBy === 'days-asc') list.sort((a, b) => (a.days || 0) - (b.days || 0));

    return list;
  }, [initialPackages, filter, query, durationFilter, budgetFilter, sortBy]);

  const hasActiveFilters = query || filter !== 'All' || durationFilter || budgetFilter;

  function resetAll() {
    setFilter('All');
    setQuery('');
    setDraftQuery('');
    setDurationFilter('');
    setBudgetFilter('');
    setSortBy('default');
  }

  function handleSearch(e) {
    e.preventDefault();
    setQuery(draftQuery);
  }

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Controls Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 items-center">
        
        {/* Keyword Search Form */}
        <form className="relative flex items-center bg-white border border-border rounded-xl px-3.5 focus-within:border-teal transition-colors duration-200" onSubmit={handleSearch}>
          <span className="text-sm mr-2 text-ink-muted">🔍</span>
          <input
            type="text"
            value={draftQuery}
            onChange={e => setDraftQuery(e.target.value)}
            placeholder="Search destination, type, or inclusion…"
            className="w-full py-3 text-sm text-ink bg-transparent border-none outline-none"
          />
          {draftQuery && (
            <button
              type="button"
              className="p-1 text-xs text-ink-muted hover:text-ink cursor-pointer bg-none border-none"
              onClick={() => { setDraftQuery(''); setQuery(''); }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </form>

        {/* Duration Select */}
        <select
          value={durationFilter}
          onChange={e => setDurationFilter(e.target.value)}
          className="bg-white border border-border rounded-xl py-3 px-4 text-sm text-ink-muted outline-none cursor-pointer focus:border-teal transition-colors"
        >
          <option value="">Any duration</option>
          <option value="1-3">1–3 days</option>
          <option value="4-6">4–6 days</option>
          <option value="7-10">7–10 days</option>
          <option value="11+">11+ days</option>
        </select>

        {/* Budget Select */}
        <select
          value={budgetFilter}
          onChange={e => setBudgetFilter(e.target.value)}
          className="bg-white border border-border rounded-xl py-3 px-4 text-sm text-ink-muted outline-none cursor-pointer focus:border-teal transition-colors"
        >
          <option value="">Any budget</option>
          <option value="0-5000">Under ₱5,000</option>
          <option value="5000-15000">₱5,000 – ₱15,000</option>
          <option value="15000-30000">₱15,000 – ₱30,000</option>
          <option value="30000+">₱30,000+</option>
        </select>

        {/* Sorting Select */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-white border border-border rounded-xl py-3 px-4 text-sm text-ink-muted outline-none cursor-pointer focus:border-teal transition-colors"
        >
          <option value="default">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="days-asc">Shortest First</option>
        </select>
      </div>

      {/* Regional Tab Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-5">
        {regions.map(region => (
          <button
            key={region}
            onClick={() => setFilter(region)}
            className={`px-5 py-2 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200 ${
              filter === region 
                ? 'bg-teal border-teal text-white shadow-md shadow-teal/20' 
                : 'bg-white border-border text-ink-muted hover:border-teal hover:text-teal'
            }`}
          >
            {region}
          </button>
        ))}
        {hasActiveFilters && (
          <button 
            className="ml-auto px-4 py-2 rounded-full text-xs font-semibold bg-red-100 border-red-100 text-red-600 hover:bg-red-200 cursor-pointer transition-colors" 
            onClick={resetAll}
          >
            ✕ Clear all
          </button>
        )}
      </div>

      {/* Grid Results Meta */}
      {!isLoading && (
        <div className="text-xs text-ink-muted font-mono uppercase tracking-wider mb-2">
          {hasActiveFilters ? (
            <span>
              <strong className="text-teal font-bold">{filteredPackages.length}</strong> matching package{filteredPackages.length !== 1 ? 's' : ''}
              {query && <span> for "<em>{query}</em>"</span>}
            </span>
          ) : (
            <span><strong className="text-teal font-bold">{filteredPackages.length}</strong> tours cataloged</span>
          )}
        </div>
      )}

      {/* Packages Grid Rendering */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filteredPackages.length === 0 ? (
        <EmptyState query={query} filter={filter} onReset={resetAll} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredPackages.map(pkg => (
            <div key={pkg.id} className="group bg-white rounded-2xl overflow-hidden border border-border flex flex-col h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative">
              
              {/* Image & Badge Overlay Wrap */}
              <a href={`/packages/${pkg.id}`} className="relative aspect-[4/3] overflow-hidden block flex-shrink-0">
                <img 
                  src={pkg.image_url} 
                  alt={pkg.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                />
                <div className="absolute top-3 left-3 bg-white/92 backdrop-blur-md text-teal text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {pkg.region}
                </div>
                {pkg.is_featured && (
                  <div className="absolute top-3 right-3 bg-coral text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Featured
                  </div>
                )}
                {pkg.difficulty && (
                  <div className={`absolute bottom-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white backdrop-blur-md ${
                    pkg.difficulty.toLowerCase() === 'easy' ? 'bg-teal/70' :
                    pkg.difficulty.toLowerCase() === 'moderate' ? 'bg-amber-500/80' : 'bg-coral/80'
                  }`}>
                    {pkg.difficulty}
                  </div>
                )}
              </a>

              {/* Card Content Height alignment [2] */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {pkg.tour_type && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-teal">{pkg.tour_type}</p>
                  )}
                  <h3 className="font-serif text-2xl text-ink leading-tight">
                    <a href={`/packages/${pkg.id}`} className="hover:text-teal transition-colors">{pkg.title}</a>
                  </h3>
                  
                  {/* Metadata Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-mono font-bold bg-sand text-ink px-2 py-0.5 rounded uppercase">{pkg.days} days</span>
                    {pkg.inclusions?.slice(0, 2).map(inc => (
                      <span key={inc} className="text-[10px] text-ink-muted border border-border px-2 py-0.5 rounded uppercase tracking-tighter">
                        {inc}
                      </span>
                    ))}
                    {pkg.inclusions?.length > 2 && (
                      <span className="text-[10px] text-ink-muted/50 py-0.5">+{pkg.inclusions.length - 2}</span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer is now absolutely aligned to bottom [2] */}
                <div className="flex justify-between items-center pt-4 border-t border-border mt-6">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-ink-muted/60 mb-0.5">Starting from</p>
                    <p className="font-mono text-xl font-bold text-teal">₱{(pkg.price || 0).toLocaleString()}</p>
                  </div>
                  <InquireButton pkgId={pkg.id} pkgTitle={pkg.title} />
                </div>
              </div>

              <a href={`/packages/${pkg.id}`} className="block text-center border border-border hover:border-teal rounded-xl text-xs font-bold uppercase tracking-wider text-ink-muted hover:text-teal py-3 mx-5 mb-5 transition-colors">
                View Details
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}