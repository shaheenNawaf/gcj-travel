/**
 * Dynamic Hero Background Image Slideshow Controller
 * Cycles through an array of image URLs using smooth CSS cross-fades.
 * @param {string[]} images - Array of image URLs to cycle.
 */
export function initHeroSlideshow(images) {
  const container = document.getElementById('hero-slideshow-container');
  if (!container || !images || images.length === 0) return;

  // Clear existing container contents
  container.innerHTML = '';

  // Create overlay slide wrappers
  const slideEls = images.map((url, index) => {
    const div = document.createElement('div');
    // We use transition-opacity with a long 2-second ease-in-out duration for premium organic fading
    div.className = `absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
      index === 0 ? 'opacity-100' : 'opacity-0'
    }`;

    const img = document.createElement('img');
    img.src = url;
    img.alt = `Paradise Destination Slide ${index + 1}`;
    img.className = 'w-full h-full object-cover animate-kb'; // Ken Burns zoom animation
    img.loading = index === 0 ? 'eager' : 'lazy'; // Optimize Largest Contentful Paint (LCP)

    div.appendChild(img);
    container.appendChild(div);
    return div;
  });

  // If there is only one image, no cycling transition is needed
  if (slideEls.length <= 1) return;

  let currentSlideIdx = 0;
  
  // Cross-fade slides every 7 seconds
  setInterval(() => {
    const nextSlideIdx = (currentSlideIdx + 1) % slideEls.length;
    
    // Cross-fade opacity by swapping Tailwind utility classes
    slideEls[currentSlideIdx].classList.replace('opacity-100', 'opacity-0');
    slideEls[nextSlideIdx].classList.replace('opacity-0', 'opacity-100');
    
    currentSlideIdx = nextSlideIdx;
  }, 7000);
}