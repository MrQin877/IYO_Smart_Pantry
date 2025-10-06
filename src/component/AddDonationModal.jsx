// src/component/AddDonationModal.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

// ---- cache so we don’t re-fetch on every open ----
let CATS_CACHE = null;
let UNITS_CACHE = null;

export default function AddDonationModal({
  open,
  onClose,
  onPublish,
  userId = "U1", // pass actual logged-in user ID
}) {
  const [f, setF] = useState(initForm());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [catOpts, setCatOpts] = useState([]);
  const [unitOpts, setUnitOpts] = useState([]);
  const didPrefillRef = useRef(false);

  // 🔹 For previous address
  const [lastAddress, setLastAddress] = useState(null);
  const [loadingAddr, setLoadingAddr] = useState(false);

  // ✅ Load last address from DB when modal opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingAddr(true);
        const res = await apiGet(`/get_last_address.php?userID=${userId}`);
        if (res.ok && res.address) setLastAddress(res.address);
        else setLastAddress(null);
      } catch {
        setLastAddress(null);
      } finally {
        setLoadingAddr(false);
      }
    })();
  }, [open, userId]);

  // ✅ Reset form each time modal opens
  useEffect(() => {
    if (!open) return;
    setF(initForm());
    setErr("");
    setSaving(false);
    didPrefillRef.current = false;
  }, [open]);

  // ✅ Load categories & units (with cache)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!CATS_CACHE) {
          const r = await apiGet("/categories_list.php");
          CATS_CACHE = r?.data || [];
        }
        if (!UNITS_CACHE) {
          const r2 = await apiGet("/units_list.php");
          UNITS_CACHE = r2?.data || [];
        }
        if (!cancelled) {
          setCatOpts(CATS_CACHE);
          setUnitOpts(UNITS_CACHE);
        }
      } catch {
        if (!cancelled) setErr("Failed to load categories or units");
      }
    })();
    return () => (cancelled = true);
  }, []);

  // ✅ Prefill first options after load
  useEffect(() => {
    if (!open || didPrefillRef.current) return;
    if (!catOpts.length || !unitOpts.length) return;
    didPrefillRef.current = true;
    setF((s) => ({
      ...s,
      categoryID: s.categoryID || catOpts[0]?.id || "",
      unitID: s.unitID || unitOpts[0]?.id || "",
    }));
  }, [open, catOpts.length, unitOpts.length]);

  // ✅ ESC to close modal
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // ---- Helpers ----
  const step = (d) => setF((s) => ({ ...s, qty: Math.max(1, s.qty + d) }));

  const canAddSlot =
    f.slotDate && f.slotStart && f.slotEnd && f.slotEnd > f.slotStart;

  const addSlot = () => {
    if (!canAddSlot) return;
    setF((s) => ({
      ...s,
      slots: [
        ...s.slots,
        {
          id: crypto.randomUUID(),
          date: s.slotDate,
          start: s.slotStart,
          end: s.slotEnd,
          note: s.slotNote.trim(),
        },
      ],
      slotDate: "",
      slotStart: "",
      slotEnd: "",
      slotNote: "",
    }));
  };

  const removeSlot = (id) =>
    setF((s) => ({ ...s, slots: s.slots.filter((x) => x.id !== id) }));

  const canPublish = useMemo(() => {
    return (
      f.name.trim() &&
      f.categoryID &&
      f.unitID &&
      f.qty > 0 &&
      f.expiry &&
      f.slots.length > 0 &&
      f.contact.trim()
    );
  }, [f]);

  // ✅ Publish donation
  async function publish() {
    if (!canPublish || saving) return;
    setSaving(true);
    setErr("");

    const address = f.useLastAddress
      ? lastAddress
      : f.address;

    const payload = {
      userID: userId,
      contact: f.contact.trim(),
      food: {
        name: f.name.trim(),
        quantity: Number(f.qty),
        expiryDate: f.expiry,
        categoryID: f.categoryID,
        unitID: f.unitID,
        remark: f.remark.trim() || null,
      },
      address,
      availability: f.slots.map(({ date, start, end, note }) => ({
        date,
        start,
        end,
        note: note || "",
      })),
    };

    try {
      const res = await apiPost("/donation_add.php", payload);
      if (!res || res.ok === false) throw new Error(res?.error || "Add failed");

      const catName = catOpts.find((c) => c.id === f.categoryID)?.name || "";
      const unitName = unitOpts.find((u) => u.id === f.unitID)?.name || "";

      onPublish?.({
        id: res.donationID,
        item: {
          name: f.name.trim(),
          qty: Number(f.qty),
          unit: unitName,
          category: catName,
          expiry: f.expiry,
          remark: f.remark.trim(),
        },
        address,
        slots: f.slots,
        contact: f.contact.trim(),
      });
      onClose?.();
    } catch (e) {
      setErr(e.message || "Network error");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;
  const addrDisabled = f.useLastAddress;

  // ---- JSX ----
  return (
    <div className="modal" onClick={onClose}>
      <div className="panel panel-wide" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Add Donation</h3>

        {err && (
          <div className="alert-error">{err}</div>
        )}

        {/* 🧾 Item info */}
        <div className="form-grid grid-3">
          <TextInput label="Item name" value={f.name}
            onChange={(v) => setF({ ...f, name: v })} />
          <QuantityRow
            qty={f.qty}
            unitID={f.unitID}
            step={step}
            unitOpts={unitOpts}
            onUnitChange={(val) => setF({ ...f, unitID: val })}
          />
          <TextInput label="Contact Number" value={f.contact}
            onChange={(v) => setF({ ...f, contact: v })} />
        </div>

        {/* 📦 Category + Expiry + Remark */}
        <div className="form-grid grid-3">
          <SelectInput label="Category" value={f.categoryID}
            options={catOpts} onChange={(v) => setF({ ...f, categoryID: v })} />
          <DateInput label="Expiry date" value={f.expiry}
            onChange={(v) => setF({ ...f, expiry: v })} />
          <TextInput label="Remark" value={f.remark}
            onChange={(v) => setF({ ...f, remark: v })} placeholder="Optional" />
        </div>

        {/* 🏠 Address */}
        <div className="section-head">
          <span className="section-title">Address</span>
          {lastAddress && (
            <label className="inline">
              <input
                type="checkbox"
                checked={f.useLastAddress}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setF((prev) => ({
                    ...prev,
                    useLastAddress: checked,
                    address: checked
                      ? lastAddress
                      : initForm().address,
                  }));
                }}
              />{" "}
              Use Previous Address
            </label>
          )}
          {loadingAddr && (
            <span className="text-sm text-gray-500 ml-2">(Loading…)</span>
          )}
        </div>

        <div className="form-grid grid-3">
          {["label","line1","line2","postcode","city","state","country"].map((key) => (
            <TextInput
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              disabled={addrDisabled}
              value={f.address[key]}
              onChange={(v) =>
                setF({ ...f, address: { ...f.address, [key]: v } })
              }
            />
          ))}
        </div>

        {/* ⏰ Availability */}
        <div className="section-head">
          <span className="section-title">Availability time(s)</span>
        </div>

        <div className="slots-row">
          <input type="date" className="input"
            value={f.slotDate} onChange={(e) => setF({ ...f, slotDate: e.target.value })}/>
          <input type="time" className="input"
            value={f.slotStart} onChange={(e) => setF({ ...f, slotStart: e.target.value })}/>
          <input type="time" className="input"
            value={f.slotEnd} onChange={(e) => setF({ ...f, slotEnd: e.target.value })}/>
          <input className="input note" placeholder="Note (optional)"
            value={f.slotNote} onChange={(e) => setF({ ...f, slotNote: e.target.value })}/>
          <button className="add-slot" disabled={!canAddSlot} onClick={addSlot}>+ Add</button>
        </div>

        {f.slots.length > 0 && (
          <div className="chip-list">
            {f.slots.map((s) => (
              <span key={s.id} className="chip">
                {formatDMY(s.date)}, {s.start}–{s.end}
                {s.note && ` · ${s.note}`}
                <button className="chip-x" onClick={() => removeSlot(s.id)}>×</button>
              </span>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn primary" disabled={!canPublish || saving} onClick={publish}>
            {saving ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Small subcomponents */
function TextInput({ label, value, onChange, disabled, placeholder }) {
  return (
    <div className="form-row">
      <label>{label}</label>
      <input
        className="input"
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function QuantityRow({ qty, unitID, step, unitOpts, onUnitChange }) {
  return (
    <div className="form-row">
      <label>Quantity</label>
      <div className="qty-row">
        <button className="step" onClick={() => step(-1)}>-</button>
        <span className="qty-num">{qty}</span>
        <button className="step" onClick={() => step(1)}>+</button>
        <select className="input unit" value={unitID} onChange={(e) => onUnitChange(e.target.value)}>
          {unitOpts.length === 0 ? (
            <option value="">Loading…</option>
          ) : (
            unitOpts.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)
          )}
        </select>
      </div>
    </div>
  );
}

function SelectInput({ label, value, options, onChange }) {
  return (
    <div className="form-row">
      <label>{label}</label>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.length === 0 ? (
          <option value="">Loading…</option>
        ) : (
          options.map((opt) => <option key={opt.id} value={opt.id}>{opt.name}</option>)
        )}
      </select>
    </div>
  );
}

function DateInput({ label, value, onChange }) {
  return (
    <div className="form-row">
      <label>{label}</label>
      <input type="date" className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function initForm() {
  return {
    name: "",
    qty: 1,
    unitID: "",
    contact: "",
    categoryID: "",
    expiry: "",
    remark: "",
    useLastAddress: false,
    address: { label: "", line1: "", line2: "", postcode: "", city: "", state: "", country: "" },
    slotDate: "",
    slotStart: "",
    slotEnd: "",
    slotNote: "",
    slots: [],
  };
}

function formatDMY(isoDate) {
  const d = new Date(isoDate);
  return isNaN(d) ? isoDate : d.toLocaleDateString("en-GB");
}
