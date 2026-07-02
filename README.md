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
| i18n | react-i18next (English + Hebrew / RTL) |
| Charts | Recharts |
| Containerisation | Docker + docker-compose |

---

## Quick Start — Docker (recommended)

```bash
# 1. Clone & enter the project
git clone <repo-url>
cd romAltarazProject-travel

# 2. Copy and fill in secrets
cp backend/.env.example backend/.env
cp .env.example .env          # root .env — read by docker-compose
# → set NVIDIA_API_KEY in root .env (AI features)

# 3. Build and run
docker compose up -d --build

# 4. Open
# App:         http://localhost
# API:         http://localhost:3000/api
# phpMyAdmin:  http://localhost:8080
```

The database is seeded automatically on first run (users, 14 vacations, likes, reviews, bookings).

**Seed credentials**

| Role | Email | Password |
|---|---|---|
| Admin | admin@vacations.com | admin1234 |
| User  | alice@example.com   | user1234  |
| User  | bob@example.com     | user1234  |

---

## Manual Setup (without Docker)

### Backend

```bash
cd backend
npm install
cp .env.example .env    # fill in DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, NVIDIA_API_KEY
npm run dev             # ts-node-dev hot reload
```

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm start               # CRA dev server on :3001
```

---

## Environment Variables

### Root `.env` (read by docker-compose)

| Variable | Default | Required |
|---|---|---|
| `NVIDIA_API_KEY` | — | Yes (AI features) |
| `DB_ROOT_PASSWORD` | rootpassword | No |
| `DB_NAME` | vacations_db | No |
| `DB_USER` | vacations_user | No |
| `DB_PASSWORD` | vacations_pass | No |
| `JWT_SECRET` | (dev default) | **Change in production** |

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
| Analytics dashboard | Admin → Analytics |
| CSV + PDF export | Analytics dashboard |

### Stage 3 — Visual Polish & i18n
| Feature | How to find it |
|---|---|
| Light / Dark mode toggle | Sun/moon icon in navbar |
| Hebrew / English toggle (RTL) | EN / עב button in navbar |
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

GET    /api/vacations          ?page=1&status=future
POST   /api/vacations          (admin)
PUT    /api/vacations/:id      (admin)
DELETE /api/vacations/:id      (admin)

POST   /api/likes/:vacationId
DELETE /api/likes/:vacationId

POST   /api/reviews/:vacationId
PUT    /api/reviews/:id
DELETE /api/reviews/:id

POST   /api/bookings
GET    /api/bookings/my
PATCH  /api/bookings/:id/cancel

POST   /api/ai/recommend       { destination }
POST   /api/ai/trip-plan       { destination, days }  OR  { vacationId }
POST   /api/ai/semantic-search { query }

POST   /api/mcp/ask            { question, history[] }

GET    /api/admin/analytics/overview
GET    /api/admin/analytics/revenue-by-month
GET    /api/admin/analytics/popular-vacations
GET    /api/reports/export/csv
GET    /api/reports/export/pdf
```

Full Postman collection: `backend/postman/Vacations.postman_collection.json`

---

## Project Structure

```
romAltarazProject-travel/
├── backend/
│   ├── src/
│   │   ├── controllers/    auth · vacations · likes · reviews · bookings · ai · mcp · admin · reports
│   │   ├── repositories/   analytics
│   │   ├── services/       anthropic (NVIDIA NIM) · tripPlannerCache
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
│   │   ├── components/     Layout · Vacations · Reviews · Booking · Chat · Common
│   │   ├── pages/          user pages · admin pages
│   │   ├── store/          Redux slices (auth · vacations · bookings · reviews · aiChat · ui)
│   │   ├── services/       api · aiService · analyticsService
│   │   ├── i18n/           locales/en.json · locales/he.json
│   │   └── types/
│   └── Dockerfile
├── dataBase/
│   └── schema.sql
├── docker-compose.yml
├── .env                    (gitignored — copy from .env.example)
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

## RTL / Hebrew

Toggle with the **EN / עב** button in the navbar. Hebrew activates `dir="rtl"` on `<html>`, reverses flex/grid ordering using Tailwind logical properties (`ms-`, `me-`, `start-`, `end-`), and mirrors chat bubbles, card badges, and navigation correctly. Language preference is persisted in `localStorage`.

---

## GitHub

[GitHub Repository](https://github.com/your-username/romAltarazProject-travel) ← replace with your URL
