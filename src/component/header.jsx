// src/component/Header.jsx
import React, { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "./header.css";
import Swal from "sweetalert2";

export default function HeaderNav() {
  const [initial, setInitial] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const refresh = () => {
      const name = localStorage.getItem("userName");
      const email = localStorage.getItem("userEmail");
      const userID = localStorage.getItem("userID");

      setIsLoggedIn(!!userID);

      if (name && name.trim() !== "") {
        setInitial(name.trim().charAt(0).toUpperCase());
      } else if (email) {
        setInitial(email.trim().charAt(0).toUpperCase());
      } else {
        setInitial("");
      }
    };

    // initial load
    refresh();

    // react to updates from login/verify/logout
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  // Handle logout click (with confirmation)
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
        icon:"success",
        title:"Logged out",
        text:"You have been logged out successfully.",
        timer: 2000,
        confirmButtonColor:"#C2D3AC",
      });
      localStorage.clear();
      // make sure other tabs / listeners know
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
            <NavItem to="/plan">Plan Meals</NavItem>
            <NavItem to="/analytics">Food Analytics</NavItem>
          </nav>
        )}

        {/* Right side icons */}
        <div className="icons">
          {isLoggedIn && <IconButton title="Notifications">🔔</IconButton>}

          <Link to={isLoggedIn ? "/settings" : "/account"}>
            {initial ? (
              <div className="avatar-circle" title={isLoggedIn ? "Settings" : "Account"}>
                {initial}
              </div>
            ) : (
              <IconButton title={isLoggedIn ? "Settings" : "Account"}>🧑</IconButton>
            )}
          </Link>

          {isLoggedIn ? (
            <button className="icon" title="Logout" onClick={handleLogout}>
              🚪
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

// Reusable components
function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) => "link" + (isActive ? " active" : "")}
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