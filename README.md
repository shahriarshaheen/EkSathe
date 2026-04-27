# EkSathe — Smart Campus Mobility & Parking Ecosystem

EkSathe (meaning "Together" in Bengali) is a university-focused smart mobility platform built for Dhaka's students. It connects students with homeowners who have idle parking spaces, enables verified carpooling, and provides commute safety tools — all in one platform.

> Built as a Software Engineering university project using the MERN stack.

---

## Project Status

| Module                                 | Status      |
| -------------------------------------- | ----------- |
| Authentication System                  | ✅ Complete  |
| Role-based Dashboards                  | ✅ Complete  |
| University Email Restriction           | ✅ Complete  |
| Student ID Verification (Admin)        | ✅ Complete  |
| Profile Photo & Edit Page              | ✅ Complete  |
| Parking Spot Listing (F-01)            | ✅ Complete  |
| Interactive Map View (F-02)            | ✅ Complete  |
| Booking Calendar System (F-03)         | ✅ Complete  |
| SSLCommerz Payment (F-04)              | ✅ Complete  |
| Homeowner Earnings Dashboard (F-05)    | ✅ Complete  |
| Post Carpool Route + Map Picker (F-06) | ✅ Complete  |
| Ride Discovery & Smart Browse (F-07)   | ✅ Complete  |
| Trust & Rating System (F-08)           | ✅ Complete  |
| In-Ride & Booking Chat (F-09)          | ✅ Complete  |
| Anonymous Incident Reporting (F-10)    | ✅ Complete  |
| SOS Panic Button (F-11)                | ✅ Complete  |
| Rider Trust Profile (F-12)             | ✅ Complete  |
| Live Trip Sharing (F-13)               | ✅ Complete  |
| Homeowner Announcement (F-14)          | ✅ Complete  |
| Admin Moderation Dashboard (F-15)      | ✅ Complete  |
| Smart Demand Indicator (F-16)          | 🔲 Sprint 4 |
| Dynamic Pricing Nudge (F-17)           | 🔲 Sprint 4 |
| Firebase Push Notifications (F-18)     | 🔲 Sprint 4 |
| Advanced Search & Filter (F-19)        | 🔲 Sprint 4 |
| Trust Score & Badge System (F-20)      | 🔲 Sprint 4 |

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

* React 18 + Vite
* TailwindCSS v3
* React Router v6
* Axios (with interceptors)
* React Hook Form + Zod
* Framer Motion (animations)
* Sonner (toast notifications)
* Lucide React (icons)
* Leaflet + React Leaflet (maps — parking + carpool)
* Recharts (earnings charts)
* @formkit/auto-animate

### Backend

* Node.js (ES Modules)
* Express 4.x
* MongoDB Atlas + Mongoose
* JWT Authentication
* bcryptjs
* Nodemailer (email + SOS alerts)
* Multer + Cloudinary (photo uploads)
* express-validator
* SSLCommerz (payment gateway)

---

## Completed Features

### Authentication System

* Register with role selection (student / homeowner / admin)
* Email OTP verification (6-digit, 1hr expiry)
* Login with JWT (stateless, 7d expiry)
* Forgot password + reset via email link
* Role-based authorization middleware

**Endpoints:** `POST /api/auth/register`, `verify-email`, `login`, `GET /api/auth/me`, `logout`, `forgot-password`, `reset-password`

---

### University Email Restriction

* 27 universities — 12 private + 15 public
* Searchable university dropdown on registration
* Email domain validated frontend (Zod) + backend

---

### Student ID Verification (Admin)

* Admin approves/rejects student ID submissions
* Approval sends branded email + adds 10 trust score points
* Three tabs: Pending / Approved / Rejected with search

**Endpoints:** `GET /api/admin/stats`, `students`, `students/pending`, `PUT students/:id/approve`, `reject`

---

### Profile Photo & Edit Page

* Upload/remove photo (Cloudinary)
* Edit name, phone, gender
* Sidebar shows real photo + links to profile page

**Endpoints:** `GET/PUT /api/user/profile`, `DELETE /api/user/profile/photo`

---

