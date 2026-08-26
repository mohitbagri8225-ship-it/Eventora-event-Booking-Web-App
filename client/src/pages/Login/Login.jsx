import React, { useState } from "react";
import { ArrowRight, Lock, Mail, ShieldCheck, Sparkles, Ticket } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth.context.jsx";

const Login = () => {
  const navigate = useNavigate();
  const {login} = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [isOtpStage, setIsOtpStage] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  console.log(import.meta.env.API_URL);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    

    try {
      const res = await fetch("https://eventora-event-booking-web-app-1.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json(); 


     if (!res.ok) {
  setMessage(data?.message || "Login failed");
  return;
}

if (data?.user) {
  login(data.user);

  if (!data.user.isVerified) {
    setIsOtpStage(true);
    setMessage("We sent a verification code to your email. Enter it below.");
    return;
  }
}

setMessage("Welcome back! You are logged in.");
navigate("/");

      setMessage("Welcome back! You are logged in.");
      // set auth context so Nav updates
      if (data?.user) {
        login(data.user);
      } else {
        console.warn("Login response missing user:", data);
      }
      navigate("/");
    } catch (err) {
      setMessage("Unable to connect to the server right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("https://eventora-event-booking-web-app-1.onrender.com/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: form.email,
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "OTP verification failed");
        return;
      }

      console.log("OTP RESPONSE:", data);

      if (data?.user) {
        login(data.user);
      } else {
        console.warn("verify-otp response missing user:", data);
      }

      setMessage("Login successful!");
      setIsOtpStage(false);
      setOtp("");
      navigate('/');

    } catch (err) {
      setMessage("Unable to verify OTP right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-panel">
          <span className="eyebrow">
            <Sparkles size={13} strokeWidth={2.4} /> Access your tickets
          </span>
          <h1 className="hero-title font-display" style={{ fontSize: "clamp(2rem, 3.8vw, 2.9rem)", marginBottom: 16 }}>
          {isOtpStage ? "Verify your email" : "Welcome back."}
          </h1>
          <p className="hero-sub" style={{ marginBottom: 24 }}>
            {isOtpStage
              ? "Enter the 6-digit code sent to your inbox so your account can be verified."
              : "Sign in to save favorite events, keep your bookings in one place, and breeze through check-in."}
          </p>

          <form className="auth-form" onSubmit={isOtpStage ? handleOtpVerify : handleLogin}>
            {!isOtpStage && (
              <>
                <label className="auth-field">
                  <Mail size={16} />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </label>

                <label className="auth-field">
                  <Lock size={16} />
                  <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </label>
              </>
            )}

            {isOtpStage && (
              <label className="auth-field">
                <ShieldCheck size={16} />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </label>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Working..." : isOtpStage ? "Verify OTP" : "Sign in"} <ArrowRight size={15} />
            </button>

            {message && (
              <div className="subscribed-msg">
                <ShieldCheck size={14} /> {message}
              </div>
            )}
          </form>

          <p className="auth-hint">
            New to Gate? <Link to="/" style={{ color: "var(--marigold)", textDecoration: "none" }}>Browse events</Link>
          </p>
        </div>

        <div className="auth-side">
          <div className="auth-badge">
            <Ticket size={16} /> Fast, secure entry
          </div>
          <h2 className="section-title font-display" style={{ marginBottom: 12 }}>
            Your next seat is waiting.
          </h2>
          <p className="hero-sub" style={{ marginBottom: 20 }}>
            Keep your favorites close, receive instant confirmation, and walk in with confidence.
          </p>

          <ul className="auth-list">
            <li>
              <ShieldCheck size={16} /> Verified listings only, checked at the door.
            </li>
            <li>
              <Sparkles size={16} /> Smart reminders for the events you care about.
            </li>
            <li>
              <Ticket size={16} /> Mobile-ready entry without the usual friction.
            </li>
          </ul>

          <Link to="/" className="btn btn-ghost">
            Explore events <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;