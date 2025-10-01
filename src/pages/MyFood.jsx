// src/pages/MyFood.jsx
import { useMemo, useState, useEffect } from "react";
import { apiGet } from "../lib/api"; // make sure you have this helper
import DonationModal from "../component/DonationModal.jsx";
import FoodFormModal from "../component/FoodFormModal.jsx"; // <-- new
import FoodDetailModal from "../component/FoodDetailModal.jsx";
import FilterModal from "../component/FilterModal.jsx";



import "./FoodCentre.css";


export default function MyFood() {
  const [sort, setSort] = useState({ key: "name", dir: "asc" });
  const [page, setPage] = useState(1);
  const [openAdd, setOpenAdd] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const [donateOpen, setDonateOpen] = useState(false);
  const [donateItem, setDonateItem] = useState(null);

  const pageSize = 5;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
  (async () => {
    setLoading(true);
    try {
      const res = await apiGet("/foods_list.php", { userID: 123 }); // TODO: replace with actual logged-in userID
      if (res.ok) setRows(res.foods || []);
      else console.error(res.error);
    } catch (e) {
      console.error("Failed to load foods", e);
    }
    setLoading(false);
  })();
}, []);

  

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

  // Count how many filters are applied
  const appliedFilterCount = Object.values(filters).filter((val) => val && val.trim() !== "").length;

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  function handleAdd(data) {
    const lastId = rows.length ? rows[rows.length - 1].id : 0;
    const next = [
      ...rows,
      {
        ...data,
        id: lastId + 1,
        status: new Date(data.expiry) < new Date() ? "Expired" : "Available",
      },
    ];
    setRows(next);
    setOpenAdd(false);
    setPage(Math.ceil(next.length / pageSize));
  }

  function handleUpdate(data) {
    const updated = {
      ...editItem,
      ...data,
      status: new Date(data.expiry) < new Date() ? "Expired" : "Available",
    };
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditItem(null);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this item?")) return;
    const prev = rows;
    setRows(prev.filter((r) => r.id !== id));
    // backend call optional...
  }

  function handleDonateRequest(item) {
    setDetailItem(null);
    setDonateItem(item);
    setDonateOpen(true);
  }

  function handlePublishDonation(payload) {
    if (payload?.itemId && payload?.qty) {
      setRows((prev) =>
        prev.map((r) => (r.id === payload.itemId ? { ...r, qty: Math.max(0, (r.qty || 0) - payload.qty) } : r))
      );
    }
    setDonateOpen(false);
    setDonateItem(null);
    alert("Donation published (demo).");
  }

  // inside MyFood.jsx (keep it above return)
  function applyFilters(overrideFilters = null) {
    const f = overrideFilters ?? filters;

    // normalize string values so empty strings are treated as empty
    const cat = (f.category ?? "").toString().trim();
    const status = (f.status ?? "").toString().trim();
    const from = (f.expiryFrom ?? "").toString().trim();
    const to = (f.expiryTo ?? "").toString().trim();

    const filtered = seedFoods.filter(r => {
      if (cat && r.category !== cat) return false;
      if (status && r.status !== status) return false;
      if (from && new Date(r.expiry) < new Date(from)) return false;
      if (to && new Date(r.expiry) > new Date(to)) return false;
      return true;
    });

    setRows(filtered);
    setPage(1);
    setFilterOpen(false);
  }

  return (
    <>
      <div className="toolbar">
        <button className="btn btn-green" onClick={() => setOpenAdd(true)}>+ Add Item</button>
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
              <Th label="Name" k="name" sort={sort} onSort={toggleSort} />
              <Th label="Category" k="category" sort={sort} onSort={toggleSort} />
              <Th label="Quantity" k="qty" sort={sort} onSort={toggleSort} center />
              <Th label="Unit" k="unit" sort={sort} onSort={toggleSort} center />
              <Th label="Expiry date" k="expiry" sort={sort} onSort={toggleSort} />
              <Th label="Status" k="status" sort={sort} onSort={toggleSort} />
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
                  <td className="link" onClick={() => setDetailItem(r)} title="Open details">{r.name}</td>
                  <td>{r.category}</td>
                  <td className="center">{r.qty}</td>
                  <td className="center">{r.unit}</td>
                  <td>{formatDate(r.expiry)}</td>
                  <td><span className={`pill ${r.status === "Expired" ? "danger" : "ok"}`}>{r.status}</span></td>
                  <td className="row-actions">
                    <button className="icon-btn" title="View" onClick={() => setDetailItem(r)}>👁️</button>
                    <button className="icon-btn" title="Edit" onClick={() => setEditItem(r)}>✏️</button>
                    <button className="icon-btn" title="Delete" onClick={() => setRows(rows.filter(x=>x.id!==r.id))}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} pageCount={pageCount} setPage={setPage} />

      {/* Modals */}
      <FoodFormModal
        open={openAdd}
        mode="add"
        onClose={() => setOpenAdd(false)}
        onSave={handleAdd}
      />
      <FoodFormModal
        open={!!editItem}
        mode="edit"
        initial={editItem || {}}
        onClose={() => setEditItem(null)}
        onSave={handleUpdate}
      />

      <FoodDetailModal
        open={!!detailItem}
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onDonate={handleDonateRequest}
      />

      <DonationModal
        open={donateOpen}
        onClose={() => setDonateOpen(false)}
        item={donateItem || {}}
        onPublish={handlePublishDonation}
      />

      <FilterModal
        open={filterOpen}
        filters={filters}
        setFilters={setFilters}
        onApply={applyFilters}
        onClose={() => setFilterOpen(false)}
      />
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




