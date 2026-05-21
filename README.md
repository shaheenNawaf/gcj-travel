# Personal Portfolio Portal

A performance-oriented, card-based portfolio built with Astro, Tailwind CSS v4, and TypeScript — designed as a dual-accented digital resume for someone who doesn't fit neatly into one lane.

The blue side showcases software engineering work: a live SaaS gym management platform, an AI agricultural chatbot built on RAG pipelines and Flutter, and mobile projects spanning Kotlin and Dart. The orange side covers four years of high-performance creator partnerships, affiliate ecosystems, and community growth across the Philippine and SEA market — $355K in transaction volume, 37M combined creator reach, and deals structured with some of SEA's biggest talent agencies.

Built for recruiters who want to see both sides of the same person.

## 🚀 Tech Stack

- **Framework:** [Astro](https://astro.build/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Programming Language:** [TypeScript](https://www.typescript.org/)
- **Asset Integrations:** Google Docs Export APIs (dynamic PDF resume delivery)

## ✨ Features

- **Dual-Accent Visual Language:** Transitions dynamically between Software Blue and Marketing Orange depending on the selected category route.
- **Glassmorphic Component Cards:** Experience, Project, and Marketing cards utilize glassmorphism filters, responsive shadows, and dynamic border states.
- **Synchronized Breathing Timeline:** Viewport ambient glows, border-glows, and floating CTAs pulse organically in lockstep on an infinite, hardware-accelerated 3.5s cycle.
- **Organic Scroll-Peeking:** A lightweight, non-intrusive JavaScript-controlled viewport scroll-peek on load that smoothly rolls down to the career timeline and pulls back to top, hinting at lower-fold content. Includes automatic cancellation if manual scrolls are detected first.
- **Image Security & Watermarking:** Delegated site-wide right-click (`contextmenu`) and drag-to-desktop (`dragstart`) prevention, combined with absolute vector SVG watermark overlays (`PROPERTY OF SHAHEEN AL ADWANI`).
- **Recruiter-Focused Sticky CTA:** A persistent bottom action bar featuring a green, pulsing availability indicator, direct Google Doc PDF resume download integration, and clean transition states.
- **Aperture Science Easter Egg:** Clicking the signature heart in the page footer triggers an infinite gravity portal loop on the screen. Spawns rotating floor/ceiling portals, a wiggling, interactive Companion Cube, and types out custom GLaDOS terminal quotes.

## 📂 Directory Structure

```text
src/
  components/
    experience_card.astro    # Standardized card/modal for professional tenure
    identity_hero.astro      # Primary top-fold introduction profile card
    marketing_card.astro     # Case-studies card with watermark protection
    project_card.astro       # Software-engineering project cards with watermarks
    sidebar.astro            # Left sidebar profile layout (desktop)
    sticky_bar.astro         # Recruiter persistent sticky action bar
    theme_toggle.astro       # High-contrast light/dark mode switcher
    view_switcher.astro      # Navigation pill toggle between routes
  data/
    resume.ts                # Central TypeScript typed resume database
  layouts/
    layout.astro             # Global HTML shell, meta tags, and global style injection
  pages/
    index.astro              # Split landing portal page
    marketing.astro          # Creator partnerships portfolio route
    software.astro           # Software engineering portfolio route
  scripts/
    main.ts                  # Global client script (Modals, sticky toggles, image security)
    index-page.ts            # Index page triggers (Reveals, countups, scroll-peek)
    theme-init.ts            # Early FOUC theme initialization script
    portal-easter-egg.ts     # GLaDOS/Companion Cube portal physics easter egg
  styles/
    global.css               # Centralized stylesheet (Tailwind base, light-mode overrides, keyframes)
```

## 🛠️ Getting Started

### 1. Installation

Clone the repository and install the project dependencies using your package manager:

```bash
npm install
```

### 2. Development

Run the local development server:

```bash
npm run dev
```

The site will be available to preview locally at `http://localhost:4321`.

### 3. Build

Compile a production-ready, static build of the website:

```bash
npm run build
```