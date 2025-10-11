// src/pages/MyFood.jsx

import { useMemo, useState, useEffect } from "react";
import { apiGet, apiPost } from "../lib/api"; // make sure you have this helper
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
  const [deletingId, setDeletingId] = useState(null);

  const [donateOpen, setDonateOpen] = useState(false);
  const [donateItem, setDonateItem] = useState(null);

  const pageSize = 5;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allFoods, setAllFoods] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);


  // ...inside your useEffect for fetching foods
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiPost("/food_list.php", { userID: "U1" });

        if (res.ok) {
          console.log("✅ Foods fetched:", res.foods);

          const mapped = res.foods.map(f => ({
            id: f.foodID,
            foodID: f.foodID,
            name: f.foodName,
            qty: f.quantity,
            categoryID: f.categoryID,    // <-- store IDs for filtering
            category: f.categoryName,
            storageID: f.storageID,      // <-- store IDs
            storage: f.storageName,
            unit: f.unitName,
            expiry: f.expiryDate,
            remark: f.remark,
            userID: f.userID,
            remark: f.remark,
            status: f.is_expiryStatus, // or f.status if you rename it
            reserved: f.reserved,      // optional, if available
            is_plan: f.is_plan,   // ✅ add this line
          }));


          setRows(mapped);
          setAllFoods(mapped); // <-- store the full list
        } else {
          console.error(res.error);
        }
      } catch (e) {
        console.error("Failed to load foods", e);
      }
      setLoading(false);
    })();
  }, [refreshKey]); // <--- depend on refreshKey


  

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
    category: "",
    storageID: "", // match storageID in FilterModal.jsx
    expiryFrom: "",
    expiryTo: "",
    pickupArea: "",
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

  async function handleDelete(foodID) {
    if (!window.confirm("Delete this item?")) return;

    // optimistic UI
    const prev = rows;
    const next = rows.filter(r => r.foodID !== foodID);
    setRows(next);
    setDeletingId(foodID);

    try {
      const res = await apiPost("/food_delete.php", {
        userID: "U1",     // <-- your logged-in user id
        foodID,           // <-- the one to delete
      });

      if (!res?.ok) {
        throw new Error(res?.error || "Delete failed");
      }

      // Optional: refresh from server to be perfectly in sync
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert(err.message || "Delete failed. Reverting UI.");
      setRows(prev);        // rollback
    } finally {
      setDeletingId(null);
    }
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

  function handleRefresh() {
    // Re-fetch or reload food list
    //loadFoods(); // assuming you have a function like this that fetches data
    setRefreshKey(prev => prev + 1);
  }


  // inside MyFood.jsx (keep it above return)
  function applyFilters(overrideFilters = null) {
    const f = overrideFilters ?? filters;

    const cat = (f.category ?? "").trim();      // categoryID
    const storage = (f.storageID ?? "").trim(); // storageID

    // Helper → consistent local YYYY-MM-DD (avoid timezone shift)
    const fmt = (d) => {
      const offset = d.getTimezoneOffset();
      const local = new Date(d.getTime() - offset * 60000);
      return local.toISOString().split("T")[0];
    };

    let from = "";
    let to = "";
    const today = new Date();

    if (f.expiryRange === "today") {
      // ✅ Only today’s date
      from = fmt(today);
      to = fmt(today);
    } 
    else if (f.expiryRange === "3days") {
      // ✅ Tomorrow + next 2 days = total 3 (e.g., 10–12 if today is 9)
      const start = new Date(today);
      start.setDate(today.getDate() + 1);
      const end = new Date(today);
      end.setDate(today.getDate() + 3);
      from = fmt(start);
      to = fmt(end);
    } 
    else if (f.expiryRange === "week") {
      // ✅ Monday → Sunday of this week (e.g., 6–12 Oct)
      const day = today.getDay(); // 0 (Sun) – 6 (Sat)
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const start = new Date(today);
      start.setDate(today.getDate() + diffToMonday);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      from = fmt(start);
      to = fmt(end);
    } 
    else if (f.expiryRange === "month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      from = fmt(start);
      to = fmt(end);
    } 
    else if (f.expiryRange === "nextmonth") {
      const start = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      from = fmt(start);
      to = fmt(end);
    } 
    else {
      from = (f.expiryFrom ?? "").trim();
      to = (f.expiryTo ?? "").trim();
    }

    // ✅ Filter logic
    const filtered = allFoods.filter((r) => {
      if (cat && r.categoryID !== cat) return false;
      if (storage && r.storageID !== storage) return false;

      const exp = fmt(new Date(r.expiry));
      if (from && exp < from) return false;
      if (to && exp > to) return false;
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
              <Th label="Storage" k="storage" sort={sort} onSort={toggleSort} />
              <Th label="Expiry date" k="expiry" sort={sort} onSort={toggleSort} />
              <th className="actions-col" />
            </tr>
          </thead>

          <tbody>
            {view.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="no-items">No items found. Please adjust your filters.</div>
                </td>
              </tr>
            ) : (
              view.map((r) => (
                <tr
                  key={r.id}
                  className={r.is_plan == 1 ? "planned-row" : ""}
                  title="Open details"
                  onClick={() => setDetailItem(r)}
                >
                  <td className="link">
                    <span>{r.name}</span>
                    {r.is_plan == 1 && <span className="planned-badge">🍽 Planned</span>}
                  </td>
                  <td>{r.category}</td>
                  <td className="center">{r.qty}</td>
                  <td className="center">{r.unit}</td>
                  <td>{r.storage}</td>
                  <td>{formatDate(r.expiry)}</td>
                  <td className="row-actions">
                    <button
                      className="icon-btn"
                      title="View"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent opening detail modal from row click
                        setDetailItem(r);
                      }}
                    >
                      👁️
                    </button>
                    <button
                      className="icon-btn"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditItem(r);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn"
                      title="Delete"
                      disabled={deletingId === r.foodID}
                      onClick={(e) => {
                        e.stopPropagation(); // don't open detail modal
                        handleDelete(r.foodID);
                      }}
                    >
                      {deletingId === r.foodID ? "⏳" : "🗑️"}
                    </button>
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

      {/* 🔍 Food detail modal */}
      <FoodDetailModal
        open={!!detailItem}
        foodID={detailItem?.foodID}
        onClose={() => {
          setDetailItem(null);
          handleRefresh(); // ✅ refresh list when modal closes
        }}
        onDonate={handleDonateRequest}
        onUpdate={handleRefresh}
        onPlanUpdate={(foodID, newPlan) => {
          setView(prev =>
            prev.map(f =>
              f.foodID === foodID ? { ...f, is_plan: newPlan } : f
            )
          );
        }}
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




