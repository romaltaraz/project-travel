# Vacations — Full-Stack Booking & Discovery Platform

A production-quality vacation booking platform with AI trip planning, community reviews, an analytics dashboard, and a conversational AI assistant.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Database | MySQL 8 |
| Backend | Node.js · Express · TypeScript |
| Frontend | React 18 · TypeScript · Tailwind CSS |
| State | Redux Toolkit |
| AI | NVIDIA NIM (OpenAI-compatible, `meta/llama-3.1-70b-instruct`) |
| Animation | Framer Motion |
| i18n | react-i18next (English) |
| Charts | Recharts |
| Containerisation | Docker + docker-compose |

---

## Quick Start

### 1. Database (Docker)

```bash
docker compose up -d
# DB:          localhost:3306
# phpMyAdmin:  http://localhost:8080
```

The database is seeded automatically on first run (users, 14 vacations, likes, reviews, bookings).

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env    # fill in DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, NVIDIA_API_KEY, MAGNIFIC_API_KEY
npm run tsc              # terminal A — tsc -w, compiles src/ → dist/
npm run dev               # terminal B — nodemon, runs dist/index.js
```

### 3. Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev                # CRA dev server on :3001
```

App: http://localhost:3001 · API: http://localhost:3000/api

**Seed credentials**

| Role | Email | Password |
|---|---|---|
| Admin | admin@vacations.com | admin1234 |
| User  | alice@example.com   | user1234  |
| User  | bob@example.com     | user1234  |

---

## Environment Variables

### Root `.env` (read by `docker-compose.yml`, for the `db` container)

| Variable | Default |
|---|---|
| `DB_ROOT_PASSWORD` | rootpassword |
| `DB_NAME` | vacations_db |
| `DB_USER` | vacations_user |
| `DB_PASSWORD` | vacations_pass |

### `backend/.env`

| Variable | Description |
|---|---|
| `DB_HOST` | MySQL host (use `db` inside Docker) |
| `DB_PORT` | 3306 |
| `DB_NAME` | Database name |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `PORT` | Backend port (default 3000) |
| `NVIDIA_API_KEY` | Get yours free at https://build.nvidia.com |
| `MAGNIFIC_API_KEY` | Text-to-image generation for the admin "ask AI for a photo" feature — get yours at https://www.magnific.com/app. Falls back to a keyless Wikimedia Commons photo search if unset or the request fails. |

---

## Demo Payment — Important Disclosure

**This application uses a simulated/mock payment flow. No real payment processing occurs.**

- The checkout form collects card details only to provide a realistic UI experience.
- **No card numbers, CVVs, or payment data are ever transmitted to a payment processor, stored in the database, or sent over any network beyond the local form.**
- The form is intentionally discarded on submission — only `numTravelers` and the computed `totalPrice` are stored.
- This is a course/demo project. Never enter real payment credentials.

The mock payment flow is clearly commented in `backend/src/controllers/bookings.controller.ts` and `frontend/src/components/Booking/MockPaymentForm.tsx`.

---

## Feature Tour

### Stage 1 — Core Platform
| Feature | How to find it |
|---|---|
| Browse vacations (paginated, filtered) | Login → Vacations |
| Like / Unlike | Heart icon on any vacation card |
| Star ratings + community reviews | Vacation detail page |
| Booking with simulated checkout | "Book now" on any vacation |
| My Bookings + cancel | My Bookings page |
| Browse hotels worldwide + filters (liked / free cancellation / breakfast) | Vacations → "Hotels" tab |
| Like / Unlike hotels | Heart icon on any hotel card |
| Admin vacation CRUD | Admin → Vacations |
| Admin booking management | Admin → Bookings |
| JWT auth (register / login / logout) | Navbar |

### Stage 2 — AI & Analytics
| Feature | How to find it |
|---|---|
| AI Quick Tip | "✨ Tip" button on any vacation card |
| AI Trip Planner | AI Planner in nav — type any destination |
| Semantic Smart Search | Smart Search in nav — plain-language queries |
| MCP Chat Assistant | Floating chat button (bottom-right) |
| Admin "generate photo with AI" (Magnific, Wikimedia fallback) | Admin → Vacations → Add/Edit |
| Analytics dashboard (overview, revenue, popular vacations, booking status, rating distribution/by destination) | Admin → Analytics |
| CSV + PDF export | Analytics dashboard |

