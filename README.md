# EkSathe — Smart Campus Mobility & Parking Ecosystem

EkSathe (meaning "Together" in Bengali) is a university-focused smart mobility platform built for Dhaka's students. It connects students with homeowners who have idle parking spaces, enables verified carpooling, and provides commute safety tools — all in one platform.

> Built as a Software Engineering university project using the MERN stack.

---

## Project Status

| Module                                 | Status                    |
| -------------------------------------- | ------------------------- |
| Authentication System                  | ✅ Complete               |
| Role-based Dashboards                  | ✅ Complete               |
| Parking Spot Listing (F-01)            | ✅ Complete               |
| Interactive Map View (F-02)            | ✅ Complete               |
| Booking Calendar System (F-03)         | 🔲 Sprint 1 — In Progress |
| SSLCommerz Payment (F-04)              | 🔲 Sprint 1 — In Progress |
| Homeowner Earnings Dashboard (F-05)    | ✅ Complete               |
| Carpooling Network (F-06 to F-10)      | 🔲 Sprint 2               |
| Safety & Trust (F-11 to F-15)          | 🔲 Sprint 3               |
| Smart Features & Deploy (F-16 to F-20) | 🔲 Sprint 4               |

---

## Project Structure

```
EkSathe/
├── client/         # React frontend (Vite + Tailwind)
├── server/         # Node.js backend (Express + MongoDB)
├── docs/           # Documentation (SRS, diagrams, sprint plan)
└── README.md
```

---

## Tech Stack

### Frontend

- React 18 + Vite
- TailwindCSS v3
- React Router v6
- Axios (with interceptors)
- React Hook Form + Zod
- Sonner (toast notifications)
- Lucide React (icons)
- React Dropzone (photo uploads)
- Leaflet + React Leaflet (interactive maps)
- Recharts (earnings charts)

### Backend

- Node.js (ES Modules)
- Express 4.x
- MongoDB Atlas + Mongoose
- JWT Authentication (jsonwebtoken)
- bcryptjs (password hashing)
- Nodemailer (email service)
- Multer + Cloudinary (photo uploads)
- express-validator

---

## Completed Features

### Authentication System

Full auth flow with JWT, OTP email verification, and role-based access.

- Register with role selection (student / homeowner / admin)
- Email OTP verification (6-digit, 1hr expiry)
- Login with JWT (stateless, 7d expiry)
- Forgot password + reset password via email link
- JWT middleware — attaches `{ id, role, status }` to `req.user`
- Role-based authorization middleware

**Auth Endpoints:**

```
POST   /api/auth/register
POST   /api/auth/verify-email
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

---

### Role-based Dashboards

Each role gets a dedicated dashboard UI after login.

- **Student Dashboard** — teal theme, campus-focused, parking/carpool/SOS cards
- **Homeowner Dashboard** — amber theme, listings/bookings/earnings management
- **Admin Dashboard** — purple theme, system status, moderation queue

---

### Parking Spot Listing (F-01)

Homeowners can list their parking spots with full details and photos.

- Create listing with title, description, address, GPS coordinates
- Upload up to 3 photos (stored on Cloudinary, auto-resized)
- Set price per day in Bangladeshi Taka (৳)
- Set available hours and days of the week
- Choose spot type: garage, driveway, or open area
- Auto-detect location via browser geolocation
- View, activate/deactivate, and delete own listings
- Geospatial indexing (2dsphere) for proximity queries

**Parking Endpoints:**

```
GET    /api/parking              # All active spots (public)
GET    /api/parking/:id          # Single spot (public)
POST   /api/parking              # Create listing (homeowner)
GET    /api/parking/my/listings  # Own listings (homeowner)
PUT    /api/parking/:id          # Update listing (homeowner)
DELETE /api/parking/:id          # Delete listing (homeowner)
```

---

### Interactive Map View (F-02)

Students can browse all available parking spots on an interactive map.

- Full screen map powered by Leaflet + OpenStreetMap (no API key needed)
- Green markers for every active parking spot from the database
- Click marker → popup with title, price and quick view button
- Side panel with full spot details — photos, hours, days, owner info
- Near me button — detects user location and flies map to their area
- Blue marker shows user's current location
- No Google Maps API key required — fully free

---

### Homeowner Earnings Dashboard (F-05)

Homeowners can track their income and listing performance.

- Stats overview — total earnings, bookings, active listings, avg per booking
- Monthly earnings bar chart using Recharts (last 6 months)
- Listing performance table — photo, title, price, booking count, status
- Live data updates as bookings come in (Sprint 1 booking system)
- Empty states with call to action for new homeowners

---

## Environment Setup

### Backend

Create `server/.env`:

```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_gmail
EMAIL_PASS=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run backend:

```bash
cd server
npm install
npm run dev
```

### Frontend

Create `client/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

> **Note:** `EMAIL_USER` and `EMAIL_PASS` are optional in development. If omitted, OTPs are logged to the terminal instead of being emailed.

---

## Sprint Plan

| Sprint | Theme               | Weeks | Goal                                                 |
| ------ | ------------------- | ----- | ---------------------------------------------------- |
| S1     | Parking Marketplace | 1–2   | Book and pay for parking spots                       |
| S2     | Carpooling Network  | 3–4   | Post and join verified carpool rides                 |
| S3     | Safety & Trust      | 5–6   | SOS, live tracking, incident reporting               |
| S4     | Smart Features      | 7–8   | Push notifications, search, trust badges, deployment |

**Team assignments (5 features each):**

| Teammate | Sprint 1                 | Sprint 2                   | Sprint 3              | Sprint 4                 |
| -------- | ------------------------ | -------------------------- | --------------------- | ------------------------ |
| Shahriar | F-01 Parking Listing     | F-08 Gender Filter         | F-11 SOS + F-15 Admin | F-17 Pricing Nudge       |
| Sushmita | F-02 Map + F-05 Earnings | F-06 Post Carpool          | F-13 Deviation Alert  | F-16 Demand Indicator    |
| Fauzia   | F-03 Booking Calendar    | F-07 Routes + F-10 Ratings | F-12 Live Sharing     | F-19 Search + F-20 Trust |
| Tasnuva  | F-04 Payment             | F-09 Cost Splitter         | F-14 Incidents        | F-18 Push Notifications  |

---

## Development Workflow

```bash
# 1. Clone the repository
git clone https://github.com/your-org/eksathe.git

# 2. Create a new feature branch
git checkout -b feature/feature-name

# 3. Make your changes

# 4. Commit
git add .
git commit -m "feat: description of what you built"

# 5. Push
git push origin feature/feature-name

# 6. Open a Pull Request to main
```

> Direct pushes to `main` are not allowed. All changes go through Pull Requests.

**Commit message format:**

```
feat: add parking spot listing form
fix: resolve cloudinary upload key error
chore: update sprint plan document
```

---

## Team Rules

- Never modify auth files — auth is complete and tested
- Build backend first, then frontend for each feature
- Test with all 3 roles (student, homeowner, admin)
- Never commit `.env` files — use `.env.example` only
- Use ES modules throughout — no `require()`

---

## Contributors

EkSathe Development Team
University Software Engineering Project — Dhaka, Bangladesh
