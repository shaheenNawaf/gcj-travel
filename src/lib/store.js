import { map } from 'nanostores';

export const modalStore = map({
  isOpen: false,
  packageTitle: '',
  packageId: ''
});

export function openInquiryModal(id, title) {
  modalStore.set({
    isOpen: true,
    packageId: id,
    packageTitle: title
  });
}

export function closeInquiryModal() {
  modalStore.setKey('isOpen', false);
}