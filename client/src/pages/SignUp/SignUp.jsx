
import React, { useState } from "react";
import {
    ArrowRight,
    Lock,
    Mail,
    ShieldCheck,
    Sparkles,
    Ticket,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth.context.jsx";

const SignUp = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [otp, setOtp] = useState("");
    const [isOtpStage, setIsOtpStage] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch(
                "https://eventora-event-booking-web-app-1.onrender.com/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        username:form.username,
                        email: form.email,
                        password: form.password,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setMessage(data?.message || "Signup failed");
                return;
            }

            if (data?.user) {
                login(data.user);

                if (!data.user.isVerified) {
                    setIsOtpStage(true);
                    setMessage(
                        "We sent a verification code to your email. Enter it below."
                    );
                    return;
                }
            }

            setMessage("Account created successfully!");
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
            const res = await fetch(
                "https://eventora-event-booking-web-app-1.onrender.com/api/auth/verify-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email: form.email,
                        otp,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setMessage(data?.message || "OTP verification failed");
                return;
            }

            console.log("OTP RESPONSE:", data);

            if (data?.user) {
                login(data.user);
            }

            setMessage("Account verified successfully!");
            setIsOtpStage(false);
            setOtp("");

            navigate("/");
        } catch (err) {
            setMessage("Unable to verify OTP right now.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-card">

                {/* LEFT PANEL */}
                <div className="auth-panel">

                    <span className="eyebrow">
                        <Sparkles size={13} strokeWidth={2.4} />
                        Join Gate
                    </span>

                    <h1
                        className="hero-title font-display"
                        style={{
                            fontSize: "clamp(2rem, 3.8vw, 2.9rem)",
                            marginBottom: 16,
                        }}
                    >
                        {isOtpStage
                            ? "Verify your email"
                            : "Create your account."}
                    </h1>

                    <p className="hero-sub" style={{ marginBottom: 24 }}>
                        {isOtpStage
                            ? "Enter the 6-digit code sent to your inbox to verify your account."
                            : "Create your Gate account to save favorite events, manage your bookings, and enjoy faster check-in."}
                    </p>

                    <form
                        className="auth-form"
                        onSubmit={
                            isOtpStage ? handleOtpVerify : handleSignUp
                        }
                    >

                        {/* SIGNUP FIELDS */}
                        {!isOtpStage && (
                            <>
                                <label className="auth-field">
                                    <input
                                        type="text"
                                        placeholder="Create a username"
                                        value={form.username}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                username: e.target.value,
                                            }))
                                        }
                                        required
                                    />

                                    <label />

                                </label>
                                <label className="auth-field">
                                    <Mail size={16} />

                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                email: e.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>

                                <label className="auth-field">
                                    <Lock size={16} />

                                    <input
                                        type="password"
                                        placeholder="Create a password"
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                password: e.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>
                            </>
                        )}

                        {/* OTP FIELD */}
                        {isOtpStage && (
                            <label className="auth-field">
                                <ShieldCheck size={16} />

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) =>
                                        setOtp(
                                            e.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    required
                                />
                            </label>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading
                                ? "Working..."
                                : isOtpStage
                                    ? "Verify OTP"
                                    : "Create account"}

                            <ArrowRight size={15} />
                        </button>

                        {message && (
                            <div className="subscribed-msg">
                                <ShieldCheck size={14} />
                                {message}
                            </div>
                        )}
                    </form>

                    <p className="auth-hint">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            style={{
                                color: "var(--marigold)",
                                textDecoration: "none",
                            }}
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* RIGHT PANEL */}
                <div className="auth-side">

                    <div className="auth-badge">
                        <Ticket size={16} />
                        Welcome to Gate
                    </div>

                    <h2
                        className="section-title font-display"
                        style={{ marginBottom: 12 }}
                    >
                        Everything you need for your next event.
                    </h2>

                    <p
                        className="hero-sub"
                        style={{ marginBottom: 20 }}
                    >
                        Create your account once and keep your tickets,
                        favorites, and event bookings together.
                    </p>

                    <ul className="auth-list">

                        <li>
                            <ShieldCheck size={16} />
                            Secure email verification for your account.
                        </li>

                        <li>
                            <Sparkles size={16} />
                            Save events you don't want to miss.
                        </li>

                        <li>
                            <Ticket size={16} />
                            Keep all your tickets ready for entry.
                        </li>

                    </ul>

                    <Link to="/" className="btn btn-ghost">
                        Explore events
                        <ArrowRight size={15} />
                    </Link>

                </div>
            </div>
        </div>
    );
};

export default SignUp;
