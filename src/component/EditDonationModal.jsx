import { useEffect, useMemo, useState } from "react";

export default function EditDonationModal({ open, onClose, onUpdate, item }) {
  // no item yet? don't render
  if (!open || !item) return null;

  const [f, setF] = useState(() => ({
    // read-only display
    name: item.name || "",
    category: item.category || "",
    qty: item.qty || 0,
    expiry: item.expiry || "",
    // editable
    useDefaultAddress: item.useDefaultAddress ?? false,
    address: item.address ?? {
      label: "",
      line1: "",
      line2: "",
      postcode: "",
      city: "",
      state: "",
      country: "",
    },
    slotDate: "",
    slotStart: "",
    slotEnd: "",
    slotNote: "",
    slots: item.slots ?? [],
  }));

  // reset when a new item comes in
  useEffect(() => {
    if (!item) return;
    setF({
      name: item.name || "",
      category: item.category || "",
      qty: item.qty || 0,
      expiry: item.expiry || "",
      useDefaultAddress: item.useDefaultAddress ?? false,
      address: item.address ?? {
        label: "",
        line1: "",
        line2: "",
        postcode: "",
        city: "",
        state: "",
        country: "",
      },
      slotDate: "",
      slotStart: "",
      slotEnd: "",
      slotNote: "",
      slots: item.slots ?? [],
    });
  }, [item]);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const canAddSlot =
    f.slotDate && f.slotStart && f.slotEnd && f.slotEnd > f.slotStart;

  const addSlot = () => {
    if (!canAddSlot) return;
    setF((s) => ({
      ...s,
      slots: [
        ...s.slots,
        { id: crypto.randomUUID(), date: s.slotDate, start: s.slotStart, end: s.slotEnd, note: s.slotNote.trim() },
      ],
      slotDate: "",
      slotStart: "",
      slotEnd: "",
      slotNote: "",
    }));
  };

  const removeSlot = (id) =>
    setF((s) => ({ ...s, slots: s.slots.filter((x) => x.id !== id) }));

  const canSave = useMemo(() => f.slots.length >= 0, [f.slots.length]); // always OK

  const save = () => {
    if (!canSave) return;
    onUpdate?.({
      id: item.id,
      useDefaultAddress: f.useDefaultAddress,
      address: f.useDefaultAddress ? null : f.address,
      slots: f.slots,
    });
  };

  const addrDisabled = f.useDefaultAddress;

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel panel-wide" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Edit Donation</h3>

        {/* Read-only Item section */}
        <div className="form-grid grid-3">
          <div className="form-row">
            <label>Item name</label>
            <input className="input" value={f.name} disabled />
          </div>
          <div className="form-row">
            <label>Quantity</label>
            <input className="input" value={String(f.qty)} disabled />
          </div>
          <div className="form-row">
            <label>Expiry date</label>
            <input className="input" value={formatDMY(f.expiry)} disabled />
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
          <button className="add-slot" disabled={!canAddSlot} onClick={addSlot}>
            + Add
          </button>
        </div>

        {f.slots.length > 0 && (
          <div className="chip-list">
            {f.slots.map((s) => (
              <span key={s.id} className="chip">
                {formatDMY(s.date)}, {to12hr(s.start)}–{to12hr(s.end)}
                {s.note ? ` · ${s.note}` : ""}
                <button className="chip-x" onClick={() => removeSlot(s.id)}>×</button>
              </span>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}

function formatDMY(isoDate) {
  const d = new Date(isoDate);
  return isNaN(d) ? isoDate : d.toLocaleDateString("en-GB");
}
function to12hr(hhmm) {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return hhmm;
  let [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${`${m}`.padStart(2, "0")} ${ampm}`;
}
