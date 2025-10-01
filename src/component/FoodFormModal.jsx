// src/components/FoodFormModal.jsx
import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

// ---- Module-level cache (valid for the page lifecycle) ----
let CATS_CACHE = null;   // [{id,name}]
let UNITS_CACHE = null;  // [{id,name}]

const toStatus = (yyyyMmDd) =>
  new Date(yyyyMmDd) < new Date() ? "Expired" : "Available";

export default function FoodFormModal({
  open,
  mode = "add",
  initial = {},
  userId = "U1",
  onClose,
  onSave,
}) {
  const [f, setF] = useState({
    name: "",
    qty: 1,
    categoryID: "",
    unitID: "",
    expiry: "",
    location: "",
    remark: "",
  });

  const [catOpts, setCatOpts] = useState([]);
  const [unitOpts, setUnitOpts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // ✅ guard so we prefill only once per "open" session
  const didPrefillRef = useRef(false);
  // snapshot the "initial" we received at the moment we open
  const initialSnapRef = useRef(initial);

  // 1) Prefetch options once and cache
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!CATS_CACHE) {
          const r = await apiGet("/categories_list.php");
          CATS_CACHE = r.data || [];
        }
        if (!UNITS_CACHE) {
          const r2 = await apiGet("/units_list.php");
          UNITS_CACHE = r2.data || [];
        }
        if (cancelled) return;
        setCatOpts(CATS_CACHE);
        setUnitOpts(UNITS_CACHE);
      } catch (e) {
        if (!cancelled) setErr("Failed to load options");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 2) When opening: snapshot `initial`, then prefill ONCE.
  useEffect(() => {
    if (!open) { 
      didPrefillRef.current = false; // reset for next time
      return; 
    }
    // snapshot the initial passed by parent right now
    initialSnapRef.current = initial;

    // if options not ready yet, we'll prefill after they arrive (see next effect)
    if (catOpts.length && unitOpts.length) {
      prefillOnce();
    }
    setErr("");
    // ⚠️ do NOT include `initial` in deps to avoid re-running on identity changes
  }, [open, catOpts.length, unitOpts.length]); 

  function prefillOnce() {
    if (didPrefillRef.current) return; // already done for this open
    didPrefillRef.current = true;

    const init = initialSnapRef.current || {};
    const pickCatID =
      init.categoryID ||
      catOpts.find((c) => c.name === init.category)?.id ||
      catOpts[0]?.id || "";

    const pickUnitID =
      init.unitID ||
      unitOpts.find((u) => u.name === init.unit)?.id ||
      unitOpts[0]?.id || "";

    setF((prev) => ({
      // don’t wipe what user already typed between open and options arrival
      name: prev.name || init.name || "",
      qty: Number(prev.qty ?? init.qty ?? 1),
      categoryID: prev.categoryID || pickCatID,
      unitID: prev.unitID || pickUnitID,
      expiry: (prev.expiry || init.expiry || "").slice(0, 10),
      location: prev.location || init.location || "",
      remark: prev.remark || init.remark || "",
    }));
  }

  // ESC to close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSave =
    f.name.trim() &&
    f.expiry &&
    (f.categoryID || catOpts.length === 0) &&
    (f.unitID || unitOpts.length === 0) &&
    Number(f.qty) > 0;

  const step = (d) =>
    setF((s) => ({ ...s, qty: Math.max(1, Number(s.qty) + d) }));

  const catName = catOpts.find((c) => c.id === f.categoryID)?.name || "";
  const unitName = unitOpts.find((u) => u.id === f.unitID)?.name || "";

  async function submit() {
    if (!canSave || saving) return;
    setSaving(true);
    setErr("");

    const payload = {
      foodName: f.name.trim(),
      quantity: Number(f.qty),
      expiryDate: f.expiry,
      is_plan: 0,
      storageLocation: f.location || "",
      remark: f.remark || "",
      userID: userId,
      categoryID: f.categoryID,
      unitID: f.unitID,
    };

    try {
      if (mode === "add") {
        const res = await apiPost("/food_add.php", payload);
        if (!res.ok && res.ok !== undefined) throw new Error(res.error || "Add failed");
        const foodID = res.foodID || null;

        onSave?.({
          id: foodID,
          foodID,
          name: f.name,
          category: catName,
          qty: f.qty,
          unit: unitName,
          expiry: f.expiry,
          status: toStatus(f.expiry),
          location: f.location || "",
          remark: f.remark || "",
          userID: userId,
          categoryID: f.categoryID,
          unitID: f.unitID,
        });
        onClose?.();
      } else {
        const foodID = initial.foodID || initial.id;
        if (!foodID) throw new Error("Missing foodID for edit");
        const res = await apiPost("/food_update.php", { foodID, ...payload });
        if (!res.ok && res.ok !== undefined) throw new Error(res.error || "Update failed");

        onSave?.({
          id: foodID,
          foodID,
          name: f.name,
          category: catName,
          qty: f.qty,
          unit: unitName,
          expiry: f.expiry,
          status: toStatus(f.expiry),
          location: f.location || "",
          remark: f.remark || "",
          userID: userId,
          categoryID: f.categoryID,
          unitID: f.unitID,
        });
        onClose?.();
      }
    } catch (e) {
      setErr(e.message || "Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">{mode === "edit" ? "Edit" : "Add Food"}</h3>

        {err && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="form-grid">
          <div className="form-row">
            <label>Item name</label>
            <input
              className="input"
              placeholder="Eg. (Egg)"
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
            />
          </div>

          <div className="form-row">
            <label>Category</label>
            <select
              className="input"
              value={f.categoryID}
              onChange={(e) => setF({ ...f, categoryID: e.target.value })}
            >
              {catOpts.length === 0 ? (
                <option value="">Loading…</option>
              ) : (
                catOpts.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              )}
            </select>
          </div>

          <div className="form-row">
            <label>Quantity</label>
            <div className="qty-row">
              <button className="step" onClick={() => step(-1)}>-</button>
              <span className="qty-num">{f.qty}</span>
              <button className="step" onClick={() => step(1)}>+</button>
              <select
                className="input unit"
                value={f.unitID}
                onChange={(e) => setF({ ...f, unitID: e.target.value })}
              >
                {unitOpts.length === 0 ? (
                  <option value="">Loading…</option>
                ) : (
                  unitOpts.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="form-row">
            <label>Expiry date</label>
            <input
              type="date"
              className="input"
              value={f.expiry}
              onChange={(e) => setF({ ...f, expiry: e.target.value })}
            />
          </div>

          <div className="form-row">
            <label>Storage Location</label>
            <input
              className="input"
              placeholder="Optional"
              value={f.location}
              onChange={(e) => setF({ ...f, location: e.target.value })}
            />
          </div>

          <div className="form-row">
            <label>Remark</label>
            <input
              className="input"
              placeholder="Optional"
              value={f.remark}
              onChange={(e) => setF({ ...f, remark: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn primary" disabled={!canSave || saving} onClick={submit}>
            {saving ? "Saving..." : mode === "edit" ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
