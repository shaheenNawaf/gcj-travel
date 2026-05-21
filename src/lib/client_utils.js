/**
 * Client-Side interactive enhancements for PublicLayout.astro
 * Handles scroll indicators, floating action buttons, and exit-intent.
 */

export function initScrollAndFloatingButtons() {
  const scrollTopBtn = document.getElementById('scroll-top');
  const quoteBtn = document.getElementById('quote-btn');

  if (!scrollTopBtn && !quoteBtn) return;

  window.addEventListener('scroll', () => {
    const shouldShow = window.scrollY > 400;
    scrollTopBtn?.classList.toggle('visible', shouldShow);
    quoteBtn?.classList.toggle('visible', shouldShow);
  });

  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

export function initExitIntentPopup() {
  const popup = document.getElementById('exit-popup');
  const dismiss = document.getElementById('exit-dismiss');
  const backdrop = document.getElementById('exit-backdrop');

  if (!popup) return;

  let triggered = false;

  const closePopup = () => {
    popup.classList.add('hidden');
    sessionStorage.setItem('exit-popup-seen', 'true');
    clearTimeout(mobileTimer);
  };

  // Desktop trigger: Cursor exits to top of screen
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 10 && !triggered && !sessionStorage.getItem('exit-popup-seen')) {
      triggered = true;
      popup.classList.remove('hidden');
    }
  });

  // Mobile trigger fallback: Trigger after 40s of idle time
  const mobileTimer = setTimeout(() => {
    if (!triggered && !sessionStorage.getItem('exit-popup-seen')) {
      triggered = true;
      popup.classList.remove('hidden');
    }
  }, 40000);

  dismiss?.addEventListener('click', closePopup);
  backdrop?.addEventListener('click', closePopup);
}