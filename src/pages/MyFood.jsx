import { useMemo, useState, useEffect } from "react";
import "./FoodCentre.css";

/* demo data */
const seedFoods = [
  { id: 1, name: "Egg",    category: "Protein",    qty: 3, unit: "ps", expiry: "2025-10-20", status: "Available", location: "Locker 2", remark: "This egg was expensive" },
  { id: 2, name: "Rice",   category: "Grains",     qty: 1, unit: "kg", expiry: "2025-10-03", status: "Expired",   location: "",        remark: "" },
  { id: 3, name: "Tomato", category: "Vegetables", qty: 1, unit: "ps", expiry: "2025-11-06", status: "Available", location: "",        remark: "" },
];

export default function MyFood() {
  const [rows, setRows] = useState(seedFoods);
  const [sort, setSort] = useState({ key: "name", dir: "asc" });
  const [page, setPage] = useState(1);
  const [openAdd, setOpenAdd] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const pageSize = 5;

  // sort + paginate
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

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  /* add & update */
  function handleAdd(newItem) {
    const next = [
      ...rows,
      {
        ...newItem,
        id: (rows.at(-1)?.id || 0) + 1,
        status: new Date(newItem.expiry) < new Date() ? "Expired" : "Available",
      },
    ];
    setRows(next);
    setOpenAdd(false);
    setPage(Math.ceil(next.length / pageSize));
  }
  function handleUpdate(updated) {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditItem(null);
  }

  return (
    <>
      {/* toolbar: Add left, Filter right */}
      <div className="toolbar">
        <button className="btn btn-green" onClick={() => setOpenAdd(true)}>+ Add Item</button>
        <div className="spacer" />
        <button className="btn btn-filter"><span className="i-filter" />Filter</button>
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
                <td className="link" onClick={() => setDetailItem(r)} title="Open details">{r.name}</td>
                <td>{r.category}</td>
                <td className="center">{r.qty}</td>
                <td className="center">{r.unit}</td>
                <td>{formatDate(r.expiry)}</td>
                <td>
                  <span className={`pill ${r.status === "Expired" ? "danger" : "ok"}`}>{r.status}</span>
                </td>
                <td className="row-actions">
                  <button className="icon-btn" title="View" onClick={() => setDetailItem(r)}>👁️</button>
                  <button className="icon-btn" title="Edit" onClick={() => setEditItem(r)}>✏️</button>
                  <button className="icon-btn" title="Delete" onClick={() => setRows(rows.filter(x=>x.id!==r.id))}>🗑️</button>
                  {/*<button className="icon-btn" title="Delete" onClick={() => handleDelete(r.id)}>🗑️</button>*/}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pager page={page} pageCount={pageCount} setPage={setPage} />

      {/* modals */}
      <AddFoodModal   open={openAdd}     onClose={() => setOpenAdd(false)}  onSave={handleAdd} />
      <EditFoodModal  open={!!editItem}  item={editItem} onClose={() => setEditItem(null)} onSave={handleUpdate} />
      <FoodDetailModal open={!!detailItem} item={detailItem} onClose={() => setDetailItem(null)} />
    </>
  );
}

async function handleDelete(id) {
  // (a) confirm
  if (!window.confirm("Delete this item?")) return;

  // (b) optimistic UI
  const prev = rows;
  setRows(prev.filter(r => r.id !== id));

  // (c) call backend (comment this block out if demo-only)
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE}/food_delete.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }) // and your auth (session or token) if needed
      }
    ).then(r => r.json());

    if (!res.ok) throw new Error(res.error || "Delete failed");
  } catch (err) {
    alert(err.message || "Delete failed");
    setRows(prev); // rollback
  }
}

/* ---------- shared small pieces ---------- */
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
      <button className="pager-btn" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>&lt;</button>
      <span className="pager-text">{page} / {pageCount} Page</span>
      <button className="pager-btn" disabled={page === pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>&gt;</button>
    </div>
  );
}
function formatDate(iso) {
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleDateString("en-GB");
}

/* =======================================================
   MODALS
   ======================================================= */

