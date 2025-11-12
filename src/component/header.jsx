// src/component/Header.jsx
import React, { useEffect, useState, useCallback } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "./header.css";
import Swal from "sweetalert2";
import { UnreadBus } from "../utils/unreadBus";

export default function HeaderNav() {
  const [initial, setInitial] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unread, setUnread] = useState(UnreadBus.get()); // immediate local value
  const navigate = useNavigate();

  // --- server reconcile ---
  const refreshUnread = useCallback(async () => {
    try {
      const res  = await fetch('/api/notifications_count.php', { credentials: 'include' });
      const data = await res.json();
      if (data?.ok) {
        UnreadBus.set(Number(data.count || 0)); // updates global + triggers event
      }
    } catch {}
  }, []);

  useEffect(() => {
    // expose a global reconciler so any page can call it after creating/reading notifications
    window.refreshUnread = refreshUnread;

    const refreshShell = () => {
      const name   = localStorage.getItem("userName");
      const email  = localStorage.getItem("userEmail");
      const userID = localStorage.getItem("userID");

      setIsLoggedIn(!!userID);
      setInitial(
        name?.trim()?.charAt(0)?.toUpperCase() ||
        email?.trim()?.charAt(0)?.toUpperCase() || ""
      );

      if (userID) refreshUnread();
      else setUnread(0);
    };

    // initial boot
    refreshShell();

    // listen to global bus → instant UI updates
    const onBus = (e) => setUnread(Number(e.detail?.value ?? UnreadBus.get()));
    window.addEventListener('unread:set', onBus);

    // cross-tab session changes
    window.addEventListener("storage", refreshShell);

    // when tab becomes visible, reconcile with server
    const onVis = () => { if (!document.hidden && localStorage.getItem("userID")) refreshUnread(); };
    document.addEventListener("visibilitychange", onVis);

    // periodic reconcile (optional)
    const t = setInterval(() => {
      if (localStorage.getItem("userID")) refreshUnread();
    }, 30000);

    return () => {
      window.removeEventListener('unread:set', onBus);
      window.removeEventListener("storage", refreshShell);
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(t);
      delete window.refreshUnread;
    };
  }, [refreshUnread]);

  // force refresh then go notification page
  const handleBellClick = async (e) => {
    e.preventDefault(); // refresh first, then navigate
    await refreshUnread();
    navigate("/notification");
  };

  // Logout with confirm
  async function handleLogout() {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#C2D3AC",
      cancelButtonColor: "#dee0deff",
      buttonsStyling: true,
    });

    if (result.isConfirmed) {
      Swal.fire({
        icon: "success",
        title: "Logged out",
        text: "You have been logged out successfully.",
        timer: 1600,
        showConfirmButton: false
      });
      localStorage.clear();
      UnreadBus.clear();                  // instant UI clear
      window.dispatchEvent(new Event("storage"));
      window.location.href = "/";
    }
  }

  return (
    <header className="nav-wrap">
      <div className="nav-pill">
        {/* Brand logo */}
        <Link
          to={isLoggedIn ? "/dashboard" : "/"}
          className="brand"
          aria-label="IYO Smart Pantry – Home"
        >
          <img className="logo" src="/logo.svg" alt="IYO Logo" />
        </Link>

        {/* Nav menu (only show when logged in) */}
        {isLoggedIn && (
          <nav className="main" aria-label="Primary">
            <NavItem to="/dashboard">Home</NavItem>
            <NavItem to="/food">Food Center</NavItem>
            <NavItem to="/meal-planner">Plan Meals</NavItem>
            <NavItem to="/analytics">Food Analytics</NavItem>
          </nav>
        )}

        {/* Right side icons */}
        <div className="icons">
          {isLoggedIn && (
            <a
              href="/notification"
              onClick={handleBellClick}
              className="icon bell"
              title="Notifications"
              aria-label="Notifications"
            >
              🔔
              {unread > 0 && <span className="badge">{unread}</span>}
            </a>
          )}

          <Link to={isLoggedIn ? "/settings" : "/account"}>
            {initial ? (
              <div className="avatar-circle" title={isLoggedIn ? "Settings" : "Account"}>
                {initial}
              </div>
            ) : (
              <IconButton title={isLoggedIn ? "Settings" : "Account"}>🧑</IconButton>
            )}
          </Link>

          {isLoggedIn && (
            <button className="icon" title="Logout" onClick={handleLogout}>
              🚪
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink to={to} end={to === "/"} className={({ isActive }) => "link" + (isActive ? " active" : "")}>
      {children}
    </NavLink>
  );
}

function IconButton({ children, title }) {
  return (
    <button className="icon" title={title} aria-label={title}>
      {children}
    </button>
  );
}
