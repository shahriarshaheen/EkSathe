# EkSathe

EkSathe is a MERN-stack platform designed to help students find parking, carpool opportunities, and safer mobility options around university areas.

The goal of the project is to reduce transportation problems faced by students in Dhaka by providing a centralized digital platform for parking discovery, ride sharing, and safety features.

---

# Current Development Status

This project is currently under active development.

## Implemented (Backend Authentication v1)

The backend authentication system has been implemented using Node.js, Express, MongoDB, and JWT.

Features implemented:

- User registration
- Email OTP verification
- Login with JWT authentication
- Protected route middleware
- Role-based authorization middleware
- Get current authenticated user (`/api/auth/me`)
- Logout endpoint
- Forgot password
- Reset password

---

# Planned Modules

The following modules are planned for future development:

- Parking marketplace
- Carpool ride sharing
- Safety verification features
- Smart parking availability detection
- Admin dashboard
- Notifications and alerts
- Maps and route support

---

# Tech Stack

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT (jsonwebtoken)
- bcrypt
- Nodemailer
- Express Validator

## Frontend

- React
- Vite

---

# Project Structure
EkSathe
│
├── client/ # React frontend
│
├── server/ # Express backend
│ ├── src
│ │ ├── config
│ │ ├── controllers
│ │ ├── middleware
│ │ ├── models
│ │ ├── routes
│ │ ├── services
│ │ ├── utils
│ │ └── validators
│
├── docs/ # Project documentation
│ ├── srs_documentation.md
│ └── class-diagram-v1.drawio.png
│
└── README.md

---

# Authentication API

These backend authentication routes are currently implemented.

## Register
POST /api/auth/register

Creates a new user account.

---

## Verify Email
POST /api/auth/verify-email

Verifies the user's email using the OTP sent during registration.

---

## Login
POST /api/auth/login

Authenticates the user and returns a JWT token.

---

## Get Current User
GET /api/auth/me

Returns the currently authenticated user's profile.

This route requires an authorization header:
Authorization: Bearer <token>

---

## Logout
POST /api/auth/logout


Stateless logout. The client must discard the JWT token.

---

## Forgot Password
POST /api/auth/forgot-password


Generates a password reset token and sends a reset email.

---

## Reset Password
POST /api/auth/reset-password


Allows the user to set a new password using the reset token.

---

# Setup

## Backend Setup
cd server
npm install
npm run dev


Server runs on:
http://localhost:5000


---

## Frontend Setup
cd client
npm install
npm run dev

Frontend runs on:
http://localhost:5173

---

# Environment Variables

Create a `.env` file inside the `server` folder using `.env.example`.

Example:
PORT=5000
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=http://localhost:5173

EMAIL_USER=
EMAIL_PASS=

---

# Documentation

Project planning and documentation files are stored in the `docs` folder.

These include:

- Software Requirement Specification (SRS)
- System architecture diagrams

---

# Project Status

This repository is under active development as part of a university project.

Additional modules such as parking services, ride sharing, and safety features will be implemented in future updates.

---

# License

This project is created for educational purposes.
