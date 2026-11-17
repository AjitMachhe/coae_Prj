import { useState } from "react";
import { Link } from "react-router-dom";
import { useMenuItems } from "../useMenuItems";
import { usePages } from "../usePages";
import { styleToCss, menuOf } from "../menuStyle";
import StylePanel from "./StylePanel";
import LinkPanel from "./LinkPanel";

function linkSummary(link, pages) {
  if (!link || !link.type || link.type === "none") return "";
  if (link.type === "url") return `→ ${link.url}`;
  const p = pages.find((x) => x.id === link.pageId);
  return p ? `→ ${p.title}${p.status === "draft" ? " (draft)" : ""}` : "→ (page missing)";
}

export default function MenuManager() {
  const {
    items, loading, error,
    addItem, renameItem, removeItem, updateStyle, updateLink, moveItem,
  } = useMenuItems();
  const { pages } = usePages();

  const [tab, setTab] = useState("top");
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [panel, setPanel] = useState(null); // { id, type: "style" | "link" }
  const [msg, setMsg] = useState("");

  const list = items.filter((i) => menuOf(i) === tab);
  const selected = panel ? items.find((i) => i.id === panel.id) : null;

  const handleAdd = async (e) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;
    setMsg("");
    try {
      await addItem(label, tab);
      setNewLabel("");
    } catch (err) {
      setMsg(err.code || err.message);
    }
  };

  const saveEdit = async (id) => {
    const label = editLabel.trim();
    if (!label) return;
    setMsg("");
    try {
      await renameItem(id, label);
      setEditingId(null);
    } catch (err) {
      setMsg(err.code || err.message);
    }
  };

  const handleDelete = async (item) => {
    const extra = item.mega ? " Its mega menu content will be deleted too." : "";
    if (!window.confirm(`Delete "${item.label}"?${extra}`)) return;
    setMsg("");
    try {
      await removeItem(item.id);
      if (panel && panel.id === item.id) setPanel(null);
    } catch (err) {
      setMsg(err.code || err.message);
    }
  };

  const handleMove = async (id, dir) => {
    setMsg("");
    try {
      await moveItem(id, dir);
    } catch (err) {
      setMsg(err.code || err.message);
    }
  };

  return (
    <div>
      <h2>Menu</h2>

      <div className="tabs">
        <button className={tab === "top" ? "on" : ""} onClick={() => { setTab("top"); setEditingId(null); }}>
          Top bar menu
        </button>
        <button className={tab === "main" ? "on" : ""} onClick={() => { setTab("main"); setEditingId(null); }}>
          Main menu
        </button>
      </div>

      <div className="mm-wrap">
        <section className="mm-card">
          <form className="mm-add" onSubmit={handleAdd}>
            <input
              placeholder={tab === "top" ? "New top bar item (e.g. Civics)" : "New main menu item (e.g. About)"}
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
            <button type="submit">Add</button>
          </form>

          {(error || msg) && <p className="mm-error">{error || msg}</p>}
          {loading && <p className="mm-empty">Loading...</p>}
          {!loading && !list.length && !error && (
            <p className="mm-empty">No items in this menu yet</p>
          )}

          {list.map((item, index) => (
            <div className="mm-row" key={item.id}>
              {editingId === item.id ? (
                <>
                  <input
                    autoFocus
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(item.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <button onClick={() => saveEdit(item.id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>X</button>
                </>
              ) : (
                <>
                  <div className="mm-main">
                    <span className="mm-label" style={styleToCss(item.style, "#8c1515")}>
                      {item.label}
                    </span>
                    {item.mega && <span className="mm-badge">mega</span>}
                    {linkSummary(item.link, pages) && (
                      <small className="mm-link">{linkSummary(item.link, pages)}</small>
                    )}
                  </div>
                  <button onClick={() => handleMove(item.id, -1)} disabled={index === 0} title="Move up">▲</button>
                  <button onClick={() => handleMove(item.id, 1)} disabled={index === list.length - 1} title="Move down">▼</button>
                  <button onClick={() => setPanel({ id: item.id, type: "style" })}>Style</button>
                  <button onClick={() => setPanel({ id: item.id, type: "link" })}>Link</button>
                  {tab === "main" && (
                    <Link className="mm-btn" to={`/admin/mega/${item.id}`}>Mega</Link>
                  )}
                  <button onClick={() => { setEditingId(item.id); setEditLabel(item.label); }}>Edit</button>
                  <button onClick={() => handleDelete(item)}>Del</button>
                </>
              )}
            </div>
          ))}
        </section>

        {selected && panel.type === "style" && (
          <StylePanel item={selected} onSave={updateStyle} onClose={() => setPanel(null)} />
        )}
        {selected && panel.type === "link" && (
          <LinkPanel item={selected} pages={pages} onSave={updateLink} onClose={() => setPanel(null)} />
        )}
      </div>
    </div>
  );
}