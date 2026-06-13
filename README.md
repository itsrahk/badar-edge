# Badar Edge — AI Solutions Company

A premium dark-themed AI solutions landing page built with HTML, CSS, and JavaScript. Features animated stat counters, a speech synthesis voice guide agent, a 3D layered diamond logo with continuous draw loop, and scroll-driven storytelling via GSAP ScrollTrigger.

## Features

- **3D Layered Diamond Logo** — three isometric diamond boxes with gradient fills and a continuous stroke-draw animation loop
- **Voice Guide Agent** — floating avatar that speaks a business model summary using the Web Speech API (female voice)
- **Animated Stat Counters** — synchronized `requestAnimationFrame` loop for all four "By the Numbers" metrics (clients, systems, industries, workflows)
- **Scroll-Triggered Animations** — section reveals, benchmark count-ups, and parallax effects using GSAP + ScrollTrigger
- **Smooth Scrolling** — Lenis-powered smooth scroll with integrated ScrollTrigger
- **Responsive Design** — fully responsive layout for desktop and mobile, including a collapsible sidebar navigation
- **Floating Cyber Navbar** — glassmorphism-style navigation bar with hamburger menu and sidebar

## Tech Stack

- **HTML5**, **CSS3**, vanilla **JavaScript**
- [GSAP](https://gsap.com/) + [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — scroll-driven animations
- [Lenis](https://lenis.darkroom.engineering/) — smooth scrolling
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) — voice guide agent
- [Lucide Icons](https://lucide.dev/) — icon set
- Google Fonts (Plus Jakarta Sans, Inter)

## Project Structure

```
├── index.html       # Main landing page
├── styles.css       # All styles
├── app.js           # All JavaScript
└── README.md        # This file
```

## Getting Started

No build tools or package managers required — it's a pure static site.

```bash
git clone <repo-url>
cd <project-directory>
# Open index.html in a browser
```

Or serve locally with any HTTP server (recommended for proper module loading):

```bash
npx serve .
```

## Deployment

Open `index.html` in any modern browser. The site works from the file system or any static web host (GitHub Pages, Netlify, Vercel, etc.).

## SEO

- Meta description, keywords, and Open Graph tags included inline in `<head>`
- Semantic HTML sectioning
- Google Analytics tracking ID: `G-W6J277LPKK`

## License

All rights reserved. &copy; Badar Edge.
