import "./IngredientPopup.css";

export default function IngredientPopup({ inventory, onClose, onAdd }) {
  const handleAdd = () => {
    const selected = inventory.filter((item) => item.selected);
    onAdd(selected.map((i) => i.name));
    onClose();
  };

  const toggleSelect = (name) => {
    inventory.forEach((item) => {
      if (item.name === name) item.selected = !item.selected;
    });
  };

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <h3>Select Ingredients</h3>

        <div className="inventory-list">
          {inventory.length > 0 ? (
            inventory.map((item, i) => (
              <div
                key={i}
                className={`inventory-item ${item.selected ? "selected" : ""}`}
                onClick={() => toggleSelect(item.name)}
              >
                <span>{item.name}</span>
                <small>Qty: {item.qty}</small>
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
          <button className="add-btn" onClick={handleAdd}>
            Add Selected
          </button>
        </div>
      </div>
    </div>
  );
}
