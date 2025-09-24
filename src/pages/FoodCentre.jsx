<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { useMemo, useState } from "react";
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
import { useMemo, useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
>>>>>>> Stashed changes
import "./FoodCentre.css";

/* --- seed demo data --- */
const seedFoods = [
  { id: 1, name: "Egg",    category: "Protein",    qty: 1, unit: "pcs", expiry: "2025-10-20", status: "Available" },
  { id: 2, name: "Rice",   category: "Grains",     qty: 1, unit: "pcs", expiry: "2025-10-03", status: "Expired"   },
  { id: 3, name: "Tomato", category: "Vegetables", qty: 1, unit: "pcs", expiry: "2025-11-06", status: "Available" },
  { id: 4, name: "Potato", category: "Vegetables", qty: 1, unit: "pcs", expiry: "2025-09-20", status: "Available" },
  { id: 5, name: "Elain Liow", category: "Bone",   qty: 1, unit: "pcs", expiry: "8520-14-13", status: "Available" },
];

const seedDonations = [
  { id: "d1", name: "Egg", category: "Protein",    qty: 2, expiry: "2025-10-20", pickup: "Jalan…..", slot: "02/10/2025, 11:47 am -12:47 pm" },
  { id: "d2", name: "Egg", category: "Grains",     qty: 2, expiry: "2025-10-03", pickup: "Jalan…..", slot: "02/10/2025, 11:47 am -12:47 pm" },
  { id: "d3", name: "Egg", category: "Vegetables", qty: 2, expiry: "2025-11-06", pickup: "Jalan…..", slot: "02/10/2025, 11:47 am -12:47 pm" },
];

/* --- Page shell --- */
export default function FoodCenter() {
  const [tab, setTab] = useState("my"); // 'my' | 'donation'

  return (
    <section className="fc">
      <h1 className="page-title">Food Center</h1>

      <div className="card">
        <Tabs active={tab} onChange={setTab} />

        {tab === "my" ? (
          <MyFoodSection initialRows={seedFoods} />
        ) : (
          <MyDonationSection initialRows={seedDonations} />
        )}
      </div>
    </section>
  );
}

/* =======================================================
   Section: MyFood
   ======================================================= */
function MyFoodSection({ initialRows = [] }) {
  const [rows] = useState(initialRows);
  const [sort, setSort] = useState({ key: "name", dir: "asc" });
  const [page, setPage] = useState(1);
  const [openAdd, setOpenAdd] = useState(false);
  const pageSize = 5;

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const k = sort.key;
      let av = a[k], bv = b[k];
      if (k === "qty") return sort.dir === "asc" ? av - bv : bv - av;
      if (k === "expiry") {
        const ad = new Date(av).getTime(), bd = new Date(bv).getTime();
        return sort.dir === "asc" ? ad - bd : bd - ad;
      }
      av = String(av).toLowerCase(); bv = String(bv).toLowerCase();
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ?  1 : -1;
      return 0;
    });
    return copy;
  }, [rows, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const view = sorted.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(key) {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  }

  function handleAdd(newItem) {
    setRows((prev) => {
      const next = [
        ...prev,
        {
          ...newItem,
          id: (prev.at(-1)?.id || 0) + 1,
          status: new Date(newItem.expiry) < new Date() ? "Expired" : "Available",
        },
      ];
      return next;
    });
    setOpenAdd(false);
    // jump to last page after adding:
    setPage((p) => Math.max(p, Math.ceil((rows.length + 1) / pageSize)));
  }
  
  return (
    <>
<<<<<<< Updated upstream
      <div className="card-head">
        <button className="btn solid">+ Add Item</button>
=======
      {/* toolbar: Add left, Filter right */}
      <div className="toolbar">
        <button className="btn btn-green" onClick={() => setOpenAdd(true)}>+ Add Item</button>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        <div className="spacer" />
        <button className="btn ghost" aria-label="Filter">
          <span className="filter-icon" /> Filter
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <Th label="Name"        k="name"     sort={sort} onSort={toggleSort} />
              <Th label="Category"    k="category" sort={sort} onSort={toggleSort} />
              <Th label="Quantity"    k="qty"      sort={sort} onSort={toggleSort} center />
              <Th label="Unit"        k="unit"     sort={sort} onSort={toggleSort} center />
              <Th label="Expiry date" k="expiry"   sort={sort} onSort={toggleSort} />
              <Th label="Status"      k="status"   sort={sort} onSort={toggleSort} />
              <th className="actions-col" />
            </tr>
          </thead>
          <tbody>
            {view.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.category}</td>
                <td className="center">{r.qty}</td>
                <td className="center">{r.unit}</td>
                <td>{formatDate(r.expiry)}</td>
                <td>
                  <span className={`pill ${r.status === "Expired" ? "danger" : "ok"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="row-actions">
                  <button className="icon-btn" title="Edit" aria-label="Edit">✏️</button>
                  <button className="icon-btn" title="Copy" aria-label="Copy">📄</button>
                  <button className="icon-btn" title="Delete" aria-label="Delete">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

<<<<<<< Updated upstream
      <div className="pager">
        <button
          className="pager-btn"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          &lt;
        </button>
        <span className="pager-text">{page} / {pageCount} Page</span>
        <button
          className="pager-btn"
          disabled={page === pageCount}
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
        >
          &gt;
        </button>
      </div>
=======
      <Pager page={page} pageCount={pageCount} setPage={setPage} />
            {/* The modal */}
      <AddFoodModal open={openAdd} onClose={() => setOpenAdd(false)} onSave={handleAdd} />
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    </>
  );
}

function Th({ label, k, sort, onSort, center }) {
  const dir = sort.key === k ? (sort.dir === "asc" ? "↑" : "↓") : "↕";
  return (
    <th className={center ? "center" : ""}>
      <button className="th-btn" onClick={() => onSort(k)} aria-label={`Sort by ${label}`}>
        {label} <span className="th-dir">{dir}</span>
      </button>
    </th>
  );
}

/* =======================================================
   Section: MyDonation
   ======================================================= */
function MyDonationSection({ initialRows = [], onAdd, onFilter }) {
  const [rows] = useState(initialRows);

  return (
    <>
      <div className="don-toolbar">
        <button className="btn solid">+ Add Donation</button>   {/* left */}
        <div className="spacer" />                               {/* pushes next to right */}
        <button className="btn ghost"><span className="filter-icon" /> Filter</button>  {/* right */}
      </div>


      <div className="soft-panel">
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
                    <button className="icon-btn" title="Delete" aria-label="Delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
/* --- shared util --- */
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
/* ------------------ Add Food Modal ------------------ */
function AddFoodModal({ open, onClose, onSave }) {
  const [f, setF] = useState({
    name: "", qty: 1, unit: "ps", category: "Grains",
    expiry: "", location: "", remark: ""
  });

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSave = f.name.trim() && f.expiry;
  const save = () => {
    if (!canSave) return;
    onSave(f);
  };
  const step = (delta) =>
    setF((s) => ({ ...s, qty: Math.max(1, s.qty + delta) }));

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Add Food</h3>

        <div className="form-grid">
          <div className="form-row">
            <label>Item name</label>
            <input className="input" placeholder="Eg.(Egg)" value={f.name}
                   onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>

          <div className="form-row">
            <label>Category</label>
            <select className="input" value={f.category}
                    onChange={(e) => setF({ ...f, category: e.target.value })}>
              <option>Grains</option><option>Protein</option>
              <option>Vegetables</option><option>Fruits</option>
              <option>Dairy</option><option>Other</option>
            </select>
          </div>

          <div className="form-row">
            <label>Quantity</label>
            <div className="qty-row">
              <button className="step" onClick={() => step(-1)}>-</button>
              <span className="qty-num">{f.qty}</span>
              <button className="step" onClick={() => step(1)}>+</button>
              <select className="input unit" value={f.unit}
                      onChange={(e) => setF({ ...f, unit: e.target.value })}>
                <option value="ps">ps</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label>Expiry date</label>
            <input type="date" className="input" value={f.expiry}
                   onChange={(e) => setF({ ...f, expiry: e.target.value })} />
          </div>

          <div className="form-row">
            <label>Storage Location</label>
            <input className="input" placeholder="Optional"
                   value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />
          </div>

          <div className="form-row">
            <label>Remark</label>
            <input className="input" placeholder="Optional"
                   value={f.remark} onChange={(e) => setF({ ...f, remark: e.target.value })} />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!canSave} onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- shared bits ---------- */
function Th({ label, k, sort, onSort, center }) {
  const dir = sort.key === k ? (sort.dir === "asc" ? "↑" : "↓") : "↕";
  return (
    <th className={center ? "center" : ""}>
      <button className="th-btn" onClick={() => onSort(k)} aria-label={`Sort by ${label}`}>
        {label} <span className="th-dir">{dir}</span>
      </button>
    </th>
  );
}

function Pager({ page, pageCount, setPage }) {
  return (
    <div className="pager">
      <button
        className="pager-btn"
        disabled={page === 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
      >
        &lt;
      </button>
      <span className="pager-text">
        {page} / {pageCount} Page
      </span>
      <button
        className="pager-btn"
        disabled={page === pageCount}
        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
      >
        &gt;
      </button>
    </div>
  );
}

>>>>>>> Stashed changes
function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB");
}

/* --- tabs --- */
function Tabs({ active, onChange }) {
  return (
    <div className="tabs">
      <button
        className={`tab ${active === "my" ? "active" : ""}`}
        onClick={() => onChange("my")}
      >
        My Food
      </button>
      <button
        className={`tab ${active === "donation" ? "active" : ""}`}
        onClick={() => onChange("donation")}
      >
        Donation
      </button>
    </div>
  );
}
