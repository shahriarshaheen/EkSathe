# EkSathe

> Getting to university in Dhaka is expensive, unsafe, and uncoordinated. EkSathe fixes that. Book verified parking near campus, join carpools with verified peers, split costs automatically and share live trips with family. Homeowners turn idle driveways into monthly income. Built on the MERN stack.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database](#database)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Parking Marketplace

Homeowners near university campuses can list their unused garages and driveways. Students can browse, book, and pay for parking by the hour or month — all within the platform.

- List parking spots with photos, pricing, and availability hours
- Interactive map showing all nearby spots as clickable pins
- Calendar-based booking with automatic conflict detection
- Online payment via SSLCommerz (bKash, Nagad, cards)
- Homeowner dashboard showing earnings, bookings, and payout history

### Carpooling Network

Students can post and join carpool rides with identity-verified university peers. Every user on the platform is verified through their student ID and university email.

- Post a carpool route with origin, destination, departure time, and available seats
- Pre-set routes for common Dhaka university commutes (Mirpur to DU, Uttara to NSU, and more)
- Gender-safe filter — drivers can restrict their ride to female passengers only
- Automatic cost splitting that recalculates each passenger's share as riders join
- Post-ride rating system with trust scores displayed as Bronze, Silver, and Gold badges

### Safety and Security

A dedicated safety layer built for the commute challenges faced by students in Dhaka.

- One-tap SOS button that sends an SMS with the user's live GPS coordinates to up to 3 emergency contacts
- Shareable live trip link — family members can track a student's journey in real time with no app install required
- Route deviation alert — if the driver strays more than 500 meters from the planned route, an SMS is automatically sent to the passenger
- Anonymous incident reporting with GPS tagging for harassment and unsafe driving reports
- Admin moderation dashboard for reviewing reports, managing users, and monitoring platform activity

### Smart Features

- Smart demand indicator that shows a high-demand banner during exam weeks to prompt early booking
- Dynamic pricing nudge that notifies homeowners when a spot has had no bookings in 7 days and suggests a price reduction
- Firebase push notifications for booking confirmations, ride reminders, new ratings, and payment updates
- Advanced search and filter across parking spots and carpool rides by price, distance, time, gender-safe toggle, and university route
- Trust score system calculated from average rating, number of completed bookings, and account age

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, React Router v6, Zustand, Axios, TailwindCSS, shadcn/ui, Framer Motion |
| Backend | Node.js 20 LTS, Express 4.x, JWT, bcrypt, Multer, nodemailer, node-cron |
| Database | MongoDB Atlas, Mongoose ODM, Aggregation Pipelines, Geospatial Indexes (2dsphere) |
| Real-time | Socket.io (live trip sharing, route deviation alerts) |
| Payments | SSLCommerz (bKash, Nagad, cards) |
| Notifications | Firebase Cloud Messaging, Twilio SMS |
| Media | Cloudinary (parking spot photos) |
| Maps | Google Maps JS API, Google Directions API |
| DevOps | GitHub, Vercel, Railway / Render, MongoDB Atlas |

---

## Architecture

```
CLIENT
React SPA — Vite, TailwindCSS, shadcn/ui, Axios, Socket.io-client

        HTTPS REST + WebSocket

SERVER
Node.js + Express — JWT Middleware, Controllers, Socket.io Server

        Mongoose ODM

DATABASE
MongoDB Atlas — Cloudinary — Firebase FCM

EXTERNAL SERVICES
Google Maps — SSLCommerz — Twilio — Firebase FCM
```

---

## Database

| Collection | Key Fields |
|------------|------------|
| users | _id, name, email, role, studentId, phone, trustScore, ratings[] |
| parking_spots | _id, ownerId, title, photos[], price, location {coordinates}, availability |
| bookings | _id, spotId, studentId, startTime, endTime, status, paymentRef |
| carpool_routes | _id, driverId, origin, destination, seats, pricePerSeat, passengers[], genderSafe |
| ratings | _id, fromUser, toUser, carpoolId, score (1–5), comment, createdAt |
| incidents | _id, reporterId, type, description, location, timestamp, status |
| notifications | _id, userId, type, message, read, createdAt |

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/parking/spots | Public | List all spots with geo filter |
| POST | /api/parking/spots | JWT (Owner) | Create a new parking listing |
| GET | /api/parking/spots/:id | Public | Get spot details |
| POST | /api/bookings | JWT (Student) | Create booking and trigger payment |
| GET | /api/bookings/my | JWT | Get user's booking history |
| GET | /api/carpool/routes | Public | Browse all carpool routes |
| POST | /api/carpool/routes | JWT (Driver) | Post a new carpool route |
| POST | /api/carpool/routes/:id/join | JWT (Student) | Join a carpool route |
| POST | /api/safety/sos | JWT | Trigger SOS and send SMS to emergency contacts |
| POST | /api/safety/incidents | JWT | Submit an anonymous incident report |
| GET | /api/admin/incidents | JWT (Admin) | View and manage all incident reports |
| GET | /api/admin/users | JWT (Admin) | User management panel |

---

## Getting Started

### Prerequisites

- Node.js v20 LTS
- MongoDB Atlas account (free M0 tier is sufficient)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/EkSathe.git
cd EkSathe

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Set up environment variables
cp .env.example .env
# Fill in your credentials — see Environment Variables below

# Start the development servers

# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:5000`.

---

## Environment Variables

Create a `.env` file inside `server/` using `.env.example` as a reference:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GOOGLE_MAPS_API_KEY=

SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASS=
SSLCOMMERZ_IS_LIVE=false

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

FIREBASE_SERVER_KEY=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

CLIENT_URL=http://localhost:5173
```

---

## Deployment

| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting with automatic GitHub deployments |
| Railway / Render | Backend Node.js hosting, free tier |
| MongoDB Atlas M0 | Cloud database, 512MB free |
| Cloudinary | Parking spot photo storage, 25GB free |
| Twilio | SOS SMS alerts, trial credit available |
| Firebase FCM | Web push notifications, free |

---

## Contributing

Contributions are welcome. Please read `CONTRIBUTING.md` before opening a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit using Conventional Commits: `git commit -m "feat: your description"`
4. Push and open a Pull Request against `main`

---

## License

MIT License. See `LICENSE` for details.
