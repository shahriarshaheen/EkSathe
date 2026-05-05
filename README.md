# EkSathe — Smart Campus Mobility & Parking Ecosystem

EkSathe (meaning "Together" in Bengali) is a university-focused smart mobility platform built for Dhaka's students. It connects students with homeowners who have idle parking spaces, enables verified carpooling, and provides commute safety tools — all in one platform.

---

## Project Status

| Module                                 | Status      |
| -------------------------------------- | ----------- |
| Authentication System                  | Complete    |
| Role-based Dashboards                  | Complete    |
| University Email Restriction           | Complete    |
| Student ID Verification (Admin)        | Complete    |
| Profile Photo & Edit Page              | Complete    |
| Parking Spot Listing (F-01)            | Complete    |
| Interactive Map View (F-02)            | Complete    |
| Booking Calendar System (F-03)         | Complete    |
| SSLCommerz Payment (F-04)              | Complete    |
| Homeowner Earnings Dashboard (F-05)    | Complete    |
| Post Carpool Route + Map Picker (F-06) | Complete    |
| Ride Discovery & Smart Browse (F-07)   | Complete    |
| Trust & Rating System (F-08)           | Complete    |
| In-Ride & Booking Chat (F-09)          | Complete    |
| Anonymous Incident Reporting (F-10)    | Complete    |
| SOS Panic Button (F-11)                | Complete    |
| Firebase Push Notification (F-12)      | Complete    |
| Live Trip Sharing (F-13)               | Complete    |
| Route Deviation Alert (F-14)           | Complete    |
| Admin Moderation Dashboard (F-15)      | Complete    |
| Coins and Leaderboard (F-16)           | Complete    |
| Coupons and Discounts (F-17)           | Complete    |
| Time-Based Check-In (F-18)             | Complete    |
| Advanced Search & Filter (F-19)        | Complete    |
| Cost Cutting Calculator (F-20)         | Complete    |

---


## Project Structure

```
EkSathe/
├── client/                         # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/             # Shared components
│   │   │   ├── ui/                 # DashboardLayout, Button, FormField, etc.
│   │   │   ├── AnnouncementBanner.jsx
│   │   │   ├── AnnouncementManager.jsx
│   │   │   ├── CarpoolMapPicker.jsx
│   │   │   ├── ChatModal.jsx
│   │   │   ├── CheckInButton.jsx
│   │   │   ├── CoinDiscountPanel.jsx
│   │   │   ├── CouponInput.jsx
│   │   │   ├── DeviationAlertBanner.jsx
│   │   │   ├── RatingModal.jsx
│   │   │   ├── StartTripModal.jsx
│   │   │   └── TripShareButton.jsx
│   │   ├── features/               # Feature-scoped pages and schemas
│   │   │   ├── auth/pages/         # Register, Login, VerifyEmail, ForgotPassword, ResetPassword
│   │   │   ├── admin/pages/        # VerificationsPage
│   │   │   ├── bookings/pages/     # BookSpotPage, MyBookingsPage, HomeownerBookingsPage
│   │   │   ├── incidents/pages/    # ReportIncidentPage, AdminIncidentsPage
│   │   │   ├── parking/pages/      # CreateListingPage, MyListingsPage, ParkingMapPage, EarningsDashboard
│   │   │   ├── payment/pages/      # PaymentSuccessPage, PaymentFailPage, PaymentCancelPage
│   │   │   ├── profile/pages/      # ProfilePage
│   │   │   └── sos/pages/          # SOSPage
│   │   ├── pages/                  # Top-level pages
│   │   │   ├── AdminCarpoolPage.jsx
│   │   │   ├── AdminCouponsPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsersPage.jsx
│   │   │   ├── BrowseCarpool.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── HomeownerDashboard.jsx
│   │   │   ├── MyRatingsPage.jsx
│   │   │   ├── MyRides.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── PostCarpool.jsx
│   │   │   ├── RewardsPage.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── TripSharePage.jsx
│   │   ├── services/               # API service layer
│   │   ├── context/                # AuthContext
│   │   ├── lib/                    # api.js (Axios with interceptors)
│   │   └── App.jsx                 # All routes defined here
├── server/                         # Node.js + Express backend
│   └── src/
│       ├── config/                 # db.js, universityRoutes.js (40 preset carpool routes)
│       ├── constants/              # universities.js (27 universities)
│       ├── controllers/            # All business logic
│       ├── middleware/             # authenticate.js, authorize.js, upload.js
│       ├── models/                 # All Mongoose models
│       ├── routes/                 # All Express routers
│       ├── services/               # emailService, pushService, rewardService
│       ├── utils/                  # generateToken, checkinUtils, haversine
│       ├── validators/             # express-validator schemas
│       └── server.js               # Entry point
├── docs/                           # SRS, diagrams, sprint plan
└── README.md
```

