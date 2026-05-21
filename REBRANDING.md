# 🗺️ Rebranding Guide

Welcome to your travel template! To fully customize this website for your travel and tours business, you only need to change files in two places.

## 1. Company Information Setup
Open `src/config/site.js` and change the business profile fields:
- Replace `brand` details with your company name and tagline.
- Set your phone, email, and address.
- Update `whatsapp` with your pure numeric handle (e.g., `639171234567`) so your chat trigger operates.
- Set your `accreditations` toggles to `true` or `false` depending on your active licensing.

## 2. Dynamic Color Brand Swapping
To customize the color theme, open `src/styles/global.css` and adjust the variables under `:root`:

```css
:root {
  --brand-primary: #10b981;      /* Change to your core primary color (e.g. Emerald Green) */
  --brand-primary-dark: #047857; /* A darker shade of your primary color */
  --brand-accent: #f59e0b;       /* Change to your accent CTA color (e.g. Honey Yellow) */
  --brand-accent-dark: #d97706;  /* A darker shade of your accent color */
}