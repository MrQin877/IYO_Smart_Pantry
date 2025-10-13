// src/component/header.jsx
import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import "./header.css";

export default function HeaderNav() {
  const [initial, setInitial] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");

    if (name && name.trim() !== "") {
      setInitial(name.trim().charAt(0).toUpperCase());
    } else if (email) {
      setInitial(email.trim().charAt(0).toUpperCase());
    }
  }, []);

  return (
    <header className="nav-wrap">
      <div className="nav-pill">
        {/* logo + wordmark */}
        <Link to="/" className="brand" aria-label="IYO Smart Pantry – Home">
          <img className="logo" src="/logo.svg" alt='IYO Logo' />
        </Link>

        {/* centered navigation */}
        <nav className="main">
          <NavItem to="/dashboard">Dashboard</NavItem>
          <NavItem to="/food">Food Center</NavItem>
          <NavItem to="/plan">Plan Meals</NavItem>
          <NavItem to="/analytics">Food Analytics</NavItem>
        </nav>

        {/* right icons */}
        <div className="icons">
          <IconButton title="Notifications">🔔</IconButton>
          
          <Link to="/account">
            {initial ? (
              <div className="avatar-circle" title="Account">
                {initial}
              </div>
            ) : (
              <IconButton title="Account">🧑</IconButton>
            )}
          </Link>

          <Link to="/settings">
            <IconButton title="Settings">⚙️</IconButton>
          </Link>
        </div>
      </div>
    </header>
  )
  };

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "link" + (isActive ? " active" : "")
      }
    >
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