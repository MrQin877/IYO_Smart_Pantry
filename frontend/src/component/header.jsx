import React from "react";
import { NavLink, Link } from "react-router-dom";

export default function HeaderNav() {
  return (
    <header className="nav-wrap">
      <div className="nav-pill">
        {/* logo + wordmark */}
        <Link to="/" className="brand" aria-label="IYO Smart Pantry – Home">
          <span className="logo">🥬</span>
          <span className="wordmark">
            <span className="line1">I&nbsp; Smart</span>
            <span className="line2">Pantry</span>
          </span>
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
          <IconButton title="Account">🧑</IconButton>
          <IconButton title="Settings">⚙️</IconButton>
        </div>
      </div>
    </header>
  );
}

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
