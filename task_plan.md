# Stage 3 Task Plan — Visual Polish + i18n + Accessibility

## Goal
Apply §7 + §8 of spec across the whole app. Light theme default, dark toggle, animations,
mobile responsiveness, Hebrew RTL with react-i18next, 21st.dev-inspired components, real images,
and complete README.

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | Download real vacation images (Unsplash free CDN via curl) | pending |
| 2 | Update backend Dockerfile to bundle images | pending |
| 3 | Install framer-motion + react-i18next in frontend | pending |
| 4 | Create i18n EN/HE translation files | pending |
| 5 | Update App.tsx — RTL direction, i18n init, AnimatePresence transitions | pending |
| 6 | Update Navbar — language toggle, glassmorphism (21st.dev-inspired) | pending |
| 7 | Redesign VacationCard — 3D tilt hover, heart burst Like animation | pending |
| 8 | Animate Vacations grid — staggered entrance with framer-motion | pending |
| 9 | Redesign About/Hero page — bold animated hero | pending |
|10 | Mobile Chat Widget — full-screen panel on mobile | pending |
|11 | Accessibility pass — ARIA, focus rings, skip-nav, modal trap | pending |
|12 | Write README.md — Demo Payment disclosure + Feature Tour | pending |
|13 | Rebuild Docker + smoke test | pending |

## Key Decisions / Assumptions
- Images stored in backend/uploads/, COPY into Dockerfile so Docker volume inherits them on first run
- framer-motion for page transitions, staggered grids, tilt, heart burst
- react-i18next with en.json + he.json; Hebrew sets dir="rtl" on <html>
- i18n language persisted in localStorage
- 21st.dev-inspired means: glassmorphism navbars, soft card shadows, smooth micro-interactions
- Tailwind logical properties (ms- / me-) used throughout for RTL compat

## Errors Log
(none yet)
