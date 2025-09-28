// src/component/FoodDetailModal.jsx
import React from "react";

export default function FoodDetailModal({
  open,
  item,
  onClose,
  onDonate,
  history = [],
}) {
  if (!open || !item) return null;

  const fallbackHistory = [
    { date: "20/10/2025", qty: 2, action: "Used" },
    { date: "22/10/2025", qty: 1, action: "Donated" },
    { date: "28/10/2025", qty: "-", action: "Plan for Meal" },
  ];
  const activity = history.length ? history : fallbackHistory;

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel panel-lg" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>

        <div className="detail-grid">
          {/* left column */}
          <div className="detail-left">
            <h3 className="modal-title">Food Detail</h3>

            <div className="detail-head">
              <ul className="kv spaced">
                <li><b>Item name:</b> {item.name}</li>
                <li><b>Category:</b> {item.category}</li>
                <li><b>Quantity:</b> {item.qty} {item.unit}</li>
                <li><b>Reserved:</b> 3</li>

                <li>
                  <b>Status:</b>{" "}
                  <span className={`pill ${item.status === "Expired" ? "danger" : ""}`}>
                    {item.status}
                  </span>
                </li>
                <li><b>Expiry date:</b> {formatDate(item.expiry)}</li>

                {/* Storage Location and Remark now come after */}
                <li><b>Storage Location:</b> {item.location || "-"}</li>
                <li><b>Remark:</b> {item.remark || "-"}</li>
              </ul>
            </div>


            <div className="detail-actions">
              <button className="chip">Used</button>
              <button className="chip">Plan for Meal</button>
              <button
                className="chip primary"
                onClick={() => onDonate?.(item)}
              >
                Donate
              </button>
            </div>
          </div>

          {/* right column */}
          <div className="detail-right">
            <table className="log-table">
              <thead>
                <tr><th>Date</th><th>Quantity</th><th>Action</th></tr>
              </thead>
              <tbody>
                {activity.map((h, i) => (
                  <tr key={i}>
                    <td>{h.date}</td>
                    <td>{h.qty}</td>
                    <td>{h.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleDateString("en-GB");
}
