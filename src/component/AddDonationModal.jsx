// src/component/AddDonationModal.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

// ---- caches (persist for page life) ----
let CATS_CACHE = null;   // [{id,name}]
let UNITS_CACHE = null;  // [{id,name}]

// Change this to 1 if you want to limit availability to one day BEFORE expiry.
// 0 = can use the expiry date itself, 1 = must be <= expiry - 1 day
const MAX_SLOT_OFFSET_DAYS = 0;

export default function AddDonationModal({
  open,
  onClose,
  onPublish,       // optional UI update callback
}) {
  const [f, setF] = useState(initForm());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [catOpts, setCatOpts] = useState([]);
  const [unitOpts, setUnitOpts] = useState([]);

  // only prefill default IDs once per open
  const didPrefillRef = useRef(false);

  // previous address
  const [lastAddress, setLastAddress] = useState(null);
  const [loadingAddr, setLoadingAddr] = useState(false);

  // when modal opens, load last address from DB
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingAddr(true);
        const res = await apiGet(`/get_last_address.php`);
        if (res?.ok && res.address) {
          setLastAddress(res.address);
        } else {
          setLastAddress(null);
        }
      } catch {
        setLastAddress(null);
      } finally {
        setLoadingAddr(false);
      }
    })();
  }, [open]);

  // Reset when opened
  useEffect(() => {
    if (!open) return;
    setF(initForm());
    setErr("");
    setSaving(false);
    didPrefillRef.current = false;
  }, [open]);

  // Load categories + units from API (with cache)
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
        if (cancelled) return;
        setCatOpts(CATS_CACHE);
        setUnitOpts(UNITS_CACHE);
      } catch {
        if (!cancelled) setErr("Failed to load categories/units");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Prefill first option IDs once options are ready
  useEffect(() => {
    if (!open) return;
    if (didPrefillRef.current) return;
    if (!catOpts.length || !unitOpts.length) return;

    didPrefillRef.current = true;
    setF((s) => ({
      ...s,
      categoryID: s.categoryID || catOpts[0]?.id || "",
      unitID:     s.unitID     || unitOpts[0]?.id || "",
    }));
  }, [open, catOpts.length, unitOpts.length]);

  // ESC to close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const step = (d) => setF((s) => ({ ...s, qty: Math.max(1, s.qty + d) }));

  // ---------- Expiry-based validation for availability ----------
  const expiryDate = safeISOToDate(f.expiry); // the food's expiry selected in the form
  const latestAllowed = useMemo(() => {
    if (!expiryDate) return null;
    const d = new Date(expiryDate);
    d.setDate(d.getDate() - MAX_SLOT_OFFSET_DAYS);
    // end-of-day to be inclusive for that date
    d.setHours(23, 59, 59, 999);
    return d;
  }, [expiryDate]);

  // ---------- Today (block past availability) ----------
  const todayFloor = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const todayISO = toISODate(todayFloor);

  function toMinutes(t) {
    if (!t) return NaN;
    const [h, m] = String(t).split(":").map(Number);
    return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN;
  }

    // --- candidate derived from the inputs ---
  const candidate = useMemo(
    () => (f.slotDate && f.slotStart && f.slotEnd
      ? { date: f.slotDate, start: f.slotStart, end: f.slotEnd }
      : null),
    [f.slotDate, f.slotStart, f.slotEnd]
  );

  // --- check against existing list (for both button-disable and warnings) ---
  const candDup  = useMemo(
    () => (candidate ? duplicateOfAny(candidate, f.slots) : false),
    [candidate, f.slots]
  );
  const candOver = useMemo(
    () => (candidate && !candDup ? overlapsAny(candidate, f.slots) : false),
    [candidate, candDup, f.slots]
  );

  // Add-row validation
  const canAddSlot = useMemo(() => {
    if (!f.slotDate || !f.slotStart || !f.slotEnd) return false;

    const toMinutes = (t) => {
      const [h, m] = String(t).split(":").map(Number);
      return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN;
    };
    const startM = toMinutes(f.slotStart);
    const endM   = toMinutes(f.slotEnd);
    if (!Number.isFinite(startM) || !Number.isFinite(endM) || endM <= startM) return false;

    const sd = safeISOToDate(f.slotDate);
    if (!sd) return false;
    if (startOfDay(sd) < todayFloor) return false;
    if (latestAllowed && sd > latestAllowed) return false;

    if (candDup || candOver) return false;   // <-- key bit

    return true;
  }, [f.slotDate, f.slotStart, f.slotEnd, latestAllowed, todayFloor, candDup, candOver]);


  const slotAfterLimit = (() => {
    if (!f.slotDate || !latestAllowed) return false;
    const sd = safeISOToDate(f.slotDate);
    return Boolean(sd && sd > latestAllowed);
  })();

  const slotBeforeToday = (() => {
    if (!f.slotDate) return false;
    const sd = safeISOToDate(f.slotDate);
    return Boolean(sd && startOfDay(sd) < todayFloor);
  })();

  const addSlot = () => {
    if (!canAddSlot) return;
    setF((s) => ({
      ...s,
      slots: [
        ...s.slots,
        {
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : String(Date.now() + Math.random()),
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

  // Any saved slots beyond the allowed date?
  const invalidSlots = useMemo(() => {
    if (!latestAllowed) return [];
    return (f.slots || []).filter((s) => {
      const d = safeISOToDate(s.date);
      return d && d > latestAllowed;
    });
  }, [f.slots, latestAllowed]);

  // NEW: any saved slots in the past?
  const pastSlots = useMemo(() => {
    return (f.slots || []).filter((s) => {
      const d = safeISOToDate(s.date);
      return d && startOfDay(d) < todayFloor;
    });
  }, [f.slots, todayFloor]);

  // ---------- "expiry must be today or later" ----------
  const expiryBeforeToday = useMemo(() => {
    if (!expiryDate) return false;
    return expiryDate < todayFloor;
  }, [expiryDate, todayFloor]);

  // ---------- Contact (MY) + Slot overlaps ----------
  const msisdnOk = useMemo(() => {
    return /^0\d{1,3}[-\s]?\d{6,9}$/.test((f.contact || "").trim());
  }, [f.contact]);

  function overlaps(a, b) {
    if (!a || !b) return false;
    if (a.date !== b.date) return false; // same day only
    const sA = toMinutes(a.start), eA = toMinutes(a.end);
    const sB = toMinutes(b.start), eB = toMinutes(b.end);
    if (![sA, eA, sB, eB].every(Number.isFinite)) return false;
    return sA < eB && sB < eA;
  }
  function sameSlot(a, b) {
  return !!a && !!b && a.date === b.date && a.start === b.start && a.end === b.end;
}

function duplicateOfAny(candidate, list = []) {
  for (const x of list) if (sameSlot(candidate, x)) return true;
  return false;
}

function overlapsAny(candidate, list = []) {
  for (const x of list) if (overlaps(candidate, x)) return true;
  return false;
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

  const canPublish = useMemo(() => {
    // base checks
    if (
      !f.name.trim() ||
      !f.categoryID ||
      !f.unitID ||
      f.qty <= 0 ||
      !f.expiry ||
      !f.contact.trim() ||
      f.slots.length === 0
    ) return false;

    // must have valid expiry to compare
    if (!expiryDate || !latestAllowed) return false;

    // contact format (simple MY check)
    if (!msisdnOk) return false;

    // reject if expiry is earlier than today
    if (expiryBeforeToday) return false;

    // reject if any invalid slots, editor invalid, past slots, or overlaps
    if (invalidSlots.length > 0 || slotAfterLimit || slotBeforeToday) return false;
    if (pastSlots.length > 0) return false;
    if (hasOverlap) return false;

    return true;
  }, [
    f.name, f.categoryID, f.unitID, f.qty, f.expiry, f.slots.length, f.contact,
    expiryDate, latestAllowed, invalidSlots.length, slotAfterLimit, slotBeforeToday,
    expiryBeforeToday, msisdnOk, pastSlots.length, hasOverlap
  ]);

  function slotKey(s) {
    return `${s.date}|${s.start}|${s.end}`;
  }

  async function publish() {
    if (!canPublish || saving) return;
    setSaving(true);
    setErr("");

    const address = f.useLastAddress && lastAddress ? lastAddress : f.address;

    // NEW: force-unique slots by (date|start|end)
    const uniqueMap = new Map();
    for (const s of f.slots) uniqueMap.set(slotKey(s), s);
    const uniqueSlots = Array.from(uniqueMap.values());

    const payload = {
      contact: f.contact.trim(),
      donationNote: "",
      food: {
        name: f.name.trim(),
        quantity: Number(f.qty),
        expiryDate: f.expiry,
        categoryID: f.categoryID,
        unitID: f.unitID,
        remark: f.remark.trim() || null,
      },
      address,
      availability: uniqueSlots.map(({ date, start, end, note }) => ({
        date, start, end, note: note || "",
      })),
    };

    try {
      const res = await apiPost("/donation_add.php", payload);
      if (!res || res.ok === false) {
        throw new Error(res?.error || "Add failed");
      }

      const catName  = catOpts.find(c => c.id === f.categoryID)?.name || "";
      const unitName = unitOpts.find(u => u.id === f.unitID)?.name || "";

      onPublish?.({
        id: res.donationID,
        donationID: res.donationID,
        item: {
          name: f.name.trim(),
          qty: Number(f.qty),
          unit: unitName,
          category: catName,
          expiry: f.expiry,
          remark: f.remark.trim(),
        },
        address,
        useLastAddress: f.useLastAddress,
        slots: f.slots,
        contact: f.contact.trim(),
      });

      alert("Donation created. ✅");
      onClose?.();
    } catch (e) {
      setErr(e.message || "Network error");
      alert(e.message || "Network error");
    } finally {
      setSaving(false);
    }
  }

  const addrDisabled = f.useLastAddress && !!lastAddress;
  if (!open) return null;

  const maxISOForPicker = latestAllowed ? toISODate(latestAllowed) : undefined;

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel panel-wide panel--uniform" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Add Donation</h3>

        {err && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

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

        {/* Row 2: category / expiry / remark */}
        <div className="form-grid grid-3">
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
            <label>Expiry date</label>
            <input
              type="date"
              className="input"
              value={f.expiry}
              min={todayISO}               // cannot pick past expiry
              onChange={(e) => setF({ ...f, expiry: e.target.value })}
            />
            {f.expiry && (
              <div className="text-xs mt-1">
                {MAX_SLOT_OFFSET_DAYS === 1 && " (one day before expiry)"}
              </div>
            )}
            {expiryBeforeToday && (
              <div className="text-xs text-red-600 mt-1">
                Expiry cannot be in the past. Please choose {formatDMY(todayFloor)} or later.
              </div>
            )}
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
                    : { label: "", line1: "", line2: "", postcode: "", city: "", state: "", country: "" },
                }));
              }}
            />{" "}
            Use Previous Address {loadingAddr ? " (Loading…)" : !lastAddress ? " (none)" : ""}
          </label>
        </div>

        <div className="form-grid grid-3">
          {["label","line1","line2","postcode","city","state","country"].map((key) => (
            <div className="form-row" key={key}>
              <label>{cap(key)}</label>
              <input
                className="input"
                disabled={f.useLastAddress && !!lastAddress}
                value={f.address[key]}
                onChange={(e) => setF({ ...f, address: { ...f.address, [key]: e.target.value } })}
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
            max={maxISOForPicker}
            min={todayISO}               // NEW: UI min = today
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

        {candDup && (
          <div className="text-xs text-red-600 mt-1">This exact time already exists.</div>
        )}
        {!candDup && candOver && (
          <div className="text-xs text-red-600 mt-1">This time overlaps another slot.</div>
        )}

        {slotAfterLimit && (
          <div className="text-xs text-red-600 mt-1">
            Availability date must be on or before {formatDMY(latestAllowed)}.
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
                {invalidSlots.length} availability {invalidSlots.length > 1 ? "entries are" : "entry is"} past the allowed date. Please remove or change them.
              </div>
            )}
            <div className="chip-list">
              {f.slots.map((s) => {
                const d = safeISOToDate(s.date);
                const late = latestAllowed && d && d > latestAllowed;
                const past = d && startOfDay(d) < todayFloor;
                return (
                  <span key={s.id} className={`slot-pill ${late || past ? "bg-red-50" : ""}`}>
                    <span className="slot-main">
                      {formatDMY(s.date)}, {fmtTime(s.start)}–{fmtTime(s.end)}
                      {s.note ? ` · ${s.note}` : ""}
                      {(late || past) ? " ⚠️" : ""}
                    </span>
                    <button className="slot-del" onClick={() => removeSlot(s.id)}>Delete</button>
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
          <button className="btn primary" disabled={!canPublish || saving} onClick={publish}>
            {saving ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------- helpers --------
function initForm() {
  return {
    // item
    name: "",
    qty: 1,
    unitID: "",       // from DB list
    contact: "",
    categoryID: "",   // from DB list
    expiry: "",       // YYYY-MM-DD
    remark: "",

    // address
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

    // slot editor + list
    slotDate: "",
    slotStart: "",
    slotEnd: "",
    slotNote: "",
    slots: [],
  };
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
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
