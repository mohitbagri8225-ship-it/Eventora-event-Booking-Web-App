import React, { useState } from "react";
import {
  Ticket,
  Type,
  AlignLeft,
  Calendar,
  MapPin,
  Tag,
  DollarSign,
  Users,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { CATEGORIES } from "../Home/data/constants.js";

const EVENT_CATEGORIES = CATEGORIES.filter((c) => c.id !== "all");

const INITIAL_FORM = {
  title: "",
  description: "",
  date: "",
  location: "",
  category: EVENT_CATEGORIES[0]?.id ?? "music",
  ticketPrice: "",
  totalSeats: "",
  availableSeats: "",
  imageUrl: "",
};

const IMAGE_EXT_RE = /\.(jpeg|jpg|gif|png)(\?.*)?$/i;

/**
 * Client-side mirror of the createEvent controller's validation, so the
 * person gets the same feedback here that the API would return —
 * just before the round trip instead of after.
 */
function validate(form) {
  const errors = {};

  if (!form.title.trim()) errors.title = "Title is required";
  if (!form.description.trim()) errors.description = "Description is required";
  if (!form.date) errors.date = "Date is required";
  if (!form.location.trim()) errors.location = "Location is required";
  if (!form.category) errors.category = "Category is required";
  if (form.ticketPrice === "") errors.ticketPrice = "Ticket price is required";
  if (form.totalSeats === "") errors.totalSeats = "Total seats is required";
  if (form.availableSeats === "") errors.availableSeats = "Available seats is required";
  if (!form.imageUrl.trim()) errors.imageUrl = "Image URL is required";

  if (form.date && new Date(form.date) < new Date()) {
    errors.date = "Event date cannot be in the past";
  }

  if (form.ticketPrice !== "" && Number(form.ticketPrice) <= 0) {
    errors.ticketPrice = "Ticket price must be greater than zero";
  }

  if (form.totalSeats !== "" && Number(form.totalSeats) < 0) {
    errors.totalSeats = "Seats cannot be negative";
  }
  if (form.availableSeats !== "" && Number(form.availableSeats) < 0) {
    errors.availableSeats = "Seats cannot be negative";
  }

  if (
    form.totalSeats !== "" &&
    form.availableSeats !== "" &&
    Number(form.availableSeats) > Number(form.totalSeats)
  ) {
    errors.availableSeats = "Available seats cannot be greater than total seats";
  }

//   if (form.imageUrl.trim() && !IMAGE_EXT_RE.test(form.imageUrl.trim())) {
//     errors.imageUrl = "Must be a valid image URL (jpeg, jpg, gif, png)";
//   }

  return errors;
}

export function PostEvent({ apiBaseUrl = "https://eventora-event-booking-web-app-1.onrender.com/api/events/create-event", onCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  const setField = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const markTouched = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccess(false);

    const validationErrors = validate(form);
    setErrors(validationErrors);
    setTouched(
      Object.keys(INITIAL_FORM).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );

    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      location: form.location.trim(),
      category: form.category,
      ticketPrice: Number(form.ticketPrice),
      totalSeats: Number(form.totalSeats),
      availableSeats: Number(form.availableSeats),
      imageUrl: form.imageUrl.trim(),
    };

    setSubmitting(true);
    try {
      const res = await fetch(apiBaseUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Couldn't create the event. Try again.");
      }

      setSuccess(true);
      setForm(INITIAL_FORM);
      setTouched({});
      onCreated?.(data.data);
    } catch (err) {
      setFormError(err.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="create-section">
      <style>{`
        .create-section {
          position: relative; z-index: 1;
          padding: 60px 6vw 90px;
          max-width: 760px;
          margin: 0 auto;
        }
        .create-card {
          background: var(--ink-2);
          border: 1px solid rgba(246,241,228,0.08);
          border-radius: 22px;
          padding: 40px clamp(20px, 4vw, 44px);
          position: relative;
          overflow: hidden;
        }
        .create-card::before {
          content: "";
          position: absolute; top: -60px; right: -60px;
          width: 200px; height: 200px; border-radius: 999px;
          border: 2px dashed rgba(246,241,228,0.08);
        }
        .create-head { margin-bottom: 30px; }
        .create-title { margin: 14px 0 8px; font-size: clamp(1.7rem, 3vw, 2.2rem); }
        .create-sub { color: var(--muted); font-size: 14px; max-width: 460px; line-height: 1.6; margin: 0; }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px 16px;
          position: relative; z-index: 1;
        }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
        .field-span-2 { grid-column: 1 / -1; }

        .field { display: flex; flex-direction: column; gap: 7px; }
        .field label {
          font-family: 'Space Mono', monospace;
          font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--muted);
          display: flex; align-items: center; gap: 6px;
        }
        .field label svg { color: var(--marigold); flex-shrink: 0; }

        .field-control {
          background: var(--paper);
          border-radius: 12px;
          border: 1.5px solid transparent;
          transition: border-color 0.15s ease;
        }
        .field-control:focus-within { border-color: var(--marigold); }
        .field.has-error .field-control { border-color: var(--coral); }

        .field-control input,
        .field-control textarea,
        .field-control select {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          color: var(--ink);
          padding: 12px 14px;
        }
        .field-control textarea {
          resize: vertical;
          min-height: 90px;
          line-height: 1.5;
        }
        .field-control select { cursor: pointer; }
        .field-control input::placeholder,
        .field-control textarea::placeholder { color: #8a8474; }

        .field-error {
          font-size: 12px; color: var(--coral);
          display: flex; align-items: center; gap: 5px;
        }

        .price-row { display: flex; align-items: center; gap: 10px; }
        .price-row .field-control { flex: 1; }
        .free-toggle {
          font-family: 'Space Mono', monospace;
          font-size: 11px; color: var(--muted);
          display: flex; align-items: center; gap: 6px;
          white-space: nowrap; cursor: pointer;
          padding: 6px 10px; border-radius: 999px;
          border: 1px solid rgba(246,241,228,0.14);
        }
        .free-toggle input { accent-color: var(--marigold); }

        .image-preview {
          margin-top: 10px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(246,241,228,0.1);
          height: 140px;
          background: var(--ink-3);
        }
        .image-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .form-banner {
          display: flex; align-items: center; gap: 10px;
          font-size: 13.5px;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .form-banner-error {
          background: rgba(239,93,93,0.12);
          border: 1px solid rgba(239,93,93,0.35);
          color: #ffb3b3;
        }
        .form-banner-success {
          background: rgba(243,169,59,0.12);
          border: 1px solid rgba(243,169,59,0.35);
          color: var(--marigold);
        }

        .submit-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
          margin-top: 28px;
          padding-top: 22px;
          border-top: 1px dashed rgba(246,241,228,0.12);
        }
        .submit-note { font-size: 12.5px; color: var(--muted); max-width: 320px; }

        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div className="create-card">
        <div className="create-head">
          <span className="eyebrow">
            <Ticket size={13} strokeWidth={2.4} /> List a new event
          </span>
          <h2 className="create-title font-display">Print a new ticket.</h2>
          <p className="create-sub">
            Fill in the details below. Once submitted, this event goes live in
            Discover the same way every other listing does — verified, real,
            and ready to book.
          </p>
        </div>

        {formError && (
          <div className="form-banner form-banner-error">
            <AlertCircle size={16} /> {formError}
          </div>
        )}
        {success && (
          <div className="form-banner form-banner-success">
            <CheckCircle2 size={16} /> Event created. It's live in Discover now.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className={`field field-span-2 ${touched.title && errors.title ? "has-error" : ""}`}>
              <label htmlFor="title"><Type size={13} /> Title</label>
              <div className="field-control">
                <input
                  id="title"
                  type="text"
                  placeholder="Night Frequencies"
                  value={form.title}
                  onChange={setField("title")}
                  onBlur={markTouched("title")}
                />
              </div>
              {touched.title && errors.title && (
                <span className="field-error"><AlertCircle size={12} /> {errors.title}</span>
              )}
            </div>

            <div className={`field field-span-2 ${touched.description && errors.description ? "has-error" : ""}`}>
              <label htmlFor="description"><AlignLeft size={13} /> Description</label>
              <div className="field-control">
                <textarea
                  id="description"
                  placeholder="What's the vibe? Who's it for? What should people know before they book?"
                  value={form.description}
                  onChange={setField("description")}
                  onBlur={markTouched("description")}
                />
              </div>
              {touched.description && errors.description && (
                <span className="field-error"><AlertCircle size={12} /> {errors.description}</span>
              )}
            </div>

            <div className={`field ${touched.date && errors.date ? "has-error" : ""}`}>
              <label htmlFor="date"><Calendar size={13} /> Date &amp; time</label>
              <div className="field-control">
                <input
                  id="date"
                  type="datetime-local"
                  value={form.date}
                  onChange={setField("date")}
                  onBlur={markTouched("date")}
                />
              </div>
              {touched.date && errors.date && (
                <span className="field-error"><AlertCircle size={12} /> {errors.date}</span>
              )}
            </div>

            <div className={`field ${touched.location && errors.location ? "has-error" : ""}`}>
              <label htmlFor="location"><MapPin size={13} /> Location</label>
              <div className="field-control">
                <input
                  id="location"
                  type="text"
                  placeholder="The Hangar, Brooklyn"
                  value={form.location}
                  onChange={setField("location")}
                  onBlur={markTouched("location")}
                />
              </div>
              {touched.location && errors.location && (
                <span className="field-error"><AlertCircle size={12} /> {errors.location}</span>
              )}
            </div>

            <div className={`field ${touched.category && errors.category ? "has-error" : ""}`}>
              <label htmlFor="category"><Tag size={13} /> Category</label>
              <div className="field-control">
                <select
                  id="category"
                  value={form.category}
                  onChange={setField("category")}
                  onBlur={markTouched("category")}
                >
                  {EVENT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              {touched.category && errors.category && (
                <span className="field-error"><AlertCircle size={12} /> {errors.category}</span>
              )}
            </div>

            <div className={`field ${touched.ticketPrice && errors.ticketPrice ? "has-error" : ""}`}>
              <label htmlFor="ticketPrice"><DollarSign size={13} /> Ticket price</label>
              <div className="field-control">
                <input
                  id="ticketPrice"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="45"
                  value={form.ticketPrice}
                  onChange={setField("ticketPrice")}
                  onBlur={markTouched("ticketPrice")}
                />
              </div>
              {touched.ticketPrice && errors.ticketPrice && (
                <span className="field-error"><AlertCircle size={12} /> {errors.ticketPrice}</span>
              )}
            </div>

            <div className={`field ${touched.totalSeats && errors.totalSeats ? "has-error" : ""}`}>
              <label htmlFor="totalSeats"><Users size={13} /> Total seats</label>
              <div className="field-control">
                <input
                  id="totalSeats"
                  type="number"
                  min="0"
                  placeholder="120"
                  value={form.totalSeats}
                  onChange={setField("totalSeats")}
                  onBlur={markTouched("totalSeats")}
                />
              </div>
              {touched.totalSeats && errors.totalSeats && (
                <span className="field-error"><AlertCircle size={12} /> {errors.totalSeats}</span>
              )}
            </div>

            <div className={`field ${touched.availableSeats && errors.availableSeats ? "has-error" : ""}`}>
              <label htmlFor="availableSeats"><Users size={13} /> Available seats</label>
              <div className="field-control">
                <input
                  id="availableSeats"
                  type="number"
                  min="0"
                  placeholder="120"
                  value={form.availableSeats}
                  onChange={setField("availableSeats")}
                  onBlur={markTouched("availableSeats")}
                />
              </div>
              {touched.availableSeats && errors.availableSeats && (
                <span className="field-error"><AlertCircle size={12} /> {errors.availableSeats}</span>
              )}
            </div>

            <div className={`field field-span-2 ${touched.imageUrl && errors.imageUrl ? "has-error" : ""}`}>
              <label htmlFor="imageUrl"><ImageIcon size={13} /> Image URL</label>
              <div className="field-control">
                <input
                  id="imageUrl"
                  type="text"
                  placeholder="https://example.com/event-cover.jpg"
                  value={form.imageUrl}
                  onChange={setField("imageUrl")}
                  onBlur={markTouched("imageUrl")}
                />
              </div>
              {touched.imageUrl && errors.imageUrl && (
                <span className="field-error"><AlertCircle size={12} /> {errors.imageUrl}</span>
              )}
              {form.imageUrl.trim() && IMAGE_EXT_RE.test(form.imageUrl.trim()) && (
                <div className="image-preview">
                  <img src={form.imageUrl.trim()} alt="" />
                </div>
              )}
            </div>
          </div>

          <div className="submit-row">
            <p className="submit-note">
              Double-check the date and seat counts — these show up exactly as
              entered on the live ticket.
            </p>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={15} className="spin" /> Creating…
                </>
              ) : (
                <>
                  Create event <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default PostEvent;