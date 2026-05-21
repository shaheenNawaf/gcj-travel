import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase_client';

interface Props { 
  initialData?: any; 
  isEdit?: boolean; 
}

interface ItineraryDay {
  title: string;
  details: string;
}

const TOUR_TYPES = ['Beach & Island', 'Cultural & Heritage', 'Adventure', 'City Tour', 'Food & Culinary', 'Nature & Wildlife', 'Pilgrimage', 'Honeymoon'];
const DIFFICULTIES = ['Easy', 'Moderate', 'Challenging'];

export default function PackageForm({ initialData = null, isEdit = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [images, setImages] = useState<string[]>(
    initialData?.images?.length ? initialData.images
    : initialData?.image_url ? [initialData.image_url]
    : []
  );
  
  // Parse existing dynamic itinerary day strings back into Title / Details structures
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>(
    initialData?.itinerary_days?.map((day: string) => {
      const parts = day.split('\n');
      return {
        title: parts[0] || '',
        details: parts.slice(1).join('\n') || ''
      };
    }) || []
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: File[]) => {
    const urls: string[] = [];
    for (const file of files) {
      const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('tour-images').upload(filePath, file);
      if (error) { alert(error.message); continue; }
      const { data } = supabase.storage.from('tour-images').getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }
    setImages(prev => [...prev, ...urls]);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    await uploadFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) await uploadFiles(files);
  };

  const removeImage = (index: number) => setImages(prev => prev.filter((_, i) => i !== index));

  const moveFirst = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      const [item] = updated.splice(index, 1);
      updated.unshift(item);
      return updated;
    });
  };

  // Itinerary Management Functions
  const addItineraryDay = () => {
    setItineraryDays([...itineraryDays, { title: '', details: '' }]);
  };

  const removeItineraryDay = (index: number) => {
    setItineraryDays(itineraryDays.filter((_, i) => i !== index));
  };

  const handleDayChange = (index: number, field: keyof ItineraryDay, value: string) => {
    const updated = [...itineraryDays];
    updated[index][field] = value;
    setItineraryDays(updated);
  };

  const moveItineraryDay = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === itineraryDays.length - 1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...itineraryDays];
    const [temp] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, temp);
    setItineraryDays(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Compile custom title and details back to raw single newline-separated strings
    const compiledItinerary = itineraryDays
      .map(d => `${d.title.trim()}\n${d.details.trim()}`)
      .filter(str => str.trim() !== '');

    const payload = {
      title: formData.get('title'),
      region: formData.get('region'),
      price: parseInt(formData.get('price') as string),
      days: parseInt(formData.get('days') as string),
      image_url: images[0] || '',
      images: images,
      inclusions: (formData.get('inclusions') as string).split(',').map(i => i.trim()).filter(Boolean),
      is_international: formData.get('is_international') === 'on',
      is_featured: formData.get('is_featured') === 'on',
      description_md: formData.get('description_md'),
      tour_type: formData.get('tour_type'),
      difficulty: formData.get('difficulty'),
      min_pax: parseInt(formData.get('min_pax') as string) || null,
      max_pax: parseInt(formData.get('max_pax') as string) || null,
      departure_info: formData.get('departure_info'),
      itinerary_days: compiledItinerary, // Map dynamic day segments
      admin_notes: formData.get('admin_notes'),
      status: 'active'
    };

    const { error } = isEdit
      ? await supabase.from('packages').update(payload).eq('id', initialData.id)
      : await supabase.from('packages').insert([payload]);

    if (error) alert(error.message);
    else window.location.href = '/admin/packages';
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

      {/* ── Section 1: Basic Info ── */}
      <section className="bg-white p-8 rounded-2xl border border-border flex flex-col gap-5">
        <SectionHeader number="1" title="Basic Information" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <FieldLabel>Journey Title</FieldLabel>
            <input
              required
              name="title"
              type="text"
              defaultValue={initialData?.title}
              placeholder="e.g. El Nido Island Hopping Adventure"
              className="w-full py-2 bg-transparent border-b border-border rounded-none font-serif text-3xl outline-none focus:border-teal transition-colors"
            />
          </div>

          <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2.5 bg-sand py-3.5 px-5 rounded-xl cursor-pointer flex-1">
              <input type="checkbox" name="is_international" defaultChecked={initialData?.is_international} className="w-4.5 h-4.5 accent-teal" />
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">International Package</span>
            </label>
            <label className="flex items-center gap-2.5 bg-sand py-3.5 px-5 rounded-xl cursor-pointer flex-1">
              <input type="checkbox" name="is_featured" defaultChecked={initialData?.is_featured} className="w-4.5 h-4.5 accent-coral" />
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Featured on Homepage</span>
            </label>
          </div>

          <div>
            <FieldLabel>Tour Type</FieldLabel>
            <select name="tour_type" defaultValue={initialData?.tour_type || ''} className="w-full py-3 px-4 border border-border rounded-xl text-sm text-ink bg-surface outline-none focus:border-teal transition-colors">
              <option value="">Select a type...</option>
              {TOUR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <FieldLabel>Difficulty</FieldLabel>
            <select name="difficulty" defaultValue={initialData?.difficulty || ''} className="w-full py-3 px-4 border border-border rounded-xl text-sm text-ink bg-surface outline-none focus:border-teal transition-colors">
              <option value="">Select difficulty...</option>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <FieldLabel>Region / Destination</FieldLabel>
            <input name="region" defaultValue={initialData?.region} placeholder="e.g. Palawan or South Korea" className="w-full py-3 px-4 border border-border rounded-xl text-sm text-ink bg-surface outline-none focus:border-teal transition-colors" />
          </div>

          <div>
            <FieldLabel>Duration (Days)</FieldLabel>
            <input name="days" type="number" min="1" defaultValue={initialData?.days} placeholder="e.g. 5" className="w-full py-3 px-4 border border-border rounded-xl text-sm text-ink bg-surface outline-none focus:border-teal transition-colors" />
          </div>

          <div>
            <FieldLabel>Price (₱ per person)</FieldLabel>
            <input name="price" type="number" min="0" defaultValue={initialData?.price} placeholder="e.g. 12500" className="w-full py-3 px-4 border border-border rounded-xl text-sm text-ink bg-surface outline-none focus:border-teal transition-colors" />
          </div>

          <div>
            <FieldLabel>Departure Info</FieldLabel>
            <input name="departure_info" defaultValue={initialData?.departure_info} placeholder="e.g. Daily / Every weekend / On request" className="w-full py-3 px-4 border border-border rounded-xl text-sm text-ink bg-surface outline-none focus:border-teal transition-colors" />
          </div>

          <div>
            <FieldLabel>Min Pax</FieldLabel>
            <input name="min_pax" type="number" min="1" defaultValue={initialData?.min_pax} placeholder="e.g. 2" className="w-full py-3 px-4 border border-border rounded-xl text-sm text-ink bg-surface outline-none focus:border-teal transition-colors" />
          </div>

          <div>
            <FieldLabel>Max Pax</FieldLabel>
            <input name="max_pax" type="number" min="1" defaultValue={initialData?.max_pax} placeholder="e.g. 20" className="w-full py-3 px-4 border border-border rounded-xl text-sm text-ink bg-surface outline-none focus:border-teal transition-colors" />
          </div>
        </div>
      </section>

      {/* ── Section 2: Photos ── */}
      <section className="bg-white p-8 rounded-2xl border border-border flex flex-col gap-5">
        <SectionHeader number="2" title="Photos" subtitle="First photo is the cover image. Click or drag & drop to upload multiple." />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
            dragging ? 'border-teal bg-teal-pale' : 'border-border bg-surface hover:bg-sand'
          }`}
        >
          <div className="text-4xl mb-2.5">🖼️</div>
          <p className="font-bold text-ink mb-1 text-sm">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-ink-muted">
            PNG, JPG, WEBP supported · Hold Ctrl / Cmd to select multiple files
          </p>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
            {images.map((url, i) => (
              <div key={url} className={`rounded-xl overflow-hidden bg-white border ${i === 0 ? 'border-teal ring-2 ring-teal/15' : 'border-border'}`}>
                <div className="relative">
                  <img src={url} className="w-full h-28 object-cover block" />
                  {i === 0 && (
                    <div className="absolute top-1.5 left-1.5 bg-teal text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Cover
                    </div>
                  )}
                </div>
                <div className="flex gap-1 p-2">
                  {i !== 0 && (
                    <button type="button" onClick={() => moveFirst(i)}
                      className="flex-1 text-[10px] font-bold p-1 bg-teal-pale text-teal rounded hover:bg-teal hover:text-white transition-colors cursor-pointer">
                      Set Cover
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(i)}
                    className="flex-1 text-[10px] font-bold p-1 bg-red-50 text-red-600 rounded hover:bg-red-600 hover:text-white transition-colors cursor-pointer">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Section 3: Package Details & Dynamic Itinerary Days ── */}
      <section className="bg-white p-8 rounded-2xl border border-border flex flex-col gap-5">
        <SectionHeader number="3" title="Package Details" />
        <div className="flex flex-col gap-5">
          <div>
            <FieldLabel>Inclusions <span className="text-ink-muted/50 font-normal normal-case">(comma separated)</span></FieldLabel>
            <input
              name="inclusions"
              defaultValue={initialData?.inclusions?.join(', ')}
              placeholder="e.g. Airfare, Hotel, Breakfast, Tour Guide, Airport Transfers"
              className="w-full py-3 px-4 border border-border rounded-xl text-sm text-ink bg-surface outline-none focus:border-teal transition-colors"
            />
          </div>
          <div>
            <FieldLabel>Short Description <span className="text-ink-muted/50 font-normal normal-case">(Markdown support)</span></FieldLabel>
            <textarea
              name="description_md"
              rows={4}
              defaultValue={initialData?.description_md}
              placeholder="Write a compelling overview of this package..."
              className="w-full py-3 px-4 border border-border rounded-xl text-sm text-ink bg-surface outline-none focus:border-teal transition-colors resize-y leading-relaxed"
            />
          </div>
        </div>
      </section>

      {/* ── NEW: Dynamic Day-by-Day Itinerary Segment Builder ── */}
      <section className="bg-white p-8 rounded-2xl border border-border flex flex-col gap-5">
        <SectionHeader number="3.5" title="Interactive Daily Itinerary" subtitle="Build a chronological, collapsible timeline shown to customers." />
        
        <div className="space-y-4">
          {itineraryDays.map((day, idx) => (
            <div key={idx} className="p-5 border border-border bg-surface rounded-xl space-y-3 relative group">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-teal uppercase">Day {idx + 1} Profile</span>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => moveItineraryDay(idx, 'up')} disabled={idx === 0} className="p-1 px-2.5 bg-white text-ink hover:text-teal border border-border rounded text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">↑</button>
                  <button type="button" onClick={() => moveItineraryDay(idx, 'down')} disabled={idx === itineraryDays.length - 1} className="p-1 px-2.5 bg-white text-ink hover:text-teal border border-border rounded text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">↓</button>
                  <button type="button" onClick={() => removeItineraryDay(idx)} className="p-1 px-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 rounded text-xs cursor-pointer">Remove</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <input 
                  type="text" 
                  value={day.title}
                  onChange={(e) => handleDayChange(idx, 'title', e.target.value)}
                  placeholder={`e.g. Day ${idx + 1}: Arrival & Hotel Check-in`}
                  className="w-full py-2.5 px-4 bg-white border border-border rounded-lg text-sm text-ink outline-none focus:border-teal"
                />
                <textarea 
                  rows={2}
                  value={day.details}
                  onChange={(e) => handleDayChange(idx, 'details', e.target.value)}
                  placeholder="Describe the activities, transfers, and inclusions for this day..."
                  className="w-full py-2.5 px-4 bg-white border border-border rounded-lg text-sm text-ink outline-none focus:border-teal resize-y"
                />
              </div>
            </div>
          ))}

          {itineraryDays.length === 0 && (
            <div className="text-center py-6 border border-dashed border-border bg-surface rounded-xl">
              <p className="text-xs text-ink-muted">No custom daily timelines added yet. Standard description will be shown.</p>
            </div>
          )}

          <button 
            type="button" 
            onClick={addItineraryDay} 
            className="w-full border border-dashed border-teal/40 hover:border-teal hover:bg-teal-pale text-teal font-bold py-3.5 rounded-xl transition-all text-xs tracking-wider uppercase cursor-pointer"
          >
            + Add Itinerary Day
          </button>
        </div>
      </section>

      {/* ── Section 4: Admin Notes ── */}
      <section className="p-8 rounded-2xl border border-amber-200 bg-amber-50 flex flex-col gap-5">
        <SectionHeader number="4" title="Admin Notes" subtitle="Internal only — not visible to customers" />
        <textarea
          name="admin_notes"
          rows={3}
          defaultValue={initialData?.admin_notes}
          placeholder="e.g. Contact supplier before booking, max 15 pax due to boat size..."
          className="w-full py-3 px-4 border border-amber-200 rounded-xl text-sm text-ink bg-white outline-none focus:border-amber-400 transition-colors"
        />
      </section>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ink hover:bg-teal text-white py-4 px-6 rounded-xl font-bold text-sm tracking-widest uppercase transition-colors duration-200 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : isEdit ? 'Update Package' : 'Publish Package'}
      </button>

    </form>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2">
      {children}
    </label>
  );
}

function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3.5 pb-5 border-b border-sand">
      <div className="w-8 h-8 bg-ink text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
        {number}
      </div>
      <div>
        <p className="font-bold text-sm text-ink leading-none">{title}</p>
        {subtitle && <p className="text-[11px] text-ink-muted/50 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}