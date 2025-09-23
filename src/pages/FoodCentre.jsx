import { useMemo, useState } from "react";
import "./FoodCentre.css";

const seedRows = [
  { id: 1, name: "Egg",    category: "Protein",    qty: 1, unit: "pcs", expiry: "2025-10-20", status: "Available" },
  { id: 2, name: "Rice",   category: "Grains",     qty: 1, unit: "pcs", expiry: "2025-10-03", status: "Expired"   },
  { id: 3, name: "Tomato", category: "Vegetables", qty: 1, unit: "pcs", expiry: "2025-11-06", status: "Available" },
  { id: 4, name: "Potato", category: "Vegetables", qty: 1, unit: "pcs", expiry: "2025-09-20", status: "Available" },
  { id: 5, name: "Elain Liow", category: "Bone",   qty: 1, unit: "pcs", expiry: "8520-14-13", status: "Available" },
];

export default function FoodCenter() {
  const [tab, setTab] = useState("my");
  const [rows] = useState(seedRows);
  const [sort, setSort] = useState({ key: "name", dir: "asc" });
  const [page, setPage] = useState(1);
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
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  return (
    <section className="fc">
      <h1 className="page-title">Food Center – MyFood</h1>

      <div className="card">

        {/* Tabs extracted */}
        <Tabs active={tab} onChange={setTab} />

        <div className="card-head">
          <button className="btn solid">+ Add Item</button>
          <div className="spacer" />
          <button className="btn ghost" aria-label="Filter">
            <span className="filter-icon" /> Filter
          </button>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <Th label="Name"        k="name"    sort={sort} onSort={toggleSort} />
                <Th label="Category"    k="category" sort={sort} onSort={toggleSort} />
                <Th label="Quantity"    k="qty"     sort={sort} onSort={toggleSort} center />
                <Th label="Unit"        k="unit"    sort={sort} onSort={toggleSort} center />
                <Th label="Expiry date" k="expiry"  sort={sort} onSort={toggleSort} />
                <Th label="Status"      k="status"  sort={sort} onSort={toggleSort} />
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
      </div>
    </section>
  );
}

/* --- Components --- */
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

function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB");
}
