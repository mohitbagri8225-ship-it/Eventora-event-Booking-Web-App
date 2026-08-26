import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Calendar, MapPin, Ticket, Users } from "lucide-react";
import Loader from "../../components/Loader";

// Convert an ISO date string (or Date) into the yyyy-MM-dd format
// required by <input type="date">.
const toDateInputValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const ViewEvent = () => {
  // Get eventId from URL
  const { eventId } = useParams();

  // Used to navigate to other pages
  const navigate = useNavigate();

  // Store event data
  const [event, setEvent] = useState(null);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Saving state
  const [saving, setSaving] = useState(false);

  // Error state
  const [error, setError] = useState("");

  // Fetch event when page loads
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `https://eventora-event-booking-web-app-1.onrender.com/api/events/${eventId}`,
          {
            withCredentials: true,
          }
        );

        console.log("fetched event:", res.data);

        // Backend may return { event: {...} } or the event object directly,
        // or wrap it as { data: {...} } like the my-events list endpoint does.
        const raw = res.data.event || res.data.data || res.data;

        // Normalize field names so the form always has the keys it expects,
        // regardless of which naming scheme the backend used.
        setEvent({
          ...raw,
          name: raw.name ?? raw.title ?? "",
          price: raw.price ?? raw.ticketPrice ?? "",
          tickets: raw.tickets ?? raw.availableSeats ?? "",
          totalSeats: raw.totalSeats ?? "",
          date: toDateInputValue(raw.date),
          imageUrl:
            raw.imageUrl ||
            raw.img ||
            "https://picsum.photos/seed/gate-fallback/900/500",
        });
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(
          err.response?.data?.message || "Unable to load this event"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Update state when input changes
  const handleChange = (e) => {
    setEvent({
      ...event,
      [e.target.name]: e.target.value,
    });
  };

  // Save updated event
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Map form field names back to whatever your backend schema expects.
      // Adjust these keys to match your actual API if it differs.
      const payload = {
        ...event,
        title: event.name,
        ticketPrice: event.price,
        availableSeats: event.tickets,
      };

      await axios.put(
        `https://eventora-event-booking-web-app-1.onrender.com/api/events/${eventId}`,
        payload,
        {
          withCredentials: true,
        }
      );

      alert("Event updated successfully!");

      // Go back after update
      navigate(-1);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(246,241,228,0.12)",
    background: "var(--ink)",
    color: "var(--fg, #f6f1e4)",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    marginBottom: 8,
    fontWeight: 500,
    color: "var(--muted)",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };

  // Loading screen
  if (loading) {
    return (
     <Loader/>
    );
  }

  // Error state
  if (error) {
    return (
      <main style={{ padding: 32, maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            borderColor: "rgba(239,93,93,0.35)",
            background: "rgba(239,93,93,0.12)",
            color: "#ffb3b3",
            padding: 18,
            borderRadius: 16,
            border: "1px solid rgba(239,93,93,0.35)",
          }}
        >
          {error}
        </div>
      </main>
    );
  }

  // If event doesn't exist
  if (!event) {
    return (
      <main style={{ padding: 32, maxWidth: 760, margin: "0 auto" }}>
        <p style={{ color: "var(--muted)" }}>Event not found</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 32, maxWidth: 760, margin: "0 auto" }}>
      <div
        style={{
          borderRadius: 24,
          overflow: "hidden",
          background: "var(--ink-2)",
          border: "1px solid rgba(246,241,228,0.08)",
        }}
      >
        {/* Image at top */}
        <div
          style={{
            background: `url(${event.imageUrl}) center/cover no-repeat`,
            height: 260,
            width: "100%",
          }}
        />

        <div style={{ padding: 28 }}>
          <header style={{ marginBottom: 24 }}>
            <p
              style={{
                marginBottom: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "var(--muted)",
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              <Ticket size={16} /> Edit event
            </p>
            <h1
              className="font-display"
              style={{ margin: 0, fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}
            >
              {event.name || "Untitled event"}
            </h1>
            <div
              style={{
                display: "flex",
                gap: 18,
                flexWrap: "wrap",
                marginTop: 12,
                color: "var(--muted)",
                fontSize: 14,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={14} /> {event.date || "Date TBD"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={14} /> {event.location || "Location TBD"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Users size={14} /> {event.tickets || 0} available
                {event.totalSeats ? ` / ${event.totalSeats} total` : ""}
              </span>
            </div>
          </header>

          <form onSubmit={handleUpdate} style={{ display: "grid", gap: 20 }}>
            {/* Event Name */}
            <div>
              <label style={labelStyle}>Event Name</label>
              <input
                type="text"
                name="name"
                value={event.name || ""}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                value={event.description || ""}
                onChange={handleChange}
                rows="5"
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* Date */}
            <div>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                name="date"
                value={event.date || ""}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            {/* Location */}
            <div>
              <label style={labelStyle}>Location</label>
              <input
                type="text"
                name="location"
                value={event.location || ""}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            {/* Price */}
            <div>
              <label style={labelStyle}>Ticket Price</label>
              <input
                type="number"
                name="price"
                value={event.price || ""}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            {/* Available Tickets */}
            <div>
              <label style={labelStyle}>Available Tickets</label>
              <input
                type="number"
                name="tickets"
                value={event.tickets || ""}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{
                  borderRadius: 12,
                  padding: "12px 22px",
                  fontWeight: 500,
                  border: "1px solid rgba(246,241,228,0.16)",
                  background: "transparent",
                  color: "var(--fg, #f6f1e4)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={{
                  borderRadius: 12,
                  padding: "12px 22px",
                  fontWeight: 500,
                  border: "none",
                  background: "var(--marigold)",
                  color: "#1a1508",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ViewEvent;