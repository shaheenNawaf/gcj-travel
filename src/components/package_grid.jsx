import React, { useState, useEffect, useMemo } from 'react';
import InquireButton from './inquire_button';

// ─── Skeleton card shown during loading ───────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="skel-card" aria-hidden="true">
      <div className="skel-img skel-pulse" />
      <div className="skel-body">
        <div className="skel-line skel-pulse" style={{ width: '40%', height: '10px', marginBottom: '10px' }} />
        <div className="skel-line skel-pulse" style={{ width: '85%', height: '22px', marginBottom: '6px' }} />
        <div className="skel-line skel-pulse" style={{ width: '60%', height: '14px', marginBottom: '20px' }} />
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {[1,2,3].map(i => (
            <div key={i} className="skel-line skel-pulse" style={{ width: '60px', height: '22px', borderRadius: '4px' }} />
          ))}
        </div>
        <div className="skel-footer">
          <div className="skel-line skel-pulse" style={{ width: '80px', height: '20px' }} />
          <div className="skel-line skel-pulse" style={{ width: '70px', height: '36px', borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ query, filter, onReset }) {
  const hasSearch = query || filter !== 'All';
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {hasSearch ? '🔍' : '🗺️'}
      </div>
      <h3 className="empty-title">
        {hasSearch ? 'No packages found' : 'No packages available yet'}
      </h3>
      <p className="empty-sub">
        {hasSearch
          ? `We couldn't find any packages matching "${query || filter}". Try a different keyword or browse all destinations.`
          : 'Our team is putting together amazing packages. Check back soon or reach out directly.'}
      </p>
      {hasSearch && (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="empty-btn-primary" onClick={onReset}>
            Clear Search
          </button>
          <a className="empty-btn-secondary" href="/contact">
            Ask a Specialist
          </a>
        </div>
      )}
      {!hasSearch && (
        <a className="empty-btn-primary" href="/contact">
          Contact Us
        </a>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PackageGrid({ initialPackages = [], regions = ['All'], loading = false }) {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [draftQuery, setDraftQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [durationFilter, setDurationFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [isLoading, setIsLoading] = useState(loading);

  // Read URL params on mount
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

    // Simulate loading state for a brief moment on first load
    if (initialPackages.length === 0) {
      setIsLoading(true);
      const t = setTimeout(() => setIsLoading(false), 900);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(t);
    }
  }, []);

  // Filtering + search logic
  const filteredPackages = useMemo(() => {
    let list = [...initialPackages];

    // Region tab filter
    if (filter !== 'All') {
      list = list.filter(p => p.region?.trim().toLowerCase() === filter.toLowerCase());
    }

    // Keyword search — title, region, tour_type, inclusions, days
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p => {
        const inTitle = p.title?.toLowerCase().includes(q);
        const inRegion = p.region?.toLowerCase().includes(q);
        const inType = p.tour_type?.toLowerCase().includes(q);
        const inInclusions = p.inclusions?.some(inc => inc.toLowerCase().includes(q));
        const inDays = String(p.days).includes(q) || `${p.days} day`.includes(q) || `${p.days}d`.includes(q);
        return inTitle || inRegion || inType || inInclusions || inDays;
      });
    }

    // Duration filter
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

    // Budget filter
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

    // Sorting
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
    <div>
      {/* ── Search + filter bar ── */}
      <div className="grid-controls">
        {/* Search input */}
        <form className="grid-search" onSubmit={handleSearch}>
          <span className="grid-search-icon">🔍</span>
          <input
            type="text"
            value={draftQuery}
            onChange={e => setDraftQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setQuery(draftQuery)}
            placeholder="Search by destination, type, or inclusion…"
            className="grid-search-input"
          />
          {draftQuery && (
            <button
              type="button"
              className="grid-search-clear"
              onClick={() => { setDraftQuery(''); setQuery(''); }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </form>

        {/* Duration filter */}
        <select
          value={durationFilter}
          onChange={e => setDurationFilter(e.target.value)}
          className="grid-select"
        >
          <option value="">Any duration</option>
          <option value="1-3">1–3 days</option>
          <option value="4-6">4–6 days</option>
          <option value="7-10">7–10 days</option>
          <option value="11+">11+ days</option>
        </select>

        {/* Budget filter */}
        <select
          value={budgetFilter}
          onChange={e => setBudgetFilter(e.target.value)}
          className="grid-select"
        >
          <option value="">Any budget</option>
          <option value="0-5000">Under ₱5,000</option>
          <option value="5000-15000">₱5,000 – ₱15,000</option>
          <option value="15000-30000">₱15,000 – ₱30,000</option>
          <option value="30000+">₱30,000+</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="grid-select"
        >
          <option value="default">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="days-asc">Shortest First</option>
        </select>
      </div>

      {/* ── Region tabs ── */}
      <div className="region-tabs">
        {regions.map(region => (
          <button
            key={region}
            onClick={() => setFilter(region)}
            className={`rtab ${filter === region ? 'rtab-active' : ''}`}
          >
            {region}
          </button>
        ))}
        {hasActiveFilters && (
          <button className="rtab rtab-clear" onClick={resetAll}>
            ✕ Clear all
          </button>
        )}
      </div>

      {/* ── Results meta ── */}
      {!isLoading && (
        <div className="results-meta">
          {hasActiveFilters ? (
            <span>
              <strong>{filteredPackages.length}</strong> package{filteredPackages.length !== 1 ? 's' : ''} found
              {query && <span className="meta-query"> for "<em>{query}</em>"</span>}
            </span>
          ) : (
            <span><strong>{filteredPackages.length}</strong> packages available</span>
          )}
        </div>
      )}

      {/* ── Package grid ── */}
      {isLoading ? (
        <div className="pkg-grid">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filteredPackages.length === 0 ? (
        <EmptyState query={query} filter={filter} onReset={resetAll} />
      ) : (
        <div className="pkg-grid">
          {filteredPackages.map(pkg => (
            <div key={pkg.id} className="pkg-card group">
              {/* Image */}
              <a href={`/packages/${pkg.id}`} className="pkg-img-wrap">
                <img src={pkg.image_url} alt={pkg.title} className="pkg-img" />
                <div className="pkg-region">{pkg.region}</div>
                {pkg.is_featured && <div className="pkg-featured-badge">Featured</div>}
                {pkg.difficulty && (
                  <div className={`pkg-diff pkg-diff-${pkg.difficulty?.toLowerCase()}`}>
                    {pkg.difficulty}
                  </div>
                )}
              </a>

              {/* Body */}
              <div className="pkg-body">
                {pkg.tour_type && <p className="pkg-type">{pkg.tour_type}</p>}
                <h3 className="pkg-title">
                  <a href={`/packages/${pkg.id}`}>{pkg.title}</a>
                </h3>
                <div className="pkg-tags">
                  <span className="pkg-tag pkg-tag-days">{pkg.days} days</span>
                  {pkg.inclusions?.slice(0, 2).map(inc => (
                    <span key={inc} className="pkg-tag">{inc}</span>
                  ))}
                  {pkg.inclusions?.length > 2 && (
                    <span className="pkg-tag-more">+{pkg.inclusions.length - 2}</span>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="pkg-footer">
                <div>
                  <p className="pkg-from">Starting from</p>
                  <p className="pkg-price">₱{(pkg.price || 0).toLocaleString()}</p>
                </div>
                <InquireButton pkgId={pkg.id} pkgTitle={pkg.title} />
              </div>

              <a href={`/packages/${pkg.id}`} className="pkg-detail-link">
                View Details
              </a>
            </div>
          ))}
        </div>
      )}

      <style>{`
        /* ── Controls ── */
        .grid-controls {
          display: grid;
          grid-template-columns: 1fr repeat(3, auto);
          gap: 10px;
          margin-bottom: 20px;
          align-items: center;
        }
        @media (max-width: 768px) {
          .grid-controls { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .grid-controls { grid-template-columns: 1fr; }
        }

        .grid-search {
          position: relative;
          display: flex;
          align-items: center;
          background: white;
          border: 1.5px solid #e2ddd7;
          border-radius: 10px;
          padding: 0 14px;
          transition: border-color 0.2s;
        }
        .grid-search:focus-within { border-color: #1a6b6b; }
        .grid-search-icon { font-size: 15px; flex-shrink: 0; margin-right: 8px; }
        .grid-search-input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 14px;
          padding: 12px 0;
          color: #111827;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
        }
        .grid-search-input::placeholder { color: #9ca3af; }
        .grid-search-clear {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13px;
          color: #9ca3af;
          padding: 4px;
          line-height: 1;
          flex-shrink: 0;
        }
        .grid-search-clear:hover { color: #374151; }

        .grid-select {
          background: white;
          border: 1.5px solid #e2ddd7;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: #374151;
          cursor: pointer;
          outline: none;
          transition: border-color 0.2s;
          white-space: nowrap;
        }
        .grid-select:focus { border-color: #1a6b6b; }

        /* ── Region tabs ── */
        .region-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
          border-bottom: 1px solid #e2ddd7;
          padding-bottom: 20px;
        }
        .rtab {
          padding: 8px 20px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 600;
          border: 1.5px solid #e2ddd7;
          background: white;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .rtab:hover { border-color: #1a6b6b; color: #1a6b6b; }
        .rtab-active {
          background: #1a6b6b !important;
          border-color: #1a6b6b !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(26,107,107,0.25);
        }
        .rtab-clear {
          background: #fee2e2;
          border-color: #fee2e2;
          color: #dc2626;
          margin-left: auto;
        }
        .rtab-clear:hover { background: #fecaca; border-color: #fecaca; color: #b91c1c; }

        /* ── Results meta ── */
        .results-meta {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 24px;
          font-family: 'DM Mono', monospace;
        }
        .results-meta strong { color: #1a6b6b; }
        .meta-query { color: #374151; }
        .meta-query em { font-style: normal; font-weight: 600; }

        /* ── Package grid ── */
        .pkg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 28px;
        }

        /* ── Package card ── */
        .pkg-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2ddd7;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .pkg-card:hover {
          box-shadow: 0 16px 48px rgba(0,0,0,0.12);
          transform: translateY(-4px);
        }

        .pkg-img-wrap {
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
          display: block;
        }
        .pkg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .pkg-card:hover .pkg-img { transform: scale(1.06); }

        .pkg-region {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(8px);
          color: #1a6b6b;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 4px 10px;
          border-radius: 99px;
        }
        .pkg-featured-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #e8562a;
          color: white;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 3px 8px;
          border-radius: 99px;
        }
        .pkg-diff {
          position: absolute;
          bottom: 12px;
          right: 12px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 3px 10px;
          border-radius: 99px;
          background: rgba(0,0,0,0.45);
          color: white;
          backdrop-filter: blur(4px);
        }
        .pkg-diff-easy { background: rgba(26,107,107,0.7); }
        .pkg-diff-moderate { background: rgba(201,152,58,0.8); }
        .pkg-diff-challenging { background: rgba(232,86,42,0.8); }

        .pkg-body { padding: 20px 20px 8px; flex: 1; }
        .pkg-type {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #1a6b6b;
          margin: 0 0 6px;
        }
        .pkg-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          color: #0d1117;
          margin: 0 0 14px;
          line-height: 1.25;
        }
        .pkg-title a {
          text-decoration: none;
          color: inherit;
          transition: color 0.2s;
        }
        .pkg-title a:hover { color: #1a6b6b; }

        .pkg-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .pkg-tag {
          font-size: 10px;
          font-family: 'DM Sans', sans-serif;
          color: #6b7280;
          border: 1px solid #e2ddd7;
          padding: 3px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .pkg-tag-days {
          background: #f5f0e8;
          border-color: #f5f0e8;
          color: #374151;
          font-weight: 700;
          font-family: 'DM Mono', monospace;
        }
        .pkg-tag-more {
          font-size: 10px;
          color: #9ca3af;
          padding: 3px 6px;
        }

        .pkg-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px 0;
          border-top: 1px solid #f0ece6;
          margin: 0 0 0;
        }
        .pkg-from {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #9ca3af;
          margin: 0 0 2px;
        }
        .pkg-price {
          font-family: 'DM Mono', monospace;
          font-size: 20px;
          font-weight: 700;
          color: #1a6b6b;
          margin: 0;
        }
        .pkg-detail-link {
          display: block;
          text-align: center;
          padding: 12px;
          margin: 12px 20px 20px;
          border: 1.5px solid #e2ddd7;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #6b7280;
          text-decoration: none;
          transition: all 0.2s;
        }
        .pkg-detail-link:hover { border-color: #1a6b6b; color: #1a6b6b; }

        /* ── Skeleton ── */
        .skel-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2ddd7;
        }
        .skel-img {
          width: 100%;
          aspect-ratio: 4/3;
          background: #f0ede8;
        }
        .skel-body { padding: 20px; }
        .skel-line {
          background: #f0ede8;
          border-radius: 6px;
          display: block;
        }
        .skel-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f0ece6;
          margin-top: 16px;
        }
        .skel-pulse {
          animation: skelPulse 1.4s ease-in-out infinite;
        }
        @keyframes skelPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }

        /* ── Empty state ── */
        .empty-state {
          text-align: center;
          padding: 72px 24px;
          background: #faf8f5;
          border: 2px dashed #e2ddd7;
          border-radius: 20px;
        }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        .empty-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          color: #0d1117;
          margin: 0 0 12px;
          font-weight: 400;
        }
        .empty-sub {
          font-size: 15px;
          color: #6b7280;
          max-width: 420px;
          margin: 0 auto 28px;
          line-height: 1.6;
        }
        .empty-btn-primary {
          display: inline-block;
          background: #1a6b6b;
          color: white;
          border: none;
          padding: 12px 28px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .empty-btn-primary:hover { background: #124d4d; }
        .empty-btn-secondary {
          display: inline-block;
          background: white;
          color: #374151;
          border: 1.5px solid #e2ddd7;
          padding: 12px 28px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
        }
        .empty-btn-secondary:hover { border-color: #1a6b6b; color: #1a6b6b; }
      `}</style>
    </div>
  );
}