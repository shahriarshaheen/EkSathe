# EkSathe — Smart Campus Mobility & Parking Ecosystem

EkSathe (meaning "Together" in Bengali) is a university-focused smart mobility platform built for Dhaka's students. It connects students with homeowners who have idle parking spaces, enables verified carpooling, and provides commute safety tools — all in one platform.

> Built as a Software Engineering university project using the MERN stack.

---

## Project Status

| Module                                     | Status                  |
| ------------------------------------------ | ----------------------- |
| Authentication System                      | ✅ Complete             |
| Role-based Dashboards                      | ✅ Complete             |
| University Email Restriction               | ✅ Complete             |
| Student ID Verification (Admin)            | ✅ Complete             |
| Profile Photo & Edit Page                  | ✅ Complete             |
| Parking Spot Listing (F-01)                | ✅ Complete             |
| Interactive Map View (F-02)                | ✅ Complete             |
| Booking Calendar System (F-03)             | ✅ Complete             |
| SSLCommerz Payment (F-04)                  | ✅ Complete             |
| Homeowner Earnings Dashboard (F-05)        | ✅ Complete             |
| Post Carpool Route + Map Picker (F-06)     | ✅ Complete             |
| Ride Discovery & Smart Browse (F-07)       | ✅ Complete             |
| Trust & Rating System (F-08)               | ✅ Complete             |
| In-Ride Communication / Noticeboard (F-09) | 🔲 Sprint 2 — Remaining |
| Rider Trust Profile (F-10)                 | 🔲 Sprint 2 — Remaining |
| SOS Panic Button (F-11)                    | ✅ Complete             |
| Live Trip Sharing (F-12)                   | 🔲 Sprint 3             |
| Route Deviation Alert (F-13)               | 🔲 Sprint 3             |
| Anonymous Incident Reporting (F-14)        | ✅ Complete             |
| Admin Moderation Dashboard (F-15)          | ✅ Complete             |
| Smart Demand Indicator (F-16)              | 🔲 Sprint 4             |
| Dynamic Pricing Nudge (F-17)               | 🔲 Sprint 4             |
| Firebase Push Notifications (F-18)         | 🔲 Sprint 4             |
| Advanced Search & Filter (F-19)            | 🔲 Sprint 4             |
| Trust Score & Badge System (F-20)          | 🔲 Sprint 4             |

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
- Framer Motion (animations)
- Sonner (toast notifications)
- Lucide React (icons)
- Leaflet + React Leaflet (maps — parking + carpool)
- Recharts (earnings charts)
- @formkit/auto-animate

### Backend

- Node.js (ES Modules)
- Express 4.x
- MongoDB Atlas + Mongoose
- JWT Authentication
- bcryptjs
- Nodemailer (email + SOS alerts)
- Multer + Cloudinary (photo uploads)
- express-validator
- SSLCommerz (payment gateway)

---

## Completed Features

### Authentication System

- Register with role selection (student / homeowner / admin)
- Email OTP verification (6-digit, 1hr expiry)
- Login with JWT (stateless, 7d expiry)
- Forgot password + reset via email link
- Role-based authorization middleware

**Endpoints:** `POST /api/auth/register`, `verify-email`, `login`, `GET /api/auth/me`, `logout`, `forgot-password`, `reset-password`

---

### University Email Restriction

- 27 universities — 12 private + 15 public
- Searchable university dropdown on registration
- Email domain validated frontend (Zod) + backend

---

### Student ID Verification (Admin)

- Admin approves/rejects student ID submissions
- Approval sends branded email + adds 10 trust score points
- Three tabs: Pending / Approved / Rejected with search

**Endpoints:** `GET /api/admin/stats`, `students`, `students/pending`, `PUT students/:id/approve`, `reject`

---

### Profile Photo & Edit Page

- Upload/remove photo (Cloudinary)
- Edit name, phone, gender
- Sidebar shows real photo + links to profile page

**Endpoints:** `GET/PUT /api/user/profile`, `DELETE /api/user/profile/photo`

---

### Parking Spot Listing (F-01)

- Create listing with photos, GPS coords, hours, days, price
- Geospatial indexing (2dsphere)

**Endpoints:** `GET/POST /api/parking`, `GET /api/parking/:id`, `my/listings`, `PUT/:id`, `DELETE/:id`

---

### Interactive Map View (F-02)

- Leaflet + OpenStreetMap (no API key)
- Floating search bar, animated side panel
- Near me button, user location marker

---

### Booking Calendar System (F-03)

- Date/time selection with conflict checking
- My Bookings page with cancel and rate homeowner

**Endpoints:** `POST /api/bookings`, `GET /api/bookings/my`, `PATCH /api/bookings/:id/cancel`

---

### SSLCommerz Payment (F-04)

- bKash, Nagad, cards
- Success/fail/cancel redirect pages

**Endpoints:** `POST /api/payment/init`, `success`, `fail`, `cancel`

---

### Homeowner Earnings Dashboard (F-05)

- Monthly earnings chart (Recharts)
- Listing performance table with hover effects

---

### Post Carpool Route + Map Picker (F-06)

Full carpool platform with map-based route pinning:

