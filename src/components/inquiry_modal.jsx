import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { modalStore, closeInquiryModal } from '../lib/store';
import { supabase } from '../lib/supabase_client';

export default function InquiryModal() {
  // Listen to the global store
  const { isOpen, packageTitle, packageId } = useStore(modalStore);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      package_id: packageId,
      package_title: packageTitle,
    };

    const { error } = await supabase.from('inquiries').insert([payload]);

    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Reset success after 3 seconds and close
      setTimeout(() => {
        setSuccess(false);
        closeInquiryModal();
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-serif text-ink">Inquire Now</h2>
              {packageTitle && <p className="text-teal font-medium mt-1">{packageTitle}</p>}
            </div>
            <button onClick={closeInquiryModal} className="text-ink-muted hover:text-ink text-2xl">&times;</button>
          </div>

          {success ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-teal-pale text-teal rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
              <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
              <p className="text-ink-muted">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="package_id" value={packageId} />
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-ink-muted">Full Name</label>
                <input required name="name" type="text" className="w-full border border-border rounded-lg p-3 focus:ring-2 focus:ring-teal outline-none transition-all" placeholder="Juan Dela Cruz" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-ink-muted">Email Address</label>
                <input required name="email" type="email" className="w-full border border-border rounded-lg p-3 focus:ring-2 focus:ring-teal outline-none transition-all" placeholder="juan@example.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-ink-muted">Message</label>
                <textarea required name="message" rows="4" className="w-full border border-border rounded-lg p-3 focus:ring-2 focus:ring-teal outline-none transition-all" placeholder="I'm interested in this package for 2 people..."></textarea>
              </div>
              <button 
                disabled={loading}
                type="submit" 
                className="w-full bg-coral hover:bg-coral-dark text-white font-bold py-4 rounded-lg transition-all shadow-lg disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "Processing..." : "Send Inquiry"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}