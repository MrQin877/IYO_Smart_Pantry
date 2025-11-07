import { useState, useEffect } from "react";
import "./IngredientPopup.css";

export default function IngredientPopup({ onClose, onAdd }) {
  const [localInventory, setLocalInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🧩 Fetch inventory
  useEffect(() => {
    fetch("http://localhost/IYO_Smart_Pantry/api/get_inventory.php?userID=U2")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const today = new Date();

          const filtered = data.data
            .filter((item) => parseFloat(item.qty) > 0) // only >0 quantity
            .map((item) => {
              const expiryDate = item.expiryDate
                ? new Date(item.expiryDate)
                : null;
              let daysLeft = null;
              if (expiryDate) {
                const diffDays = Math.ceil(
                  (expiryDate - today) / (1000 * 60 * 60 * 24)
                );
                if (diffDays >= 0 && diffDays <= 7) daysLeft = diffDays;
              }

              return {
                ...item,
                selected: false,
                currentQty: 0,
                totalQty: parseFloat(item.qty) || 0,
                unit: item.unit || "g",
                daysLeft,
              };
            })
            // 🧠 Sort: expiring soon first
            .sort((a, b) => {
              if (a.daysLeft !== null && b.daysLeft === null) return -1;
              if (a.daysLeft === null && b.daysLeft !== null) return 1;
              if (a.daysLeft !== null && b.daysLeft !== null)
                return a.daysLeft - b.daysLeft;
              return a.name.localeCompare(b.name);
            });

          setLocalInventory(filtered);
        } else {
          setError("Failed to load inventory data.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching inventory:", err);
        setError("Unable to connect to the server.");
        setLoading(false);
      });
  }, []);

  // 🧠 Toggle selection
  const toggleSelect = (name) => {
    setLocalInventory((prev) =>
      prev.map((item) =>
        item.name === name ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // ✏️ Handle quantity input
  const handleQtyChange = (name, value) => {
    const newValue = Number(value) || 0;
    setLocalInventory((prev) =>
      prev.map((item) =>
        item.name === name
          ? {
              ...item,
              currentQty: newValue > item.totalQty ? item.totalQty : newValue,
            }
          : item
      )
    );
  };

  // 💾 Save selected items
  const handleAdd = () => {
    const selected = localInventory
      .filter((item) => item.selected && item.currentQty > 0)
      .map((item) => ({
        foodID: item.foodID,
        name: item.name,
        qty: item.currentQty,
        total: item.totalQty,
        unit: item.unit,
      }));

    onAdd(selected);
    onClose();
  };

  // 🖼️ UI Rendering
  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <h3>Select Ingredients</h3>

        {loading ? (
          <p>Loading inventory...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : (
          <>
            <div className="inventory-header">
              <span className="header-name">Item Name</span>
              <span className="header-qty">Quantity</span>
              <span className="header-unit">Units</span>
            </div>

            <div className="inventory-list">
              {localInventory.length > 0 ? (
                localInventory.map((item, i) => (
                  <div
                    key={i}
                    className={`inventory-item ${
                      item.selected ? "selected" : ""
                    }`}
                    onClick={() => toggleSelect(item.name)}
                  >
                    <div className="ingredient-name-wrapper">
                      <span className="ingredient-name">{item.name}</span>

                      {/* ⚠ Expiring soon text beside name */}
                      {item.daysLeft !== null && (
                        <span className="expiry-warning-row pulse">
                          ⚠ {item.daysLeft} day
                          {item.daysLeft !== 1 ? "s" : ""} left
                        </span>
                      )}
                    </div>

                    <div
                      className="qty-section"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="number"
                        min="0"
                        max={item.totalQty}
                        className="qty-input"
                        value={item.currentQty}
                        onChange={(e) =>
                          handleQtyChange(item.name, e.target.value)
                        }
                      />
                      <span className="fixed-unit">
                        / {item.totalQty} {item.unit}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-text">No items in inventory.</p>
              )}
            </div>
          </>
        )}

        <div className="popup-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="add-btn"
            onClick={handleAdd}
            disabled={
              !localInventory.some(
                (item) => item.selected && item.currentQty > 0
              )
            }
          >
            Save Selected
          </button>
        </div>
      </div>
    </div>
  );
}
