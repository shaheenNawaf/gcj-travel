import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase_client';

interface Props { initialData?: any; isEdit?: boolean; }

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
    // Reset input so same files can be re-selected if needed
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* ── Section 1: Basic Info ── */}
      <section style={sectionStyle}>
        <SectionHeader number="1" title="Basic Information" />
        <div style={gridStyle}>

          <div style={{ gridColumn: 'span 2' }}>
            <FieldLabel>Journey Title</FieldLabel>
            <input
              required
              name="title"
              type="text"
              defaultValue={initialData?.title}
              placeholder="e.g. El Nido Island Hopping Adventure"
              style={{ ...inputStyle, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', borderBottom: '1px solid #e2ddd7', borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '8px 0', background: 'transparent' }}
            />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '16px' }}>
            <label style={checkboxLabelStyle}>
              <input type="checkbox" name="is_international" defaultChecked={initialData?.is_international} style={checkboxStyle} />
              <span style={checkboxTextStyle}>International Package</span>
            </label>
            <label style={checkboxLabelStyle}>
              <input type="checkbox" name="is_featured" defaultChecked={initialData?.is_featured} style={{ ...checkboxStyle, accentColor: '#e8562a' }} />
              <span style={checkboxTextStyle}>Featured on Homepage</span>
            </label>
          </div>

          <div>
            <FieldLabel>Tour Type</FieldLabel>
            <select name="tour_type" defaultValue={initialData?.tour_type || ''} style={inputStyle}>
              <option value="">Select a type...</option>
              {TOUR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <FieldLabel>Difficulty</FieldLabel>
            <select name="difficulty" defaultValue={initialData?.difficulty || ''} style={inputStyle}>
              <option value="">Select difficulty...</option>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <FieldLabel>Region / Destination</FieldLabel>
            <input name="region" defaultValue={initialData?.region} placeholder="e.g. Palawan or South Korea" style={inputStyle} />
          </div>

          <div>
            <FieldLabel>Duration (Days)</FieldLabel>
            <input name="days" type="number" min="1" defaultValue={initialData?.days} placeholder="e.g. 5" style={inputStyle} />
          </div>

          <div>
            <FieldLabel>Price (₱ per person)</FieldLabel>
            <input name="price" type="number" min="0" defaultValue={initialData?.price} placeholder="e.g. 12500" style={inputStyle} />
          </div>

          <div>
            <FieldLabel>Departure Info</FieldLabel>
            <input name="departure_info" defaultValue={initialData?.departure_info} placeholder="e.g. Daily / Every weekend / On request" style={inputStyle} />
          </div>

          <div>
            <FieldLabel>Min Pax</FieldLabel>
            <input name="min_pax" type="number" min="1" defaultValue={initialData?.min_pax} placeholder="e.g. 2" style={inputStyle} />
          </div>

          <div>
            <FieldLabel>Max Pax</FieldLabel>
            <input name="max_pax" type="number" min="1" defaultValue={initialData?.max_pax} placeholder="e.g. 20" style={inputStyle} />
          </div>

        </div>
      </section>

      {/* ── Section 2: Photos ── */}
      <section style={sectionStyle}>
        <SectionHeader number="2" title="Photos" subtitle="First photo is the cover image. Click or drag & drop to upload multiple." />

        {/* Hidden file input — always multiple */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          style={{ display: 'none' }}
        />

        {/* Drop Zone */}
        <div
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.multiple = true;
              fileInputRef.current.click();
            }
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragging ? '#1a6b6b' : '#c9c2b8'}`,
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? '#f0f9f7' : '#faf8f5',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🖼️</div>
          <p style={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px', fontSize: '14px' }}>
            Click to upload or drag & drop
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
            PNG, JPG, WEBP supported · Hold Ctrl / Cmd to select multiple files
          </p>
        </div>

        {/* Image Preview Grid */}
        {images.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginTop: '16px' }}>
            {images.map((url, i) => (
              <div key={url} style={{ borderRadius: '12px', overflow: 'hidden', border: i === 0 ? '2px solid #1a6b6b' : '1px solid #e2ddd7', background: 'white' }}>
                <div style={{ position: 'relative' }}>
                  <img src={url} style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} />
                  {i === 0 && (
                    <div style={{ position: 'absolute', top: '6px', left: '6px', background: '#1a6b6b', color: 'white', fontSize: '9px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                      Cover
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px', padding: '8px' }}>
                  {i !== 0 && (
                    <button type="button" onClick={() => moveFirst(i)}
                      style={{ flex: 1, fontSize: '10px', fontWeight: 'bold', padding: '5px', background: '#f0f9f7', color: '#1a6b6b', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      Set Cover
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(i)}
                    style={{ flex: 1, fontSize: '10px', fontWeight: 'bold', padding: '5px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Section 3: Package Details ── */}
      <section style={sectionStyle}>
        <SectionHeader number="3" title="Package Details" />
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
          <div>
            <FieldLabel>Inclusions <span style={{ color: '#9ca3af', fontWeight: 'normal', textTransform: 'none' as const }}>(comma separated)</span></FieldLabel>
            <input
              name="inclusions"
              defaultValue={initialData?.inclusions?.join(', ')}
              placeholder="e.g. Airfare, Hotel, Breakfast, Tour Guide, Airport Transfers"
              style={inputStyle}
            />
          </div>
          <div>
            <FieldLabel>Description <span style={{ color: '#9ca3af', fontWeight: 'normal', textTransform: 'none' as const }}>(Markdown: **bold**, *italic*, - bullet)</span></FieldLabel>
            <textarea
              name="description_md"
              rows={8}
              defaultValue={initialData?.description_md}
              placeholder="Write a compelling description of this package..."
              style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: '1.6' }}
            />
          </div>
        </div>
      </section>

      {/* ── Section 4: Admin Notes ── */}
      <section style={{ ...sectionStyle, background: '#fffbeb', borderColor: '#fde68a' }}>
        <SectionHeader number="4" title="Admin Notes" subtitle="Internal only — not visible to customers" />
        <textarea
          name="admin_notes"
          rows={3}
          defaultValue={initialData?.admin_notes}
          placeholder="e.g. Contact supplier before booking, max 15 pax due to boat size..."
          style={{ ...inputStyle, background: 'white' }}
        />
      </section>

      <button
        type="submit"
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : '#0d1117',
          color: 'white', padding: '18px', borderRadius: '14px',
          width: '100%', cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.05em',
          textTransform: 'uppercase' as const, border: 'none', transition: 'background 0.2s'
        }}
      >
        {loading ? 'Saving...' : isEdit ? 'Update Package' : 'Publish Package'}
      </button>

    </form>
  );
}

// ── Shared Styles ──
const sectionStyle: React.CSSProperties = {
  background: 'white', padding: '32px', borderRadius: '20px',
  border: '1px solid #e2ddd7', display: 'flex', flexDirection: 'column', gap: '20px'
};

const gridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', border: '1px solid #e2ddd7',
  borderRadius: '10px', fontSize: '14px', color: '#111827',
  background: '#faf8f5', outline: 'none', boxSizing: 'border-box'
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  background: '#f5f0e8', padding: '14px 20px', borderRadius: '12px',
  cursor: 'pointer', flex: 1
};

const checkboxStyle: React.CSSProperties = {
  width: '18px', height: '18px', accentColor: '#1a6b6b'
};

const checkboxTextStyle: React.CSSProperties = {
  fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase',
  letterSpacing: '0.1em', color: '#374151'
};

// ── Sub-components ──
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6b7280', marginBottom: '8px' }}>
      {children}
    </label>
  );
}

function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '20px', borderBottom: '1px solid #f0ece6' }}>
      <div style={{ width: '32px', height: '32px', background: '#0d1117', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', flexShrink: 0 }}>
        {number}
      </div>
      <div>
        <p style={{ fontWeight: 'bold', fontSize: '15px', color: '#111827', margin: 0 }}>{title}</p>
        {subtitle && <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, marginTop: '2px' }}>{subtitle}</p>}
      </div>
    </div>
  );
}