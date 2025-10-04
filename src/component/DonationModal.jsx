// src/components/DonationModal.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

export default function DonationModal({
  open,
  onClose,
  onPublish,
  userId = "U1",
  // item should at least have: { id/foodID, name, qty, unit, unitID? }
  item = {},
}) {
  const maxQty = Number(item.qty ?? 0); // available stock

  const [f, setF] = useState(() => ({
    name: item.name || "",
    qty: Math.min(1, maxQty) || 1,
    unit: item.unit || "UNIT",
    contact: "",
    useLastAddress: false,
    address: {
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
    slots: [],
  }));

  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  // previous address from DB
  const [lastAddress, setLastAddress] = useState(null);
  const [loadingAddr, setLoadingAddr] = useState(false);

  // reset when opens
  useEffect(() => {
    if (!open) return;
    setErr("");
    setSaving(false);
    setF({
      name: item.name || "",
      qty: Math.min(1, Number(item.qty ?? 0)) || 1,
      unit: item.unit || "UNIT",
      contact: "",
      useLastAddress: false,
      address: {
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
      slots: [],
    });
  }, [open, item]);

  // load last address when opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingAddr(true);
        const res = await apiGet(`/get_last_address.php?userID=${userId}`);
        setLastAddress(res?.ok && res.address ? res.address : null);
      } catch {
        setLastAddress(null);
      } finally {
        setLoadingAddr(false);
      }
    })();
  }, [open, userId]);

  // ESC to close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // time helpers
  const toMinutes = (t) => {
    if (!t) return NaN;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const canAddSlot =
    Boolean(f.slotDate) &&
    Number.isFinite(toMinutes(f.slotStart)) &&
    Number.isFinite(toMinutes(f.slotEnd)) &&
    toMinutes(f.slotEnd) > toMinutes(f.slotStart);

  const addSlot = () => {
    if (!canAddSlot) return;
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now() + Math.random());

    setF((s) => ({
      ...s,
      slots: [
        ...s.slots,
        {
          id,
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

  // clamp qty to [1, maxQty]
  const setQty = (q) =>
    setF((s) => ({ ...s, qty: Math.max(1, Math.min(maxQty, Number(q) || 1)) }));

  const step = (d) => setQty((f.qty || 1) + d);

  // disallow exceeding available quantity
  const qtyError =
    maxQty <= 0
      ? "No stock available to donate."
      : f.qty > maxQty
      ? `Max you can donate is ${maxQty} ${item.unit || ""}`.trim()
      : "";

  const canPublish = useMemo(() => {
    return (
      f.name.trim() &&
      f.qty > 0 &&
      f.qty <= maxQty && // key restriction
      f.contact.trim() &&
      f.slots.length > 0
    );
  }, [f.name, f.qty, maxQty, f.contact, f.slots.length]);

  // publish -> call backend to convert this existing food into a donation
  const publish = async () => {
    if (!canPublish || saving) return;
    setSaving(true);
    setErr("");

    const address = f.useLastAddress && lastAddress ? lastAddress : f.address;

    try {
      const res = await apiPost("/donation_convert.php", {
        userID: userId,
        foodID: item.foodID || item.id, // must be the real foodID
        donateQty: Number(f.qty),
        contact: f.contact.trim(),
        // optional note for donation (separate from address 'line' note)
        note: "",
        address, // {label,line1,line2,postcode,city,state,country}
        availability: f.slots.map(({ date, start, end, note }) => ({
          date,
          start,
          end,
          note: note || "",
        })),
      });

      if (!res || res.ok === false) throw new Error(res?.error || "Convert failed");

      // push to table
      const slotText = (f.slots ?? [])
        .map((s) => `${formatDMY(s.date)}, ${fmtTime(s.start)} - ${fmtTime(s.end)}${s.note ? ` (${s.note})` : ""}`)
        .join(" | ");
      const pickup = [address.line1, address.city].filter(Boolean).join(", ");

      onPublish?.({
        id: res.donationID,
        donationID: res.donationID,
        foodID: item.foodID || item.id,
        name: f.name.trim(),
        category: item.category || "-", // keep if you have it
        qty: Number(f.qty),
        unit: item.unit || f.unit,
        expiry: item.expiry || "",     // if you want to keep showing
        pickup,
        slots: f.slots,
        slotText,
      });

      onClose?.();
    } catch (e) {
      setErr(e.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const addrDisabled = f.useLastAddress && !!lastAddress;

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel panel-wide" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Convert to Donation</h3>

        {err && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        {/* Item / Qty / Contact */}
        <div className="form-grid grid-3">
          <div className="form-row">
            <label>Item name</label>
            <input
              className="input"
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
            />
          </div>

          <div className="form-row">
            <label>
              Quantity{" "}
              <span className="subtle">
                (available: {maxQty} {item.unit || ""})
              </span>
            </label>
            <div className="qty-row">
              <button className="step" onClick={() => step(-1)} disabled={f.qty <= 1}>-</button>
              <input
                className="input qty-num"
                type="number"
                min={1}
                max={maxQty}
                value={f.qty}
                onChange={(e) => setQty(e.target.value)}
                style={{ width: 80, textAlign: "center" }}
              />
              <button className="step" onClick={() => step(1)} disabled={f.qty >= maxQty}>+</button>
              <select
                className="input unit"
                value={f.unit}
                onChange={(e) => setF({ ...f, unit: e.target.value })}
              >
                <option value={item.unit || "UNIT"}>{item.unit || "UNIT"}</option>
              </select>
            </div>
            {qtyError && <div className="text-xs text-red-600 mt-1">{qtyError}</div>}
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

        {/* Address */}
        <div className="section-head">
          <span className="section-title">Address</span>
          <label className={`inline ${!lastAddress ? "opacity-60" : ""}`}>
            <input
              type="checkbox"
              disabled={!lastAddress}
              checked={f.useLastAddress}
              onChange={(e) => {
                const checked = e.target.checked;
                setF((prev) => ({
                  ...prev,
                  useLastAddress: checked,
                  address: checked && lastAddress
                    ? lastAddress
                    : {
                        label: "",
                        line1: "",
                        line2: "",
                        postcode: "",
                        city: "",
                        state: "",
                        country: "",
                      },
                }));
              }}
            />{" "}
            Use Previous Address {loadingAddr ? " (Loading…)" : !lastAddress ? " (none)" : ""}
          </label>
        </div>

        <div className="form-grid grid-3">
          {["label","line1","line2","postcode","city","state","country"].map((key) => (
            <div className="form-row" key={key}>
              <label>{key.charAt(0).toUpperCase()+key.slice(1)}</label>
              <input
                className="input"
                disabled={addrDisabled}
                value={f.address[key]}
                onChange={(e) =>
                  setF({ ...f, address: { ...f.address, [key]: e.target.value } })
                }
              />
            </div>
          ))}
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
              <span key={s.id} className="slot-pill">
                <span className="slot-main">
                  {formatDMY(s.date)}, {fmtTime(s.start)}–{fmtTime(s.end)}
                  {s.note ? ` · ${s.note}` : ""}
                </span>
                <button className="slot-del" onClick={() => removeSlot(s.id)}>Delete</button>
              </span>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn primary" disabled={!canPublish || saving} onClick={publish}>
            {saving ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDMY(iso) {
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleDateString("en-GB");
}
function fmtTime(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(); d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}
