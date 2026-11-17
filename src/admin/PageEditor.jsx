import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { getPageById, savePage, slugExists, slugify, usePages } from "../usePages";
import { useHeader } from "../useHeader";
import { BLOCK_TYPES, newBlock, normalizeBlocks, cleanBlocks, validateBlocks } from "../blockUtil";
import {
  TEMPLATES, LAYOUTS, layoutOf, defaultData, normalizeData, cleanData, validateData,
} from "../templateUtil";
import BlockFields from "./BlockFields";
import DepartmentFields from "./DepartmentFields";
import FacultyFields from "./FacultyFields";
import PageBody from "../site/PageBody";

const RESERVED = ["admin", "login"];

const TITLE_LABEL = {
  custom: "Title",
  department: "Department name",
  faculty: "Faculty member's name",
};

export default function PageEditor() {
  const { id } = useParams(); // undefined for /admin/pages/new
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { pages } = usePages();
  const { header } = useHeader();

  const wanted = params.get("type");
  const startType = TEMPLATES.some((x) => x.key === wanted) ? wanted : "custom";

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState("draft");
  const [template, setTemplate] = useState(startType);
  const [layout, setLayout] = useState("boxed");
  const [data, setData] = useState(defaultData(startType));
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Use the site's accent color in the preview too
  const accent = header ? header.mainBg : null;
  useEffect(() => {
    if (!accent) return;
    document.documentElement.style.setProperty("--btn", accent);
    return () => document.documentElement.style.removeProperty("--btn");
  }, [accent]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const page = await getPageById(id);
        if (cancelled) return;
        if (!page) {
          setMsg("Page not found");
        } else {
          const tpl = TEMPLATES.some((x) => x.key === page.template) ? page.template : "custom";
          setTitle(page.title);
          setSlug(page.slug);
          setSlugTouched(true);
          setStatus(page.status);
          setTemplate(tpl);
          setLayout(layoutOf(page.layout));
          setData(normalizeData(tpl, page.data));
          if (Array.isArray(page.blocks)) {
            setBlocks(normalizeBlocks(page.blocks));
          } else if (page.content) {
            // Old page: its text becomes one Text block
            setBlocks([{ ...newBlock("richtext"), html: page.content }]);
          }
        }
      } catch (err) {
        if (!cancelled) setMsg(err.code || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const onTitle = (value) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const changeTemplate = (key) => {
    setTemplate(key);
    setData(defaultData(key));
    setMsg("");
  };

  const patchData = (patch) => {
    setData((d) => ({ ...d, ...patch }));
    setMsg("");
  };

  const addBlock = (type) => { setBlocks((bs) => [...bs, newBlock(type)]); setMsg(""); };
  const setBlock = (bid, patch) => {
    setBlocks((bs) => bs.map((b) => (b.id === bid ? { ...b, ...patch } : b)));
    setMsg("");
  };
  const moveBlock = (i, dir) =>
    setBlocks((bs) => {
      const to = i + dir;
      if (to < 0 || to >= bs.length) return bs;
      const c = [...bs];
      [c[i], c[to]] = [c[to], c[i]];
      return c;
    });
  const removeBlock = (bid) => {
    if (!window.confirm("Remove this block?")) return;
    setBlocks((bs) => bs.filter((b) => b.id !== bid));
  };

  const handleSave = async () => {
    setMsg("");
    const cleanSlug = slugify(slug);
    if (!title.trim()) return setMsg("Title is required");
    if (!cleanSlug) return setMsg("Slug is required");
    if (RESERVED.includes(cleanSlug)) {
      return setMsg(`"${cleanSlug}" is reserved by the site. Choose another slug.`);
    }
    const dataProblem = validateData(template, data);
    if (dataProblem) return setMsg(dataProblem);
    const blockProblem = validateBlocks(blocks);
    if (blockProblem) return setMsg(blockProblem);

    const cleanedData = cleanData(template, data);
    const cleanedBlocks = cleanBlocks(blocks);
    const size = JSON.stringify(cleanedData).length + JSON.stringify(cleanedBlocks).length;
    if (size > 850000) {
      return setMsg(`This page is about ${Math.round(size / 1024)} KB, over the ~830 KB limit. Use hosted or cloud-uploaded images.`);
    }

    setSaving(true);
    try {
      if (await slugExists(cleanSlug, id)) {
        setMsg(`The slug "${cleanSlug}" is already used by another page`);
        setSaving(false);
        return;
      }
      await savePage(id, {
        title: title.trim(),
        slug: cleanSlug,
        status,
        template,
        layout,
        data: cleanedData,
        blocks: cleanedBlocks,
        content: "", // old single-text field, replaced by blocks
      });
      navigate("/admin/pages");
    } catch (err) {
      setMsg(err.code || err.message);
      setSaving(false);
    }
  };

  if (loading) return <p className="mm-empty">Loading...</p>;

  const departments = pages.filter((p) => p.template === "department");
  const showPreview = template !== "custom" || blocks.length > 0;

  return (
    <div className="mg">
      <div className="pl-head">
        <h2>{id ? "Edit page" : "New page"}</h2>
        <Link to="/admin/pages">Back to pages</Link>
      </div>

      <div className="mg-card">
        <label className="pe-field">
          Page type
          <select value={template} disabled={!!id} onChange={(e) => changeTemplate(e.target.value)}>
            {TEMPLATES.map((x) => (
              <option key={x.key} value={x.key}>{x.label}</option>
            ))}
          </select>
          {id && <small>The page type can't be changed after the page is saved.</small>}
        </label>
        <label className="pe-field">
          {TITLE_LABEL[template]}
          <input value={title} onChange={(e) => onTitle(e.target.value)} />
        </label>
        <label className="pe-field">
          Slug (URL)
          <input value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} />
        </label>
        <label className="pe-field">
          Page width
          <select value={layout} onChange={(e) => setLayout(e.target.value)}>
            {LAYOUTS.map((l) => (
              <option key={l.key} value={l.key}>{l.label}</option>
            ))}
          </select>
        </label>
        <label className="pe-field">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published (public)</option>
          </select>
        </label>
      </div>

      {template === "department" && <DepartmentFields d={data} set={patchData} />}
      {template === "faculty" && <FacultyFields d={data} set={patchData} departments={departments} />}

      <h3 className="bb-title">
        {template === "custom" ? "Page blocks" : "Extra sections (optional, shown below the template)"}
      </h3>

      {!blocks.length && <p className="mm-empty">No blocks yet.</p>}

      {blocks.map((b, i) => (
        <div className="bb" key={b.id}>
          <div className="bb-head">
            <h3>{BLOCK_TYPES.find((x) => x.type === b.type)?.label}</h3>
            <div className="mg-row">
              <button type="button" onClick={() => moveBlock(i, -1)} disabled={i === 0}>▲</button>
              <button type="button" onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1}>▼</button>
              <button type="button" onClick={() => removeBlock(b.id)}>Remove</button>
            </div>
          </div>
          <BlockFields block={b} pages={pages} set={(patch) => setBlock(b.id, patch)} />
        </div>
      ))}

      <div className="bb-add">
        <span>Add block:</span>
        {BLOCK_TYPES.map((x) => (
          <button type="button" key={x.type} onClick={() => addBlock(x.type)}>
            + {x.label}
          </button>
        ))}
      </div>

      {showPreview && (
        <>
          <div className="preview-label">Preview (faculty lists show only saved, published profiles)</div>
          <div className="pb-preview">
            <PageBody
              page={{ id, title, template, layout, data: cleanData(template, data), blocks }}
              pages={pages}
            />
          </div>
        </>
      )}

      {msg && <p className="he-msg">{msg}</p>}
      <div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save page"}
        </button>
      </div>
    </div>
  );
}