import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
});
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Gmail transporter error:", error);
    } else {
        console.log("✅ Gmail transporter is ready");
    }
});

// Capitalize first letter of "type" for nicer display (e.g. "login" -> "Login")
// const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const sendEmail = async (email, otp, type) => {
    const title = `Your ${type} OTP Code`;

    console.log("📧 Sending OTP to:", email);
    console.log("🔢 OTP:", otp);

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: title,
        text: `Your OTP for ${type} is ${otp}. It will expire in 5 minutes.`,
        html: `
            <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:20px;">
                <div style="max-width:420px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;">
                    <div style="background:#4f46e5;color:#fff;text-align:center;padding:16px;">
                        <h2 style="margin:0;font-size:18px;">${title}</h2>
                    </div>

                    <div style="padding:24px;text-align:center;">
                        <p style="color:#666;font-size:14px;">
                            Use the code below to verify your <strong>${type}</strong>:
                        </p>

                        <div style="display:inline-block;padding:10px 22px;
                            background:#f3f4f6;border:2px dashed #4f46e5;
                            border-radius:8px;font-size:26px;font-weight:bold;
                            letter-spacing:6px;color:#111;">
                            ${otp}
                        </div>

                        <p style="color:#dc2626;font-weight:bold;font-size:13px;">
                            Expires in 5 minutes
                        </p>
                    </div>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);

        console.log("✅ Email sent successfully");
        console.log("Message ID:", info.messageId);

    } catch (error) {
        console.error("❌ SEND EMAIL ERROR:", error);
        throw error;
    }
};
export const sendBookingEmail = async (email, userName, eventName,eventDate,seatNumber) => {
    const title = `Booking Confirmed: ${eventName}`;

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: title,
        text: `Hello ${userName},\n\nYour booking for "${eventName}" is confirmed.\n\nDate: ${eventDate}\nSeat: ${seatNumber ? seatNumber : 0}\n\nThank you for booking with us!`,
        html: `
            <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:20px;">
                <div style="max-width:420px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
                    <div style="background:#059669;color:#fff;text-align:center;padding:16px;">
                        <h2 style="margin:0;font-size:18px;">${title}</h2>
                    </div>
                    <div style="padding:24px;">
                        <p style="color:#333;font-size:14px;">Hi ${userName}, your seat is booked for <strong>${eventName}</strong>.</p>
                        <table style="width:100%;font-size:13px;color:#444;border-collapse:collapse;margin-top:10px;">
                            <tr><td style="padding:4px 0;color:#888;">Date</td><td style="text-align:right;">${eventDate}</td></tr> 
                            <tr><td style="padding:4px 0;color:#888;">Seat</td><td style="text-align:right;">${seatNumber}</td></tr> 
                        </table>
                        <p style="color:#888;font-size:12px;margin-top:16px;">Thank you for booking with us!</p>
                    </div>
                    <div style="background:#f9fafb;color:#888;font-size:11px;text-align:center;padding:12px;">&copy; ${new Date().getFullYear()} Your App</div>
                </div>
            </div>
        `
    };
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent to ${email} for event "${eventName}"`);
};

