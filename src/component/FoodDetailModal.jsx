// src/components/FoodDetailModal.jsx
import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import React from "react";

export default function FoodDetailModal({ open, item, onClose, onDonate }) {
  const [food, setFood] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!open || !item?.foodID) return;

    (async () => {
      try {
        const res = await apiGet("/food_get.php", { foodID: item.foodID });
        if (res.ok) {
          setFood(res.food);
          setHistory(res.history || []);
        } else {
          console.error(res.error);
        }
      } catch (e) {
        console.error("Failed to fetch food detail", e);
      }
    })();
  }, [open, item]);

  if (!open) return null;

  // fallback if backend hasn’t responded yet
  if (!food) {
    return (
      <div className="modal" onClick={onClose}>
        <div className="panel panel-lg" onClick={(e) => e.stopPropagation()}>
          <button className="close" onClick={onClose}>✕</button>
          <p>Loading food details...</p>
        </div>
      </div>
    );
  }

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
                <li><b>Item name:</b> {food.foodName}</li>
                <li><b>Category:</b> {food.categoryID}</li>
                <li><b>Quantity:</b> {food.quantity} {food.unitID}</li>
                <li>
                  <b>Status:</b>{" "}
                  <span className={`pill ${food.is_expiryStatus ? "danger" : ""}`}>
                    {food.is_expiryStatus ? "Expired" : "Available"}
                  </span>
                </li>
                <li><b>Expiry date:</b> {formatDate(food.expiryDate)}</li>
                <li><b>Storage Location:</b> {food.storageLocation || "-"}</li>
                <li><b>Remark:</b> {food.remark || "-"}</li>
              </ul>
            </div>

            <div className="detail-actions">
              <button className="chip">Used</button>
              <button className="chip">Plan for Meal</button>
              <button className="chip primary" onClick={() => onDonate?.(food)}>
                Donate
              </button>
            </div>
          </div>

          {/* right column (history) */}
          <div className="detail-right">
            <table className="log-table">
              <thead>
                <tr><th>Date</th><th>Quantity</th><th>Action</th></tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={3}>No history found</td></tr>
                ) : (
                  history.map((h, i) => (
                    <tr key={i}>
                      <td>{h.date}</td>
                      <td>{h.qty}</td>
                      <td>{h.action}</td>
                    </tr>
                  ))
                )}
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
