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
    const reserved = parseFloat(food.reservedQty ?? 0); // ✅ ensure numeric

    const newQty = parseFloat((current - used).toFixed(2));

    if (newQty < 0) {
      alert("Used quantity cannot exceed available quantity.");
      return;
    }

    if (isIntegerUnit(food.unitName) && used % 1 !== 0) {
      alert("Please enter a whole number for this unit.");
      return;
    }

    // ✅ Only confirm deletion if both available and reserved quantities are 0
    if (newQty === 0 && reserved === 0) {
      const confirmDelete = confirm(
        "⚠️ Quantity will become 0. This will remove the food item. Continue?"
      );
      if (!confirmDelete) return;
    }

    try {
      const res = await apiPost("/food_update_used.php", {
        foodID: food.foodID,
        usedAmount: used,
      });

      if (!res.ok) {
        throw new Error(res.error || "Failed to update quantity.");
      }

      // ✅ Show different alerts depending on result
      if (res.warning) {
        alert(res.message); // ✅ will show both success + warning
      } else if (res.deleted) {
        alert(res.message || "✅ Food item used up and removed.");
      } else if (res.updated) {
        alert(res.message || "✅ Food quantity updated successfully.");
      }

      onUpdate?.();
      onClose();
    } catch (err) {
      alert("Failed to update food quantity: " + err.message);
    }
  };





  const isIntegerUnit = (unitName) => {
    if (!unitName) return false;
    const lower = unitName.toLowerCase();
    return ["pcs", "pack", "bottle", "other"].includes(lower);
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
                <b>Available Quantity:</b> {food.quantity} {food.unitName || ""}
              </li>
              <li><b>Reserved Quantity:</b> {food.reservedQty ?? 0} {food.unitName || ""}</li>
              <li>
                <b>Status:</b> {food.is_plan ? "Planned for Meal" : "Normal"}
              </li>
              <li>
                <b>Expiry date:</b> {formatDate(food.expiryDate)}
              </li>
              <li>
                <b>Storage Location:</b> {food.storageName || "-"}
              </li>
              <li>
                <b>Remark:</b> {food.remark || "-"}
              </li>
            </ul>

            {/* 🔹 Action buttons */}
            <div className="actions" style={{ marginTop: "20px" }}>
              {/* --- Quantity Used Input --- */}
              <div style={{ marginBottom: "10px" }}>
                <label>
                  Quantity used:{" "}
                  <input
                    type="number"
                    min="0"
                    step={isIntegerUnit(food.unitName) ? "1" : "0.01"} // integer vs decimal
                    value={usedQty}
                    onKeyDown={(e) => {
                      // 🔹 Block '.' or ',' typing for integer units
                      if (isIntegerUnit(food.unitName) && (e.key === "." || e.key === ",")) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (isIntegerUnit(food.unitName)) {
                        // ✅ Strip any non-digit input
                        val = val.replace(/\D/g, "");
                      }
                      setUsedQty(val);
                    }}
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

                <button 
                  className="btn success" 
                  onClick={() =>
                    onDonate({
                      foodID:  food.foodID,
                      name:    food.foodName,
                      qty:     Number(food.quantity),
                      unit:    food.unitName,   // display name
                      unitID:  food.unitID,     // if you track it
                      expiry:  food.expiryDate,
                      category: food.categoryName,
                    })
                  }
                >
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
