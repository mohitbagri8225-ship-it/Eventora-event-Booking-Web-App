import React from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Ticket,
  Menu,
  ArrowUpRight,
  User as UserIcon,
} from "lucide-react";

import { useAuth } from "../context/auth.context";
import { motion } from "framer-motion";

export default function Nav({ scrolled, menuOpen, setMenuOpen }) {
  const { user, logout, isLoggedIn } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  // Handle navigation to sections on the home page
  const goToSection = (id, e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // If we are not on the home page,
    // first navigate to home and tell it which section to scroll to
    if (location.pathname !== "/") {
      navigate("/", {
        state: {
          scrollTo: id,
        },
      });

      return;
    }

    // Find the section
    const el = document.getElementById(id);

    // Scroll to section
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Update URL hash
      window.history.replaceState(
        null,
        "",
        `#${id}`
      );
    }
  };

  return (
    <motion.nav
      className={`gate-nav ${scrolled ? "scrolled" : ""}`}
      initial={{
        opacity: 0,
        y: -8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
      }}
    >
      {/* ================= LOGO ================= */}

      <a href="/" className="logo">
        <span className="logo-mark">
          <Ticket
            size={16}
            color="#131022"
            strokeWidth={2.6}
          />
        </span>

        <span
          className="font-display"
          style={{
            fontSize: 20,
          }}
        >
          Gate.
        </span>
      </a>

      {/* ================= MAIN NAVIGATION ================= */}

      <div
        className="nav-links"
        style={{
          display: menuOpen ? "none" : undefined,
        }}
      >
        {/* HOME */}

        <Link
          to="/"
          className={`nav-link ${
            location.pathname === "/" &&
            !location.hash
              ? "active"
              : ""
          }`}
        >
          Home
        </Link>

        {/* DISCOVER */}

        <a
          href="#discover"
          onClick={(e) =>
            goToSection("discover", e)
          }
          className={`nav-link ${
            location.hash === "#discover"
              ? "active"
              : ""
          }`}
        >
          Discover
        </a>

        {/* CATEGORIES */}

        <a
          href="#categories"
          onClick={(e) =>
            goToSection("categories", e)
          }
          className={`nav-link ${
            location.hash === "#categories"
              ? "active"
              : ""
          }`}
        >
          Categories
        </a>

        {/* HOW IT WORKS */}

        <a
          href="#how"
          onClick={(e) =>
            goToSection("how", e)
          }
          className={`nav-link ${
            location.hash === "#how"
              ? "active"
              : ""
          }`}
        >
          How it works
        </a>

        {/* ================= USER LINKS ================= */}

         

        {/* ================= ADMIN LINKS ================= */}

        {user?.role === "admin" && (
          <Link
            to="/post-events"
            className={`nav-link ${
              location.pathname === "/post-events"
                ? "active"
                : ""
            }`}
          >
            Post Events
          </Link>
        )}

        {/* ================= MY EVENTS / MY TICKETS ================= */}

        {isLoggedIn && (
          <>
            {user?.role === "admin" ? (
              <Link
                to="/my-events"
                className={`nav-link ${
                  location.pathname === "/my-events"
                    ? "active"
                    : ""
                }`}
              >
                My Events
              </Link>
            ) : (
              <Link
                to="/my-tickets"
                className={`nav-link ${
                  location.pathname === "/my-tickets"
                    ? "active"
                    : ""
                }`}
              >
                My Tickets
              </Link>
            )}
          </>
        )}
      </div>

      {/* ================= RIGHT SIDE ================= */}

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        {/* ================= DESKTOP BUTTONS ================= */}

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
          className="desktop-only"
        >
          {!isLoggedIn ? (
            <>
              {/* SIGN IN */}

              <Link to="/login">
                <button className="btn btn-ghost">
                  Sign in
                </button>
              </Link>

              {/* GET STARTED */}

              <Link to="/register">
                <button className="btn btn-primary">
                  Get started

                  <ArrowUpRight size={15} />
                </button>
              </Link>
            </>
          ) : (
            <>
              {/* PROFILE */}

              <Link
                className="btn btn-ghost"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <UserIcon size={16} />

                {user?.username || "Profile"}
              </Link>

              {/* LOGOUT */}

              <button
                className="btn btn-primary"
                onClick={logout}
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* ================= MOBILE MENU BUTTON ================= */}

        <button
          className="icon-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          title="Open menu"
        >
          <Menu size={18} />
        </button>
      </div>
    </motion.nav>
  );
}