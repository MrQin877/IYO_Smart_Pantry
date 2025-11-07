import { useState } from "react";
import "./IngredientPopup.css";

export default function IngredientPopup({ inventory, onClose, onAdd }) {
  // Local state with selection and editable quantity
  const [localInventory, setLocalInventory] = useState(
    inventory.map((item) => ({
      ...item,
      selected: item.selected || false,
      currentQty: 0, // user adjustable amount
      unit: item.unit || "g", // fixed from DB
      totalQty: item.qty || 0, // total available in inventory
    }))
  );

  // Toggle item selection
  const toggleSelect = (name) => {
    setLocalInventory((prev) =>
      prev.map((item) =>
        item.name === name ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Handle quantity input change (limit to available qty)
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

  // Save selected ingredients with updated quantities
  const handleAdd = () => {
    const selected = localInventory
      .filter((item) => item.selected && item.currentQty > 0)
      .map((item) => ({
        name: item.name,
        qty: item.currentQty,
        total: item.totalQty,
        unit: item.unit,
      }));

    onAdd(selected);
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <h3>Select Ingredients</h3>

        {/* Header row */}
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
                className={`inventory-item ${item.selected ? "selected" : ""}`}
                onClick={() => toggleSelect(item.name)}
              >
                <span className="ingredient-name">{item.name}</span>

                <div
                  className="qty-section"
                  onClick={(e) => e.stopPropagation()} // prevent toggling when adjusting qty
                >
                  <input
                    type="number"
                    min="0"
                    max={item.totalQty}
                    className="qty-input"
                    value={item.currentQty}
                    onChange={(e) => handleQtyChange(item.name, e.target.value)}
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
