import { useState } from "react";

const seedDonations = [
  { id: "d1", name: "Egg", category: "Protein",    qty: 2, expiry: "2025-10-20", pickup: "Jalan…..", slot: "02/10/2025, 11:47 am -12:47 pm" },
  { id: "d2", name: "Egg", category: "Grains",     qty: 2, expiry: "2025-10-03", pickup: "Jalan…..", slot: "02/10/2025, 11:47 am -12:47 pm" },
  { id: "d3", name: "Egg", category: "Vegetables", qty: 2, expiry: "2025-11-06", pickup: "Jalan…..", slot: "02/10/2025, 11:47 am -12:47 pm" },
];

export default function MyDonation({ initialRows = seedDonations }) {
  const [rows] = useState(initialRows);

  return (
    <>
      <div className="toolbar">
        <button className="btn btn-green">+ Add Donation</button>
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
                  <td><span className="bubble">{r.slot}</span></td>
                  <td className="row-actions">
                    <button className="icon-btn" title="Edit" aria-label="Edit">✏️</button>
                    <button className="icon-btn" title="Delete" onClick={() => handleDeleteDonation(r.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </>
  );
}

// inside MyDonation component

async function handleDeleteDonation(id) {
  if (!window.confirm("Delete this donation?")) return;

  const prev = rows;
  setRows(prev.filter(r => r.id !== id));

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE}/donation_delete.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      }
    ).then(r => r.json());

    if (!res.ok) throw new Error(res.error || "Delete failed");
  } catch (err) {
    alert(err.message || "Delete failed");
    setRows(prev); // rollback
  }
}


function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB");
}
