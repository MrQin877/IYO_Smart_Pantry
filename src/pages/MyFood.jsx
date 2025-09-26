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

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",       // single select for simplicity
    status: "",         // Available / Expired (for My Food)
    expiryFrom: "",     // date range
    expiryTo: "",
    pickupArea: "",     // for donations
  });


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

const applyFilters = (type = "food") => {
  let source = type === "food" ? seedFoods : seedDonations; // use seed data or backend data later
  let filtered = source.filter(r => {
    if (filters.category && r.category !== filters.category) return false;
    if (type === "food" && filters.status && r.status !== filters.status) return false;
    if (filters.expiryFrom && new Date(r.expiry) < new Date(filters.expiryFrom)) return false;
    if (filters.expiryTo && new Date(r.expiry) > new Date(filters.expiryTo)) return false;
    if (type !== "food" && filters.pickupArea && !r.pickupArea?.toLowerCase().includes(filters.pickupArea.toLowerCase()))
      return false;
    return true;
  });

  setRows(filtered);
  setFilterOpen(false);
  setPage(1);
};


  return (
    <>
      {/* toolbar: Add left, Filter right */}
      <div className="toolbar">
        <button className="btn btn-green" onClick={() => setOpenAdd(true)}>+ Add Item</button>
        <div className="spacer" />

        <button className="btn btn-filter" onClick={() => setFilterOpen(true)}><span className="i-filter" />Filter</button>

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
            {view.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="no-items">
                    No items found. Please adjust your filters.
                  </div>
                </td>
              </tr>
            ) : (
              view.map((r) => (
                <tr key={r.id}>
                  <td className="link" onClick={() => setDetailItem(r)}>{r.name}</td>
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
                    <button className="icon-btn" title="View" onClick={() => setDetailItem(r)}>👁️</button>
                    <button className="icon-btn" title="Edit" onClick={() => setEditItem(r)}>✏️</button>
                    <button className="icon-btn" title="Delete" onClick={() => setRows(rows.filter(x => x.id !== r.id))}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

      <Pager page={page} pageCount={pageCount} setPage={setPage} />

      {/* modals */}
      <AddFoodModal   open={openAdd}     onClose={() => setOpenAdd(false)}  onSave={handleAdd} />
      <EditFoodModal  open={!!editItem}  item={editItem} onClose={() => setEditItem(null)} onSave={handleUpdate} />
      <FoodDetailModal open={!!detailItem} item={detailItem} onClose={() => setDetailItem(null)} />
      <FilterModal open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} setFilters={setFilters} onApply={applyFilters}/>
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

function FilterModal({ open, onClose, filters, setFilters, onApply, type = "food" }) {
  if (!open) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Filter {type === "food" ? "Foods" : "Donations"}</h3>

        <div className="form-grid">
          {/* Category */}
          <div className="form-row">
            <label>Category</label>
            <select
              className="input"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All</option>
              <option value="Protein">Protein</option>
              <option value="Grains">Grains</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Dairy">Dairy</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Status (only for My Food) */}
          {type === "food" && (
            <div className="form-row">
              <label>Status</label>
              <select
                className="input"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All</option>
                <option value="Available">Available</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          )}

          {/* Expiry From / To */}
          <div className="form-row">
            <label>Expiry From</label>
            <input
              type="date"
              className="input"
              value={filters.expiryFrom}
              onChange={(e) => setFilters({ ...filters, expiryFrom: e.target.value })}
            />
          </div>
          <div className="form-row">
            <label>Expiry To</label>
            <input
              type="date"
              className="input"
              value={filters.expiryTo}
              onChange={(e) => setFilters({ ...filters, expiryTo: e.target.value })}
            />
          </div>

          {/* Pickup Area (only for Donations) */}
          {type !== "food" && (
            <div className="form-row">
              <label>Pickup Area</label>
              <input
                type="text"
                className="input"
                placeholder="Any"
                value={filters.pickupArea}
                onChange={(e) => setFilters({ ...filters, pickupArea: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button
            className="btn secondary"
            onClick={() =>
              setFilters({ category: "", status: "", expiryFrom: "", expiryTo: "", pickupArea: "" })
            }
          >
            Clear
          </button>
          <button className="btn primary" onClick={() => onApply(type)}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}