### Parking Spot Listing (F-01)

* Create listing with photos, GPS coords, hours, days, price
* Geospatial indexing (2dsphere)

**Endpoints:** `GET/POST /api/parking`, `GET /api/parking/:id`, `my/listings`, `PUT/:id`, `DELETE/:id`

---

### Interactive Map View (F-02)

* Leaflet + OpenStreetMap (no API key)
* Floating search bar, animated side panel
* Near me button, user location marker

---

### Booking Calendar System (F-03)

* Date/time selection with conflict checking
* My Bookings page with cancel and rate homeowner

**Endpoints:** `POST /api/bookings`, `GET /api/bookings/my`, `PATCH /api/bookings/:id/cancel`

---

### SSLCommerz Payment (F-04)

* bKash, Nagad, cards
* Success/fail/cancel redirect pages

**Endpoints:** `POST /api/payment/init`, `success`, `fail`, `cancel`

---

### Homeowner Earnings Dashboard (F-05)

* Monthly earnings chart (Recharts)
* Listing performance table with hover effects

---

### Post Carpool Route + Map Picker (F-06)

Full carpool platform with map-based route pinning:

* 3-step wizard — pick route, trip details, confirm
* Step 1: Select from preset university routes OR pin exact pickup/dropoff on map
* Reverse geocoding resolves map clicks into real addresses
* Step 2: Departure time, seats (1–6), price per seat, gender-safe toggle, notes
* Step 3: Review with full route preview before posting
* Double booking prevention within time window

---

### Ride Discovery & Smart Browse (F-07)

* Standalone full-page ride browsing experience
* From/To inputs with visual indicators
* Suggested rides based on user's university
* Filters: university + gender-safe
* Skeleton loading UI
* My Rides page with active/past separation

---

### Trust & Rating System (F-08)

* Mutual rating for carpool and parking
* Score impact system (positive + negative weighting)
* Duplicate rating prevention
* Ratings dashboard with breakdown

---

### In-Ride & Booking Chat (F-09)

* Carpool group chat + parking booking chat
* Polling-based messaging (no WebSockets)
* Read/unread tracking
* Structured message UI with avatars and timestamps

---

### Anonymous Incident Reporting (F-10)

* Anonymous safety reporting with GPS capture
* Admin moderation workflow

---

### SOS Panic Button (F-11)

* One-tap emergency alert to saved contacts
* Email with live location link

---

### Rider Trust Profile (F-12)

* Public user profile with trust score and verification
* Ratings breakdown and recent reviews
* Accessible from rides, bookings, and chat
* Supports safer decision making before joining rides

**Endpoints:** `GET /api/users/:id/profile`, `GET /api/ratings/user/:id`

---

### Live Trip Sharing (F-13)

* Share live trip location with external contacts
* Generates tracking link for real-time visibility
* Auto-expiry after trip ends
* Privacy-focused temporary sharing

**Endpoints:** `POST /api/trips/share`, `GET /api/trips/:id/status`

---

### Homeowner Announcement (F-14)

* Homeowners can post announcements per listing
* Visible to users with bookings for that spot
* Useful for schedule updates or notices

**Endpoints:** `POST /api/announcements/:listingId`, `GET /api/announcements/:listingId`, `DELETE /api/announcements/:id`

---

### Admin Moderation Dashboard (F-15)

* Platform-wide statistics overview
* Student verification controls
* Carpool moderation tools
* System monitoring panel

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

| Sprint | Theme               | Status         |
| ------ | ------------------- | -------------- |
| S1     | Parking Marketplace | ✅ Complete     |
| S2     | Carpooling Network  | ✅ Complete     |
| S3     | Safety & Trust      |  ✅ Complete    |
| S4     | Smart Features      | 🔲 Pending     |

---

## Development Workflow

```bash
git checkout -b feature/feature-name
git add .
git commit -m "feat: description"
git push origin feature/feature-name
```

---

## Team Rules

* Never modify auth files
* Backend first, then frontend
* Test with all roles
* Never commit `.env`

---

## Contributors

EkSathe Development Team
BRAC University Software Engineering Course Project