### Stage 3 — Visual Polish & i18n
| Feature | How to find it |
|---|---|
| Light / Dark mode toggle | Sun/moon icon in navbar |
| Page transition animations | Navigate between any pages |
| 3D tilt + heart-burst on cards | Hover vacation cards / click heart |
| Staggered grid entrance | Load or filter vacations page |
| Full-screen mobile chat | Open chat on a phone-sized viewport |
| Animated hero landing page | Home (/) |
| Real vacation images | All 14 destination photos |
| phpMyAdmin | http://localhost:8080 |

---

## API Reference (key endpoints)

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/vacations           ?page=1&status=future
POST   /api/vacations           (admin)
PUT    /api/vacations/:id       (admin)
DELETE /api/vacations/:id       (admin)
POST   /api/vacations/:id/like
DELETE /api/vacations/:id/like

GET    /api/hotels
POST   /api/hotels/:id/like
DELETE /api/hotels/:id/like

GET    /api/vacations/:id/reviews
POST   /api/vacations/:id/reviews
PUT    /api/reviews/:id
DELETE /api/reviews/:id

POST   /api/vacations/:id/book
GET    /api/bookings/me
DELETE /api/bookings/:id

POST   /api/ai/recommend        { destination }
POST   /api/ai/trip-plan        { destination, days }  OR  { vacationId }
POST   /api/ai/semantic-search  { query }
POST   /api/ai/vacation-photo   { destination }  (admin — Magnific, falls back to Wikimedia)

POST   /api/mcp/ask             { question, history[] }

GET    /api/admin/bookings      ?status=&dateFrom=&dateTo=
PUT    /api/admin/bookings/:id
GET    /api/admin/analytics/overview
GET    /api/admin/analytics/revenue-by-month
GET    /api/admin/analytics/popular-vacations
GET    /api/admin/analytics/booking-status
GET    /api/admin/analytics/rating-distribution
GET    /api/admin/analytics/ratings-by-destination

GET    /api/reports/likes
GET    /api/reports/likes/csv
GET    /api/reports/export/pdf
```

Full Postman collection: `backend/postman/Vacations-API.postman_collection.json`

---

## Project Structure

```
romAltarazProject-travel/
├── backend/
│   ├── src/
│   │   ├── controllers/    auth · vacations · hotel · likes · reviews · bookings · ai · mcp · admin · reports
│   │   ├── repositories/   hotel · analytics
│   │   ├── services/       anthropic (NVIDIA NIM) · magnific · wikimedia · tripPlannerCache
│   │   ├── middleware/     auth · errorHandler · upload
│   │   ├── routes/
│   │   ├── config/         db
│   │   └── seed.ts
│   ├── uploads/            vacation images (seeded at build time)
│   ├── postman/
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     Layout · Vacations · Reviews · Booking · Chat · Common · ui (hotel-card-1)
│   │   ├── pages/          user pages · admin pages
│   │   ├── store/          Redux slices (auth · vacations · hotels · bookings · reviews · aiChat · ui)
│   │   ├── services/       api · aiService · analyticsService · hotelService
│   │   ├── i18n/           locales/en.json · locales/he.json
│   │   └── types/
│   └── Dockerfile
├── dataBase/
│   └── schema.sql
├── docker-compose.yml
├── .env                    (gitignored — optional DB override values for docker-compose)
└── README.md
```

---

## Accessibility

- Semantic HTML throughout (`<nav>`, `<main>`, `<article>`, heading hierarchy)
- ARIA attributes: `aria-live` on toasts and chat, `aria-expanded` on dropdowns, `aria-label` on all icon buttons
- Full keyboard navigation; skip-to-content link (`Tab` from any page)
- Visible focus rings (not stripped)
- Minimum 44×44 px touch targets on all interactive elements
- Color contrast meets WCAG AA in both light and dark themes
