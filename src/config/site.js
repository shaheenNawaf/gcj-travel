/**
 * Global Brand & Metadata Configuration
 * For Site Configuration and SEO
 */


export const siteConfig = {
  // Brand details shown in headers, titles, and SEO layouts
  brand: {
    name: "GCJ",
    suffix: "Travel & Tours",
    tagline: "Follow Your Heartbeat",
    description: "Explore the world, without breaking the bank.",
  },
  
  // Navigation links mapped in both Navbar.astro and Footer.astro
  nav: [
    { label: "DOMESTIC", href: "/domestic" },
    { label: "INTERNATIONAL", href: "/international" },
    { label: "PACKAGES", href: "/packages" },
  ],
  
  // Official company contact details
  contact: {
    email: "hello@gcjtravel.com",
    phone: "+63 917 123 4567",
    
    // Format for WA: 639171234567; no plus symbol 
    whatsapp: "639171234567", 
    address: "Manila, Philippines",
    facebook: "https://facebook.com/gcjtravel",
    instagram: "https://instagram.com/gcjtravel",
  },
  
  // SEO default tags for PublicLayout metadata engines
  seo: {
    defaultTitle: "GCJ Travel and Tours | Philippines, SEA, ASIA",
    defaultDescription: "Experience the world with GCJ Edition.",
    ogImage: "/og-image.jpg",
    keywords: ["travel", "philippines", "luxury", "budget tours"],
  }
};