// src/components/FilterModal.jsx
import React, { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function FilterModal({ open, type = "food", filters, setFilters, onApply, onClose, userId }) {
  const [storages, setStorages] = useState([]);
  const [categories, setCategories] = useState([]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Fetch categories and storages when modal opens
  useEffect(() => {
    if (!open) return;

    async function fetchData() {
      try {
        const storageRes = await apiGet("/storages_list.php");
        if (storageRes.ok) setStorages(storageRes.data || []);

        const categoryRes = await apiGet("/categories_list.php");
        if (categoryRes.ok) setCategories(categoryRes.data || []);
      } catch (e) {
        console.error("Failed to fetch storages or categories", e);
      }
    }

    fetchData();
  }, [open]);

  if (!open) return null;

  const resetFilters = {
    category: "",
    storageID: "",
    expiryFrom: "",
    expiryTo: "",
    pickupArea: "",
  };

  function handleApply() {
    onApply?.(filters); // backend filtering handled in MyFood.jsx
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Filter Foods</h3>

        <div className="form-grid">
          {/* Category */}
          <select
            className="input"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Storage */}
          <select
            className="input"
            value={filters.storageID}
            onChange={(e) => setFilters({ ...filters, storageID: e.target.value })}
          >
            <option value="">All</option>
            {storages.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Expiry */}
          <div className="form-row">
            <label>Expiry</label>
            <select
              className="input"
              value={filters.expiryRange || ""}
              onChange={(e) => setFilters({
                ...filters,
                expiryRange: e.target.value
              })}
            >
              <option value="">Any</option>
              <option value="3days">Next 3 Days</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Pickup Area (optional) */}
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
              onApply?.(resetFilters); // clear results
              onClose?.();
            }}
          >
            Clear
          </button>
          <button className="btn primary" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
