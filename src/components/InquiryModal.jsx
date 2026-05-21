import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { modalStore, closeInquiryModal } from '../lib/store';
import { supabase } from '../lib/supabase_client';

export default function InquiryModal() {
  const { isOpen, packageTitle, packageId, prefillDate, prefillAdults, prefillChildren } = useStore(modalStore);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Local states synchronized to global prefill stores on opening
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [travelDate, setTravelDate] = useState('');

  // Sync state with store prefills when modal is opened
  useEffect(() => {
    if (isOpen) {
      setAdults(prefillAdults || 2);
      setChildren(prefillChildren || 0);
      setTravelDate(prefillDate || '');
    }
  }, [isOpen, prefillDate, prefillAdults, prefillChildren]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const rawMessage = formData.get('user_message');

    // Compile dynamic parameters into backwards-compatible message body
    const compiledMessage = `
[Target Date]: ${travelDate || 'Flexible / Unspecified'}
[Travelers]: ${adults} Adult(s) ${children > 0 ? `, ${children} Child(ren)` : ''}
─────────────────────────────────────────────
[Inquiry Notes]:
${rawMessage}
    `.trim();

    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: compiledMessage,
      package_id: packageId || null,
      package_title: packageTitle || 'Custom Itinerary Inquiry',
    };

    const { error } = await supabase.from('inquiries').insert([payload]);

    if (error) {
      alert("Error submitting inquiry: " + error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        setSuccess(false);
        closeInquiryModal();
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transition-transform duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-serif text-ink">Inquire Now</h2>
              {packageTitle && (
                <p className="text-teal font-medium mt-1 text-sm">{packageTitle}</p>
              )}
            </div>
            <button onClick={closeInquiryModal} className="text-ink-muted hover:text-ink text-2xl cursor-pointer bg-none border-none p-1" aria-label="Close Modal">
              &times;
            </button>
          </div>

          {success ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-teal-pale text-teal rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
              <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
              <p className="text-ink-muted">Our travel specialists will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="package_id" value={packageId || ''} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-ink-muted">Full Name</label>
                  <input required name="name" type="text" className="w-full border border-border rounded-lg p-3 focus:ring-2 focus:ring-teal outline-none transition-all text-sm" placeholder="Juan Dela Cruz" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-ink-muted">Email Address</label>
                  <input required name="email" type="email" className="w-full border border-border rounded-lg p-3 focus:ring-2 focus:ring-teal outline-none transition-all text-sm" placeholder="juan@example.com" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-ink-muted">Target Travel Date</label>
                  <input 
                    required 
                    name="travel_date" 
                    type="date" 
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full border border-border rounded-lg p-3 focus:ring-2 focus:ring-teal outline-none transition-all text-sm text-ink" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-ink-muted font-sans">Travelers Count</label>
                  <div className="flex gap-2 items-center">
                    <div className="flex items-center justify-between border border-border rounded-lg px-2 py-1.5 flex-1 bg-surface">
                      <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="text-ink-muted hover:text-ink px-1.5 font-bold cursor-pointer">-</button>
                      <span className="text-xs font-mono">{adults} Ad</span>
                      <button type="button" onClick={() => setAdults(adults + 1)} className="text-ink-muted hover:text-ink px-1.5 font-bold cursor-pointer">+</button>
                    </div>

                    <div className="flex items-center justify-between border border-border rounded-lg px-2 py-1.5 flex-1 bg-surface">
                      <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="text-ink-muted hover:text-ink px-1.5 font-bold cursor-pointer">-</button>
                      <span className="text-xs font-mono">{children} Ch</span>
                      <button type="button" onClick={() => setChildren(children + 1)} className="text-ink-muted hover:text-ink px-1.5 font-bold cursor-pointer">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-ink-muted">Message / Special Requests</label>
                <textarea required name="user_message" rows="3" className="w-full border border-border rounded-lg p-3 focus:ring-2 focus:ring-teal outline-none transition-all text-sm resize-none" placeholder="Let us know of any special preferences (e.g. hotel upgrades, dietary requirements, specific flight routes)..."></textarea>
              </div>

              <button 
                disabled={loading}
                type="submit" 
                className="w-full bg-coral hover:bg-coral-dark text-white font-bold py-3.5 rounded-lg transition-all shadow-lg disabled:opacity-50 active:scale-[0.98] cursor-pointer"
              >
                {loading ? "Processing..." : "Submit Booking Request"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}