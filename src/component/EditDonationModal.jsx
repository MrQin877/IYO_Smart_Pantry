// src/component/EditDonationModal.jsx
import { useEffect, useMemo, useState } from "react";

// 0 = allow slots on the expiry day
// 1 = last allowed day is one day BEFORE expiry
const MAX_SLOT_OFFSET_DAYS = 0;

export default function EditDonationModal({ open, onClose, onUpdate, item }) {
  if (!open || !item) return null;

  // ---- normalize incoming slots (string "dd/mm/yyyy, hh:mm - hh:mm" or objects) ----
  const normalizeSlots = (slots = []) =>
    (slots || []).map((s) => {
      if (typeof s === "string") {
        // Try to split "dd/mm/yyyy, hh:mm - hh:mm"
        const [datePart = "", timePart = ""] = s.split(",").map((x) => x.trim());
        const [start = "", end = ""] = timePart.split("-").map((x) => x.trim());
        return {
          id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
          date: toISOFromDMY(datePart) || "", // keep empty if parsing fails
          start: toHHMM(start),
          end: toHHMM(end),
          note: "",
        };
      }
      // already an object
      return {
        id: s.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
        date: s.date || "",
        start: s.start || "",
        end: s.end || "",
        note: s.note || "",
      };
    });

  const [f, setF] = useState(() => ({
    // read-only display
    name: item.name || "",
    qty: item.qty || 0,
    expiry: item.expiry || "", // ISO yyyy-mm-dd preferred
    // editable
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
    slots: normalizeSlots(item.slots),
  }));

  // when item changes, re-seed form
  useEffect(() => {
    if (!open || !item) return;
    setF({
      name: item.name || "",
      qty: item.qty || 0,
      expiry: item.expiry || "",
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
      slots: normalizeSlots(item.slots),
    });
  }, [open, item]);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // ---------- expiry-guard logic (same idea as AddDonationModal) ----------
  const expiryDate = safeISOToDate(f.expiry);
  const latestAllowed = useMemo(() => {
    if (!expiryDate) return null;
    const d = new Date(expiryDate);
    d.setDate(d.getDate() - MAX_SLOT_OFFSET_DAYS);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [expiryDate]);

  const toMinutes = (t) => {
    if (!t) return NaN;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const slotAfterLimit = (() => {
    if (!f.slotDate || !latestAllowed) return false;
    const sd = safeISOToDate(f.slotDate);
    return Boolean(sd && sd > latestAllowed);
  })();

  const canAddSlot = useMemo(() => {
    if (!f.slotDate || !f.slotStart || !f.slotEnd) return false;
    const startM = toMinutes(f.slotStart);
    const endM = toMinutes(f.slotEnd);
    if (!Number.isFinite(startM) || !Number.isFinite(endM) || endM <= startM) return false;

    const sd = safeISOToDate(f.slotDate);
    if (!sd || !latestAllowed) return false;
    return sd <= latestAllowed;
  }, [f.slotDate, f.slotStart, f.slotEnd, latestAllowed]);

  const addSlot = () => {
    if (!canAddSlot) return;
    setF((s) => ({
      ...s,
      slots: [
        ...s.slots,
        {
          id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
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

  // Any existing saved slots invalid?
  const invalidSlots = useMemo(() => {
    if (!latestAllowed) return [];
    return (f.slots || []).filter((s) => {
      const d = safeISOToDate(s.date);
      return d && d > latestAllowed;
    });
  }, [f.slots, latestAllowed]);

  const canSave = f.slots.length >= 0 && !slotAfterLimit && invalidSlots.length === 0;

  const save = () => {
    if (!canSave) return;
    onUpdate?.({
      id: item.id || item.donationID,
      address: f.address,
      slots: f.slots,
    });
  };

  const maxISOForPicker = latestAllowed ? toISODate(latestAllowed) : undefined;

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel panel-wide" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Edit Donation</h3>

        {/* Read-only item info (same layout as add) */}
        <div className="form-grid grid-3">
          <div className="form-row">
            <label>Item name</label>
            <input className="input" value={f.name} readOnly />
          </div>
          <div className="form-row">
            <label>Quantity</label>
            <input className="input" value={String(f.qty)} readOnly />
          </div>
          <div className="form-row">
            <label>Expiry date</label>
            <input className="input" value={formatDMY(f.expiry)} readOnly />
          </div>
        </div>

        {/* Address – no "use default" toggle here */}
        <div className="section-head">
          <span className="section-title">Address</span>
        </div>

        <div className="form-grid grid-3">
          {["label", "line1", "line2", "postcode", "city", "state", "country"].map((key) => (
            <div className="form-row" key={key}>
              <label>{cap(key)}</label>
              <input
                className="input"
                value={f.address[key] || ""}
                onChange={(e) =>
                  setF({ ...f, address: { ...f.address, [key]: e.target.value } })
                }
              />
            </div>
          ))}
        </div>

        {/* Availability (same markup/classes as AddDonationModal) */}
        <div className="section-head">
          <span className="section-title">Availability time(s)</span>
        </div>

        <div className="slots-row">
          <input
            type="date"
            className="input"
            value={f.slotDate}
            max={maxISOForPicker}
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

        {slotAfterLimit && (
          <div className="text-xs text-red-600 mt-1">
            Availability date must be on or before {formatDMY(latestAllowed)}.
          </div>
        )}

        {f.slots.length > 0 && (
          <>
            {invalidSlots.length > 0 && (
              <div className="mb-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {invalidSlots.length} availability {invalidSlots.length > 1 ? "entries are" : "entry is"} past the allowed date.
              </div>
            )}
            <div className="chip-list">
              {f.slots.map((s) => {
                const d = safeISOToDate(s.date);
                const late = latestAllowed && d && d > latestAllowed;
                return (
                  <span key={s.id} className={`slot-pill ${late ? "bg-red-50" : ""}`}>
                    <span className="slot-main">
                      {formatDMY(s.date)}, {fmtTime(s.start)}–{fmtTime(s.end)}
                      {s.note ? ` · ${s.note}` : ""}{late ? " ⚠️" : ""}
                    </span>
                    <button className="slot-del" onClick={() => removeSlot(s.id)}>Delete</button>
                  </span>
                );
              })}
            </div>
          </>
        )}

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={save} disabled={!canSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function safeISOToDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDMY(dOrIso) {
  const d = dOrIso instanceof Date ? dOrIso : new Date(dOrIso);
  return isNaN(d) ? String(dOrIso) : d.toLocaleDateString("en-GB");
}

function fmtTime(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(); d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}

function toISOFromDMY(dmy) {
  // expects "dd/mm/yyyy"
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((dmy || "").trim());
  if (!m) return "";
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

function toHHMM(text) {
  // if already "HH:MM" keep; else try to parse "h:mm AM/PM"
  if (/^\d{2}:\d{2}$/.test(text)) return text;
  const t = (text || "").toUpperCase().trim();
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/.exec(t);
  if (!m) return "";
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ap = m[3];
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}
