import { useState } from "react";
import AddDonationModal from "../component/AddDonationModal.jsx";
import EditDonationModal from "../component/EditDonationModal.jsx";

const seedDonations = [
  {
    id: "d1",
    name: "Egg",
    category: "Protein",
    qty: 2,
    expiry: "2025-10-20",
    pickup: "Jalan…..",
    // keep both: human text and structured slots
    slotText: "02/10/2025, 11:47 am - 12:47 pm",
    slots: [],
  },
  {
    id: "d2",
    name: "Rice",
    category: "Grains",
    qty: 2,
    expiry: "2025-10-03",
    pickup: "Jalan…..",
    slotText: "02/10/2025, 11:47 am - 12:47 pm",
    slots: [],
  },
  {
    id: "d3",
    name: "Egg",
    category: "Vegetables",
    qty: 2,
    expiry: "2025-11-06",
    pickup: "Jalan…..",
    slotText: "02/10/2025, 11:47 am - 12:47 pm",
    slots: [],
  },
];

export default function MyDonation({ initialRows = seedDonations }) {
  const [rows, setRows] = useState(initialRows);
  const [openAdd, setOpenAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);

  function handlePublish(payload) {
    const item = payload.item ?? payload; // be forgiving about shape
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
    // updated: { id, address, useDefaultAddress, slots }
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
      // Call your backend if needed
      // const res = await fetch(`${import.meta.env.VITE_API_BASE}/donation_delete.php`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ id }),
      // }).then((r) => r.json());
      // if (!res.ok) throw new Error(res.error || "Delete failed");
    } catch (err) {
      alert(err.message || "Delete failed");
      setRows(prev); // rollback
    }
  }

  return (
    <>
      <div className="toolbar">
        <button className="btn btn-green" onClick={() => setOpenAdd(true)}>
          + Add Donation
        </button>
        <div className="spacer" />
        <button className="btn btn-filter">
          <span className="i-filter" />
          Filter
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
              <th className="actions-col" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td className="subtle">{r.category}</td>
                <td>{r.qty}</td>
                <td>{formatDate(r.expiry)}</td>
                <td>{r.pickup}</td>
                <td>
                  <span className="bubble">{r.slotText || joinSlots(r.slots)}</span>
                </td>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Add */}
      <AddDonationModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onPublish={handlePublish}
      />

      {/* Edit (address + availability only) */}
      <EditDonationModal
        open={!!editItem}
        item={editItem}
        onClose={() => setEditItem(null)}
        onUpdate={handleUpdate}
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
