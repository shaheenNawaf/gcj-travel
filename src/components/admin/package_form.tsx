import React, { useState } from 'react';
import { supabase } from '../../lib/supabase_client';

interface Props { initialData?: any; isEdit?: boolean; }

export default function PackageForm({ initialData = null, isEdit = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const filePath = `${Math.random()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('tour-images').upload(filePath, file);
    if (error) return alert(error.message);
    const { data } = supabase.storage.from('tour-images').getPublicUrl(filePath);
    setImageUrl(data.publicUrl);
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
      image_url: imageUrl,
      inclusions: (formData.get('inclusions') as string).split(',').map(i => i.trim()),
      is_international: formData.get('is_international') === 'on',
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
    <form onSubmit={handleSubmit} className="editor-form">
      <div className="form-grid">
        <div className="full-width">
          <label>Journey Title</label>
          <input required name="title" type="text" defaultValue={initialData?.title} className="title-input" />
        </div>
        <div className="full-width" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f5f0e8', padding: '16px', borderRadius: '12px' }}>
          <input type="checkbox" name="is_international" defaultChecked={initialData?.is_international} style={{ width: '20px', height: '20px' }} />
          <label style={{ margin: 0 }}>International Package</label>
        </div>
        <div className="full-width">
          <label>Cover Image</label>
          <input type="file" accept="image/*" onChange={handleUpload} />
          {imageUrl && <img src={imageUrl} style={{ width: '100%', height: '200px', objectFit: 'cover', marginTop: '10px', borderRadius: '12px' }} />}
        </div>
        <div><label>Region</label><input name="region" defaultValue={initialData?.region} placeholder="e.g. Japan or Palawan" /></div>
        <div><label>Price</label><input name="price" type="number" defaultValue={initialData?.price} /></div>
        <div><label>Days</label><input name="days" type="number" defaultValue={initialData?.days} /></div>
        <div className="full-width"><label>Inclusions</label><textarea name="inclusions" defaultValue={initialData?.inclusions?.join(', ')} /></div>
      </div>
      <button type="submit" disabled={loading} className="save-btn">{loading ? "Saving..." : "Publish"}</button>
      <style dangerouslySetInnerHTML={{ __html: `.editor-form { background: white; padding: 40px; border-radius: 24px; border: 1px solid #e2ddd7; } .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; } .full-width { grid-column: span 2; } label { display: block; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #4b5563; margin-bottom: 8px; } input, select, textarea { width: 100%; padding: 12px; border: 1px solid #e2ddd7; border-radius: 12px; } .title-input { font-family: 'Cormorant Garamond', serif; font-size: 32px; border: none; border-bottom: 1px solid #e2ddd7; border-radius: 0; } .save-btn { background: #0d1117; color: white; padding: 16px; border-radius: 12px; width: 100%; margin-top: 40px; cursor: pointer; font-weight: bold; }` }} />
    </form>
  );
}