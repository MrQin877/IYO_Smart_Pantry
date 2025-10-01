// src/components/FilterModal.jsx
import React, { useEffect } from "react";
import { apiGet } from "../lib/api";

export default function FilterModal({ open, type = "food", filters, setFilters, onApply, onClose, userId }) {
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

  async function applyFilters() {
    try {
      const res = await apiGet("/foods_list.php", {
        userID: userId,
        categoryID: filters.category || undefined,
        status: filters.status || undefined,
        pickupArea: filters.pickupArea || undefined,
        expiryFrom: filters.expiryFrom || undefined,
        expiryTo: filters.expiryTo || undefined,
      });

      if (res.ok) {
        onApply?.(res.foods); // parent gets updated food list
      } else {
        console.error(res.error);
      }
    } catch (e) {
      console.error("Failed to fetch filtered foods", e);
    }
    onClose?.();
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Filter {type === "food" ? "Foods" : "Donations"}</h3>

        <div className="form-grid">
          {/* Category */}
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

          {/* Status */}
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

          {/* Expiry */}
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

          {/* Pickup Area */}
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
              onApply?.([]); // clear results
              onClose?.();
            }}
          >
            Clear
          </button>

          <button className="btn primary" onClick={applyFilters}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
