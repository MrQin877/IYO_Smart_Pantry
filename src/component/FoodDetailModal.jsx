// src/components/FoodDetailModal.jsx
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import React from "react";

export default function FoodDetailModal({ open, item, onClose, onDonate }) {
  const [food, setFood] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [planned, setPlanned] = useState(false);

  useEffect(() => {
    if (open && item?.foodID) {
      fetchFoodDetail(item.foodID);
      setPlanned(false); // reset highlight
    }
  }, [open, item]);


  const fetchFoodDetail = async (foodID) => {
    if (!foodID) return; // safety check

    try {
      // POST request with JSON body
      const res = await apiPost("/food_detail.php", { foodID });
      if (res.ok) {
        setFood(res.food);
        setHistory(res.history || []);
      } else {
        console.error("Error fetching food detail:", res.error);
      }
    } catch (e) {
      console.error("Failed to fetch food detail", e);
    }
  };


  const handleAction = async (actionType) => {
    if (actionType === "Plan for Meal") {
      setPlanned(!planned);
      return;
    }

    if (!food) return;
    setLoadingAction(true);
    try {
      const res = await apiPost("/food_update_status.php", {
        foodID: food.foodID,
        action: actionType,
        qty: 1,
      });
      if (res.ok) {
        setHistory(res.history || []);
        setFood((prev) => ({
          ...prev,
          quantity: res.updatedQuantity ?? prev.quantity,
        }));
      } else {
        console.error(res.error);
      }
    } catch (e) {
      console.error("Failed to update food status", e);
    } finally {
      setLoadingAction(false);
    }
  };

  if (!open) return null;
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

  const isExpired = food.expiryDate && new Date(food.expiryDate) < new Date();

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel panel-lg" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>

        <div className="detail-grid">
          {/* Left column */}
          <div className="detail-left">
            <h3 className="modal-title">Food Detail</h3>

            <ul className="kv spaced">
              <li><b>Item name:</b> {food.foodName}</li>
              <li><b>Category:</b> {food.categoryName || "-"}</li>
              <li><b>Quantity:</b> {food.quantity} {food.unitName || ""}</li>
              <li>
                <b>Status:</b>{" "}
                <span className={`pill ${isExpired ? "danger" : ""}`}>
                  {isExpired ? "Expired" : "Available"}
                </span>
              </li>
              <li><b>Expiry date:</b> {formatDate(food.expiryDate)}</li>
              <li><b>Storage Location:</b> {food.storageLocation || "-"}</li>
              <li><b>Owner:</b> {food.ownerName} ({food.ownerEmail})</li>
              <li><b>Remark:</b> {food.remark || "-"}</li>
            </ul>

            <div className="detail-actions">
              <button
                className="chip"
                disabled={loadingAction}
                onClick={() => handleAction("Used")}
              >
                Used
              </button>
              <button
                className={`chip ${planned ? "primary" : ""}`}
                onClick={() => handleAction("Plan for Meal")}
              >
                Plan for Meal
              </button>
              <button className="chip primary" onClick={() => onDonate?.(food)}>
                Donate
              </button>
            </div>
          </div>

          {/* Right column (history) */}
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
                      <td>{formatDate(h.date)}</td>
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

// Helper: format ISO date to DD/MM/YYYY
function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleDateString("en-GB");
}
