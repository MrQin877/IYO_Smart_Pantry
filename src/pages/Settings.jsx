import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../lib/api";
import { clearAuth } from "../utils/auth.js";

export default function Settings({ setBanner }) {
  const [twoFA, setTwoFA] = useState(true);
  const [visible, setVisible] = useState(false);
  const [notif, setNotif] = useState(true);

  useEffect(() => {
    apiGet("/settings.php").then(resp => {
      if (resp.ok && resp.settings) {
        setTwoFA(!!resp.settings.twoFA);
        setVisible(!!resp.settings.foodVisibility);
        setNotif(!!resp.settings.notification);
      }
    });
  }, []);

  async function save() {
    try {
      await apiPost("/settings.php", {
        twoFA: twoFA ? 1 : 0,
        foodVisibility: visible ? 1 : 0,
        notification: notif ? 1 : 0,
      });
      setBanner({ kind: "ok", msg: "Settings saved" });
    } catch (err) {
      setBanner({ kind: "err", msg: err.message || "Save failed" });
    }
  }

  return (
    <div className="container">
      <div className="card grid" style={{ gridTemplateColumns: "220px 1fr" }}>
        <div className="side">
          <button className="tab active">Setting</button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              clearAuth();
              location.reload();
            }}
          >
            Logout
          </button>
        </div>
        <div>
          <h1 className="h1">Privacy & Security</h1>
          <div className="card" style={{ padding: 16 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>Two-Factor Verification</div>
              <button
                className={`toggle ${twoFA ? "on" : ""}`}
                onClick={() => setTwoFA(!twoFA)}
              >
                <span></span>
              </button>
            </div>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>Food Listing Visibility</div>
              <button
                className={`toggle ${visible ? "on" : ""}`}
                onClick={() => setVisible(!visible)}
              >
                <span></span>
              </button>
            </div>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>Notification</div>
              <button
                className={`toggle ${notif ? "on" : ""}`}
                onClick={() => setNotif(!notif)}
              >
                <span></span>
              </button>
            </div>
          </div>
          <div className="actions" style={{ marginTop: 12 }}>
            <button className="btn btn-secondary" onClick={() => location.reload()}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={save}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
