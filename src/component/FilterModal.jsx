// src/component/FilterModal.jsx
import React from "react";

export default function FilterModal({ open, filters, setFilters, onApply, onClose }) {
  if (!open) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Filter Foods</h3>

        <div className="form-grid">
          {/* Category */}
          <div className="form-row">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All</option>
              <option value="Protein">Protein</option>
              <option value="Grains">Grains</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Dairy">Dairy</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Status */}
          <div className="form-row">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All</option>
              <option value="Available">Available</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Expiry Date */}
          <div className="form-row">
            <label>Expiry From</label>
            <input
              type="date"
              value={filters.expiryFrom}
              onChange={(e) => setFilters({ ...filters, expiryFrom: e.target.value })}
            />
          </div>
          <div className="form-row">
            <label>Expiry To</label>
            <input
              type="date"
              value={filters.expiryTo}
              onChange={(e) => setFilters({ ...filters, expiryTo: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="btn secondary"
            onClick={() =>
              setFilters({ category: "", status: "", expiryFrom: "", expiryTo: "" })
            }
          >
            Clear
          </button>
          <button className="btn primary" onClick={onApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
