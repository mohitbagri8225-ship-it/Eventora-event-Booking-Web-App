import { asyncHandler } from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/user.model.js";
import { Otp } from "../models/otp.model.js";
import { Event } from "../models/event.model.js"; 
import {Booking} from "../models/Booking.model.js"
import { sendEmail, sendBookingEmail } from "../utils/emails.js";
import { razorPayInstance } from "../index.js";

const OTP_EXPIRY_MINUTES = 10;

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

const verifyRazorpaySignature = (
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
) => {
    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
        .createHmac(
            "sha256",
            process.env.RAZOR_API_SECRET_KEY
        )
        .update(body)
        .digest("hex");

    return expectedSignature === razorpaySignature;
};


const sendBookingOtp = asyncHandler(async (req, res) => {
    
    const { eventId } = req.body;
    const userEmail = req.user.email;
    console.log(userEmail);
    

    if (!eventId) {
        throw new apiError(400, "eventId is required");
    }

    const event = await Event.findById(eventId);
    if (!event) {
        throw new apiError(404, "No Event found");
    }
    if (event.availableSeats <= 0) {
        throw new apiError(400, "No seats are available");
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await Otp.deleteMany({ email: userEmail, action: "booking_verification" });
    await Otp.create({ email: userEmail, otp, action: "booking_verification", expiresAt });

    await sendEmail(
        userEmail,
        otp,
        "Your booking verification code" 
    );

    res.status(200).json({ success: true, message: "OTP sent to email" });
});

const bookEvent = asyncHandler(async (req, res) => {
    const { eventId, otp, quantity } = req.body;
    console.log(req.user.email);
    

    if (!eventId || !otp || !quantity) {
        throw new apiError(400, "eventId, otp and quantity are required");
    }

    const event = await Event.findById(eventId);
    if (!event) {
        throw new apiError(404, "No Event found");
    }
    
    if (event.availableSeats < quantity) {
        throw new apiError(400, "Not enough seats available");
    }

    const existingBooking = await Booking.findOne({ eventId, userId: req.user._id });
    if (existingBooking) {
        throw new apiError(409, "Booking already exists");
    }

    const otpRecord = await Otp.findOne({ email: req.user.email, action: "booking_verification" });
    if (!otpRecord) {
        throw new apiError(400, "No OTP found. Please request a new one");
    }
    if (otpRecord.expiresAt < new Date()) {
        await Otp.deleteOne({ _id: otpRecord._id });
        throw new apiError(400, "OTP has expired. Please request a new one");
    }
    if (otpRecord.otp !== otp) {
        throw new apiError(400, "Invalid OTP");
    }

    const options = {
        amount:event.ticketPrice*quantity*100,
        currency:"INR",
    };

    const order = await razorPayInstance.orders.create(options);
    console.log(order);

   const booking = await Booking.create({
    userId: req.user._id,
    eventId,
    quantity,
    amount: event.ticketPrice * quantity,
    razorpayOrderId: order.id
});

    event.availableSeats -= quantity;
    await event.save();

    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(201).json({
        success: true,
        message: "Booking created. Please check your email for confirmation.",
        data: booking,
        order:order
    });
});

const confirmBooking = asyncHandler(async (req, res) => {
    console.log("BODY:", req.body);
    const {bookingId,razorpay_payment_id,razorpay_order_id, razorpay_signature} = req.body;
 
    if (!bookingId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        throw new apiError(400,"Missing payment verification details");
    }
 
    // 2. Find booking
    const booking = await Booking.findById(bookingId).populate("eventId").populate("userId");

    if (!booking) {
        throw new apiError(404, "Booking not found");
    }

    // 3. Prevent duplicate confirmation
    if (booking.status === "confirmed") {
        throw new apiError(400,"Booking already confirmed"
        );
    }

    // 4. Get Razorpay order ID from YOUR database
    const razorpayOrderIdFromDB = booking.razorpayOrderId;

    if (!razorpayOrderIdFromDB) {
        throw new apiError(
            400,
            "Razorpay order ID not found"
        );
    }

    // 5. Verify that returned order belongs to our booking
    if (razorpay_order_id !== razorpayOrderIdFromDB) {
        throw new apiError(
            400,
            "Invalid Razorpay order"
        );
    }

    // 6. VERIFY RAZORPAY SIGNATURE 
    const isValid = verifyRazorpaySignature(razorpayOrderIdFromDB,razorpay_payment_id,razorpay_signature);

    if (!isValid) {
        throw new apiError(
            400,
            "Payment verification failed"
        );
    }

    // 7. Payment is genuine
    const paymentStatus = "paid";

    // 8. Get event
    const event = await Event.findById(
        booking.eventId._id
    );


    if (!event) {
        throw new apiError(
            404,
            "Event not found"
        );
    }
    
    // 9. Check seats
    if (event.availableSeats <= 0) {
        throw new apiError(
            400,
            "Seats are not available"
        );
    }

    // 10. Update booking
    booking.status = "confirmed";
    booking.paymentStatus = paymentStatus;
    booking.razorpayPaymentId =razorpay_payment_id;
    booking.razorpaySignature =razorpay_signature;
    await booking.save();


    // 11. Reduce seats
    event.availableSeats -= 1;
    await event.save();

    // 12. Send confirmation email
    const bookingUser = booking.userId;

    await sendBookingEmail(
        bookingUser.email,
        bookingUser.username,
        event.title,
        event.date,
        event.availableSeats
    );

    // 13. Response
    res.status(200).json({
        success: true,
        message: "Booking confirmed",
        data: booking
    });
});

const getMyBookings = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const bookings = await Booking.find({ userId }).populate('eventId');

    res.status(200).json({
        success: true,
        data: bookings
    });
});

const cancelBooking = asyncHandler(async (req, res) => {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
        throw new apiError(404, "Booking not found");
    }
    if (booking.userId.toString() !== req.user._id.toString()) {
        throw new apiError(403, "Unauthorized");
    }

    if (booking.status === 'confirmed') {
        const event = await Event.findById(booking.eventId);
        if (event) {
            event.availableSeats += booking.quantity || 1;
            await event.save();
        }
    }

    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({
        success: true,
        message: "Booking cancelled"
    });
});

export {
    bookEvent, getMyBookings, confirmBooking, cancelBooking, sendBookingOtp
};