# 🎟️ Eventora – Event Booking Platform

Eventora is a full-stack MERN event booking platform that connects **event organizers** with **users** through a modern and intuitive platform.

Users can discover events, explore different categories, book tickets, pay securely online, and manage their bookings. Event organizers can create and manage events, update event details, and monitor their events through a dedicated organizer interface.

Designed with a scalable architecture and role-based access control, Eventora demonstrates modern full-stack web development using **React, Node.js, Express, MongoDB, JWT Authentication, Cloudinary, and Razorpay**.

---

# ✨ Core Features

### 👤 User Authentication

* User Registration & Login
* JWT-based Authentication
* Protected Routes
* Persistent Login Sessions
* Role-based Access Control
* User & Admin/Organizer Roles
* Secure Logout

---

### 🎫 Event Discovery

* Browse available events
* Explore events by category
* View complete event details
* Search and discover events
* Event date and location information
* Event pricing information
* Responsive event cards

---

### 🎟️ Ticket Booking

Users can:

* Browse available events
* View event details
* Book tickets
* Pay securely online via **Razorpay**
* Manage their bookings
* View previously booked events
* Access their ticket information
* View payment status of each booking

---

### 💳 Online Payments (Razorpay)

Eventora integrates **Razorpay** for secure and seamless ticket payments.

* Razorpay Checkout integration
* Order creation on booking
* Secure payment verification using signature validation
* Payment success / failure handling
* Booking confirmed only after successful payment
* Payment status tracking (Pending / Paid / Failed)
* Refund-ready architecture for future cancellations

---

### 👨‍💼 Event Organizer / Admin

Event organizers can:

* Create events
* Publish events
* Edit event details
* Update event information
* Delete events
* View their created events
* Manage event information
* Control ticket availability
* View payment/booking status for their events

---

### 🖼️ Event Images

* Upload event images
* Cloudinary-based image storage
* Image preview
* Event-specific images
* Optimized image handling

---

### 🛡️ Role-Based Access

Eventora provides different functionality depending on the user's role.

#### 👤 Users

* Discover events
* Book tickets
* Make secure payments
* View booked tickets
* Manage their profile

#### 👨‍💼 Admin / Organizers

* Create events
* Edit events
* Delete events
* Manage their events
* View event information
* View booking & payment details

---

### 📱 Fully Responsive

Eventora is designed to work across:

* 📱 Mobile
* 📲 Tablet
* 💻 Desktop

---

# 🛠 Tech Stack

## Frontend

* React.js
* React Router
* Axios
* Tailwind CSS
* Vite
* Lucide React
* Framer Motion
* Razorpay Checkout.js

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt
* Multer
* Razorpay Node SDK

## Services & Tools

* Cloudinary
* Razorpay
* Git
* GitHub
* Postman
* MongoDB Atlas

---

# 📂 Project Structure

```text
Eventora/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── assets/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── config/
│   ├── utils/
│   ├── uploads/
│   ├── app.js
│   └── server.js
│
├── README.md
└── package.json
```

---

# 🚀 Key Modules

## Authentication Module

Eventora uses JWT-based authentication to secure users and APIs.

### Features

* User Registration
* User Login
* JWT Authentication
* Protected Routes
* Role-based Authorization
* Password Hashing using bcrypt
* Persistent Authentication

---

# 🎪 Event Management

Event organizers have complete control over their events.

### Organizers can

* Create Events
* Add Event Images
* Add Event Description
* Set Event Date
* Set Event Location
* Set Ticket Price
* Set Ticket Availability
* Edit Events
* Delete Events
* View Their Events

---

# 🎟️ Booking & Payment System

Users can discover, book, and pay for events through Eventora using **Razorpay**.

### Booking & Payment Flow

```text
User
  ↓
Discover Events
  ↓
Select Event
  ↓
View Event Details
  ↓
Select Tickets
  ↓
Create Razorpay Order
  ↓
Razorpay Checkout (Payment)
  ↓
Verify Payment Signature
  ↓
Booking Confirmed (Payment: Paid)
  ↓
View My Tickets
```

If the payment fails or is cancelled, the booking is marked as **Failed / Pending** and the user can retry payment.

---

# 🗂️ Event Categories

Eventora organizes events into different categories to make discovery easier.

Examples include:

* 🎵 Music
* 🎤 Workshops
* 🏆 Sports
* 🎨 Art
* 💻 Technology
* 🍴 Food
* 🎭 Entertainment
* 📚 Education

---

# 🖼️ Image Management

Eventora uses **Cloudinary** for event and profile image management.

### Features

* Image Upload
* Cloud Storage
* Image URL Management
* Event Image Preview
* Profile Image Support

---

# 💳 Payment Management (Razorpay)

Eventora uses **Razorpay** to handle all ticket payments securely.

### Features

* Order creation per booking
* Razorpay Checkout on the frontend
* Server-side payment signature verification
* Payment status stored with each booking
* Prevents booking confirmation without successful payment
* Clean separation between booking creation and payment verification

---

# 🔐 Security Features

* JWT Authentication
* Password Hashing using bcrypt
* Protected API Routes
* Role-based Authorization
* Authentication Middleware
* Input Validation
* Secure Environment Variables
* Protected Admin Routes
* Razorpay Signature Verification for Payment Integrity

---

# ⚙️ Environment Variables

