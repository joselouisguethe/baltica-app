# Báltica Education Platform

A 3-day digital wellness and mental health SaaS program built on neuroscience (Grounding, Purposeful Action, Self-Compassion). Users complete guided daily exercises with videos, audios, mood tracking, and reflections.

**Live:** [balticaeducation.com](https://balticaeducation.com)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite 5 |
| Styling | Tailwind CSS 3 + Shadcn/ui (48 components) |
| Animations | Framer Motion 12 |
| State | React Context API + TanStack Query 5 |
| Backend | Node.js 20 + Express 4 + TypeScript |
| Database | PostgreSQL (10 tables, UUID PKs, JSONB) |
| Auth | JWT Bearer tokens |
| Payments | MercadoPago Checkout Pro |
| PDF Export | html2canvas + jsPDF |
| Testing | Vitest |
| Deploy | PM2 + Nginx + Certbot on VPS |

---

## Project Structure

```
baltica-platform/
├── src/                          # Frontend source
│   ├── pages/                    # 19 route pages
│   ├── components/               # 67 components
│   │   ├── ui/                   # 48 Shadcn/ui components
│   │   ├── journey/              # VideoPlayer, AudioPlayer, MoodSelector, etc.
│   │   ├── layout/               # Header, Footer
│   │   ├── notifications/        # Toast/notification UI
│   │   ├── celebrations/         # Confetti/achievement effects
│   │   └── brand/                # Logo
│   ├── contexts/                 # AppContext, AdminContext, NotificationContext
│   ├── hooks/                    # 6 custom hooks
│   ├── lib/                      # api.ts, i18n.ts, utils.ts
│   └── config/                   # content.ts (day content & journey config)
│
├── server/                       # Backend
│   └── src/
│       ├── controllers/          # 10 controllers
│       ├── routes/               # 10 route files
│       ├── middleware/            # auth, adminOnly, errorHandler
│       ├── db/
│       │   ├── migrations/       # 3 SQL migrations
│       │   └── migrate.ts        # Migration runner
│       ├── config/               # db.ts, env.ts
│       ├── types/                # TypeScript definitions
│       └── index.ts              # Express entry point
│
├── public/                       # Static assets (videos, audios, PDFs, images)
├── docs/                         # Admin manual (MD + HTML)
├── deploy.sh                     # VPS deployment automation
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Pages & Routes

### Public Routes
| Route | Page | Description |
|-------|------|-------------|
| `/landing` | LandingPage | Marketing page with plans, testimonials, science section |
| `/auth` | AuthPage | Login / signup |
| `/how-it-works` | HowItWorksPage | Program explanation |
| `/metodologia` | MethodologyPage | Scientific methodology |
| `/help` | HelpPage | FAQ |
| `/terms` | TermsPage | Terms of service |
| `/privacy` | PrivacyPage | Privacy policy |

### Protected Routes (auth + payment required)
| Route | Page | Description |
|-------|------|-------------|
| `/` | Index | Dashboard with day cards, progress ring, streak |
| `/journey/:day` | JourneyPage | Day 0-3 guided journey (videos, exercises, surveys) |
| `/onboarding` | OnboardingPage | New user welcome flow |
| `/payment` | PaymentPage | 3-plan selection + MercadoPago checkout |
| `/progress` | ProgressPage | Mood/energy comparison, day completion stats |
| `/achievements` | AchievementsPage | Unlocked badges |
| `/settings` | SettingsPage | Locale, theme, notifications |
| `/activity-log` | ActivityLogPage | User event history |
| `/survey` | SatisfactionSurveyPage | Post-course mandatory survey |
| `/diploma` | DiplomaPage | Certificate with PDF download |

### Admin Route
| Route | Page | Description |
|-------|------|-------------|
| `/admin` | AdminDashboard | User management, statistics, logs, settings |

---

## Journey Structure

The program consists of 3 visible days (internally 4 days: 0-3, where Day 0+1 are merged into "Día 1"):

### Día 1: Bienvenida y Anclaje (Internal Days 0+1)
1. Welcome video (BIENVENIDA.mp4)
2. Pre-survey (mood + energy — locked after selection)
3. Introduction video (INTRODUCCION.mp4)
4. Grounding video (GROUNDING.mp4)
5. Grounding audio meditation
6. Five-senses exercise (3 words + time slot)
7. PDF downloads (Bienvenida + Grounding guides)
8. Closure

### Día 2: Acción con Propósito (Internal Day 2)
1. Start
2. Video (Accion con Proposito.mp4)
3. Audio meditation
4. PDF download
5. Survey (value selection, action, reflection, mood, energy)
6. Closure

### Día 3: Autocompasión (Internal Day 3)
1. Start
2. Video (Autocompasion.mp4)
3. Audio meditation
4. PDF download
5. Survey (gratitude, kind phrase, commitment, mood, energy)
6. Closure → Satisfaction survey → Diploma

---

## Database Schema

10 tables across 3 migrations:

```
users                    journey_progress         day_answers
├── id (UUID, PK)        ├── id (UUID, PK)        ├── id (UUID, PK)
├── email (UNIQUE)       ├── user_id (FK)         ├── user_id (FK)
├── password_hash        ├── current_day (0-3)    ├── day_key (welcome/day1/day2/day3)
├── name                 ├── completed_days[]     ├── answers (JSONB)
├── role (user/admin)    ├── current_step         └── updated_at
├── status               ├── day0_step
├── plan_type            ├── streak               access_logs
├── access_expires_at    └── updated_at           ├── id (UUID, PK)
├── locale                                        ├── user_id (FK)
├── theme                plans                    ├── event_type
└── created_at           ├── id (PK)              ├── event_detail
                         ├── name                 └── created_at
payments                 ├── duration_months
├── id (UUID, PK)        ├── regular_price        satisfaction_surveys
├── user_id (FK)         ├── launch_price         ├── id (UUID, PK)
├── external_id          ├── features (JSONB)     ├── user_id (FK, UNIQUE)
├── status               └── display_order        ├── responses (JSONB)
├── amount                                        ├── contact_authorized
├── plan_type            diplomas                 └── created_at
└── created_at           ├── id (UUID, PK)
                         ├── user_id (FK, UNIQUE) app_settings
                         └── issued_at            ├── key (PK)
                                                  └── value
                         _migrations
                         ├── name (PK)
                         └── applied_at
```

---

## Payment Plans

| Plan | Duration | Launch Price (COP) | Content |
|------|----------|--------------------|---------|
| **Básico** | 1 month | $35,000 | 3-day challenge + certificate + bonus video |
| **Intermedio** | 3 months | $70,000 | Básico + 3 extra videos + 25% off 7-day challenge |
| **Premium** | 6 months | $140,000 | Intermedio + masterclass + protocol + micro-actions + buddy bonus |

Payment flow: Select plan → MercadoPago checkout → Webhook/return verification → User activated with plan_type and duration.

---

## Internationalization

3 locales stored in `src/lib/i18n.ts` (~94KB):

| Locale | Language |
|--------|----------|
| `es-ES` | Spanish (Spain) — default |
| `es-LATAM` | Spanish (Latin America) |
| `en` | English |

Persisted in `localStorage` and user DB record.

---

## API Endpoints

Base URL: `/api` (proxied to `:3001` in dev, Nginx in prod)

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login (returns JWT) |
| PUT | `/api/auth/change-password` | Change password |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress` | Get user's journey progress |
| POST | `/api/progress/complete-day` | Mark a day as complete |
| PUT | `/api/progress/step` | Update current step |
| PUT | `/api/progress/day0-step` | Update Day 0 sub-step |

### Answers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/answers` | Get all user answers |
| GET | `/api/answers/:dayKey` | Get answers for specific day |
| PUT | `/api/answers/:dayKey` | Save/update day answers |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-preference` | Create MercadoPago checkout |
| GET | `/api/payments/verify/:paymentId` | Verify payment status |
| POST | `/api/payments/webhook` | MercadoPago webhook |

### Surveys
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/surveys/mine` | Get user's survey |
| POST | `/api/surveys` | Submit satisfaction survey |
| GET | `/api/surveys/stats` | Admin: survey statistics |
| GET | `/api/surveys` | Admin: all surveys |

### Diplomas
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/diplomas/mine` | Get user's diploma record |
| POST | `/api/diplomas` | Issue diploma |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id/status` | Update user status |
| DELETE | `/api/users/:id` | Delete user |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get app settings |
| PUT | `/api/settings` | Update settings |
| GET | `/api/user-settings` | Get user preferences |
| PUT | `/api/user-settings` | Update user preferences |

### Logs (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logs` | Activity logs with pagination |

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm or bun

### 1. Clone & Install

```bash
git clone <repo-url>
cd baltica-platform

# Frontend
npm install

# Backend
cd server
npm install
```

### 2. Database Setup

```bash
# Create database
sudo -u postgres createdb baltica

# Configure environment
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, etc.
```

### 3. Run Migrations

```bash
cd server
npm run migrate
```

### 4. Start Development

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

Frontend runs on `http://localhost:8080` with API proxy to `:3001`.

### 5. Default Admin Account

```
Email: admin@baltica.app
Password: (set in .env ADMIN_PASSWORD)
```

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/baltica` |
| `JWT_SECRET` | Secret for signing JWTs | `random-secure-string` |
| `PORT` | API server port | `3001` |
| `MERCADOPAGO_ACCESS_TOKEN` | MercadoPago API token | `TEST-xxx` or `APP_USR-xxx` |
| `MERCADOPAGO_WEBHOOK_SECRET` | Webhook signature secret | `xxx` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:8080` |
| `ADMIN_EMAIL` | Default admin email | `admin@baltica.app` |
| `ADMIN_PASSWORD` | Default admin password | `SecurePass123!` |

---

## Build & Deploy

### Build

```bash
# Frontend
npm run build          # outputs to dist/

# Backend
cd server
npm run build          # outputs to server/dist/
```

### Production Deploy (VPS)

The `deploy.sh` script automates full VPS setup:

```bash
# On VPS (Hostinger)
chmod +x deploy.sh
./deploy.sh
```

This installs Node.js 20, PostgreSQL, Nginx, PM2, Certbot, configures the database, builds both frontend and backend, and sets up reverse proxy with SSL.

### Manual Deploy

```bash
# On VPS
cd /var/www/baltica-platform

# Pull latest
git pull origin main

# Frontend
npm install && npm run build

# Backend
cd server
npm install && npm run build && npm run migrate

# Restart
pm2 restart baltica-api
```

### Infrastructure

```
Client → Nginx (port 80/443)
           ├── /       → dist/ (static SPA)
           └── /api/*  → localhost:3001 (Express)
                              └── PostgreSQL :5432
```

---

## Admin Dashboard

Access at `/admin` (requires admin role). Tabs:

1. **Usuarios** — Create, suspend, reactivate, delete users. View plan type, completion, streak, expiry.
2. **Estadísticas** — Survey completion rate, average rating, NPS score, diploma count, plan distribution chart.
3. **Registro de Actividad** — Paginated event logs (login, payment, day completion, etc.).
4. **Configuración** — Default access days, admin password change.

Full admin manual: [docs/manual-administrador.md](docs/manual-administrador.md)

---

## Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| Navy | `#102050` | Primary dark backgrounds |
| Turquoise | `#10B0C0` | Primary accent, CTAs |
| BlueMid | `#2070A0` | Secondary accent |
| GreenLight | `#B0E090` | Success states |
| TextSecondary | `#4A627A` | Muted text |

---

## Key Design Decisions

- **Internal 4 days, visible 3 days**: Day 0 + Day 1 merged into "Día 1" visually. No DB migration needed — `completeDay(0)` auto-completes day 1 and skips to day 2.
- **Mood/Energy lock**: Selections are locked after choosing to ensure statistical integrity (before/after comparison).
- **One diploma per user**: `UNIQUE` constraint on `user_id` prevents re-issuance. Requires survey completion + all 3 days done.
- **Plan-based access**: Duration (1/3/6 months) and content gating determined by `plan_type` on user record.
- **JSONB for flexibility**: Day answers, survey responses, and plan features stored as JSONB for schema-free evolution.

---

## License

Proprietary. All rights reserved.
