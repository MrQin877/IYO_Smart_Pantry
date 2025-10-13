// src/component/FoodDeleteConfirm.jsx
import React from "react";

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onConfirm: () => void
 * - foodName: string
 * - flags: { inDonation?: boolean, reserved?: boolean }
 */
export default function FoodDeleteConfirm({
  open,
  onClose,
  onConfirm,
  foodName = "",
  flags = {},
}) {
  if (!open) return null;

  const { inDonation = false, reserved = false } = flags;

  // Build merged message
  const bits = [];
  if (inDonation) bits.push("this item is currently part of a donation");
  if (reserved) bits.push("this item is reserved in your meal plan");
  const hasSpecial = bits.length > 0;

  const title = hasSpecial ? "Delete item with warnings" : "Delete item";
  const warning = hasSpecial
    ? `Heads up: ${bits.join(" and ")}.`
    : "This will permanently remove the item.";

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="panel"
        style={{ maxWidth: 500 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">{title}</h3>

        <div className="mb-3 text-sm">
          <p>
            Are you sure you want to delete{" "}
            <b>{foodName || "this item"}</b>?
          </p>
          <p className={hasSpecial ? "text-red-700" : "text-gray-600"}>
            {warning}
            {inDonation && (
              <>
                <br />
                If you continue, we’ll set its quantity to <b>0</b> (so the donation stays intact).
              </>
            )}
          </p>
        </div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`btn ${hasSpecial ? "danger" : "primary"}`}
            onClick={onConfirm}
          >
            {hasSpecial ? "Yes, proceed" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
