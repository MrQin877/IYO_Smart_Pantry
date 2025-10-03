// src/components/FoodDetailModal.jsx
import { useEffect, useState } from "react";
import { apiPost } from "../lib/api";  // ensure you're using apiPost
import React from "react";

export default function FoodDetailModal({ open, foodID, onClose, onDonate }) {
  const [loading, setLoading] = useState(true);
  const [food, setFood] = useState(null);

  useEffect(() => {
    if (!foodID) return; // ✅ use foodID, not item.id
    console.log("🔍 Sending foodID:", foodID);

    (async () => {
      try {
        const res = await apiPost("/food_detail.php", { foodID }); // ✅ use foodID directly
        console.log("✅ Response from API:", res);

        if (res.ok) {
          setFood(res.food);
        } else {
          console.error("❌ API error:", res.error);
          setFood(null);
        }
      } catch (e) {
        console.error("❌ Fetch error:", e);
        setFood(null);
      } finally {
        setLoading(false); // ✅ stop loading after fetch
      }
    })();
  }, [foodID]);

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
