import { openInquiryModal } from '../lib/store';

export default function InquireButton({ pkgId, pkgTitle }) {
  return (
    <button 
      onClick={() => openInquiryModal(pkgId, pkgTitle)}
      className="bg-coral hover:bg-coral-dark text-white text-[10px] font-bold px-4 py-2 rounded shadow-sm transition-all active:scale-95 uppercase tracking-wider"
    >
      Inquire
    </button>
  );
}