---

## Tech Stack

### Frontend

* React 18 + Vite
* TailwindCSS v3
* React Router v6
* Axios (with interceptors — errors normalized to `Error(message)`)
* React Hook Form + Zod
* Framer Motion (animations)
* Sonner (toast notifications)
* Lucide React (icons)
* Leaflet + React Leaflet (maps — parking + carpool)
* Recharts (earnings charts)
* @formkit/auto-animate
* @lottiefiles/dotlottie-react (dashboard animations)
* firebase (push notifications — client SDK)

### Backend

* Node.js (ES Modules — no `require()` anywhere)
* Express 4.x
* MongoDB Atlas + Mongoose
* JWT Authentication (7d expiry, stored as `eksathe_token` in localStorage)
* bcryptjs
* Nodemailer (email + SOS alerts via Gmail SMTP)
* Multer + Cloudinary (photo uploads)
* express-validator
* SSLCommerz (payment gateway — bKash, Nagad, cards)
* firebase-admin (push notifications — server SDK)
* node-cron (pricing nudge jobs)

---

## All API Endpoints

### Auth — `/api/auth`
```
POST   /register
POST   /verify-email
POST   /login
POST   /logout
GET    /me
POST   /forgot-password
POST   /reset-password
```

### User — `/api/user`
```
GET    /profile
PUT    /profile
DELETE /profile/photo
POST   /fcm-token
```

### Admin — `/api/admin`
```
GET    /stats
GET    /students
GET    /students/pending
PUT    /students/:id/approve
PUT    /students/:id/reject
GET    /users
PATCH  /users/:id/suspend
PATCH  /users/:id/unsuspend
POST   /coupons
GET    /coupons
GET    /coupons/:id
PUT    /coupons/:id
PATCH  /coupons/:id/toggle
DELETE /coupons/:id
```

### Parking — `/api/parking`
```
GET    /                    (with search/price/day filters)
POST   /
GET    /:id
GET    /my/listings
PUT    /:id
DELETE /:id
```

### Bookings — `/api/bookings`
```
POST   /
GET    /my
GET    /homeowner
GET    /spot/:spotId
PATCH  /:id/cancel
```

### Payment — `/api/payment`
```
POST   /initiate/:bookingId       (body: { couponCode? })
POST   /success
POST   /fail
POST   /cancel
POST   /carpool/initiate/:routeId (body: { couponCode?, coinTierId? })
POST   /carpool/success
POST   /carpool/fail
POST   /carpool/cancel
POST   /ipn
```

### Carpool — `/api/carpool`
```
GET    /presets
GET    /routes
POST   /routes
POST   /routes/:id/join
DELETE /routes/:id/leave
PATCH  /routes/:id/cancel
GET    /my
POST   /routes/:id/start
PATCH  /routes/:id/end-trip
POST   /routes/:id/location
GET    /routes/:id/deviation-alerts
POST   /routes/:id/deviation-alerts/:alertId/ack
POST   /:id/checkin               (body: { lat?, lng? })
GET    /:id/checkin-status
PATCH  /:id/auto-cancel-no-show
GET    /admin/routes
PATCH  /admin/routes/:id/cancel
```

### Ratings — `/api/ratings`
```
POST   /
GET    /received
GET    /given
GET    /check?contextId=X
GET    /user/:id
```

### Messages — `/api/messages`
```
GET    /:contextType/:contextId
POST   /:contextType/:contextId
GET    /unread/:contextType/:contextId
POST   /unread/bulk
```

### SOS — `/api/sos`
```
POST   /trigger
GET    /contacts
POST   /contacts
DELETE /contacts/:id
```

### Incidents — `/api/incidents`
```
POST   /
GET    /          (admin only)
PATCH  /:id/status (admin only, body: { status, adminNote? })
```

### Trip Share — `/api/tripshare`
```
POST   /                (authenticated — creates share with token)
PATCH  /:token          (authenticated — update location)
DELETE /:token          (authenticated — stop sharing)
GET    /:token          (public — view live location)
```

### Notifications — `/api/notifications`
```
GET    /my
PATCH  /:id/read
PATCH  /read-all
```

### Announcements — `/api/announcements`
```
POST   /:spotId
GET    /:spotId
DELETE /:id
GET    /homeowner/all
POST   /:id/dismiss
```

