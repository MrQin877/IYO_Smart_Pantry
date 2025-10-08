// src/components/FoodDetailModal.jsx
import { useEffect, useState } from "react";
import { apiPost } from "../lib/api";

export default function FoodDetailModal({
  open,
  foodID,
  onClose,
  onDonate,
  onUpdate,
  onPlanUpdate, // ✅ added this prop explicitly
}) {
  const [loading, setLoading] = useState(true);
  const [food, setFood] = useState(null);
  const [usedQty, setUsedQty] = useState("");

  // 🔹 Fetch food detail
  useEffect(() => {
    if (open && foodID) {
      setLoading(true);
      apiPost("/food_detail.php", { foodID })
        .then((res) => {
          if (!res.ok) throw new Error(res.error || "Query failed");
          setFood(res.food);
        })
        .catch((err) => {
          console.error("❌ Fetch error:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [open, foodID]);

  if (!open) return null;

  // 🔹 Format date helper
  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return isNaN(d) ? iso : d.toLocaleDateString("en-GB");
  };

  // 🔹 Handle "Used" click
  const handleUsed = async () => {
    if (!usedQty || isNaN(usedQty) || usedQty <= 0) {
      alert("Please enter a valid quantity used.");
      return;
    }

    const used = parseFloat(usedQty);
    const current = parseFloat(food.quantity);
    const newQty = parseFloat((current - used).toFixed(2));

    if (newQty < 0) {
      alert("Used quantity cannot exceed available quantity.");
      return;
    }

    try {
      if (newQty === 0) {
        const confirmDelete = confirm("Quantity will become 0. Delete this food item?");
        if (!confirmDelete) return;

        // ✅ Use the same test userID you use in food_list.php
        const res = await apiPost("/food_delete.php", { 
          foodID: food.foodID,
          userID: "U1"   // ✅ Add this line
        });

        if (!res.ok) throw new Error(res.error || "Delete failed");
        alert("Food item deleted successfully!");
      } else {
        const res = await apiPost("/food_update_used.php", {
          foodID: food.foodID,
          newQuantity: newQty,
        });
        if (!res.ok) throw new Error(res.error || "Update failed");
        alert("Food quantity updated successfully!");
      }

      onUpdate?.(); // refresh parent list
      onClose();
    } catch (err) {
      console.error("❌ HandleUsed error:", err);
      alert("Failed to update food quantity.");
    }
  };



  // 🔹 Handle "Plan for Meal" / "Unplan Meal"
  const handlePlanToggle = async () => {
    const newPlanStatus = food.is_plan ? 0 : 1;

    try {
      const res = await apiPost("/food_plan.php", {
        foodID: food.foodID,
        is_plan: newPlanStatus,
      });

      if (res.ok) {
        alert(newPlanStatus ? "Planned for meal!" : "Removed from meal plan.");

        // ✅ Instantly reflect in modal
        setFood({ ...food, is_plan: newPlanStatus });

        // ✅ Instantly reflect in list table
        onPlanUpdate?.(food.foodID, newPlanStatus);

        // ✅ Optional backend refresh (if needed)
        // onUpdate?.();
      } else {
        console.error("❌ Backend error:", res.error);
        alert(res.error || "Failed to update meal plan.");
      }
    } catch (err) {
      console.error("❌ Error updating plan:", err);
      alert("Error updating meal plan.");
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel panel-lg" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>
          ✕
        </button>

        {loading ? (
          <p>Loading food detail...</p>
        ) : food ? (
          <div>
            <h3 className="modal-title">Food Detail</h3>
            <ul className="kv spaced">
              <li>
                <b>Item name:</b> {food.foodName}
              </li>
              <li>
                <b>Category:</b> {food.categoryName || "-"}
              </li>
              <li>
                <b>Quantity:</b> {food.quantity} {food.unitName || ""}
              </li>
              <li>
                <b>Status:</b> {food.is_plan ? "Planned for Meal" : "Normal"}
              </li>
              <li>
                <b>Expiry date:</b> {formatDate(food.expiryDate)}
              </li>
              <li>
                <b>Storage Location:</b> {food.storageLocation || "-"}
              </li>
              <li>
                <b>Remark:</b> {food.remark || "-"}
              </li>
            </ul>

            {/* 🔹 Action buttons */}
            <div className="actions" style={{ marginTop: "20px" }}>
              <div style={{ marginBottom: "10px" }}>
                <label>
                  Quantity used:{" "}
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={usedQty}
                    onChange={(e) => setUsedQty(e.target.value)}
                    style={{ width: "80px" }}
                  />
                </label>
              </div>
              <div className="detail-actions">
                <button className="btn used" onClick={handleUsed}>
                  Used
                </button>

                <button
                  className={`btn ${food.is_plan ? "unplan" : "plan"}`}
                  onClick={handlePlanToggle}
                >
                  {food.is_plan ? "Unplan Meal" : "Plan for Meal"}
                </button>

                <button className="btn success" onClick={() => onDonate(food)}>
                  Donate
                </button>
              </div>

            </div>
          </div>
        ) : (
          <p>Food not found.</p>
        )}
      </div>
    </div>
  );
}
