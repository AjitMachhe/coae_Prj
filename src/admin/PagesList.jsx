import { useState } from "react";
import { Link } from "react-router-dom";
import { usePages, deletePage } from "../usePages";
import { TEMPLATES, shortLabel } from "../templateUtil";

export default function PagesList() {
  const { pages, loading, error } = usePages();
  const [msg, setMsg] = useState("");
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");

  const term = q.trim().toLowerCase();
  const shown = pages.filter(
    (p) =>
      (type === "all" || (p.template || "custom") === type) &&
      p.title.toLowerCase().includes(term)
  );

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    setMsg("");
    try {
      await deletePage(p.id);
    } catch (err) {
      setMsg(err.code || err.message);
    }
  };

  return (
    <div>
      <div className="pl-head">
        <h2>Pages</h2>
        <div className="pl-new">
          <Link className="btn-primary" to="/admin/pages/new">+ New page</Link>
          <Link className="btn-primary" to="/admin/pages/new?type=department">+ Department</Link>
          <Link className="btn-primary" to="/admin/pages/new?type=faculty">+ Faculty profile</Link>
        </div>
      </div>

      <div className="pl-tools">
        <input placeholder="Search by title..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All types</option>
          {TEMPLATES.map((x) => (
            <option key={x.key} value={x.key}>{x.short}</option>
          ))}
        </select>
      </div>

      {(error || msg) && <p className="mm-error">{error || msg}</p>}
      {loading && <p className="mm-empty">Loading...</p>}
      {!loading && !pages.length && !error && <p className="mm-empty">No pages yet</p>}
      {!loading && pages.length > 0 && !shown.length && <p className="mm-empty">No pages match.</p>}

      {shown.length > 0 && (
        <table className="pl-table">
          <thead>
            <tr><th>Title</th><th>Type</th><th>Slug</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{shortLabel(p.template || "custom")}</td>
                <td>/{p.slug}</td>
                <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                <td className="pl-actions">
                  <Link to={`/admin/pages/${p.id}`}>Edit</Link>
                  <button onClick={() => handleDelete(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}