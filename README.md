# EkSathe — Smart Campus Mobility & Parking Ecosystem

EkSathe (meaning "Together" in Bengali) is a university-focused smart mobility platform built for Dhaka's students. It connects students with homeowners who have idle parking spaces, enables verified carpooling, and provides commute safety tools — all in one platform.

> Built as a Software Engineering university project using the MERN stack.

---

## Project Status

| Module                              | Status                    |
| ----------------------------------- | ------------------------- |
| Authentication System               | ✅ Complete               |
| Role-based Dashboards               | ✅ Complete               |
| University Email Restriction        | ✅ Complete               |
| Student ID Verification (Admin)     | ✅ Complete               |
| Profile Photo & Edit Page           | ✅ Complete               |
| Parking Spot Listing (F-01)         | ✅ Complete               |
| Interactive Map View (F-02)         | ✅ Complete               |
| Booking Calendar System (F-03)      | 🔲 Sprint 1 — In Progress |
| SSLCommerz Payment (F-04)           | 🔲 Sprint 1 — In Progress |
| Homeowner Earnings Dashboard (F-05) | ✅ Complete               |
| Post Carpool Route (F-06)           | 🔲 Sprint 2               |
| Pre-set University Routes (F-07)    | 🔲 Sprint 2               |
| Gender-Safe Carpool Filter (F-08)   | 🔲 Sprint 2               |
| Cost Splitting Calculator (F-09)    | 🔲 Sprint 2               |
| Post-Ride Rating System (F-10)      | 🔲 Sprint 2               |
| SOS Panic Button (F-11)             | ✅ Complete               |
| Live Trip Sharing (F-12)            | 🔲 Sprint 3               |
| Route Deviation Alert (F-13)        | 🔲 Sprint 3               |
| Anonymous Incident Reporting (F-14) | 🔲 Sprint 3               |
| Admin Moderation Dashboard (F-15)   | 🔲 Sprint 3               |
| Smart Demand Indicator (F-16)       | 🔲 Sprint 4               |
| Dynamic Pricing Nudge (F-17)        | 🔲 Sprint 4               |
| Firebase Push Notifications (F-18)  | 🔲 Sprint 4               |
| Advanced Search & Filter (F-19)     | 🔲 Sprint 4               |
| Trust Score & Badge System (F-20)   | 🔲 Sprint 4               |

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
- Nodemailer (email service + SOS alerts)
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

### University Email Restriction

Students must register with a verified Bangladeshi university email.

- 27 universities supported — 12 private + 15 public
- Searchable university dropdown on registration
- Email domain validated against selected university at both frontend and backend
- Email hint shown dynamically: "Use your @northsouth.edu email"

**Supported universities include:** NSU, BRAC, AIUB, IUB, UIU, EWU, AUST, DIU, DU, BUET, JU, SUST, RU, CU, KU, RUET, CUET, KUET and more.

---

### Student ID Verification (Admin)

Admins can manually verify student ID submissions.

- Students submit their university ID on registration
- Admin dashboard shows live pending verification count
- Admin can approve or reject with optional reason
- Approval sends branded email + adds 10 trust score points
- Rejection sends email with reason
- Three tabs: Pending / Approved / Rejected with counts
- Search by name, email, or student ID

**Admin Endpoints:**

```
GET    /api/admin/stats
GET    /api/admin/students
GET    /api/admin/students/pending
PUT    /api/admin/students/:id/approve
PUT    /api/admin/students/:id/reject
```

---

### Profile Photo & Edit Page

All users can upload a profile photo and edit their details.

- Upload profile photo stored on Cloudinary
- Edit name, phone number, gender
- Remove profile photo
- Read-only: email, student ID, university — cannot be changed after registration
- Profile photo shown in sidebar and all dashboard cards
- Sidebar user card is clickable — navigates to profile page

**User Endpoints:**

```
GET    /api/user/profile
PUT    /api/user/profile
DELETE /api/user/profile/photo
```

---

### Role-based Dashboards

Each role gets a dedicated dashboard UI after login.

- **Student Dashboard** — teal theme, campus-focused, parking/carpool/SOS cards
- **Homeowner Dashboard** — amber theme, listings/bookings/earnings management
- **Admin Dashboard** — purple theme, real stats, pending verification alerts, system status

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

- Full screen map powered by Leaflet + OpenStreetMap (no API key, fully free)
- Green markers for every active parking spot from the database
- Click marker → popup with title, price, quick view button
- Side panel with full spot details — photos, hours, days, owner info
- Near me button — detects user location and flies map to area
- Blue marker shows user's current location

---

### Homeowner Earnings Dashboard (F-05)

Homeowners can track their income and listing performance.

- Stats: total earnings, bookings, active listings, avg per booking
- Monthly earnings bar chart — last 6 months (Recharts)
- Listing performance table with photo, price, booking count, status

---

### SOS Panic Button (F-11)

Students can trigger an emergency alert with one tap.

- Large red SOS button — detects GPS and sends alert instantly
- Professional branded email to up to 3 emergency contacts
- Email includes EkSathe branding, student profile card, static map image, Google Maps link
- Recommended actions panel (call, go to location, call 999)
- Manage up to 3 emergency contacts (name, email, relation)

**SOS Endpoints:**

```
POST   /api/sos/trigger
GET    /api/sos/contacts
POST   /api/sos/contacts
DELETE /api/sos/contacts/:id
```

---

## Environment Setup

### Backend

Create `server/.env`:

```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_gmail@gmail.com
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

> **Note:** Gmail requires an App Password — go to myaccount.google.com/apppasswords to generate one.

---

## Sprint Plan

| Sprint | Theme               | Weeks | Goal                                                 |
| ------ | ------------------- | ----- | ---------------------------------------------------- |
| S1     | Parking Marketplace | 1–2   | Book and pay for parking spots                       |
| S2     | Carpooling Network  | 3–4   | Post and join verified carpool rides                 |
| S3     | Safety & Trust      | 5–6   | SOS, live tracking, incident reporting               |
| S4     | Smart Features      | 7–8   | Push notifications, search, trust badges, deployment |

**Team assignments (5 features each):**

| Teammate | Sprint 1          | Sprint 2    | Sprint 3       | Sprint 4    |
| -------- | ----------------- | ----------- | -------------- | ----------- |
| Shahriar | F-01 ✅           | F-08        | F-11 ✅ + F-15 | F-17        |
| Sushmita | F-02 ✅ + F-05 ✅ | F-06        | F-13           | F-16        |
| Fauzia   | F-03              | F-07 + F-10 | F-12           | F-19 + F-20 |
| Tasnuva  | F-04              | F-09        | F-14           | F-18        |

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
feat: add university email restriction + student ID verification
fix: resolve cloudinary upload key error
chore: update readme and sprint status
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
