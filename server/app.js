import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

//intialize express app
const app = express();
 
import cors from "cors";

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://eventora-event-booking-web-app-dwrq-nine.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());//parse incoming JSON requests
app.use(cookieParser());//parse incoming cookies
app.use(express.urlencoded({ extended: true }));//parse incoming URL-encoded requests

//Routes
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/events.routes.js';
import bookingRoutes from './routes/booking.routes.js'; 
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/events', eventRoutes); 

export default app;