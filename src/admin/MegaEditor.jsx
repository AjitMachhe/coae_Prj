import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useMenuItems } from "../useMenuItems";
import { usePages } from "../usePages";
import { isAllowedUrl, isAllowedImage } from "../linkUtil";
import { compressImage } from "../imageUtil";
import MegaPanel from "../site/MegaPanel";

const MAX_COLUMNS = 4;
const MAX_LINKS = 10;

const emptyLink = () => ({ type: "none", pageId: "", url: "", newTab: false });

const DEFAULT_MEGA = {
  enabled: true,
  bg: "#ffffff",
  text: "#1f2937",
  accent: "#8c1515",
  columns: [{ title: "", links: [] }],
  featured: {
    enabled: false,
    image: "",
    title: "",
    text: "",
    buttonLabel: "",
    link: emptyLink(),
  },
};

function cleanLink(l) {
  const v = { ...emptyLink(), ...(l || {}) };
  if (v.type === "page") return { type: "page", pageId: v.pageId };
  if (v.type === "url") return { type: "url", url: v.url.trim(), newTab: !!v.newTab };
  return { type: "none" };
}

function linkError(l) {
  const v = { ...emptyLink(), ...(l || {}) };
  if (v.type === "page" && !v.pageId) return "choose a page";
  if (v.type === "url" && !isAllowedUrl(v.url.trim())) {
    return "URL must start with https://, http://, mailto:, tel: or /";
  }
  return "";
}

function moveIn(arr, i, dir) {
  const t = i + dir;
  if (t < 0 || t >= arr.length) return;
  [arr[i], arr[t]] = [arr[t], arr[i]];
}

function validate(m) {
  if (!m.enabled) return "";
  let count = 0;
  for (let ci = 0; ci < m.columns.length; ci++) {
    const links = m.columns[ci].links;
    for (let li = 0; li < links.length; li++) {
      const where = `Column ${ci + 1}, link ${li + 1}`;
      if (!links[li].label.trim()) return `${where}: label is required`;
      const e = linkError(links[li].link);
      if (e) return `${where}: ${e}`;
      count++;
    }
  }
  const f = m.featured;
  if (f.enabled) {
    if (f.image && !isAllowedImage(f.image)) {
      return "Featured image URL must start with https:// or http://";
    }
    if (f.buttonLabel.trim()) {
      if (!f.link || f.link.type === "none") return "The button needs a link";
      const e = linkError(f.link);
      if (e) return `Button: ${e}`;
    }
    count++;
  }
  if (!count) return "Add at least one link, or turn on the featured block";
  return "";
}

function LinkField({ value, pages, onChange }) {
  const v = { ...emptyLink(), ...(value || {}) };
  const set = (k, val) => onChange({ ...v, [k]: val });
  return (
    <div className="lf">
      <select value={v.type} onChange={(e) => set("type", e.target.value)}>
        <option value="none">No link</option>
        <option value="page">Page</option>
        <option value="url">URL</option>
      </select>
      {v.type === "page" && (
        <select value={v.pageId} onChange={(e) => set("pageId", e.target.value)}>
          <option value="">Select page...</option>
          {pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}{p.status === "draft" ? " (draft)" : ""}
            </option>
          ))}
        </select>
      )}
      {v.type === "url" && (
        <>
          <input
            placeholder="https://..."
            value={v.url}
            onChange={(e) => set("url", e.target.value)}
          />
          <label className="lf-tab">
            <input
              type="checkbox"
              checked={!!v.newTab}
              onChange={(e) => set("newTab", e.target.checked)}
            />
            new tab
          </label>
        </>
      )}
    </div>
  );
}

