import React, { useState } from 'react';
import { supabase } from '../../lib/supabase_client';

export default function PackageForm({ initialData = null, isEdit = false }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const inclusionsRaw = formData.get('inclusions');
    const inclusionsArray = inclusionsRaw ? inclusionsRaw.split(',').map(i => i.trim()) : [];

    const payload = {
      title: formData.get('title'),
      region: formData.get('region'),
      price: parseInt(formData.get('price')),
      days: parseInt(formData.get('days')),
      image_url: formData.get('image_url'),
      inclusions: inclusionsArray,
      status: 'active'
    };

    let result;
    if (isEdit) {
      // Update existing
      result = await supabase
        .from('packages')
        .update(payload)
        .eq('id', initialData.id);
    } else {
      // Insert new
      result = await supabase
        .from('packages')
        .insert([payload]);
    }

    if (result.error) {
      alert("Error: " + result.error.message);
      setLoading(false);
    } else {
      window.location.href = '/admin/packages';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="editor-form">
      <div className="form-grid">
        <div className="full-width">
          <label>Journey Title</label>
          <input 
            required 
            name="title" 
            type="text" 
            defaultValue={initialData?.title} 
            className="title-input" 
          />
        </div>

        <div>
          <label>Region</label>
          <select name="region" defaultValue={initialData?.region || "Luzon"}>
            <option>Luzon</option>
            <option>Visayas</option>
            <option>Mindanao</option>
            <option>Palawan</option>
          </select>
        </div>

        <div>
          <label>Starting Price (PHP)</label>
          <input required name="price" type="number" defaultValue={initialData?.price} />
        </div>

        <div>
          <label>Duration (Days)</label>
          <input required name="days" type="number" defaultValue={initialData?.days} />
        </div>

        <div>
          <label>Cover Image URL</label>
          <input required name="image_url" type="text" defaultValue={initialData?.image_url} />
        </div>

        <div className="full-width">
          <label>Inclusions (Separate with commas)</label>
          <textarea 
            name="inclusions" 
            rows="3" 
            defaultValue={initialData?.inclusions?.join(', ')}
          ></textarea>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="save-btn">
          {loading ? "Saving Changes..." : isEdit ? "Update Magazine Entry" : "Publish to Magazine"}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .editor-form { background: white; padding: 40px; border-radius: 24px; border: 1px solid #e2ddd7; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .full-width { grid-column: span 2; }
        label { display: block; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #4b5563; margin-bottom: 8px; }
        input, select, textarea { width: 100%; padding: 12px; border: 1px solid #e2ddd7; border-radius: 12px; font-family: inherit; outline: none; box-sizing: border-box; }
        .title-input { font-family: 'Cormorant Garamond', serif; font-size: 24px; border: none; border-bottom: 1px solid #e2ddd7; border-radius: 0; padding: 8px 0; }
        .form-actions { margin-top: 40px; padding-top: 32px; border-top: 1px solid #e2ddd7; }
        .save-btn { background: #0d1117; color: white; border: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; cursor: pointer; width: 100%; font-size: 16px; }
        .save-btn:hover { background: #1a6b6b; }
      `}} />
    </form>
  );
}