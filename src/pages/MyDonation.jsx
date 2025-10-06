import { useState, useEffect } from "react";
import AddDonationModal from "../component/AddDonationModal.jsx";
import EditDonationModal from "../component/EditDonationModal.jsx";
import FilterModal from "../component/FilterModal.jsx";

export default function MyDonation() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openAdd, setOpenAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    expiryFrom: "",
    expiryTo: "",
    pickupArea: "",
  });

  // Load all shared donations on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/donation_list.php`
        ).then((r) => r.json());

        if (res.ok && Array.isArray(res.data)) {
          const mapped = res.data.map((d) => ({
            id: d.donationID,
            name: d.foodName,
            category: d.category || "-",
            qty: d.donatedQuantity,
            unit: d.unitName,
            expiry: d.expiryDate || "",
            pickup: d.pickupLocation,
            contact: d.contact,
            note: d.note,
            slots: d.availableTime
              ? [
                  {
                    date: d.availableTime.split(" ")[0],
                    start: d.availableTime.split(" ")[1],
                    end: d.availableTime.split(" ")[2],
                  },
                ]
              : [],
            slotText: d.availableTime || "",
            donorName: d.donorName,
          }));
          setRows(mapped);
        } else {
          console.error(res.error || "No donations returned");
        }

      } catch (e) {
        console.error("Failed to load donations", e);
      }
      setLoading(false);
    })();
  }, []);

  const appliedFilterCount = Object.values(filters).filter(
    (val) => val && val.trim() !== ""
  ).length;

  function handlePublish(payload) {
    const item = payload.item ?? payload;
    const slotText = (payload.slots ?? [])
      .map((s) => `${formatDMY(s.date)}, ${to12hr(s.start)} - ${to12hr(s.end)}`)
      .join(" | ");

    const pickup = payload.useDefaultAddress
      ? "Default address"
      : [payload.address?.line1, payload.address?.city].filter(Boolean).join(", ");

    const newRow = {
      id: crypto.randomUUID(),
      name: item.name,
      category: item.category ?? "-",
      qty: item.qty ?? 0,
      expiry: item.expiry ?? "",
      pickup,
      slots: payload.slots ?? [],
      slotText,
    };

    setRows((prev) => [newRow, ...prev]);
    setOpenAdd(false);
  }

  function handleUpdate(updated) {
    const slotText = (updated.slots ?? [])
      .map((s) => `${formatDMY(s.date)}, ${to12hr(s.start)} - ${to12hr(s.end)}`)
      .join(" | ");

    const pickup = updated.useDefaultAddress
      ? "Default address"
      : [updated.address?.line1, updated.address?.city].filter(Boolean).join(", ");

    setRows((prev) =>
      prev.map((r) =>
        r.id === updated.id
          ? { ...r, pickup, slots: updated.slots ?? [], slotText }
          : r
      )
    );
    setEditItem(null);
  }

  async function handleDeleteDonation(id) {
    if (!window.confirm("Delete this donation?")) return;
    const prev = rows;
    setRows(prev.filter((r) => r.id !== id));

    try {
      // Backend call if needed
    } catch (err) {
      alert(err.message || "Delete failed");
      setRows(prev);
    }
  }

  function applyFilters(overrideFilters = null) {
    const f = overrideFilters ?? filters;
    const cat = (f.category ?? "").trim();
    const from = (f.expiryFrom ?? "").trim();
    const to = (f.expiryTo ?? "").trim();
    const pickup = (f.pickupArea ?? "").trim().toLowerCase();

    const filtered = rows.filter((r) => {
      if (cat && r.category !== cat) return false;
      if (from && new Date(r.expiry) < new Date(from)) return false;
      if (to && new Date(r.expiry) > new Date(to)) return false;
      if (pickup && !r.pickup.toLowerCase().includes(pickup)) return false;
      return true;
    });

    setRows(filtered);
    setFilterOpen(false);
  }

  return (
    <>
      <div className="toolbar">
        <button className="btn btn-green" onClick={() => setOpenAdd(true)}>
          + Add Donation
        </button>
        <div className="spacer" />
        <button className="btn btn-filter" onClick={() => setFilterOpen(true)}>
          <span className="i-filter" />Filter
          {appliedFilterCount > 0 && (
            <span className="filter-badge">{appliedFilterCount}</span>
          )}
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Expiry date</th>
              <th>Pickup</th>
              <th>Availability</th>
              <th>Donor</th>
              <th className="actions-col" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="no-items">
                    No items found. Please adjust your filters.
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td className="subtle">{r.category}</td>
                  <td>{r.qty} {r.unit}</td>
                  <td>{formatDate(r.expiry)}</td>
                  <td>{r.pickup}</td>
                  <td>
                    <span className="bubble">
                      {r.slotText || joinSlots(r.slots)}
                    </span>
                  </td>
                  <td>{r.donorName || "-"}</td>
                  <td className="row-actions">
                    <button
                      className="icon-btn"
                      title="Edit"
                      onClick={() => setEditItem(r)}
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn"
                      title="Delete"
                      onClick={() => handleDeleteDonation(r.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddDonationModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onPublish={handlePublish}
      />

      <EditDonationModal
        open={!!editItem}
        item={editItem}
        onClose={() => setEditItem(null)}
        onUpdate={handleUpdate}
      />

      <FilterModal
        open={filterOpen}
        type="donation"
        filters={filters}
        setFilters={setFilters}
        onApply={applyFilters}
        onClose={() => setFilterOpen(false)}
      />
    </>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleDateString("en-GB");
}
function formatDMY(iso) {
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleDateString("en-GB");
}
function to12hr(hhmm) {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return hhmm;
  let [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${`${m}`.padStart(2, "0")} ${ampm}`;
}
function joinSlots(slots = []) {
  return slots
    .map((s) => `${formatDMY(s.date)}, ${to12hr(s.start)} - ${to12hr(s.end)}`)
    .join(" | ");
}
