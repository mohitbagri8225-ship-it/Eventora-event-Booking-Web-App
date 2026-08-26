import React, { useEffect, useState } from "react";
import { Calendar, Users, X } from "lucide-react";
import { Link } from "react-router-dom";
import EventCountdown from "./EventCountDown";
import Loader from "../../components/Loader";


const normalizeBooking = (b) => {
    const event = b.eventId || {};
    return {
        id: b._id || b.id,
        title: event.title || "Untitled event",
        rawDate: event.date || null,
        date: event.date ? new Date(event.date).toLocaleString() : "Date TBD",
        quantity: b.quantity || 1,
        amount: Number(b.amount ?? 0),
        status: b.status || "pending",
        eventImage: event.imageUrl || event.img || "https://picsum.photos/seed/gate-fallback/640/480",
        eventId: event._id || event.id,
    };
};

export default function MyTickets() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [toast, setToast] = useState({ visible: false, message: "", type: "info" });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("https://eventora-event-booking-web-app-1.onrender.com/api/bookings/my", { credentials: "include" });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to load bookings");
                setBookings(Array.isArray(data.data) ? data.data.map(normalizeBooking) : []);
            } catch (err) {
                setError(err.message || "Unable to fetch bookings");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const handleCancelClick = (bookingId) => {
        setConfirmId(bookingId);
    };

    const closeConfirm = () => setConfirmId(null);

    const showToast = (message, type = "info", ttl = 3500) => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast((t) => ({ ...t, visible: false })), ttl);
    };

    const handleCancelConfirmed = async (bookingId) => {
        setCancelling(bookingId);
        try {
            const res = await fetch(`https://eventora-event-booking-web-app-1.onrender.com/api/bookings/${bookingId}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Cancel failed");
            setBookings((prev) => prev.filter((b) => b.id !== bookingId));
            showToast("Booking cancelled", "success");
            closeConfirm();
        } catch (err) {
            showToast(err.message || "Unable to cancel booking", "error");
        } finally {
            setCancelling(null);
        }
    };

    return (
        <main className="bookings-page">
            <style>{`
        .bookings-page { max-width: 1040px; margin: 0 auto; padding: 60px 6vw 90px; position: relative; z-index: 1; }
        .bookings-page .eyebrow { margin-bottom: 10px; }
        .bookings-heading { margin: 0; font-size: clamp(2rem, 3vw, 2.4rem); }
        .bookings-desc { color: var(--muted); margin-top: 10px; max-width: 480px; line-height: 1.6; }

        .state-msg { color: var(--muted); }
        .state-error {
          padding: 18px; border-radius: 12px;
          background: rgba(239,93,93,0.08);
          border: 1px solid rgba(239,93,93,0.25);
          color: #ffb3b3;
        }
        .state-empty {
          padding: 32px 24px; border-radius: 14px;
          background: var(--ink-2);
          border: 1px dashed rgba(246,241,228,0.14);
          color: var(--muted);
          text-align: center;
        }

        .bookings-list { display: grid; gap: 16px; }

        .booking-card {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          background: var(--ink-2);
          border: 1px solid rgba(246,241,228,0.08);
          border-radius: 16px;
          padding: 20px;
        }
        @media (max-width: 640px) { .booking-card { flex-direction: column; } }

        .booking-title { margin: 0; font-size: 17px; }
        .booking-date { margin: 6px 0; color: var(--muted); font-size: 13.5px; }
        .booking-meta { display: flex; gap: 16px; color: var(--muted); align-items: center; font-size: 13px; flex-wrap: wrap; }
        .booking-meta-item { display: flex; gap: 6px; align-items: center; }

        .booking-side { display: flex; flex-direction: column; gap: 10px; align-items: stretch; flex-shrink: 0; width: 220px; }
        @media (max-width: 640px) { .booking-side { width: 100%; } }
        .booking-thumb { height: 96px; border-radius: 10px; background-size: cover; background-position: center; }
        .booking-actions { display: flex; gap: 8px; }
        .booking-actions .btn { flex: 1; justify-content: center; }

        .btn-danger {
          background: transparent;
          color: #ff8a8a;
          border: 1px solid rgba(239,93,93,0.4);
        }
        .btn-danger:hover:not(:disabled) { background: rgba(239,93,93,0.12); border-color: rgba(239,93,93,0.6); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .modal-overlay {
          position: fixed; inset: 0; z-index: 80;
          background: rgba(0,0,0,0.5);
          display: grid; place-items: center;
          padding: 20px;
        }
        .modal-card {
          width: 100%; max-width: 380px;
          background: var(--paper); color: var(--ink);
          padding: 22px; border-radius: 14px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.4);
        }
        .modal-card h3 { margin: 0 0 8px; }
        .modal-card p { color: #55503f; font-size: 14px; line-height: 1.5; margin: 0; }
        .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; }
        .modal-cancel-btn {
          background: #ef5d5d; color: #fff; border: none;
        }
        .modal-cancel-btn:hover:not(:disabled) { background: #e14b4b; }
        .modal-close-btn {
          background: transparent; color: var(--ink);
          border: 1px solid rgba(19,16,34,0.15);
        }
        .modal-close-btn:hover { border-color: rgba(19,16,34,0.3); }

        .toast-wrap { position: fixed; right: 18px; top: 18px; z-index: 90; }
        .toast {
          min-width: 220px; padding: 12px 16px; border-radius: 10px;
          color: white; font-size: 13.5px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.3);
          animation: toastIn 0.2s ease;
        }
        .toast-success { background: #1f7a3a; }
        .toast-error { background: #c23d3d; }
        .toast-info { background: #333; }
        @keyframes toastIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

            <div style={{ marginBottom: 18 }}>
                <p className="eyebrow">My bookings</p>
                <h1 className="bookings-heading font-display">Your bookings</h1>
                <p className="bookings-desc">
                    All bookings you made are shown below. You can cancel a booking if it's not cancelled.
                </p>
            </div>

            {loading ? (
                <Loader/>
            ) : error ? (
                <div className="state-error">{error}</div>
            ) : bookings.length === 0 ? (
                <div className="state-empty">No bookings found.</div>
            ) : (
                <div className="bookings-list">
                    {bookings.map((b) => (
                        <article key={b.id} className="booking-card">
                            <EventCountdown date={b.rawDate} />
                            <div>
                                <h3 className="booking-title">{b.title}</h3>
                                <p className="booking-date">{b.date}</p>
                                <div className="booking-meta">
                                    <span className="booking-meta-item"><Calendar size={14} /> {b.date}</span>
                                    <span className="booking-meta-item"><Users size={14} /> {b.quantity} tickets</span>
                                </div>
                            </div>
                            <div className="booking-side">
                                <div className="booking-thumb" style={{ backgroundImage: `url(${b.eventImage})` }} />
                                <div className="booking-actions">
                                    <Link
                                        className="btn btn-ghost"
                                        to={`/my-tickets/${b.eventId}`}
                                    >
                                        View
                                    </Link>
                                    <button
                                        className="btn btn-danger"
                                        disabled={cancelling === b.id}
                                        onClick={() => handleCancelClick(b.id)}
                                    >
                                        {cancelling === b.id ? "Cancelling..." : (
                                            <>
                                                <X size={14} /> Cancel
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {confirmId && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h3>Cancel booking</h3>
                        <p>Are you sure you want to cancel this booking? This cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn modal-close-btn" onClick={closeConfirm}>Close</button>
                            <button
                                className="btn modal-cancel-btn"
                                onClick={() => handleCancelConfirmed(confirmId)}
                                disabled={cancelling === confirmId}
                            >
                                {cancelling === confirmId ? "Cancelling..." : "Confirm cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast.visible && (
                <div className="toast-wrap">
                    <div className={`toast toast-${toast.type}`}>{toast.message}</div>
                </div>
            )}
        </main>
    );
}