### Coupons — `/api/coupons`
```
GET    /available?serviceType=parking&amount=120
POST   /validate
```

### Rewards — `/api/rewards`
```
GET    /me
GET    /quote?serviceType=carpool&amount=120
```

---

### Authentication System

* Register with role selection (student / homeowner / admin)
* Email OTP verification (6-digit, 1-hour expiry)
* Login with JWT (stateless, 7-day expiry, stored as `eksathe_token`)
* Forgot password + reset via email link
* Role-based authorization middleware — `authorize("admin")` pattern
* Suspended accounts are blocked from all authenticated routes
* Face Verification,need to be approved by admin
---

### University Email Restriction

* 27 universities — 12 private + 15 public Dhaka universities
* Searchable university dropdown on registration
* Email domain validated on both frontend (Zod) and backend
* University ID stored as internal key (e.g. `"nsu"`, `"bracu"`, `"buet"`)

---

### Student ID Verification (Admin)

* Admin reviews and approves/rejects student ID submissions from a three-tab panel (Pending / Approved / Rejected)
* Approval sends branded email + adds 10 trust score points to student
* Rejection sends email with optional reason from admin

**Endpoints:** `GET /api/admin/students/pending`, `PUT /api/admin/students/:id/approve`, `PUT /api/admin/students/:id/reject`

---

### Profile Photo & Edit Page

* Upload/remove profile photo (stored on Cloudinary)
* Edit name, phone, gender
* Sidebar shows real photo and links to profile page

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
* Step 1: Select from 40 preset university routes across 10 Dhaka universities OR pin exact pickup/dropoff on Leaflet map
* Nominatim reverse geocoding — tapping map auto-resolves to real street address
* Preset route shows preview map with both markers and dashed route line
* Step 2: Departure time, seats (1–6), price per seat, gender-safe toggle, notes
* Step 3: Review with map showing full route before posting
* Double booking prevention — blocks joining two rides within 2 hours

**Endpoints:**

```
GET    /api/carpool/presets
GET    /api/carpool/routes
POST   /api/carpool/routes
POST   /api/carpool/routes/:id/join
DELETE /api/carpool/routes/:id/leave
PATCH  /api/carpool/routes/:id/cancel
GET    /api/carpool/my
GET    /api/carpool/admin/routes
PATCH  /api/carpool/admin/routes/:id/cancel
```

---

### Ride Discovery & Smart Browse (F-07)

* Full-page carpool experience — no sidebar, standalone layout
* From/To search inputs with teal/rose dot indicators
* "Suggested for you" section — reads user's registered university and surfaces matching rides at the top
* University filter dropdown and gender-safe toggle
* Skeleton loading cards — no spinner
* Contextual empty state with Post a Ride CTA
* My Rides page — active/past tabs, posted and joined rides
* Expandable map per ride card, passenger manifest for drivers
* Cancel ride (driver) and Leave ride (passenger) actions

---

### Trust & Rating System (F-08)

Peer accountability system for both carpool and parking:

* After departure time passes, Rate button appears per person on past rides
* Driver rates each passenger individually — not blocked after first rating
* Passenger rates driver
* After confirmed booking end time, Rate Spot button appears on My Bookings
* Student rates homeowner
* Quick comment chips per context — "Great driver!", "Punctual", "Left spot clean"
* Trust score auto-updates — 5 stars = +3, 4 stars = +2, 3 stars = +1, 2 stars = -1, 1 star = -3
* Duplicate prevention — one rating per person per ride or booking
* My Ratings page — received ratings with breakdown chart, given ratings tab, filter by Carpool/Parking

**Endpoints:**

```
POST   /api/ratings
GET    /api/ratings/received
GET    /api/ratings/given
GET    /api/ratings/check
GET    /api/ratings/user/:id
```

---

### In-Ride & Booking Chat (F-09)

Private messaging system for carpool groups and parking bookings:

* Carpool chat — driver and all confirmed passengers can message each other per ride
* Booking chat — student and homeowner can message each other per booking
* Polling every 5 seconds — no websocket dependency, works on existing infrastructure
* Messages grouped by date with separators
* My messages on right (teal for carpool, dark for parking), others on left with avatar and name
* Unread message badge on chat button — count fetched in bulk on page load
* Messages marked as read on open
* Auto-scroll to latest message on open and on new message
* Participant avatars shown in chat header
* Authorization enforced on backend — only ride/booking members can read or write
* Enter to send, Shift+Enter for new line, auto-expanding textarea

**Endpoints:**