/* Add */
function AddFoodModal({ open, onClose, onSave }) {
  const [f, setF] = useState({ name:"", qty:1, unit:"ps", category:"Grains", expiry:"", location:"", remark:"" });
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;

  const canSave = f.name.trim() && f.expiry;
  const step = (d) => setF((s) => ({ ...s, qty: Math.max(1, s.qty + d) }));

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Add Food</h3>

        <FormGrid f={f} setF={setF} step={step} />

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!canSave} onClick={() => onSave(f)}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* Edit (prefilled) */
function EditFoodModal({ open, item, onClose, onSave }) {
  const [f, setF] = useState(item || {});
  useEffect(() => setF(item || {}), [item]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open || !item) return null;

  const canSave = f.name?.trim() && f.expiry;
  const step = (d) => setF((s) => ({ ...s, qty: Math.max(1, (s.qty || 1) + d) }));

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Edit</h3>

        <FormGrid f={f} setF={setF} step={step} />

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn primary"
            disabled={!canSave}
            onClick={() => onSave({
              ...item,
              ...f,
              status: new Date(f.expiry) < new Date() ? "Expired" : "Available",
            })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* Food detail (left info + right history) */
function FoodDetailModal({ open, item, onClose }) {
  if (!open || !item) return null;

  // quick mock history (you can load from API later)
  const history = [
    { date: "20/10/2025", qty: 2, action: "Used" },
    { date: "22/10/2025", qty: 1, action: "Donated" },
    { date: "28/10/2025", qty: "-", action: "Plan for Meal" },
  ];

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel panel-lg" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>

        <div className="detail-grid">
          {/* left column */}
          <div className="detail-left">
            <h3 className="modal-title">Food Detail</h3>

            <div className="detail-head">
              <div className="food-img" aria-hidden>
                <img alt="" src="https://images.unsplash.com/photo-1517957791429-3a88f0397c3a?w=300&q=60" />
              </div>

              <ul className="kv">
                <li><b>Item name:</b> {item.name}</li>
                <li><b>Category:</b> {item.category}</li>
                <li><b>Quantity:</b> {item.qty}</li>
                <li><b>Expiry date:</b> {formatDate(item.expiry)}</li>
                <li><b>Storage Location:</b> {item.location || "-"}</li>
                <li><b>Remark:</b> {item.remark || "-"}</li>
              </ul>

              <ul className="kv tight">
                <li><b>Status:</b> <span className={`pill ${item.status === "Expired" ? "danger" : ""}`}>{item.status}</span></li>
                <li><b>Reserved:</b> 3</li>
              </ul>
            </div>

            <div className="detail-actions">
              <button className="chip">Used</button>
              <button className="chip">Plan for Meal</button>
              <button className="chip primary">Donate</button>
            </div>
          </div>

          {/* right column */}
          <div className="detail-right">
            <table className="log-table">
              <thead>
                <tr><th>Date</th><th>Quantity</th><th>Action</th></tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}><td>{h.date}</td><td>{h.qty}</td><td>{h.action}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* shared form grid used by Add & Edit */
function FormGrid({ f, setF, step }) {
  return (
    <div className="form-grid">
      <div className="form-row">
        <label>Item name</label>
        <input className="input" placeholder="Eg.(Egg)" value={f.name || ""}
               onChange={(e) => setF({ ...f, name: e.target.value })} />
      </div>

      <div className="form-row">
        <label>Category</label>
        <select className="input" value={f.category || "Grains"}
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
          <span className="qty-num">{f.qty || 1}</span>
          <button className="step" onClick={() => step(1)}>+</button>
          <select className="input unit" value={f.unit || "ps"}
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
        <input type="date" className="input" value={f.expiry || ""}
               onChange={(e) => setF({ ...f, expiry: e.target.value })} />
      </div>

      <div className="form-row">
        <label>Storage Location</label>
        <input className="input" placeholder="Optional"
               value={f.location || ""} onChange={(e) => setF({ ...f, location: e.target.value })} />
      </div>

      <div className="form-row">
        <label>Remark</label>
        <input className="input" placeholder="Optional"
               value={f.remark || ""} onChange={(e) => setF({ ...f, remark: e.target.value })} />
      </div>
    </div>
  );
}
