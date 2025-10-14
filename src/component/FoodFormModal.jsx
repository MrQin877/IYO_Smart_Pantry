// src/components/FoodFormModal.jsx
import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

// ---- Module-level caches (persist while page lives) ----
let CATS_CACHE = null;      // [{ id, name }]
let UNITS_CACHE = null;     // [{ id, name }]
let STORAGES_CACHE = null;  // [{ id, name }]

const toStatus = (yyyyMmDd) =>
  yyyyMmDd && new Date(yyyyMmDd) < new Date() ? "Expired" : "Available";

// Normalize any shape to { id, name }
function normalizeOptions(list = [], idKeys = [], nameKeys = []) {
  return (list || []).map((raw) => {
    const id =
      idKeys.map((k) => raw[k]).find((v) => v !== undefined && v !== null && v !== "") ??
      raw.id ??
      raw.ID ??
      "";
    const name =
      nameKeys.map((k) => raw[k]).find((v) => typeof v === "string" && v.trim() !== "") ??
      raw.name ??
      raw.Name ??
      "";
    return { id: String(id), name: String(name) };
  }).filter(opt => opt.id !== "" && opt.name !== "");
}

export default function FoodFormModal({
  open,
  mode = "add",
  initial = {},
  onClose,
  onSave,
}) {
  const [f, setF] = useState({
    name: "",
    qty: 1,
    categoryID: "",
    unitID: "",
    expiry: "",
    storageID: "",
    remark: "",
  });

  const [catOpts, setCatOpts] = useState([]);
  const [unitOpts, setUnitOpts] = useState([]);
  const [storageOpts, setStorageOpts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // guard so we prefill only once per "open" session
  const didPrefillRef = useRef(false);
  // snapshot the "initial" at the moment the modal opens
  const initialSnapRef = useRef(initial);

  // 1) Prefetch options once (with caches) and normalize to {id,name}
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!CATS_CACHE) {
          const r = await apiGet("/categories_list.php");
          CATS_CACHE = normalizeOptions(
            r?.data || [],
            ["categoryID", "categoryId", "id"],
            ["categoryName", "category_name", "name"]
          );
        }
        if (!UNITS_CACHE) {
          const r2 = await apiGet("/units_list.php");
          UNITS_CACHE = normalizeOptions(
            r2?.data || [],
            ["unitID", "unitId", "id"],
            ["unitName", "unit_name", "name"]
          );
        }
        if (!STORAGES_CACHE) {
          const r3 = await apiGet("/storages_list.php");
          STORAGES_CACHE = normalizeOptions(
            r3?.data || [],
            ["storageID", "storageId", "id"],
            ["storageName", "storage_name", "name"]
          );
        }
        if (cancelled) return;
        setCatOpts(CATS_CACHE);
        setUnitOpts(UNITS_CACHE);
        setStorageOpts(STORAGES_CACHE);
      } catch (e) {
        if (!cancelled) setErr("Failed to load options");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 2) When opening: snapshot `initial`, then prefill ONCE once options are ready
  useEffect(() => {
    if (!open) {
      didPrefillRef.current = false; // reset for next show
      return;
    }
    initialSnapRef.current = initial;

    if (catOpts.length && unitOpts.length && storageOpts.length) {
      prefillOnce();
    }
    setErr("");
    // do NOT include `initial` directly to avoid re-runs when object identity changes
  }, [open, catOpts.length, unitOpts.length, storageOpts.length]);

  function prefillOnce() {
    if (didPrefillRef.current) return;
    didPrefillRef.current = true;

    const init = initialSnapRef.current || {};
    // console.debug("Prefill init:", init, { catOpts, unitOpts, storageOpts });

    const findByName = (arr, name) => arr.find((x) => x.name === name)?.id || "";

    const pickCatID =
      init.categoryID ||
      findByName(catOpts, init.category) ||
      catOpts[0]?.id || "";

    const pickUnitID =
      init.unitID ||
      findByName(unitOpts, init.unit) ||
      unitOpts[0]?.id || "";

    // support both `storage` and `storageName`
    const storageNameFromRow = init.storage || init.storageName || "";
    const pickStorageID =
      init.storageID ||
      findByName(storageOpts, storageNameFromRow) ||
      "";

    const initQty = Number.isFinite(Number(init.qty)) ? Number(init.qty) : 1;

    setF((prev) => ({
      // text inputs: prefer the incoming item; keep previous typing if user changed after open
      name: prev.name || init.name || "",
      qty:
        prev.qty !== undefined &&
        prev.qty !== null &&
        String(prev.qty) !== "1" &&
        Number(prev.qty) > 0
          ? Number(prev.qty)
          : initQty,
      categoryID: prev.categoryID || pickCatID,
      unitID: prev.unitID || pickUnitID,
      expiry: (prev.expiry || init.expiry || "").slice(0, 10),
      storageID: prev.storageID || pickStorageID,
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
  const storageName =
    storageOpts.find((s) => s.id === f.storageID)?.name || "";

  async function submit() {
    if (!canSave || saving) return;
    setSaving(true);
    setErr("");

    const payload = {
      foodName: f.name.trim(),
      quantity: Number(f.qty),
      expiryDate: f.expiry,           // YYYY-MM-DD
      is_plan: 0,
      storageID: f.storageID || null, // send DB id or NULL
      remark: f.remark || "",
      categoryID: f.categoryID,
      unitID: f.unitID,
    };

    try {
      if (mode === "add") {
        const res = await apiPost("/food_add.php", payload);
        if (!res || res.ok === false) throw new Error(res?.error || "Add failed");
        const foodID = res.foodID || res.id || null;

        onSave?.({
          id: foodID,
          foodID,
          name: f.name,
          category: catName,
          qty: f.qty,
          unit: unitName,
          expiry: f.expiry,
          status: toStatus(f.expiry),
          storageID: f.storageID,
          storageName,
          remark: f.remark || "",
          categoryID: f.categoryID,
          unitID: f.unitID,
        });
        onClose?.();
      } else {
        const foodID = initialSnapRef.current.foodID || initialSnapRef.current.id;
        if (!foodID) throw new Error("Missing foodID for edit");
        const res = await apiPost("/food_update.php", { foodID, ...payload });
        if (!res || res.ok === false) throw new Error(res?.error || "Update failed");

        onSave?.({
          id: foodID,
          foodID,
          name: f.name,
          category: catName,
          qty: f.qty,
          unit: unitName,
          expiry: f.expiry,
          status: toStatus(f.expiry),
          storageID: f.storageID,
          storageName,
          remark: f.remark || "",
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
              <button type="button" className="step" onClick={() => step(-1)}>-</button>
              <span className="qty-num">{f.qty}</span>
              <button type="button" className="step" onClick={() => step(1)}>+</button>
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
            <select
              className="input"
              value={f.storageID}
              onChange={(e) => setF({ ...f, storageID: e.target.value })}
            >
              <option value="">None</option>
              {storageOpts.length === 0 ? null : storageOpts.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
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
          <button className="btn secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn primary" disabled={!canSave || saving} onClick={submit}>
            {saving ? "Saving..." : mode === "edit" ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