Create a `.env` file inside the **server** directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

> Add the public Razorpay Key ID to your **client** `.env` as well (e.g. `VITE_RAZORPAY_KEY_ID`) so the frontend can initialize Checkout.

---

# 📦 Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/eventora.git
```

### Move into the project

```bash
cd Eventora
```

### Install root dependencies

```bash
npm install
```

### Install frontend dependencies

```bash
cd client
npm install
```

### Install backend dependencies

```bash
cd ../server
npm install
```

---

# ▶️ Running the Project

## Start Backend

```bash
cd server
npm run dev
```

## Start Frontend

Open another terminal:

```bash
cd client
npm run dev
```

### Frontend

```text
http://localhost:5173
```

### Backend

```text
http://localhost:5000
```

---

# 📡 API Overview

## Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/profile
```

## Events

```text
GET    /api/events
GET    /api/events/:id
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id
```

## Bookings

```text
POST   /api/bookings
GET    /api/bookings
GET    /api/bookings/:id
```

## Payments (Razorpay)

```text
POST   /api/payments/create-order
POST   /api/payments/verify
GET    /api/payments/:id
```

> Update these endpoints according to your actual backend routes.

---

# 🔄 Application Flow

```text
                    EVENTORA
                       │
          ┌────────────┴────────────┐
          │                         │
       USER                    ORGANIZER
          │                         │
          ↓                         ↓
   Discover Events            Create Event
          │                         │
          ↓                         ↓
   View Event Details         Publish Event
          │                         │
          ↓                         ↓
    Book Tickets              Manage Event
          │                         │
          ↓                         ↓
  Pay via Razorpay          View Bookings/Payments
          │                         │
          ↓                         ↓
    My Tickets                 My Events
```

---

# 🏠 Main Pages

Eventora includes pages such as:

* Home
* Discover Events
* Event Details
* Categories
* Login
* Register
* Profile
* Checkout / Payment
* My Tickets
* My Events
* Post Event
* Edit Event

---

# 🎨 User Experience

Eventora focuses on providing a modern event discovery experience with:

* Clean UI
* Responsive layouts
* Smooth animations
* Interactive event cards
* Intuitive navigation
* Role-specific interfaces
* Modern typography
* Responsive navigation
* Animated UI components
* Seamless in-app Razorpay checkout experience

---

# ☁️ Deployment

The application can be deployed using:

### Frontend

* Vercel

### Backend

* Render
* Railway

### Database

* MongoDB Atlas

### Image Storage

* Cloudinary

### Payments

* Razorpay

---

# 📸 Screenshots

Add screenshots of:

* 🏠 Home Page
* 🔐 Login Page
* 📝 Registration Page
* 🎪 Event Discovery
* 🎟️ Event Details
* 🎫 Booking Page
* 💳 Razorpay Payment Checkout
* 🎟️ My Tickets
* 👨‍💼 Admin Dashboard
* ➕ Create Event
* ✏️ Edit Event
* 👤 Profile Page

---

# 🎯 Future Improvements

* 📧 Email Booking Confirmation
* 📱 QR Code Tickets
* 🔔 Push Notifications
* ⭐ Event Ratings & Reviews
* ❤️ Favorite Events
* 🔎 Advanced Event Search
* 📍 Location-based Event Discovery
* 📊 Organizer Analytics Dashboard
* 📈 Event Statistics
* 🎫 Digital QR Tickets
* 🤖 AI Event Recommendations
* 💬 AI Event Assistant
* 📅 Calendar Integration
* 🌙 Dark Mode
* 💸 Automated Refunds via Razorpay
* 🧾 Downloadable Payment Invoices

---

# 🤖 Future AI Integration

Eventora can be extended with AI-powered functionality such as:

### AI Event Recommendations

Recommend events based on:

* User interests
* Previous bookings
* Preferred categories
* Location
* Event popularity

### AI Event Assistant

Users could ask:

```text
"Find me music events this weekend."

"Which technology events are available?"

"Show me events near me."

"Suggest an event under ₹500."
```

The AI assistant can then search the Eventora event database and provide personalized recommendations.

---

# 🧩 Architecture

```text
                    ┌─────────────────┐
                    │     React       │
                    │    Frontend     │
                    └────────┬────────┘
                             │
                          Axios
                             │
                             ↓
                    ┌─────────────────┐
                    │     Express     │
                    │      API        │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ↓              ↓              ↓
      ┌──────────────┐┌──────────────┐┌──────────────┐
      │   MongoDB    ││  Cloudinary  ││   Razorpay   │
      │   Database   ││    Images    ││   Payments   │
      └──────────────┘└──────────────┘└──────────────┘
```

---

# 📌 Project Highlights

Eventora demonstrates practical implementation of:

* Full-stack MERN development
* REST API development
* JWT authentication
* Role-based authorization
* CRUD operations
* MongoDB database management
* Image uploads
* Cloudinary integration
* Razorpay payment gateway integration
* Secure payment verification
* Protected React routes
* Responsive frontend development
* Modern UI animations
* Event, booking, and payment management

---

# 👨‍💻 Author

**Mohit Bagri**

B.Tech Electronics & Communication Engineering

MNNIT Allahabad

---

# ⭐ Support

If you like **Eventora**, consider giving the repository a ⭐ on GitHub!

Made with ❤️ using the MERN Stack + Razorpay.
