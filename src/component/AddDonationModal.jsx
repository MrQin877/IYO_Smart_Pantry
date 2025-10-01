import { useEffect, useMemo, useState } from "react";

/**
 * Add Donation (MyDonation tab)
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onPublish: (payload) => void
 */
export default function AddDonationModal({ open, onClose, onPublish }) {
  const [f, setF] = useState(() => ({
    // item detail
    name: "",
    qty: 1,
    unit: "ps",
    contact: "",
    category: "Grains",
    expiry: "",
    remark: "",

    // address
    useDefaultAddress: false,
    address: {
      label: "",
      line1: "",
      line2: "",
      postcode: "",
      city: "",
      state: "",
      country: "",
    },

    // availability (editor + list)
    slotDate: "",
    slotStart: "",
    slotEnd: "",
    slotNote: "",
    slots: [],
  }));

  // reset when opened
  useEffect(() => {
    if (!open) return;
    setF((s) => ({
      ...s,
      name: "",
      qty: 1,
      unit: "ps",
      contact: "",
      category: "Grains",
      expiry: "",
      remark: "",
      useDefaultAddress: false,
      address: { label: "", line1: "", line2: "", postcode: "", city: "", state: "", country: "" },
      slotDate: "",
      slotStart: "",
      slotEnd: "",
      slotNote: "",
      slots: [],
    }));
  }, [open]);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const step = (d) => setF((s) => ({ ...s, qty: Math.max(1, s.qty + d) }));

  const canAddSlot = f.slotDate && f.slotStart && f.slotEnd && f.slotEnd > f.slotStart;

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
    return f.name.trim() && f.category && f.qty > 0 && f.expiry && f.slots.length > 0;
  }, [f.name, f.category, f.qty, f.expiry, f.slots.length]);

  const publish = () => {
    if (!canPublish) return;
    onPublish?.({
      item: {
        name: f.name.trim(),
        qty: f.qty,
        unit: f.unit,
        category: f.category,
        expiry: f.expiry,
        contact: f.contact.trim(),
        remark: f.remark.trim(),
      },
      address: f.useDefaultAddress ? null : f.address,
      useDefaultAddress: f.useDefaultAddress,
      slots: f.slots, // [{id,date,start,end,note}]
    });
  };

  const addrDisabled = f.useDefaultAddress;
  if (!open) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel panel-wide" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Add Donation</h3>

        {/* Row 1: item name / qty / contact */}
        <div className="form-grid grid-3">
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
            <label>Quantity</label>
            <div className="qty-row">
              <button className="step" onClick={() => step(-1)}>-</button>
              <span className="qty-num">{f.qty}</span>
              <button className="step" onClick={() => step(1)}>+</button>
              <select
                className="input unit"
                value={f.unit}
                onChange={(e) => setF({ ...f, unit: e.target.value })}
              >
                <option value="ps">UNIT</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label>Contact Number</label>
            <input
              className="input"
              placeholder="012-3456789"
              value={f.contact}
              onChange={(e) => setF({ ...f, contact: e.target.value })}
            />
          </div>
        </div>

        {/* Row 2: category / expiry / remark */}
        <div className="form-grid grid-3">
          <div className="form-row">
            <label>Category</label>
            <select
              className="input"
              value={f.category}
              onChange={(e) => setF({ ...f, category: e.target.value })}
            >
              <option>Grains</option>
              <option>Protein</option>
              <option>Vegetables</option>
              <option>Fruits</option>
              <option>Dairy</option>
              <option>Other</option>
            </select>
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
            <label>Remark</label>
            <input
              className="input"
              placeholder="Optional"
              value={f.remark}
              onChange={(e) => setF({ ...f, remark: e.target.value })}
            />
          </div>
        </div>

        {/* Address */}
        <div className="section-head">
          <span className="section-title">Address</span>
          <label className="inline">
            <input
              type="checkbox"
              checked={f.useDefaultAddress}
              onChange={(e) => setF({ ...f, useDefaultAddress: e.target.checked })}
            />{" "}
            Use default address
          </label>
        </div>

        <div className="form-grid grid-3">
          <div className="form-row">
            <label>Label</label>
            <input
              className="input"
              placeholder="Eg. (Home / Office)"
              disabled={addrDisabled}
              value={f.address.label}
              onChange={(e) => setF({ ...f, address: { ...f.address, label: e.target.value } })}
            />
          </div>
          <div className="form-row">
            <label>Line 1</label>
            <input
              className="input"
              placeholder="Eg. (jalan 123..)"
              disabled={addrDisabled}
              value={f.address.line1}
              onChange={(e) => setF({ ...f, address: { ...f.address, line1: e.target.value } })}
            />
          </div>
          <div className="form-row">
            <label>Line 2</label>
            <input
              className="input"
              placeholder="Eg. (Bukit …)"
              disabled={addrDisabled}
              value={f.address.line2}
              onChange={(e) => setF({ ...f, address: { ...f.address, line2: e.target.value } })}
            />
          </div>

          <div className="form-row">
            <label>Postcode</label>
            <input
              className="input"
              placeholder="Eg. (40160)"
              disabled={addrDisabled}
              value={f.address.postcode}
              onChange={(e) => setF({ ...f, address: { ...f.address, postcode: e.target.value } })}
            />
          </div>
          <div className="form-row">
            <label>City</label>
            <input
              className="input"
              placeholder="Eg. (Shah Alam)"
              disabled={addrDisabled}
              value={f.address.city}
              onChange={(e) => setF({ ...f, address: { ...f.address, city: e.target.value } })}
            />
          </div>
          <div className="form-row">
            <label>State</label>
            <input
              className="input"
              placeholder="Eg. (Selangor)"
              disabled={addrDisabled}
              value={f.address.state}
              onChange={(e) => setF({ ...f, address: { ...f.address, state: e.target.value } })}
            />
          </div>

          <div className="form-row">
            <label>Country</label>
            <input
              className="input"
              placeholder="Eg. (Malaysia)"
              disabled={addrDisabled}
              value={f.address.country}
              onChange={(e) => setF({ ...f, address: { ...f.address, country: e.target.value } })}
            />
          </div>
        </div>

        {/* Availability */}
        <div className="section-head">
          <span className="section-title">Availability time(s)</span>
        </div>

        <div className="slots-row">
          <input
            type="date"
            className="input"
            value={f.slotDate}
            onChange={(e) => setF({ ...f, slotDate: e.target.value })}
          />
          <input
            type="time"
            className="input"
            value={f.slotStart}
            onChange={(e) => setF({ ...f, slotStart: e.target.value })}
          />
          <input
            type="time"
            className="input"
            value={f.slotEnd}
            onChange={(e) => setF({ ...f, slotEnd: e.target.value })}
          />
          <input
            className="input note"
            placeholder="Note (optional)"
            value={f.slotNote}
            onChange={(e) => setF({ ...f, slotNote: e.target.value })}
          />
          <button className="add-slot" disabled={!canAddSlot} onClick={addSlot}>+ Add</button>
        </div>

        {f.slots.length > 0 && (
          <div className="chip-list">
            {f.slots.map((s) => (
              <span key={s.id} className="chip">
                {formatDMY(s.date)}, {s.start}–{s.end}{s.note ? ` · ${s.note}` : ""}
                <button className="chip-x" onClick={() => removeSlot(s.id)}>×</button>
              </span>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!canPublish} onClick={publish}>Publish</button>
        </div>
      </div>
    </div>
  );
}

function formatDMY(isoDate) {
  const d = new Date(isoDate);
  return isNaN(d) ? isoDate : d.toLocaleDateString("en-GB");
}
