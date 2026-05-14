import React, { useState } from 'react';
import InquireButton from './inquire_button';

export default function PackageGrid({ initialPackages, regions = ['All'] }) {
  const [filter, setFilter] = useState('All');

  const filteredPackages = filter === 'All' 
    ? initialPackages 
    : initialPackages.filter(p => p.region?.trim().toLowerCase() === filter.toLowerCase());

    return (
    <div>
      {/* Dynamic Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-12 border-b border-border pb-6">
        {regions.map((region) => (
          <button
            key={region}
            onClick={() => setFilter(region)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              filter === region 
                ? 'bg-teal text-white shadow-md' 
                : 'bg-white text-ink-muted border border-border hover:border-teal hover:text-teal'
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      <p className="text-xs font-mono text-ink-muted uppercase tracking-widest mb-8">
        Showing {filteredPackages.length} Packages
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredPackages.map((pkg) => (
          <div key={pkg.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={pkg.image_url} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-teal px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {pkg.region}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-serif text-ink mb-4 group-hover:text-teal transition-colors leading-tight">{pkg.title}</h3>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="text-[10px] text-ink-muted uppercase tracking-widest mb-1">Starting from</p>
                  <p className="text-xl font-mono text-teal font-bold">₱{pkg.price.toLocaleString()}</p>
                </div>
                <InquireButton pkgId={pkg.id} pkgTitle={pkg.title} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <div className="text-center py-20 bg-sand rounded-2xl border border-dashed border-border">
          <p className="text-ink-muted font-serif text-xl">No packages found in {filter}.</p>
          <button onClick={() => setFilter('All')} className="text-teal font-bold mt-2 underline">View all destinations</button>
        </div>
      )}
    </div>
  );
}



