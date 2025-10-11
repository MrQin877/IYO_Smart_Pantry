// src/component/header.jsx
import React, { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "./header.css";
import { apiGet } from "../lib/api";

export default function HeaderNav() {
  const [user, setUser] = useState(undefined); // undefined=loading, null=guest
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const j = await apiGet("/session.php");
        setUser(j.user);
      } catch { setUser(null); }
    })();
  }, []);

  async function handleLogout() {
    try { await apiGet("/logout.php"); } catch {}
    setUser(null);
    navigate("/");
  }

  return (
    <header className="nav-wrap">
      <div className="nav-pill">
        <Link to="/" className="brand" aria-label="IYO Smart Pantry – Home">
          <img className="logo" src="/logo.svg" alt="IYO Logo" />
        </Link>

        <nav className="main" aria-label="Primary">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/food">Food Center</NavItem>
          <NavItem to="/plan">Plan Meals</NavItem>
          <NavItem to="/analytics">Food Analytics</NavItem>
        </nav>

        <div className="right-side">
          {user === undefined ? null : !user ? (
            <div className="auth-actions">
              <Link to="/login" className="login-link">Login</Link>
              <Link to="/register" className="register-btn">Register</Link>
            </div>
          ) : (
            <div className="icons">
              <button className="icon" title="Notifications" aria-label="Notifications">🔔</button>
              <Link to="/account" aria-label="Account"><button className="icon" title="Account">🧑</button></Link>
              <Link to="/settings" aria-label="Settings"><button className="icon" title="Settings">⚙️</button></Link>
              <button className="logout-link" onClick={handleLogout}>Logout</button>
            </div>
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
