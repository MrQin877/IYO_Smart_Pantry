// src/component/Header.jsx
import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import "./header.css";
import Swal from "sweetalert2";
import { UnreadBus } from "../utils/unreadBus";

export default function HeaderNav() {
  const [initial, setInitial] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    // show an immediate value without network
    setUnread(UnreadBus.get());

    const refreshShell = () => {
      const name   = localStorage.getItem("userName");
      const email  = localStorage.getItem("userEmail");
      const userID = localStorage.getItem("userID");

      setIsLoggedIn(!!userID);
      setInitial(
        name?.trim()?.charAt(0)?.toUpperCase() ||
        email?.trim()?.charAt(0)?.toUpperCase() || ""
      );

      if (userID) fetchUnread();
      else setUnread(0);
    };

    async function fetchUnread() {
      try {
        const res  = await fetch('/api/notifications_count.php', { credentials: 'include' });
        const data = await res.json();
        if (data?.ok) {
          const n = Number(data.count || 0);
          setUnread(n);       // reconcile UI
          UnreadBus.set(n);   // keep hint fresh for other views/tabs
        }
      } catch {}
    }

    // initial
    refreshShell();

    // app-wide instant updates (open detail, mark all, create new)
    const onBus = (e) => setUnread(Number(e.detail?.value ?? UnreadBus.get()));
    window.addEventListener('unread:set', onBus);

    // cross-tab updates
    window.addEventListener("storage", refreshShell);

    // refresh on focus + light polling to stay correct
    const onVis = () => { if (!document.hidden && localStorage.getItem("userID")) fetchUnread(); };
    document.addEventListener("visibilitychange", onVis);
    const t = setInterval(() => {
      if (localStorage.getItem("userID")) fetchUnread();
    }, 30000);

    return () => {
      window.removeEventListener('unread:set', onBus);
      window.removeEventListener("storage", refreshShell);
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(t);
    };
  }, []);

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
      UnreadBus.clear();
      window.dispatchEvent(new Event("storage"));
      window.location.href = "/";
    }
  }

  return (
    <header className="nav-wrap">
      <div className="nav-pill">
        {/* Brand */}
        <Link to={isLoggedIn ? "/dashboard" : "/"} className="brand" aria-label="IYO Smart Pantry – Home">
          <img className="logo" src="/logo.svg" alt="IYO Logo" />
        </Link>

        {/* Main nav when logged in */}
        {isLoggedIn && (
          <nav className="main" aria-label="Primary">
            <NavItem to="/dashboard">Home</NavItem>
            <NavItem to="/food">Food Center</NavItem>
            <NavItem to="/meal-planner">Plan Meals</NavItem>
            <NavItem to="/analytics">Food Analytics</NavItem>
          </nav>
        )}

        {/* Right icons */}
        <div className="icons">
          {isLoggedIn && (
            <Link to="/notification" className="icon bell" title="Notifications" aria-label="Notifications">
              🔔
              {unread > 0 && <span className="badge">{unread}</span>}
            </Link>
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
