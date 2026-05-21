import { map } from 'nanostores';

// We expand the global state to support prefilled traveler parameters
export const modalStore = map({
  isOpen: false,
  packageTitle: '',
  packageId: '',
  prefillDate: '',
  prefillAdults: 2,
  prefillChildren: 0
});

/**
 * Launches the inquiry modal with optional prefilled parameters
 */
export function openInquiryModal(id, title, date = '', adults = 2, children = 0) {
  modalStore.set({
    isOpen: true,
    packageId: id,
    packageTitle: title,
    prefillDate: date,
    prefillAdults: adults,
    prefillChildren: children
  });
}

export function closeInquiryModal() {
  modalStore.setKey('isOpen', false);
}