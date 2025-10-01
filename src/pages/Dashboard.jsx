import React from "react";
import { Link } from "react-router-dom";
import "./dashboard.css";
// If you already have the header component from earlier:

export default function Dashboard() {
  return (
    <>
      <main className="container">
        {/* Hero */}
        <section className="dashboard-hero">
          <div className="hero-text">
            <h1>
              Welcome To
              <br />
              <span>IYO Smart Pantry</span>
            </h1>
          </div>

          {/* Decorative circle/plate */}
          <div className="hero-art">
            <div className="plate">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
            </div>
            <div className="utensils">🍴</div>
          </div>
        </section>

        {/* Dotted section */}
        <section className="dashboard-dots">
          <h2 className="start-heading">Start Now ↓</h2>

          <div className="start-cards">
            <StartCard to="/food" icon="🧊" label="My food" />
            <StartCard to="/plan" icon="🍽️" label="Meal Plan" />
            <StartCard to="/analytics" icon="📈" label="Food Analytic" />
          </div>
        </section>
      </main>
    </>
  );
}

function StartCard({ to, icon, label }) {
  return (
    <Link className="start-card" to={to}>
      <div className="start-icon">{icon}</div>
      <div className="start-btn">{label}</div>
    </Link>
  );
}
