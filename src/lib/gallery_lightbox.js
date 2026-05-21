/**
 * Image Gallery Lightbox Module for package details
 */
export function initGalleryLightbox(allImages) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const closeBtn = document.getElementById('lightbox-close');

  if (!lightbox || !lightboxImg) return;

  let currentIndex = 0;

  // Click on gallery item to launch Lightbox
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      currentIndex = parseInt(item.dataset.index, 10);
      lightboxImg.src = allImages[currentIndex];
      lightbox.classList.remove('hidden');
    });
  });

  const close = () => lightbox.classList.add('hidden');
  
  const prev = () => {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : allImages.length - 1;
    lightboxImg.src = allImages[currentIndex];
  };

  const next = () => {
    currentIndex = currentIndex < allImages.length - 1 ? currentIndex + 1 : 0;
    lightboxImg.src = allImages[currentIndex];
  };

  closeBtn?.addEventListener('click', close);
  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);

  // Close when user clicks black background
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  // Global window keyboard control listeners
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
}