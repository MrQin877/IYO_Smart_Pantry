import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

export default function DonationModal({
  open,
  onClose,
  onPublish,
  // Pass: { foodID (or id), name, qty, unit, expiry, category? }
  item = {},
}) {
  const maxQty = Number(item.qty ?? 0);
  const expiryISO = item.expiry || "";                      // "YYYY-MM-DD"
  const expiryDate = safeISOToDate(expiryISO);              // Date | null

  const [f, setF] = useState(() => initForm(item, maxQty));
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  // Last address
  const [lastAddress, setLastAddress] = useState(null);
  const [loadingAddr, setLoadingAddr] = useState(false);

  // Reset when opened or item changes
  useEffect(() => {
    if (!open) return;
    setErr("");
    setSaving(false);
    setF(initForm(item, maxQty));
  }, [open, item, maxQty]);

  // Clamp qty if available stock changes mid-session
  useEffect(() => {
    if (!open) return;
    setF((s) => ({
      ...s,
      qty: Math.max(1, Math.min(maxQty, Number(s.qty) || 1)),
    }));
  }, [open, maxQty]);

  // Load last address when modal opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingAddr(true);
        const res = await apiGet(`/get_last_address.php`);
        setLastAddress(res?.ok && res.address ? res.address : null);
      } catch {
        setLastAddress(null);
      } finally {
        setLoadingAddr(false);
      }
    })();
  }, [open]);

  // If "Use Previous Address" on and lastAddress loaded, apply it
  useEffect(() => {
    if (!open || !lastAddress) return;
    setF((s) => (s.useLastAddress ? { ...s, address: lastAddress } : s));
  }, [open, lastAddress]);

  // ESC to close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Time helpers
  const toMinutes = (t) => {
    if (!t) return NaN;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // ---- Today (for "no past availability") ----
  const todayFloor = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const todayISO = toISODate(todayFloor);

  // --- availability validations ---
  const slotDateObj = safeISOToDate(f.slotDate);
  const slotAfterExpiry =
    Boolean(slotDateObj && expiryDate) && slotDateObj > endOfDay(expiryDate);
  const slotBeforeToday =
    Boolean(slotDateObj) && startOfDay(slotDateObj) < todayFloor;

  const canAddSlot =
    Boolean(f.slotDate) &&
    !slotAfterExpiry &&
    !slotBeforeToday &&
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

  // quantity controls
  const setQty = (q) =>
    setF((s) => ({
      ...s,
      qty: Math.max(1, Math.min(maxQty, Number(q) || 1)),
    }));
  const step = (d) => setQty((f.qty || 1) + d);

  const qtyError =
    maxQty <= 0
      ? "No stock available to donate."
      : f.qty > maxQty
      ? `Max you can donate is ${maxQty} ${item.unit || ""}`.trim()
      : "";

  // any existing slot beyond expiry?
  const invalidSlots = useMemo(() => {
    if (!expiryDate) return [];
    const expEnd = endOfDay(expiryDate);
    return (f.slots || []).filter((s) => {
      const d = safeISOToDate(s.date);
      return d && d > expEnd;
    });
  }, [f.slots, expiryDate]);

  // any past slots?
  const pastSlots = useMemo(() => {
    return (f.slots || []).filter((s) => {
      const d = safeISOToDate(s.date);
      return d && startOfDay(d) < todayFloor;
    });
  }, [f.slots, todayFloor]);

  // overlap checks (same-day)
  function overlaps(a, b) {
    if (a.date !== b.date) return false;
    const sA = a.start, eA = a.end, sB = b.start, eB = b.end;
    return (sA < eB) && (sB < eA); // "HH:MM" zero-padded → safe string compare
  }
  const hasOverlap = useMemo(() => {
    const arr = f.slots || [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (overlaps(arr[i], arr[j])) return true;
      }
    }
    return false;
  }, [f.slots]);

  // simple MY contact check
  const msisdnOk = useMemo(() => {
    return /^0\d{1,3}[-\s]?\d{6,9}$/.test((f.contact || "").trim());
  }, [f.contact]);

  const canPublish = useMemo(() => {
    const base =
      f.name.trim() &&
      f.qty > 0 &&
      f.qty <= maxQty &&
      f.contact.trim() &&
      f.slots.length > 0;

    if (!base) return false;
    if (!msisdnOk) return false;
    if (expiryDate && invalidSlots.length > 0) return false;
    if (pastSlots.length > 0) return false;
    if (slotAfterExpiry || slotBeforeToday) return false;
    if (hasOverlap) return false;
    return true;
  }, [
    f.name, f.qty, maxQty, f.contact, f.slots.length,
    expiryDate, invalidSlots.length, slotAfterExpiry, slotBeforeToday,
    pastSlots.length, hasOverlap, msisdnOk,
  ]);

  const publish = async () => {
    if (!canPublish || saving || maxQty <= 0) return;
    setSaving(true);
    setErr("");

    const address = f.useLastAddress && lastAddress ? lastAddress : f.address;

    try {
      const res = await apiPost("/donation_convert.php", {
        foodID: item.foodID || item.id,
        donateQty: Number(f.qty),
        contact: f.contact.trim(),
        note: "",
        expiryDate: expiryISO,
        address,
        availability: f.slots.map(({ date, start, end, note }) => ({
          date, start, end, note: note || "",
        })),
      });

      if (!res || res.ok === false) throw new Error(res?.error || "Convert failed");

      const slotText = (f.slots ?? [])
        .map(
          (s) =>
            `${formatDMY(s.date)}, ${fmtTime(s.start)} - ${fmtTime(s.end)}${
              s.note ? ` (${s.note})` : ""
            }`
        )
        .join(" | ");
      const pickup = [address.line1, address.city].filter(Boolean).join(", ");

      onPublish?.({
        id: res.donationID,
        donationID: res.donationID,
        foodID: item.foodID || item.id,
        name: f.name.trim(),
        category: item.category || "-",
        qty: Number(f.qty),
        unit: item.unit || f.unit,
        expiry: item.expiry || "",
        pickup,
        slots: f.slots,
        slotText,
      });

      alert("Donation created. ✅");
      onClose?.();
    } catch (e) {
      setErr(e.message || "Network error");
      alert(e.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  const addrDisabled = f.useLastAddress && !!lastAddress;
  const noStock = maxQty <= 0;

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
              readOnly
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
            {f.contact && !msisdnOk && (
              <div className="text-xs text-red-600 mt-1">
                Please enter a valid Malaysian number (e.g. 012-3456789).
              </div>
            )}
          </div>
        </div>

        {/* Expiry info & guard */}
        <div className="mb-2 text-sm">
          <b>Food expiry:</b>{" "}
          {expiryISO ? formatDMY(expiryISO) : <span className="text-red-600">Unknown</span>}
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
                  address:
                    checked && lastAddress
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
          {["label", "line1", "line2", "postcode", "city", "state", "country"].map((key) => (
            <div className="form-row" key={key}>
              <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
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
            max={expiryISO || undefined}
            min={todayISO}
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

        {slotAfterExpiry && (
          <div className="text-xs text-red-600 mt-1">
            Availability date cannot be later than the food expiry date.
          </div>
        )}
        {slotBeforeToday && (
          <div className="text-xs text-red-600 mt-1">
            Availability date cannot be in the past.
          </div>
        )}

        {f.slots.length > 0 && (
          <>
            {hasOverlap && (
              <div className="mb-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                Some availability times overlap on the same day. Please adjust them.
              </div>
            )}
            {pastSlots.length > 0 && (
              <div className="mb-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Some availability dates are in the past. Please update or remove them.
              </div>
            )}
            {invalidSlots.length > 0 && (
              <div className="mb-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {invalidSlots.length} availability {invalidSlots.length > 1 ? "entries are" : "entry is"} past the expiry date. Please remove or change them.
              </div>
            )}
            <div className="chip-list">
              {f.slots.map((s) => {
                const d = safeISOToDate(s.date);
                const isLate = expiryDate && d && d > endOfDay(expiryDate);
                const isPast = d && startOfDay(d) < todayFloor;
                return (
                  <span key={s.id} className={`slot-pill ${isLate || isPast ? "bg-red-50" : ""}`}>
                    <span className="slot-main">
                      {formatDMY(s.date)}, {fmtTime(s.start)}–{fmtTime(s.end)}
                      {s.note ? ` · ${s.note}` : ""}
                      {(isLate || isPast) ? " ⚠️" : ""}
                    </span>
                    <button className="slot-del" onClick={() => removeSlot(s.id)}>
                      Delete
                    </button>
                  </span>
                );
              })}
            </div>
          </>
        )}

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="btn primary"
            disabled={!canPublish || saving || noStock}
            onClick={publish}
          >
            {saving ? "Publishing…" : "Publish"}
          </button>
          {noStock && (
            <div className="text-xs text-amber-700 mt-2">
              No stock available to donate for this item.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- helpers ----------
function initForm(item, maxQty) {
  return {
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
  };
}

function safeISOToDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d) ? null : d;
}
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function formatDMY(iso) {
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleDateString("en-GB");
}
function fmtTime(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}
