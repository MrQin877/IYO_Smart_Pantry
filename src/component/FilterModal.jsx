// src/component/FilterModal.jsx
import React, { useEffect } from "react";

export default function FilterModal({ open, type = "food", filters, setFilters, onApply, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const resetFilters = {
    category: "",
    status: "",
    expiryFrom: "",
    expiryTo: "",
    pickupArea: "",
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Filter {type === "food" ? "Foods" : "Donations"}</h3>

        <div className="form-grid">
          <div className="form-row">
            <label>Category</label>
            <select
              className="input"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All</option>
              <option>Grains</option>
              <option>Protein</option>
              <option>Vegetables</option>
              <option>Fruits</option>
              <option>Dairy</option>
              <option>Other</option>
            </select>
          </div>

          {type === "food" && (
            <div className="form-row">
              <label>Status</label>
              <select
                className="input"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All</option>
                <option>Available</option>
                <option>Expired</option>
              </select>
            </div>
          )}

          <div className="form-row">
            <label>Expiry From</label>
            <input
              type="date"
              className="input"
              value={filters.expiryFrom}
              onChange={(e) => setFilters({ ...filters, expiryFrom: e.target.value })}
            />
          </div>

          <div className="form-row">
            <label>Expiry To</label>
            <input
              type="date"
              className="input"
              value={filters.expiryTo}
              onChange={(e) => setFilters({ ...filters, expiryTo: e.target.value })}
            />
          </div>

          {type !== "food" && (
            <div className="form-row">
              <label>Pickup Area</label>
              <input
                className="input"
                placeholder="Any"
                value={filters.pickupArea}
                onChange={(e) => setFilters({ ...filters, pickupArea: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button
            className="btn secondary"
            onClick={() => {
              setFilters(resetFilters);
              // call parent applyFilters with the resetFilters so it reloads immediately
              onApply?.(resetFilters);
              onClose?.();
            }}
          >
            Clear
          </button>

          <button
            className="btn primary"
            onClick={() => {
              onApply?.(); // parent will use current filters state
              onClose?.();
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