- 3-step wizard — pick route, trip details, confirm
- Step 1: Select from 40 preset university routes across 10 Dhaka universities OR pin exact pickup/dropoff on Leaflet map
- Nominatim reverse geocoding — tapping map auto-resolves to real street address
- Preset route shows preview map with both markers and dashed route line
- Step 2: Departure time, seats (1–6), price per seat, gender-safe toggle, notes
- Step 3: Review with map showing full route before posting
- Double booking prevention — blocks joining two rides within 2 hours

**Endpoints:**

```
GET    /api/carpool/presets
GET    /api/carpool/routes
POST   /api/carpool/routes
POST   /api/carpool/routes/:id/join
DELETE /api/carpool/routes/:id/leave
PATCH  /api/carpool/routes/:id/cancel
GET    /api/carpool/my
GET    /api/carpool/admin/routes          (admin)
PATCH  /api/carpool/admin/routes/:id/cancel (admin)
```

---

### Ride Discovery & Smart Browse (F-07)

- Browse all open future carpool rides
- University filter pills — narrow by institution
- Gender-safe toggle — show female-only rides
- Custom search by area or destination
- My Rides page — active/past tabs for posted and joined rides
- Expandable map on each ride card showing exact route
- Driver sees full passenger list with photos and trust scores
- Passenger sees driver info with trust score
- Cancel ride (driver) and Leave ride (passenger) buttons
- Unread message badge placeholder for future noticeboard

---

### Trust & Rating System (F-08)

Peer accountability system for both carpool and parking:

- **Carpool ratings** — after departure time passes, Rate button appears on past rides
  - Passenger rates driver (1–5 stars + comment)
  - Driver rates each passenger individually
- **Parking ratings** — after confirmed booking end time passes, Rate Spot button appears
  - Student rates homeowner (1–5 stars + comment)
- Quick comment chips per context — e.g. "Great driver!", "Punctual", "Left spot clean"
- Custom text comment field
- Trust score updates automatically on submission — 5★ = +3, 4★ = +2, 3★ = +1, 2★ = -1, 1★ = -3
- Duplicate prevention — one rating per person per ride/booking
- Already-rated notice shown on rated cards
- My Ratings page — view all ratings received with star breakdown chart, and all ratings given
- Filter by Carpool or Parking context

**Endpoints:**

```
POST   /api/ratings
GET    /api/ratings/received
GET    /api/ratings/given
GET    /api/ratings/check
GET    /api/ratings/user/:id    (public)
```

---

### SOS Panic Button (F-11)

- One-tap GPS alert to up to 3 emergency contacts
- Branded email with Google Maps link
- Pulsing animation when contacts are set

**Endpoints:** `POST /api/sos/trigger`, `GET/POST /api/sos/contacts`, `DELETE /api/sos/contacts/:id`

---

### Anonymous Incident Reporting (F-14)

- Categories: Harassment, Unsafe Driving, Theft, Suspicious Activity, Other
- GPS auto-captured, anonymous submission
- Admin table with status management (Pending → Reviewed → Resolved)

**Endpoints:** `POST /api/incidents`, `GET /api/incidents` (admin), `PATCH /api/incidents/:id/status` (admin)

---

### Admin Moderation Dashboard (F-15)

- Real-time stats: users, students, pending verifications, active carpools
- Student ID verification panel with approve/reject and email notifications
- Carpool moderation panel — view all rides, force cancel, filter by status, search by driver
- System status panel showing all modules

---

## Environment Setup

### Backend — `server/.env`

```
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
```

```bash
cd server && npm install && npm run dev
```

### Frontend — `client/.env`

```
VITE_API_URL=http://localhost:5000/api
```

```bash
cd client && npm install && npm run dev
```

---

## Sprint Plan

| Sprint | Theme               | Status                             |
| ------ | ------------------- | ---------------------------------- |
| S1     | Parking Marketplace | ✅ Complete                        |
| S2     | Carpooling Network  | 🔲 In Progress (3/5 done)          |
| S3     | Safety & Trust      | 🔲 Partial (F-11, F-14, F-15 done) |
| S4     | Smart Features      | 🔲 Pending                         |

| Teammate | Sprint 1          | Sprint 2       | Sprint 3          | Sprint 4    |
| -------- | ----------------- | -------------- | ----------------- | ----------- |
| Shahriar | F-01 ✅           | F-08 ✅        | F-11 ✅ + F-15 ✅ | F-17        |
| Sushmita | F-02 ✅ + F-05 ✅ | F-06 ✅        | F-13              | F-16        |
| Fauzia   | F-03 ✅           | F-07 ✅ + F-10 | F-12              | F-19 + F-20 |
| Tasnuva  | F-04 ✅           | F-09 ✅        | F-14 ✅           | F-18        |

---

## Development Workflow

```bash
git checkout -b feature/feature-name
git add .
git commit -m "feat: description"
git push origin feature/feature-name
# Open Pull Request to main
```

**Commit format:** `feat:` / `fix:` / `chore:`

---

## Team Rules

- Never modify auth files
- Backend first, then frontend
- Test with all 3 roles
- Never commit `.env`
- ES modules only — no `require()`

---

## Contributors

EkSathe Development Team
BRAC University Software Engineering Course Project