```
GET    /api/messages/:contextType/:contextId
POST   /api/messages/:contextType/:contextId
GET    /api/messages/unread/:contextType/:contextId
POST   /api/messages/unread/bulk
```

---

### Anonymous Incident Reporting (F-10)

* Categories: Harassment, Unsafe Driving, Theft, Suspicious Activity, Other
* GPS auto-captured, fully anonymous submission
* Admin table with status management (Pending → Reviewed → Resolved)

**Endpoints:** `POST /api/incidents`, `GET /api/incidents` (admin), `PATCH /api/incidents/:id/status` (admin)

---

### SOS Panic Button (F-11)

* One-tap GPS alert to up to 3 emergency contacts
* Branded email with Google Maps link
* Pulsing animation when contacts are set

**Endpoints:** `POST /api/sos/trigger`, `GET/POST /api/sos/contacts`, `DELETE /api/sos/contacts/:id`

---

### Firebase Push Notification (F-12)

Real-time push notification system using Firebase Cloud Messaging (FCM):

* Browser push permission requested on login and stored as FCM token per user
* Firebase Admin SDK on the backend sends notifications to individual device tokens
* Notifications persisted to MongoDB — users can read history even without a push token
* In-app Notifications page shows all received notifications with type-based icons and timestamps
* Notification types include: booking requests, payment confirmations, carpool events, new passengers, ratings received, and pricing nudges
* Mark as read per notification or mark all as read in one action
* Service worker registered via `firebase-messaging-sw.js` for background push delivery
* Foreground message handler keeps the UI in sync when the app is open

**Endpoints:**

```
POST   /api/user/fcm-token
GET    /api/notifications/my
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
```

---

### Live Trip Sharing (F-13)

* One-tap trip sharing during active carpool rides
* Generates live location tracking link (Google Maps integration)
* Shareable with external contacts
* Periodic location updates while trip is active
* Auto-expiry after trip ends for privacy
* Route deviation detection — Haversine + polyline projection algorithm flags when driver moves more than 500 metres off the planned route
* Deviation alerts stored in MongoDB with 24-hour TTL and delivered to passengers via polling
* Passengers can acknowledge (dismiss) an alert; driver is notified by email with a 5-minute cooldown to prevent inbox flooding

**Endpoints:**

```
POST   /api/trips/share
GET    /api/trips/:id/status
POST   /api/carpool/routes/:id/start
PATCH  /api/carpool/routes/:id/end-trip
POST   /api/carpool/routes/:id/location
GET    /api/carpool/routes/:id/deviation-alerts
POST   /api/carpool/routes/:id/deviation-alerts/:alertId/ack
```

---

### Homeowner Announcement (F-14)

* Homeowners can post announcements per parking listing
* Visible to users with active or past bookings for that spot
* Useful for schedule updates, availability notices, or alerts
* Announcement banner shown on booking and listing pages

**Endpoints:**

```
POST   /api/announcements/:listingId
GET    /api/announcements/:listingId
DELETE /api/announcements/:id
```

---

### Admin Moderation Dashboard (F-15)

* Real-time stats: users, students, pending verifications, active carpools
* Student ID verification panel with approve/reject and email notifications
* Carpool moderation panel — view all rides, force cancel, filter by status, search by driver
* Incident management panel — review anonymous reports, update status
* User management panel — view all registered users, filter by role
* Coupon management panel — create, edit, activate/deactivate, and delete discount codes
* System status panel showing all modules

---

### Coins and Leaderboard (F-16)

Gamified reward system tied to on-time check-in behaviour:

* Coins are earned at check-in based on how early a passenger arrives relative to departure time — 15 coins for 10–15 minutes early, 10 coins for 5–10 minutes early, 5 coins for under 5 minutes early
* Location-verified check-in required within 150 metres of the pickup point to earn coins
* Coins can be redeemed for carpool payment discounts across three tiers: 50 coins = Tk 10 off, 100 coins = Tk 25 off, 200 coins = Tk 60 off
* Coin redemption is reserved at checkout and released if the payment is abandoned
* Duplicate coin earning is prevented per ride via a unique compound index on user, type, source type, and source ID
* CoinTransaction model tracks every earn, redeem, refund, and admin adjustment with full audit metadata
* Rewards page shows current coin balance and all available redemption tiers

**Endpoints:**

```
GET /api/rewards/me
GET /api/rewards/quote?serviceType=carpool&amount=<amount>
```

---

### Coupons and Discounts (F-17)

Admin-controlled discount code system applicable to parking and carpool payments:

* Admin creates coupons with code, title, description, discount type (percentage or fixed), discount value, optional maximum discount cap, minimum order amount, total usage limit, and per-user usage limit
* Coupons can be scoped to parking, carpool, or both service types
* Valid date range enforced — coupon is rejected if used outside the active window
* Per-user usage tracked in an embedded array on the Coupon document
* Welcome coupons flagged separately for new user onboarding flows
* Students enter a coupon code at checkout; the backend validates and returns the discounted total before payment is initiated
* Admin panel lists all coupons with live toggle to activate or deactivate, inline editing, and deletion
* Coupon search by code or title available in the admin panel

**Endpoints:**

```
GET  /api/coupons/available
POST /api/coupons/validate
```

Admin endpoints are routed through the admin controller and protected by the admin role middleware.

---

### Time-Based Check-In (F-18)

Prevents no-shows by requiring users to confirm arrival before a ride:

* Passengers tap "I've Arrived" within a defined time window before departure
* Check-in validates that the passenger's GPS location is within 150 metres of the pickup point
* If a passenger does not check in, their seat is automatically cancelled via the auto-cancel endpoint
* Drivers can view the real-time check-in status of all passengers
* Coins are awarded at the moment of a valid check-in based on early arrival time (see F-16)
* Check-in data feeds into the deviation and rewards systems

**Endpoints:**

```
POST   /api/carpool/:id/checkin
GET    /api/carpool/:id/checkin-status
PATCH  /api/carpool/:id/auto-cancel-no-show
```

---

### Advanced Search & Filter (F-19)

Multi-dimensional filtering layer on the ride browse experience:

* Free-text from/to search — filters ride cards client-side against origin and destination labels
* University filter dropdown — surfaces rides associated with a specific university preset
* Gender-safe toggle — filters to rides marked as gender-safe by the driver
* Maximum price slider — backend query parameter filters rides where price per seat is at or below the selected ceiling (default ceiling Tk 500)
* Minimum available seats — backend query parameter to exclude full or near-full rides
* Departure window filter — preset time buckets (morning, afternoon, evening) sent as a time range to the backend
* Active filter indicator — a summary chip shows when any non-default filter is applied with a clear all button
* Results update reactively as filters change; each filter combination triggers a new API fetch

**Endpoints:** Filters are passed as query parameters to `GET /api/carpool/routes`

---

### Cost Cutting Calculator (F-20)

Inline savings estimator shown at the point of joining a carpool ride:

* Each ride card displays an estimated saving chip when the calculated saving exceeds Tk 50
* Savings are computed by comparing the carpool price per seat against a solo CNG fare estimated at Tk 25 per kilometre for the same route distance
* The checkout modal shows a full savings breakdown — estimated solo CNG cost versus carpool price, with the difference highlighted in green
* When the fare is comparable to a solo ride, a neutral "fare is similar to solo CNG for this route" message is shown instead
* The calculator uses the route's stored kilometre distance where available, falling back to a seat-count-based estimate
* No user input required — savings display automatically based on route data

---

## Rider Trust Profile

* Public profile page for each user showing name, photo, university, and verification status
* Trust score prominently displayed with visual indicator
* Rating breakdown with average score and total ratings count
* Recent reviews preview (latest feedback from other users)
* Badge indicators for verified student and active user
* Accessible from ride cards, chat headers, and booking contexts

**Endpoints:**

```
GET /api/users/:id/profile
GET /api/ratings/user/:id
```

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
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

```bash
cd server && npm install && npm run dev
```

### Frontend — `client/.env`

```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

```bash
cd client && npm install && npm run dev
```

---

## Sprint Plan

| Sprint | Theme               | Status   |
| ------ | ------------------- | -------- |
| S1     | Parking Marketplace | Complete |
| S2     | Carpooling Network  | Complete |
| S3     | Safety & Trust      | Complete |
| S4     | Smart Features      | Complete |

| Teammate | Sprint 1       | Sprint 2       | Sprint 3          | Sprint 4       |
| -------- | -------------- | -------------- | ----------------- | -------------- |
| Shahriar | F-01           | F-09           | F-11 + F-15       | F-17           |
| Sushmita | F-02 + F-05    | F-08           | F-14              | F-16           |
| Fauzia   | F-06           | F-07           | F-13              | F-18 + F-19    |
| Tasnuva  | F-03 + F-04    | F-10           | F-12              | F-20           |

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


## Contributors

Al SHAHRIAR BIN SHAHEEN
SUSHMITA ALIA
TASNUVA KARIM 
FAUZIA SHUPTY
