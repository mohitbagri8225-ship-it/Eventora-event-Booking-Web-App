import React, { useState, useEffect } from "react";
import { EVENTS as STATIC_EVENTS, STEPS } from "./data/constants.js";
import Hero from "./Hero/Hero.jsx";
import Discover from "./Discover/Discover.jsx";
import { CATEGORIES } from "./data/constants.js";
import { useAuth } from "../../context/auth.context.jsx";

const normalizeEvent = (event) => ({
  ...event,
  id: event._id || event.id,
  title: event.title || "Untitled event",
  category: event.category || "all",
  venue: event.location || event.venue || "Venue TBD",
  price: Number(event.ticketPrice ?? event.price ?? 0),
  seats: Number(event.availableSeats ?? event.seats ?? 0),
  img: event.imageUrl || event.img || "https://picsum.photos/seed/gate-fallback/640/480",
});

function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [favorites, setFavorites] = useState(new Set());
  const { isLoggedIn } = useAuth();
  const [events, setEvents] = useState(() => STATIC_EVENTS.map(normalizeEvent));

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = events.filter((event) => {
    const item = normalizeEvent(event);
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesQuery =
      query.trim() === "" ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.venue.toLowerCase().includes(query.toLowerCase());
    const matchesCity =
      city.trim() === "" ||
      item.location.toLowerCase().includes(city.toLowerCase());
    return matchesCategory && matchesQuery && matchesCity;
  });

  useEffect(() => {
    const getEvents = async () => {
      try {
        const res = await fetch("https://eventora-event-booking-web-app-1.onrender.com/api/events", {
          credentials: "include",
        });

        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : [];

        if (!res.ok) {
          console.log(data.message || "Failed to fetch events");
          setEvents(STATIC_EVENTS.map(normalizeEvent));
          return;
        }

        setEvents(list.length ? list.map(normalizeEvent) : STATIC_EVENTS.map(normalizeEvent));
      } catch (error) {
        console.error(error);
        setEvents(STATIC_EVENTS.map(normalizeEvent));
      }
    };

    getEvents();
  }, [isLoggedIn]);

  return (
    <>
      <Hero
        query={query}
        setQuery={setQuery}
        city={city}
        setCity={setCity}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        events={events}
      />

      <div id="categories" className="cat-row">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              className={`cat-pill ${activeCategory === c.id ? "active" : ""}`}
              onClick={() => setActiveCategory(c.id)}
            >
              <Icon size={14} /> {c.label}
            </button>
          );
        })}
      </div>

      <Discover
        filtered={filtered}
        activeCategory={activeCategory}
        query={query}
        city={city}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />

      <section id="how" className="how-wrap">
        <span className="eyebrow">The process</span>
        <h2 className="section-title font-display" style={{ marginTop: 14 }}>
          Three steps, one confirmed seat.
        </h2>
        <div className="how-grid">
          {STEPS.map((s) => (
            <div key={s.n} className="how-step">
              <span className="how-num font-mono">{s.n}</span>
              <h3 className="how-title">{s.title}</h3>
              <p className="how-body">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;