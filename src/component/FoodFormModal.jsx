// src/components/FoodFormModal.jsx
import { useEffect, useState } from "react";

export default function FoodFormModal({
  open,
  mode = "add",                 // 'add' | 'edit'
  initial = {},                 // { id?, name, qty, unit, category, expiry, location, remark }
  onClose,
  onSave,                       // (data) => void
}) {
  const [f, setF] = useState({
    name: "",
    qty: 1,
    unit: "ps",
    category: "Grains",
    expiry: "",
    location: "",
    remark: "",
  });

  useEffect(() => {
    if (!open) return;
    setF({
      name: initial.name ?? "",
      qty: initial.qty ?? 1,
      unit: initial.unit ?? "ps",
      category: initial.category ?? "Grains",
      expiry: initial.expiry ?? "",
      location: initial.location ?? "",
      remark: initial.remark ?? "",
    });
  }, [open, initial]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSave = f.name.trim() && f.expiry;
  const step = (d) => setF((s) => ({ ...s, qty: Math.max(1, s.qty + d) }));

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">{mode === "edit" ? "Edit" : "Add Food"}</h3>

        <div className="form-grid">
          <div className="form-row">
            <label>Item name</label>
            <input className="input" placeholder="Eg. (Egg)" value={f.name}
                   onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>

          <div className="form-row">
            <label>Category</label>
            <select className="input" value={f.category}
                    onChange={(e) => setF({ ...f, category: e.target.value })}>
              <option>Grains</option><option>Protein</option>
              <option>Vegetables</option><option>Fruits</option>
              <option>Dairy</option><option>Other</option>
            </select>
          </div>

          <div className="form-row">
            <label>Quantity</label>
            <div className="qty-row">
              <button className="step" onClick={() => step(-1)}>-</button>
              <span className="qty-num">{f.qty}</span>
              <button className="step" onClick={() => step(1)}>+</button>
              <select className="input unit" value={f.unit}
                      onChange={(e) => setF({ ...f, unit: e.target.value })}>
                <option value="ps">ps</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label>Expiry date</label>
            <input type="date" className="input" value={f.expiry}
                   onChange={(e) => setF({ ...f, expiry: e.target.value })} />
          </div>

          <div className="form-row">
            <label>Storage Location</label>
            <input className="input" placeholder="Optional" value={f.location}
                   onChange={(e) => setF({ ...f, location: e.target.value })} />
          </div>

          <div className="form-row">
            <label>Remark</label>
            <input className="input" placeholder="Optional" value={f.remark}
                   onChange={(e) => setF({ ...f, remark: e.target.value })} />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!canSave} onClick={() => onSave?.(f)}>
            {mode === "edit" ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
