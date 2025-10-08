import React from "react";
import { NavLink, Link } from "react-router-dom";
import "./header.css";

export default function HeaderNav() {
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
            <IconButton title="Account">🧑</IconButton>
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

/*import { apiGet } from '../lib/api'
import { useState } from 'react'

export default function Header() {
  const [pong, setPong] = useState('')

  async function testPing() {
    try {
      const j = await apiGet('/ping.php')
      console.log('PING JSON:', j)        // <-- look in DevTools console
      // show fallback text if keys are missing, so you can see it's the right file
      setPong(`${j.msg ?? '(no msg)'} @ ${j.time ?? '(no time)'} | raw=${JSON.stringify(j)}`)
    } catch (e) {
      console.error(e)
      setPong('FAILED: ' + e.message)
    }
  }

  return (
    <header style={{padding:12}}>
      <button onClick={testPing}>Test API</button>
      {pong && <span style={{marginLeft:12}}>{pong}</span>}
    </header>
  )
}*/
