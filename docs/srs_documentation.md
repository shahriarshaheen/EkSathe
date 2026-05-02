# 

# ***“EkSathe”***  

# ***Student-Centric Smart Mobility & Parking Ecosystem***

**Software Requirements Specification (SRS)**

**Prepared by**

| Student ID | Name |
| :---: | :---: |
| 24241066 | Al Shahriar Bin Shaheen |
| 23241026 | Sushmita Alia |
| 23201208 | Fauzia Zaman Shupty |
| 23201066 | Tasnuva Karim Samiha |

**1\. Introduction**

**1.1 Purpose**

This Software Requirements Specification (SRS) document outlines the requirements for developing "EkSathe" \-a student-centric smart mobility and parking ecosystem built using the MERN stack (MongoDB, Express.js, React.js, Node.js). The primary goal of this application is to solve the daily commute and parking challenges faced by university students in Dhaka, Bangladesh, by combining a parking marketplace, a verified carpooling network, and a real-time commute safety layer into a single platform.

 

**1.2 Scope**

The scope of this project includes the design, development, testing, and deployment of the EkSathe web application, catering to: 

* Students who can register, book parking spots, post or join carpool rides, and use safety features including SOS alerts and live trip sharing.  
    
* Homeowners who can list unused garage or driveway space near university campuses and earn monthly income from student bookings.

*  Carpool Drivers who can post routes, manage passenger requests, and split fuel costs automatically with fellow students.  
    
* Admins who can oversee platform activity, review incident reports, and manage user accounts from a moderation dashboard.

 

This SRS covers the functional and non-functional requirements, constraints, assumptions, technology stack, class diagram, and the agile development plan for the project.

**1.3 Definitions, Acronyms, and Abbreviations**

|  Term | Meaning | Definition |
| :---- | :---- | :---- |
|  MERN | MongoDB, Express.js, React.js, Node.js   |  the full-stack JavaScript framework used. |
| JWT | JSON Web Token |  used for stateless authentication and session management.  |
| SOS | Save Our Souls  | emergency alert button that sends the user's GPS location to emergency contacts  |
| OTP | One-Time Password | a time-limited code sent to the user's email for verification.  |
| RBAC | Role-Based Access Control  | restricts platform features based on user role (student, homeowner, admin).  |
| FCM | Firebase Cloud Messaging | used to deliver push notifications to mobile browser users. |
| API | Application Programming Interface | the RESTful communication layer between frontend and backend. |

**1.4 References**

