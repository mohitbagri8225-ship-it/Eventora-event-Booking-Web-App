import React, { useEffect, useState } from "react";
import { Ticket, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader.jsx"

const normalizeEvent = (event) => ({
  id: event._id || event.id,
  title: event.title || "Untitled event",
  category: event.category || "Unknown",
  location: event.location || event.venue || "Location TBD",
  date: event.date ? new Date(event.date).toLocaleString() : "Date TBD",
  price: Number(event.ticketPrice ?? event.price ?? 0),
  seats: Number(event.availableSeats ?? event.seats ?? 0),
  totalSeats: Number(event.totalSeats ?? 0),
  imageUrl: event.imageUrl || event.img || "https://picsum.photos/seed/gate-fallback/640/480",
});

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("https://eventora-event-booking-web-app-1.onrender.com/api/events/my-events", {
          credentials: "include",
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Request failed with status ${res.status}`);
        }

        const data = await res.json();

        // Defensive: handle a few possible response shapes so this doesn't
        // silently render an empty list if the backend key ever changes.
        const rawEvents = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.events)
          ? data.events
          : Array.isArray(data)
          ? data
          : [];

        console.log("fetched events:", rawEvents);

        setEvents(rawEvents.map(normalizeEvent));
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError(err.message || "Unable to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <main className="my-events-page" style={{ padding: 32, maxWidth: 1040, margin: "0 auto" }}>
      <header style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ marginBottom: 10, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Ticket size={16} /> My events
        </p>
        <h1 className="section-title font-display" style={{ margin: 0, fontSize: "clamp(2rem, 3vw, 2.7rem)" }}>
          Events you created
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 10, maxWidth: 600 }}>
          This page shows all events created by your admin account. Use this view to verify what is live and check availability.
        </p>
      </header>

      {loading ?  (
         <Loader/>
      ) : error ? (
        <div
          className="form-banner form-banner-error"
          style={{
            borderColor: "rgba(239,93,93,0.35)",
            background: "rgba(239,93,93,0.12)",
            color: "#ffb3b3",
            padding: 18,
            borderRadius: 16,
          }}
        >
          {error}
        </div>
      ) : events.length === 0 ? (
        <div style={{ padding: 24, borderRadius: 18, background: "var(--ink-2)", border: "1px solid rgba(246,241,228,0.1)" }}>
          <p style={{ margin: 0 }}>No events found. Create a new event from the post event page.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 18 }}>
          {events.map((event) => (
            <article
              key={event.id}
              style={{
                borderRadius: 24,
                overflow: "hidden",
                background: "var(--ink-2)",
                border: "1px solid rgba(246,241,228,0.08)",
                display: "grid",
                gridTemplateColumns: "1.2fr 0.8fr",
                minHeight: 180,
              }}
            >
              <div
                onClick={() => navigate(`/my-events/${event.id}`)}
                style={{
                  padding: 22,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)" }}>
                    {event.category}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--marigold)" }}>
                    {event.price === 0 ? "Free" : `$${event.price.toFixed(2)}`}
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: "clamp(1.3rem, 2.2vw, 1.7rem)", lineHeight: 1.2 }}>{event.title}</h2>
                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>{event.location}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--muted)" }}>
                    <Calendar size={16} /> {event.date}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--muted)" }}>
                    <Users size={16} /> {event.seats} available / {event.totalSeats} total
                  </div>
                </div>
              </div>

              <div style={{ background: `url(${event.imageUrl}) center/cover no-repeat`, minHeight: 180 }} />
            </article>
          ))}
        </div>
      )}
    </main>
  );
}