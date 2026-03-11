# EkSathe

EkSathe is a secure housing platform designed to help university students find trusted accommodation while allowing homeowners to list verified rental spaces.

This repository currently contains the **authentication system and frontend interface for user accounts**.

---

# Project Structure

EkSathe is built as a **full-stack application** with separate client and server.

Eksathe/
│
├── client/ # React frontend (Vite + Tailwind)
├── server/ # Node.js backend (Express + MongoDB)
├── docs/ # Documentation (SRS, diagrams, API plans)
└── README.md

---

# Tech Stack

### Frontend

- React (Vite)
- TailwindCSS
- React Router
- Axios
- React Hook Form
- Zod
- Sonner (toast notifications)

### Backend

- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- JWT Authentication
- bcrypt password hashing
- Nodemailer (email service)

---

# Authentication Features (Completed)

The platform currently supports a full authentication flow.

### User Registration

Users can create an account with:

- Name
- Email
- Phone
- Password
- Role (student / homeowner)

After registration:

- A **6-digit OTP is generated**
- OTP is sent via email
- Account status is `pending_verification`

---

### Email Verification

Users verify their account using the OTP sent to their email.

Verification logic includes:

- OTP validation
- OTP expiry check
- Account activation after successful verification

---

### Login

Users can log in using:

- Email
- Password

Security checks include:

- Password verification
- Email verification status
- Suspended account check

On success:

- JWT token is issued
- Token contains:

id
role
status

---

### Authentication Middleware

Protected routes are secured using:

**authenticate middleware**

- Verifies JWT
- Extracts user identity
- Attaches `{ id, role, status }` to `req.user`

**authorize middleware**

- Restricts access based on roles
- Example:

authorize("admin")
authorize("student","homeowner")

---

### Current API Endpoints

Auth routes implemented:

POST /api/auth/register
POST /api/auth/verify-email
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password

---

# Frontend Features (Completed)

The React client includes a full authentication UI.

Pages implemented:

Register
Verify Email (OTP input)
Login
Forgot Password
Reset Password
Dashboard (protected)

---

### UI Highlights

- Clean editorial design
- TailwindCSS styling
- OTP input component with auto-focus
- Form validation using Zod
- Toast notifications for feedback
- Protected routes using AuthContext

---

# Environment Setup

## Backend

Create `.env` inside `server/`

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

EMAIL_USER=your_email
EMAIL_PASS=your_email_password

Run backend:

cd server
npm install
npm run dev

---

## Frontend

Create `.env` inside `client/`

VITE_API_URL=http://localhost:5000/api

Run frontend:

cd client
npm install
npm run dev

Frontend runs at:

http://localhost:5173

---

# Documentation

Project documentation is available in the `/docs` folder.

Includes:

- SRS document
- System diagrams
- Auth API planning

---

# Development Workflow

Team members should follow this workflow:

1. Clone repository
2. Create a new feature branch

git checkout -b feature/feature-name

3. Make changes
4. Commit changes

git add .
git commit -m "feature: description"

5. Push branch

git push origin feature/feature-name

6. Open a Pull Request to `main`

Direct pushes to `main` should be avoided.

---

# Current Development Stage

Completed:

- Backend authentication system
- Email verification
- Password reset system
- React authentication UI
- Protected routes
- Auth context

Next planned features:

- Property listing system
- Student housing search
- Booking requests
- Review and trust score system
- Admin moderation tools

---

# Contributors

EkSathe Development Team

University Software Engineering Project