export default function MegaEditor() {
  const { id } = useParams();
  const { items, loading: itemsLoading } = useMenuItems();
  const { pages } = usePages();
  const [mega, setMega] = useState(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const item = items.find((i) => i.id === id);

  useEffect(() => {
    let cancelled = false;
    getDoc(doc(db, "megaMenus", id))
      .then((snap) => {
        if (cancelled) return;
        const data = snap.exists() ? snap.data() : {};
        setMega({
          enabled: data.enabled ?? true,
          bg: data.bg || DEFAULT_MEGA.bg,
          text: data.text || DEFAULT_MEGA.text,
          accent: data.accent || DEFAULT_MEGA.accent,
          columns: data.columns && data.columns.length ? data.columns : structuredClone(DEFAULT_MEGA.columns),
          featured: { ...structuredClone(DEFAULT_MEGA.featured), ...(data.featured || {}) },
        });
      })
      .catch((err) => {
        if (!cancelled) setMsg(err.code || err.message);
      });
    return () => { cancelled = true; };
  }, [id]);

  // Change a copy of the draft, never the state itself
  const update = (fn) => {
    setMega((m) => {
      const c = structuredClone(m);
      fn(c);
      return c;
    });
    setMsg("");
  };

  const onFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setMsg("Processing image...");
    try {
      const data = await compressImage(file);
      update((m) => { m.featured.image = data; });
      setMsg(`Image ready (${Math.round(data.length / 1024)} KB). Click Save to apply it.`);
    } catch (err) {
      setMsg(err.message);
    }
  };

  const handleSave = async () => {
    const err = validate(mega);
    if (err) return setMsg(err);

    const f = mega.featured;
    const clean = {
      enabled: !!mega.enabled,
      bg: mega.bg,
      text: mega.text,
      accent: mega.accent,
      columns: mega.columns
        .map((c) => ({
          title: c.title.trim(),
          links: c.links.map((l) => ({
            label: l.label.trim(),
            link: cleanLink(l.link),
          })),
        }))
        .filter((c) => c.title || c.links.length),
      featured: {
        enabled: !!f.enabled,
        image: f.image || "",
        title: f.title.trim(),
        text: f.text.trim(),
        buttonLabel: f.buttonLabel.trim(),
        link: cleanLink(f.link),
      },
    };

    setSaving(true);
    setMsg("");
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, "megaMenus", id), { ...clean, updatedAt: serverTimestamp() });
      batch.update(doc(db, "menuItems", id), { mega: clean.enabled });
      await batch.commit();
      setMsg("Saved");
    } catch (e) {
      setMsg(e.code || e.message);
    }
    setSaving(false);
  };

  if (!mega) return <p className="mm-empty">{msg || "Loading..."}</p>;
  if (!itemsLoading && !item) {
    return (
      <p className="mm-error">
        Menu item not found. <Link to="/admin/menu">Back to menu</Link>
      </p>
    );
  }

  const f = mega.featured;
  const isData = (f.image || "").startsWith("data:");

  return (
    <div className="mg">
      <div className="pl-head">
        <h2>Mega menu{item ? `: ${item.label}` : ""}</h2>
        <Link to="/admin/menu">Back to menu</Link>
      </div>

      <div className="mg-card">
        <label className="mg-row">
          <input
            type="checkbox"
            checked={mega.enabled}
            onChange={(e) => update((m) => { m.enabled = e.target.checked; })}
          />
          Enable mega menu for this item
        </label>
        <div className="mg-row">
          <label>Background <input type="color" value={mega.bg} onChange={(e) => update((m) => { m.bg = e.target.value; })} /></label>
          <label>Text <input type="color" value={mega.text} onChange={(e) => update((m) => { m.text = e.target.value; })} /></label>
          <label>Headings and button <input type="color" value={mega.accent} onChange={(e) => update((m) => { m.accent = e.target.value; })} /></label>
        </div>
      </div>

      <div className="mg-card">
        <h3>Columns ({mega.columns.length}/{MAX_COLUMNS})</h3>
        <div className="mg-cols">
          {mega.columns.map((col, ci) => (
            <div className="mg-link" key={ci}>
              <div className="mg-row">
                <input
                  placeholder="Column heading"
                  value={col.title}
                  onChange={(e) => update((m) => { m.columns[ci].title = e.target.value; })}
                />
                <button onClick={() => update((m) => moveIn(m.columns, ci, -1))} disabled={ci === 0}>◀</button>
                <button onClick={() => update((m) => moveIn(m.columns, ci, 1))} disabled={ci === mega.columns.length - 1}>▶</button>
                <button
                  onClick={() => {
                    if (!col.links.length || window.confirm("Remove this column and its links?")) {
                      update((m) => { m.columns.splice(ci, 1); });
                    }
                  }}
                >
                  Remove
                </button>
              </div>

              {col.links.map((l, li) => (
                <div className="mg-link" key={li}>
                  <div className="mg-row">
                    <input
                      placeholder="Link label"
                      value={l.label}
                      onChange={(e) => update((m) => { m.columns[ci].links[li].label = e.target.value; })}
                    />
                    <button onClick={() => update((m) => moveIn(m.columns[ci].links, li, -1))} disabled={li === 0}>▲</button>
                    <button onClick={() => update((m) => moveIn(m.columns[ci].links, li, 1))} disabled={li === col.links.length - 1}>▼</button>
                    <button onClick={() => update((m) => { m.columns[ci].links.splice(li, 1); })}>X</button>
                  </div>
                  <LinkField
                    value={l.link}
                    pages={pages}
                    onChange={(v) => update((m) => { m.columns[ci].links[li].link = v; })}
                  />
                </div>
              ))}

              <button
                disabled={col.links.length >= MAX_LINKS}
                onClick={() => update((m) => { m.columns[ci].links.push({ label: "", link: emptyLink() }); })}
              >
                + Add link
              </button>
            </div>
          ))}
        </div>
        <div>
          <button
            disabled={mega.columns.length >= MAX_COLUMNS}
            onClick={() => update((m) => { m.columns.push({ title: "", links: [] }); })}
          >
            + Add column
          </button>
        </div>
      </div>

      <div className="mg-card">
        <label className="mg-row">
          <input
            type="checkbox"
            checked={f.enabled}
            onChange={(e) => update((m) => { m.featured.enabled = e.target.checked; })}
          />
          <h3>Featured block (image, text, button)</h3>
        </label>

        {f.enabled && (
          <>
            <div className="mg-row">
              <input
                placeholder="Image URL (https://...) or upload"
                value={isData ? "" : f.image}
                onChange={(e) => update((m) => { m.featured.image = e.target.value; })}
              />
              <input type="file" accept="image/*" onChange={onFile} />
              {f.image && (
                <button onClick={() => update((m) => { m.featured.image = ""; })}>Remove image</button>
              )}
            </div>
            {isData && <small>Uploaded image in use ({Math.round(f.image.length / 1024)} KB)</small>}
            {isAllowedImage(f.image) && <img className="mg-thumb" src={f.image} alt="" />}

            <input
              placeholder="Title"
              value={f.title}
              onChange={(e) => update((m) => { m.featured.title = e.target.value; })}
            />
            <input
              placeholder="Short text"
              value={f.text}
              onChange={(e) => update((m) => { m.featured.text = e.target.value; })}
            />
            <input
              placeholder="Button label (leave empty for no button)"
              value={f.buttonLabel}
              onChange={(e) => update((m) => { m.featured.buttonLabel = e.target.value; })}
            />
            <LinkField
              value={f.link}
              pages={pages}
              onChange={(v) => update((m) => { m.featured.link = v; })}
            />
          </>
        )}
      </div>

      <div className="preview-label">Preview</div>
      <div className="mg-preview">
        <MegaPanel mega={mega} pages={pages} onNavigate={() => {}} />
      </div>

      {msg && <p className="he-msg">{msg}</p>}
      <div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save mega menu"}
        </button>
      </div>
    </div>
  );
}