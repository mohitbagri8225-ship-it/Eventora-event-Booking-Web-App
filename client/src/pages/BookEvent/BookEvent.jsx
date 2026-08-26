import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/auth.context.jsx";

const normalizeEvent = (event) => ({
  ...event,
  id: event._id || event.id,
  title: event.title || "Untitled event",
  category: event.category || "general",
  venue: event.location || event.venue || "Venue TBD",
  price: Number(event.ticketPrice ?? event.price ?? 0),
  seats: Number(event.availableSeats ?? event.seats ?? 0),
  img: event.imageUrl || event.img || "https://picsum.photos/seed/gate-fallback/640/480",
  date: event.date ? new Date(event.date) : null,
  time:
    event.time ||
    (event.date
      ? new Date(event.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : "Time TBA"),
});

const BookEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setEventLoading(true);
      try {
        const res = await fetch(`https://eventora-event-booking-web-app-1.onrender.com/api/events/${eventId}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          setMessage(data?.message || "Could not load this event");
          return;
        }

        setEvent(normalizeEvent(data?.data || data));
      } catch (err) {
        setMessage("Unable to connect to the server right now.");
      } finally {
        setEventLoading(false);
      }
    };

    if (eventId) fetchEvent();
  }, [eventId]);

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(event?.seats ?? 1, q + 1));
  const amount = event ? event.price * quantity : 0;
  const soldOut = (event?.seats ?? 0) <= 0;

  const sendOtp = async () => {
    if (!user) {
      setMessage("Please sign in before booking.");
      navigate("/login");
      return;
    }

    setOtpLoading(true);
    setMessage("");

    try {
      const res = await fetch("https://eventora-event-booking-web-app-1.onrender.com/api/bookings/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "Unable to send OTP");
        return;
      }

      setMessage(data.message || "OTP sent to your email.");
    } catch (error) {
      setMessage("Unable to connect to the server right now.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage("Please sign in to book this event.");
      navigate("/login");
      return;
    }

    if (!otp.trim()) {
      setMessage("Please enter the OTP sent to your email.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "https://eventora-event-booking-web-app-1.onrender.com/api/bookings/book-event",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            eventId,
            otp,
            quantity,
          }),
        }
      );

      const data = await res.json();

      console.log("Backend response:", data);
      console.log(data);


      if (!res.ok) {
        setMessage(data?.message || "Booking failed");
        return;
      }

      const order = data.order;


      if (!order) {
        setMessage("Razorpay order was not created.");
        return;
      }

      if (!window.Razorpay) {
        setMessage("Razorpay checkout is not loaded.");
        return;
      }
      const bookingId = data.data._id; 

      const options = {
        key: import.meta.env.VITE_RAZOR_API_KEY,
        amount: order.amount,
        currency: order.currency,
        name: "Eventora",
        description: event.title,
        order_id: order.id,
         

        handler: async function (response) { 
          
          const res = await fetch(
            `https://eventora-event-booking-web-app-1.onrender.com/api/bookings/confirm`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                bookingId,
                eventId,
                quantity,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            }
          );

          const data = await res.json();

          if (!res.ok) {
            setMessage(data.message || "Payment verification failed");
            return;
          }

          setSuccess(true);
        },

        prefill: {
          name: user?.username || "",
          email: user?.email || "",
        },

        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.log("Payment failed:", response);

        setMessage(
          response.error?.description ||
          "Payment failed. Please try again."
        );
      });

      razorpay.open();
    } catch (err) {
      console.error("BOOKING ERROR:", err);
      setMessage("Something went wrong. Check the browser console.");
    } finally {
      setLoading(false);
    }
  };

  if (eventLoading) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-panel">
            <p className="hero-sub">Loading event...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-panel">
            <h1 className="hero-title font-display" style={{ fontSize: "clamp(2rem, 3.8vw, 2.9rem)" }}>
              Event not found
            </h1>
            <p className="hero-sub" style={{ marginBottom: 24 }}>
              {message || "This event may no longer be available."}
            </p>
            <Link to="/" className="btn btn-ghost">
              Browse events <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-panel">
          <span className="eyebrow">
            <Sparkles size={13} strokeWidth={2.4} /> Reserve your seat
          </span>

          <h1 className="hero-title font-display" style={{ fontSize: "clamp(2rem, 3.8vw, 2.9rem)", marginBottom: 16 }}>
            {success ? "Booking confirmed" : event.title}
          </h1>

          <p className="hero-sub" style={{ marginBottom: 24 }}>
            {success
              ? `${quantity} ticket${quantity > 1 ? "s" : ""} confirmed for ${event.title}.`
              : "Pick your quantity, verify with a one-time code, and confirm your booking."}
          </p>

          {!success ? (
            <form className="auth-form" onSubmit={handleBook}>
              <label className="auth-field">
                <Ticket size={16} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <span>Quantity</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button type="button" onClick={decrement} disabled={quantity <= 1} className="btn btn-ghost" style={{ padding: "4px 8px" }}>
                      <Minus size={14} />
                    </button>
                    <span>{quantity}</span>
                    <button type="button" onClick={increment} disabled={quantity >= event.seats} className="btn btn-ghost" style={{ padding: "4px 8px" }}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </label>

              <div className="auth-field">
                <ShieldCheck size={16} />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </div>

              <button type="button" className="btn btn-ghost btn-block" onClick={sendOtp} disabled={otpLoading || soldOut}>
                {otpLoading ? "Sending OTP..." : "Send OTP"}
              </button>

              <div className="subscribed-msg">
                <ShieldCheck size={14} />
                {event.price === 0 ? "Free entry" : `Total: $${amount.toFixed(2)}`}
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading || soldOut || !otp.trim()}>
                {soldOut ? "Sold out" : loading ? "Booking..." : "Confirm booking"} <ArrowRight size={15} />
              </button>

              {message && (
                <div className="subscribed-msg">
                  <ShieldCheck size={14} /> {message}
                </div>
              )}
            </form>
          ) : (
            <Link to="/" className="btn btn-primary btn-block">
              Back to events <ArrowRight size={15} />
            </Link>
          )}

          <p className="auth-hint">
            Wrong event? <Link to="/" style={{ color: "var(--marigold)", textDecoration: "none" }}>Browse events</Link>
          </p>
        </div>

        <div className="auth-side">
          <div className="auth-badge">
            <Ticket size={16} /> {event.seats} {event.seats === 1 ? "seat" : "seats"} left
          </div>

          <h2 className="section-title font-display" style={{ marginBottom: 12 }}>
            {event.title}
          </h2>

          <p className="hero-sub" style={{ marginBottom: 20 }}>
            {event.category}
          </p>

          <ul className="auth-list">
            <li>
              <MapPin size={16} /> {event.venue}
            </li>
            <li>
              <Calendar size={16} /> {event.date ? new Date(event.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Date TBD"}
            </li>
            <li>
              <Clock size={16} /> {event.time}
            </li>
          </ul>

          <Link to="/" className="btn btn-ghost">
            Explore more events <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookEvent;