// src/components/FoodDetailModal.jsx
import { useEffect, useState } from "react";
import { apiPost } from "../lib/api";  // ensure you're using apiPost
import React from "react";

export default function FoodDetailModal({ open, foodID, onClose, onDonate }) {
  const [loading, setLoading] = useState(true);
  const [food, setFood] = useState(null);

  // FoodDetailModal.jsx
  useEffect(() => {
    if (open && foodID) {
      console.log("Sending foodID:", foodID);

      apiPost("/api/food_detail.php", { foodID })   // <-- wrap foodID in an object
        .then(res => {
          if (!res.ok) throw new Error(res.error || "Query failed");
          setDetail(res.food);
        })
        .catch(err => {
          console.error("❌ Fetch error:", err);
        });
    }
  }, [open, foodID]);


  if (!open) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel panel-lg" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>

        {loading ? (
          <p>Loading food detail...</p>
        ) : food ? (
          <div>
            <h3 className="modal-title">Food Detail</h3>
            <ul className="kv spaced">
              <li><b>Item name:</b> {food.foodName}</li>
              <li><b>Category:</b> {food.categoryName || "-"}</li>
              <li><b>Quantity:</b> {food.quantity} {food.unitName || ""}</li>
              <li><b>Expiry date:</b> {formatDate(food.expiryDate)}</li>
              <li><b>Storage Location:</b> {food.storageLocation || "-"}</li>
              <li><b>Owner:</b> {food.ownerName} ({food.ownerEmail})</li>
            </ul>
          </div>
        ) : (
          <p>Food not found.</p>
        )}
      </div>
    </div>
  );
}

// Helper: format ISO date
function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleDateString("en-GB");
}
