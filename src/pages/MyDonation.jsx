import { useState, useEffect, useMemo } from "react";
import AddDonationModal from "../component/AddDonationModal.jsx";
import EditDonationModal from "../component/EditDonationModal.jsx";
import FilterModal from "../component/FilterModal.jsx";
import ConfirmDialog from "../component/ConfirmDialog.jsx";
import { apiPost } from "../lib/api";

// If your backend wants "dd/mm/yyyy, HH:MM - HH:MM (note)" per slot
function slotToServerString({ date, start, end, note }) {
  const d = new Date(date);
  if (isNaN(d)) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}, ${start} - ${end}${note ? ` (${note})` : ""}`;
}

// helpers
function formatDate(iso) {
  const d = new Date(iso);
  return isNaN(d) ? (iso || "-") : d.toLocaleDateString("en-GB");
}

export default function MyDonation() {
  const [rows, setRows] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [delOpen, setDelOpen] = useState(false);
  const [delBusy, setDelBusy] = useState(false);
  const [pendingDel, setPendingDel] = useState(null); // { id, name, slotsCount }
  const [openAdd, setOpenAdd] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    category: "",
    expiryRange: "",
    expiryFrom: "",
    expiryTo: "",
  });

  const [sort, setSort] = useState({ key: "name", dir: "asc" });
  const toggleSort = (key) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );

  // small helper: read first existing key from possible keys
  const pick = (obj, keys = [], fallback = "") => {
    if (!obj) return fallback;
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null) return obj[k];
    }
    return fallback;
  };

  // load donations
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/donation_list.php`).then((r) => r.json());
        if (res.ok && Array.isArray(res.data)) {
          const mapped = res.data.map((d) => {
            const availability =
              pick(d, ["availabilityTimes", "availabilityTime", "availableTime", "availability", "availability_times", "availability_time", "pickTime", "pick_time"], "");
            let slots = [];
            if (Array.isArray(availability)) {
              slots = availability
                .map((a) => (typeof a === "string" ? a.trim() : pick(a, ["pickTime", "pick_time", "pickTimeText", "pickTimeTxt"], "").trim()))
                .filter(Boolean);
            } else if (typeof availability === "string" && availability.trim() !== "") {
              slots = availability.includes("|")
                ? availability.split("|").map((s) => s.trim()).filter(Boolean)
                : [availability.trim()];
            } else if (Array.isArray(d.pickup_times) && d.pickup_times.length) {
              slots = d.pickup_times
                .map((p) => (typeof p === "string" ? p : pick(p, ["pickTime", "pick_time"], "")))
                .filter(Boolean);
            }

            return {
              id: pick(d, ["donationID", "id", "donationId"], ""),
              donationID: pick(d, ["donationID", "id", "donationId"], ""),
              name: pick(d, ["foodName", "name", "food_name"], "-"),
              category: pick(d, ["categoryName", "category", "category_name"], "-"),
              categoryID: pick(d, ["categoryID", "categoryId", "category_id", "cat_id"], ""),
              storage: pick(d, ["storageName", "storage", "storage_name"], ""),
              storageID: pick(d, ["storageID", "storageId", "storage_id"], ""),
              qty: Number(pick(d, ["donationQuantity", "quantity", "donation_qty"], 0)) || 0,
              unit: pick(d, ["unitName", "unit", "unit_name"], ""),
              expiry: pick(d, ["expiryDate", "expiry_date", "expiry"], ""),
              pickup: pick(d, ["pickupLocation", "pickup_location", "pickup"], "-"),
              contact: pick(d, ["contact"], "-"),
              note: pick(d, ["note", "remarks"], "-"),
              slots,
            };
          });

          setAllDonations(mapped);
          setRows(mapped);
        } else {
          console.error(res.error || "No donations returned");
        }
      } catch (err) {
        console.error("Failed to load donations", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // normalize slots if sometimes strings like "2025-02-10, 11:00-12:00"
  const normalizeSlots = (slots = []) =>
    slots.map((s) => {
      if (typeof s === "object") return s; // already normalized
      const [date, range = ""] = s.split(",").map((x) => x.trim());
      const [start = "", end = ""] = range.split("-").map((x) => x.trim());
      return { id: crypto.randomUUID?.() ?? String(Math.random()), date, start, end, note: "" };
    });

  function askDeleteDonation(row) {
    setPendingDel({
      id: row.id || row.donationID,
      name: row.name,
      slotsCount: (row.slots || []).length,
    });
    setDelOpen(true);
  }

  async function doDeleteDonation() {
    if (!pendingDel) return;
    setDelBusy(true);

    // optimistic UI (keep copy for rollback)
    const prev = [...rows];
    setRows(prev.filter((r) => (r.id || r.donationID) !== pendingDel.id));

    try {
      const userID = localStorage.getItem("userID");
      if (!userID) throw new Error("Not logged in (missing userID).");

      // Pick the endpoint your backend actually has:
      const res = await apiPost("/donation_cancel.php", { userID, donationID: pendingDel.id });
      // Or: const res = await apiPost("/donation_delete.php", { userID, donationID: pendingDel.id });

      if (!res?.ok) throw new Error(res?.error || "Delete failed");
    } catch (e) {
      alert(e.message || "Delete failed. Reverting.");
      // rollback
      setRows(prev);
    } finally {
      setDelBusy(false);
      setDelOpen(false);
      setPendingDel(null);
    }
  }

  function parsePickupToAddress(pickup = "") {
    const lines = String(pickup)
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    let label = "", line1 = "", line2 = "", postcode = "", city = "", state = "", country = "";

    if (lines[0]) {
      const parts = lines[0].split(",").map((s) => s.trim());
      label = parts.shift() || "";
      line1 = parts.join(", ");
    }
    if (lines[1]) line2 = lines[1];
    if (lines[2]) {
      const parts = lines[2].split(",").map((s) => s.trim());
      postcode = parts[0] || "";
      city = parts[1] || "";
      state = parts[2] || "";
      country = parts.slice(3).join(", ") || "";
    }

    return { label, line1, line2, postcode, city, state, country };
  }

  // sorting (client-side)
  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const { key, dir } = sort;
      let va = a[key] ?? "";
      let vb = b[key] ?? "";

      if (key === "qty") {
        va = parseFloat(va) || 0;
        vb = parseFloat(vb) || 0;
        return dir === "asc" ? va - vb : vb - va;
      }

      if (key === "expiry") {
        const da = va ? new Date(va) : null;
        const db = vb ? new Date(vb) : null;
        if ((!da || isNaN(da)) && (!db || isNaN(db))) return 0;
        if (!da || isNaN(da)) return dir === "asc" ? 1 : -1;
        if (!db || isNaN(db)) return dir === "asc" ? -1 : 1;
        return dir === "asc" ? da - db : db - da;
      }

      return dir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return copy;
  }, [rows, sort]);

  // applied filter count for badge (optional)
  const appliedFilterCount = Object.values(filters).filter((v) => v && String(v).trim() !== "").length;

  // filtering
  function applyFilters(overrideFilters = null) {
    const f = overrideFilters ?? filters;

    const cat = (f.category ?? "").trim();      // categoryID
    const storage = (f.storageID ?? "").trim(); // storageID

    const fmt = (d) => {
      const offset = d.getTimezoneOffset();
      const local = new Date(d.getTime() - offset * 60000);
      return local.toISOString().split("T")[0];
    };

    let from = "";
    let to = "";
    const today = new Date();

    if (f.expiryRange === "today") {
      from = fmt(today);
      to = fmt(today);
    } else if (f.expiryRange === "3days") {
      const start = new Date(today);
      start.setDate(today.getDate() + 1);
      const end = new Date(today);
      end.setDate(today.getDate() + 3);
      from = fmt(start);
      to = fmt(end);
    } else if (f.expiryRange === "week") {
      const day = today.getDay(); // 0 (Sun) – 6 (Sat)
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const start = new Date(today);
      start.setDate(today.getDate() + diffToMonday);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      from = fmt(start);
      to = fmt(end);
    } else if (f.expiryRange === "month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      from = fmt(start);
      to = fmt(end);
    } else if (f.expiryRange === "nextmonth") {
      const start = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      from = fmt(start);
      to = fmt(end);
    } else {
      from = (f.expiryFrom ?? "").trim();
      to = (f.expiryTo ?? "").trim();
    }

    const filtered = allDonations.filter((r) => {
      if (cat && r.category !== getCategoryName(cat)) return false;
      if (storage && r.storageID !== storage) return false;

      const exp = fmt(new Date(r.expiry));
      if (from && exp < from) return false;
      if (to && exp > to) return false;
      return true;
    });

    setRows(filtered);
    setPage(1);
    setShowFilter(false);
  }

  function getCategoryName(categoryID) {
    const map = {
      C1: "Protein",
      C2: "Grains",
      C3: "Fruits",
      C4: "Vegetables",
      C5: "Dairy",
      C6: "Canned Food",
      C7: "Other",
    };
    return map[categoryID] || "";
  }

  async function handlePublish(payload) {
    setOpenAdd(false);
    setLoading(true);

    try {
      // await apiPost("/donation_add.php", payload);

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/donation_list.php`).then((r) => r.json());
      if (res.ok && Array.isArray(res.data)) {
        const mapped = res.data.map((d) => ({
          id: d.donationID,
          donationID: d.donationID,
          name: d.foodName,
          category: d.categoryName,
          qty: Number(d.donationQuantity) || 0,
          unit: d.unitName,
          expiry: d.expiryDate,
          pickup: d.pickupLocation,
          donorName: d.donorName,
          slots: d.availabilityTimes ? d.availabilityTimes.split("|") : [],
        }));
        setRows(mapped);
        setAllDonations(mapped);
      }
    } catch (err) {
      console.error("Failed to refresh after publish:", err);
    } finally {
      setLoading(false);
    }
  }

  // REAL update function — calls API then updates UI
  async function handleUpdateDonation({ id, address, slots }) {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      alert("Not logged in (missing userID).");
      return;
    }

    const payload = {
      userID,
      donationID: id,
      availabilityTimes: (slots || []).map(slotToServerString).filter(Boolean).join("|"),
      address, // JSON object; split into columns in PHP if needed
    };

    try {
      const res = await apiPost("/donation_update.php", payload);
      if (!res?.ok) throw new Error(res?.error || "Update failed");

      // Optimistic UI update
      setRows((prev) =>
        prev.map((r) => ((r.donationID || r.id) === id ? { ...r, address, slots } : r))
      );
      setAllDonations((prev) =>
        prev.map((r) => ((r.donationID || r.id) === id ? { ...r, address, slots } : r))
      );

      setEditOpen(false);
      setEditItem(null);
    } catch (e) {
      console.error(e);
      alert(e.message || "Server error during update.");
    }
  }

  // ---------- Render ----------
  return (
    <>
      <div className="toolbar">
        <button className="btn btn-green" onClick={() => setOpenAdd(true)}>
          + Add Donation
        </button>
        <div className="spacer" />
        <button className="btn btn-filter" onClick={() => setShowFilter(true)}>
          <span className="i-filter" />
          Filter
          {appliedFilterCount > 0 && (
            <span className="filter-badge">{appliedFilterCount}</span>
          )}
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => toggleSort("name")} className="sortable">
                Name <span>{sort.key === "name" ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}</span>
              </th>
              <th onClick={() => toggleSort("category")} className="sortable">
                Category <span>{sort.key === "category" ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}</span>
              </th>
              <th onClick={() => toggleSort("qty")} className="sortable">
                Quantity <span>{sort.key === "qty" ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}</span>
              </th>
              <th onClick={() => toggleSort("expiry")} className="sortable">
                Expiry <span>{sort.key === "expiry" ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}</span>
              </th>
              <th onClick={() => toggleSort("pickup")} className="sortable">
                Pickup <span>{sort.key === "pickup" ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}</span>
              </th>
              <th>Contact </th>
              <th>Availability</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="no-items">
                    {appliedFilterCount > 0
                      ? "No items found. Please adjust your filters."
                      : "You haven’t made any donations yet. Add one to get started."}
                  </div>
                </td>
              </tr>
            ) : (
              sortedRows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td className="subtle">{r.category}</td>
                  <td style={{ minWidth: "90px" }}>
                    {r.qty} {r.unit}
                  </td>
                  <td>{formatDate(r.expiry)}</td>
                  <td style={{ minWidth: "121px" }}>{r.pickup}</td>

                  <td style={{ minWidth: "118px" }}>{r.contact || "-"}</td>
                  <td style={{ minWidth: "224px" }}>
                    {r.slots && r.slots.length > 0 ? (
                      <div className="slot-container">
                        {r.slots.map((s, idx) => {
                          const slotStr = typeof s === "string" ? s : s.pickTime || "";
                          const [date, timeRange] = slotStr
                            ? slotStr.split(",").map((p) => p.trim())
                            : ["", ""];
                          const formatTimeRange = (range) => {
                            if (!range) return "-";
                            return range
                              .split("-")
                              .map((t) => {
                                const [h, m] = t.split(":").map(Number);
                                if (isNaN(h) || isNaN(m)) return t;
                                const ampm = h >= 12 ? "PM" : "AM";
                                const hour12 = h % 12 === 0 ? 12 : h % 12;
                                return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
                              })
                              .join(" - ");
                          };
                          return (
                            <div key={idx} className="slot-item">
                              <div className="slot-date">📅 {date || "-"}</div>
                              <div className="slot-time">🕒 {formatTimeRange(timeRange)}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="bubble">-</span>
                    )}
                  </td>

                  <td className="row-actions">
                    <button
                      className="icon-btn"
                      title="Edit"
                      onClick={() => {
                        const addressObj =
                          r.address ?? parsePickupToAddress(r.pickup || r.pickupLocation || "");
                        setEditItem({
                          id: r.donationID || r.id,
                          name: r.name,
                          category: r.category,
                          qty: r.qty,
                          expiry: r.expiry,
                          address: addressObj,
                          slots: normalizeSlots(r.slots),
                        });
                        setEditOpen(true);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn"
                      title="Delete"
                      disabled={deletingId === (r.donationID || r.id)}
                      onClick={() => askDeleteDonation(r)}
                    >
                      {deletingId === (r.donationID || r.id) ? "⏳" : "🗑️"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddDonationModal open={openAdd} onClose={() => setOpenAdd(false)} onPublish={handlePublish} />

      <EditDonationModal
        open={editOpen}
        item={editItem}
        onClose={() => {
          setEditOpen(false);
          setEditItem(null);
        }}
        onUpdate={handleUpdateDonation}
      />

      <ConfirmDialog
        open={delOpen}
        title="Cancel donation?"
        message={
          pendingDel
            ? `“${pendingDel.name}” will be cancelled.` +
              (pendingDel.slotsCount > 0
                ? `\nThis will also remove ${pendingDel.slotsCount} pickup time(s).`
                : "")
            : ""
        }
        confirmText="Yes"
        cancelText="No"
        danger
        busy={delBusy}
        onCancel={() => {
          if (!delBusy) {
            setDelOpen(false);
            setPendingDel(null);
          }
        }}
        onConfirm={doDeleteDonation}
      />

      <FilterModal
        open={showFilter}
        type="donation"
        filters={filters}
        setFilters={setFilters}
        onApply={(f) => {
          setFilters(f);
          applyFilters(f);
        }}
        onClose={() => setShowFilter(false)}
      />
    </>
  );
}