*  [**MongoDB Documentation**](https://www.mongodb.com/docs/) 

*  **[Express.js Documentation](http://Express.js)**   
    
*  **[React.js Documentation](http://React.js)**  
    
* [**Node.js Documentation**](http://Node.js)  
    
* [**Socket.io Documentation**](http://Socket.io)  
    
*  [**Google Maps JavaScript API**](https://developers.google.com/maps/documentation/javascript/)   
    
* [**SSLCommerz Developer Documentation**](https://developer.sslcommerz.com/)   
    
* [**Firebase Cloud Messaging**](https://firebase.google.com/docs/cloud-messaging)   
    
* [**Twilio SMS API**](https://www.twilio.com/docs/messaging)  
    
* [**Cloudinary Documentation**](https://cloudinary.com/documentation)


**1.5 Overview**

Section 2 provides an overall description of the product including its user classes, operating environment, and constraints. Section 3 details the functional and non-functional requirements organized by the feature group. Section 4 presents the class diagram for the system. Section 5 outlines the agile development plan with sprint-wise deliverables.

**2\. Overall Description**

**2.1 Product Perspective**

EkSathe is a standalone full-stack web application built on the MERN stack. It operates as a two-sided marketplace and peer-to-peer carpooling platform combined with a real-time commute safety system. The platform integrates with external APIs and services including Google Maps for location and routing, SSLCommerz for online payments, Twilio for SMS-based SOS alerts, Firebase FCM for push notifications, and Cloudinary for parking spot photo storage. The application must handle real-time data updates via Socket.io for live GPS tracking and route deviation detection.

 

**2.2 Product Features**

* **Parking Marketplace:** Homeowners near university campuses list unused parking space. Students browse spots on an interactive map, book by calendar, and pay online.  
    
* **Carpooling Network:** Students post and join verified carpool routes with pre-set university destinations, gender-safe filters, and automatic cost splitting.

* **Safety Layer:** SOS panic button with SMS alerts, live trip sharing via shareable link, route deviation alerts, and anonymous incident reporting.

* **Smart Features:** Demand indicator banners during exam weeks, dynamic pricing nudges for homeowners, push notifications, advanced search and filter, and a trust score badge system.  
    
* **Admin Panel:** Incident report management, user moderation, and platform-wide statistics dashboard.

 

**2.3 User Classes and Characteristics**

| User Type | Description |
| :---- | :---- |
| Student ( Driver/ Rider) | University students who book parking, post or join carpools, and use safety features. Verified via university email and student ID. Primary user of the platform. |
| Homeowner | Residents near university campuses who list unused garage or driveway space for student bookings. Require a simple listing form and earnings dashboard. |
| Carpool Driver | A student who acts as the driver by posting a route, managing seat requests, and triggering ride start/end. Uses SOS and live sharing features |
| Admin | Platform supervisors who monitor incidents, manage user accounts, and view system statistics. Have full access to the moderation dashboard. |


**2.4 Operating Environment**

*  **Web Application:** Accessible on modern web browsers including Chrome, Firefox, Edge, and Safari.  
    
* **Mobile Compatibility:** Fully responsive design for smartphones and tablets from 375px screen width.  
    
* **Server-Side:** Node.js 20 LTS and Express.js running on Railway or Render (cloud hosting).  
    
* **Database:** MongoDB Atlas cloud cluster with Mongoose ODM and 2dsphere geospatial indexing.  
    
*  **Frontend Hosting:** Deployed on Vercel with CI/CD from the GitHub repository.

 

**2.5 Constraints**

* **Security:** All passwords must be hashed with bcrypt. All communication must occur over HTTPS. JWT tokens must be used for all authenticated routes.  
    
* **Payment:** The platform uses SSLCommerz sandbox mode during academic development. No real financial transactions are processed.  
    
* **SMS:** Twilio trial credit or SSL Wireless sandbox is used for SOS alerts. Limited to verified numbers in trial mode.  
    
* **Time & Resource:** The project must be delivered in 8 weeks by a team of four developers following an agile sprint structure.  
    
* **Student Verification:** The platform relies on university email domain verification and student ID entry as there is no access to official university registrar APIs.

 

**2.6 Assumptions and Dependencies**

* Users have a stable internet connection for real-time features such as live trip sharing and route deviation detection.  
    
*  Students grant browser location access (Geolocation API) for GPS-dependent features including SOS and live tracking.  
    
* Third-party services for payment, SMS, push notifications, and maps are available and operating in sandbox or free-tier mode.  
    
*  All external API integrations including SSLCommerz, Twilio, Firebase, and Google Maps operate on free-tier or sandbox modes suitable for academic project development and demonstration.

**3\. System Requirements**

**3.1 Functional Requirements**

**3.1.1 Authentication & Authorization**

**1\. User Registration:**

○  A student should be able to register using their university email, student ID, name, phone number, and password.

○  The system should allow users to select their role during registration as either Student or Homeowner or Admin

○  The system should not allow access to protected features until a student's university email has been verified using an OTP sent to their email. The OTP should expire after 1 hour.

 

**2\. User Login & Logout:**

○  The system should allow users to log in with their registered email and password and receive a secure JWT session token.

○  The system should allow users to log out, which immediately invalidates their active session.

 

**3\. Password Reset:**

○  The system should allow users to reset their password by requesting a secure reset link sent to their registered email.

○  The password reset link should expire after 1 hour. Only with a valid token should the user be allowed to set a new password.

**3.1.2 Parking Marketplace**

**1\. Parking Spot Listing (F-01):**

○  A homeowner should be able to list a parking spot by submitting a title, address, price per day, availability hours, and up to three photos.

○  A homeowner should be able to edit or deactivate their parking listing at any time.

○  Parking spot listings should be stored in MongoDB with geospatial coordinates to support proximity-based search.

 

**2\. Interactive Map View (F-02):**

○  A student should be able to view all available parking spots as clickable pins on an interactive Google Map.

○  Clicking a map pin should open a side panel showing spot details, photos, pricing, and a Book button.

 

**3\. Booking System with Calendar UI (F-03):**

○  A student should be able to book a parking spot by selecting a date and an available time slot from a calendar interface.

○  The system should not allow a student to book a time slot that is already confirmed by another booking.

○  The system should send a booking confirmation email to the student after a successful booking.

 

**4\. SSLCommerz Payment Integration (F-04):**

○  The system should allow a student to pay for a booking online using bKash, Nagad, or a card via SSLCommerz.

○  On payment success, the booking status should automatically update to 'confirmed' and the homeowner should be notified.

 

**5\. Homeowner Earnings Dashboard (F-05):**

○  A homeowner should be able to view their total monthly earnings, number of completed bookings, upcoming reservations, and a payout history table on their dashboard.

○  Earnings data should be calculated from MongoDB aggregation queries and displayed as a chart.

 

**3.1.3 Carpooling Network**

**1\. Post a Carpool Route (F-06):**

○  A student should be able to post a carpool route by entering origin, destination, departure time, number of available seats, and price per seat.

○  The posted route should be listed publicly for other students to browse and join.

**2\. Pre-set University Routes (F-07):**

○  A student should be able to select a pre-set university route from a dropdown to automatically fill in the origin and destination fields when posting a carpool.

○  The system should support at least 10 pre-configured Dhaka university routes such as Mirpur to DU, Dhanmondi to NSU, and others.

 

**3\. Gender-Safe Carpool Filter (F-08):**

○  A driver should be able to enable a female-passengers-only filter when posting a carpool route.

○  A student should be able to toggle a gender-safe filter on the search page to view only female-only rides.

 

**4\. Cost Splitting Calculator (F-09):**

○  A driver should be able to enter the total estimated fuel and toll cost when posting a carpool route.

○  The system should automatically calculate and display each passenger's share in real time as new passengers join the route.

 

**5\. Post-Ride Rating System (F-10):**

○  A student should be able to rate a driver or passenger on a scale of 1 to 5 stars after a ride is marked as complete.

○  An optional comment should be allowed alongside the star rating.

○  The average rating should be calculated and displayed as a badge on the user's profile card.

 

 

**3.1.4 Safety Features** 

**1\. SOS Panic Button (F-11):**

○  A student should be able to tap an SOS button during an active ride to instantly send their GPS location via SMS to up to three pre-configured emergency contacts.

○  The SMS should include the student's name and their last known GPS coordinates.

 

**2\. Live Trip Sharing Link (F-12):**

○  A student should be able to generate a shareable live trip link when a ride starts so that a family member can track their journey in real time without creating an account.

○  The student's live location should update every 30 seconds on the shared tracking page.

 

**3\. Route Deviation Alert (F-13):**

○  The system should store the planned route as a polyline when a ride starts.

○  The system should alert the passenger via in-app notification and SMS if the driver's location deviates more than 500 meters from the planned route.

 

**4\. Anonymous Incident Reporting (F-14):**

○  A student should be able to submit an anonymous incident report with a category such as harassment, unsafe driving, or wrong location, along with a written description.

○  The system should automatically attach the reporter's GPS location and timestamp to the report.

○  The identity of the reporter should never be exposed to the reported user or in any public-facing part of the platform.

 

**5\. Admin Moderation Dashboard (F-15):**

○  An admin should be able to view, filter, and act on all incident reports from a protected moderation dashboard, with filtering by status and type.

○  An admin should be able to flag, suspend, or verify any user account from the moderation dashboard.

○  The admin dashboard should display platform-wide statistics including total bookings, active rides, and total revenue.

 

 

**3.1.5 Smart Features**

**1\. Smart Demand Indicator (F-16):**

○  The system should display a high-demand banner on the parking page during university exam weeks to prompt students to book early.

○  The system should check exam calendar dates stored in the database daily using a scheduled background job and update the banner accordingly.

 

**2\. Dynamic Pricing Nudge (F-17):**

○  The system should automatically notify a homeowner via a dashboard notification if their parking spot has had zero bookings in the past 7 days.

○  The notification should suggest that the homeowner consider reducing their listing price to attract more bookings.

 

**3\. Firebase Push Notifications (F-18):**

○  The system should allow users to receive push notifications for booking confirmations, ride reminders 15 minutes before departure, new ratings received, payments processed, and incident report status updates.

○  Push notifications should work on mobile browsers via Firebase Cloud Messaging and a Service Worker without requiring any app installation.

 

**4\. Advanced Search & Filter (F-19):**

○  A student should be able to search and filter parking spots and carpool rides by price range, distance, time of day, gender-safe toggle, available seats, and university route.

○  The search should use a debounced query so that results update as the user types without excessive API calls.

 

**5\. Trust Score & Badge System (F-20):**

○  The system should calculate each user's trust score based on their average rating, number of completed bookings or rides, and account age.

○  A student should be able to view their trust score displayed as a Bronze, Silver, or Gold badge on their profile card.

 

 

**3.2 Non-Functional Requirements**

 

**Performance Requirements:**

○  The system should be able to return API responses for standard requests such as listing parking spots or browsing carpool routes within 2 seconds under normal load conditions.

○  The system should be able to deliver real-time GPS location updates to connected clients within 5 seconds of a location change event via Socket.io.

○  The system should have a frontend that loads its initial page within 3 seconds on a standard broadband connection.

 

**Security Requirements:**

○  The system should implement bcrypt password hashing with a minimum cost factor of 10 to ensure all user passwords are stored securely and never in plain text.

○  The system should implement JWT-based authentication so that all protected API routes verify the user's token on every request and return a 401 Unauthorized response for invalid or expired tokens.

○  The system should have HTTPS enforced across all environments so that all data transmitted between the client and server is encrypted in transit.

○  The system should not allow sensitive configuration values such as API keys, database URIs, and JWT secrets to be stored in the codebase. All secrets must be managed through environment variables.

 

**Reliability & Availability:**

○  The system should have an availability of 99% uptime across the frontend and backend services during the project evaluation period.

○  The system should implement error handling for all external service calls such as SMS, email, and push notifications so that a failure in one service does not crash the main API response.

 

**Scalability:**

○  The system should be able to handle concurrent booking requests without creating time slot conflicts, enforced through database-level conflict detection queries in MongoDB.

○  The system architecture should allow horizontal scaling of the Node.js backend and MongoDB cluster with minimal reconfiguration.

 

**Usability:**

○  The system should have a fully responsive interface that functions correctly on screen sizes ranging from 375px mobile to 1440px desktop without broken layouts or horizontal scrolling.

○  The system should provide real-time inline validation on all forms so that users receive clear, human-readable error messages rather than generic error codes.

○  The system should allow the live trip sharing page to be fully usable by a viewer who does not have an account and has not installed any application.

 

**Privacy:**

○  The system should implement anonymous incident reporting so that the identity of a reporter is never exposed to the reported user or in any public-facing part of the platform.

○  The system should implement role-based access control so that students, homeowners, and admins can only access the features permitted to their role.

