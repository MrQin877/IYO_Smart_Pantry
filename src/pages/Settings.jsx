// src/pages/Setting.jsx
import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../lib/api";
import { clearAuth } from "../utils/auth.js";
import { UnreadBus } from "../utils/unreadBus";
import "./Setting.css";

export default function Settings() {
  const [twoFA, setTwoFA] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Load settings when page opens
  useEffect(() => {
    async function fetchSettings() {
      try {
        const resp = await apiGet("/settings.php");
        console.log("Fetched settings response:", resp); // 👈 add this

        if (resp.ok && resp.settings) {
          console.log("twoFA value from backend:", resp.settings.twoFA); // 👈 debug
          setTwoFA(Number(resp.settings.twoFA) === 1); // ✅ ensure it's treated as number
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);


  // Save new setting when toggled
  async function save(newVal) {
    setSaving(true);
    try {
      const resp = await apiPost("/settings.php", { twoFA: newVal ? 1 : 0 });
      if (resp.ok) {
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2500);
        UnreadBus.inc(1);          // instant bump
        window.refreshUnread?.();  // reconcile exact count
      } else {
        alert(resp.error || "Save failed");
      }
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="container">Loading settings...</div>;

  return (
    <div className="container settings-page">
      {/* ✅ Success Popup */}
      {showPopup && <div className="popup">✅ Your settings have been saved</div>}

      <div className="settings-content">
        <h1>Privacy & Security Setting</h1>

        <div className="setting-item">
          <div className="setting-label">
            <h3>Two-Factor Verification</h3>
          </div>

          <label className={`switch ${saving ? "saving" : ""}`}>
            <input
              type="checkbox"
              checked={twoFA}
              disabled={saving}
              onChange={async (e) => {
                const newVal = e.target.checked;
                setTwoFA(newVal);
                await save(newVal);
              }}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
}
