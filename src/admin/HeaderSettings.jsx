import { useEffect, useState } from "react";
import { useHeader, saveHeader, DEFAULT_HEADER } from "../useHeader";
import ImageField from "./ImageField";
import { uploadsConfigured } from "../mediaUpload";
import { isAllowedImage } from "../linkUtil";

export default function HeaderSettings() {
  const { header, error } = useHeader();
  const [draft, setDraft] = useState(DEFAULT_HEADER);
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // Fill the form once, when the saved settings first arrive
  useEffect(() => {
    if (header && !loaded) {
      setDraft(header);
      setLoaded(true);
    }
  }, [header, loaded]);

  const set = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setMsg("");
  };

  const handleSave = async () => {
    if (!draft.siteName.trim()) return setMsg("Site name is required");
    if (draft.logo && !isAllowedImage(draft.logo)) {
      return setMsg("Logo must be an https:// URL or an upload");
    }
    setSaving(true);
    setMsg("");
    try {
      const data = { ...draft, siteName: draft.siteName.trim(), logo: draft.logo || "" };
      delete data.logoHeight; // old setting, the logo size is fixed now
      await saveHeader(data);
      setMsg("Saved");
    } catch (err) {
      setMsg(err.code || err.message);
    }
    setSaving(false);
  };

  if (!header) return <p className="mm-empty">Loading...</p>;

  const showLogo = isAllowedImage(draft.logo);

  return (
    <div className="pe">
      <h2>Header</h2>
      {error && <p className="mm-error">{error}</p>}

      <label className="pe-field">
        Site name (shown when there is no logo)
        <input value={draft.siteName} onChange={(e) => set("siteName", e.target.value)} />
      </label>

      <div className="pe-field">
        Logo (optional)
        <small>
          Recommended size: 250 × 60 px (or 500 × 120 px for sharper display). Other shapes are
          fitted inside that box without stretching.
        </small>
        <ImageField
          value={draft.logo}
          onChange={(v) => set("logo", v)}
          maxWidth={500}
          maxBytes={60000}
        />
        {!uploadsConfigured && (
          <small>
            Without cloud uploads, logos are converted to JPEG on a white background. For a
            transparent logo, set up Cloudinary or paste a PNG link.
          </small>
        )}
      </div>

      <label className="he-check">
        <input type="checkbox" checked={draft.showTopBar} onChange={(e) => set("showTopBar", e.target.checked)} />
        Show top bar
      </label>

      <label className="pe-field">
        Top bar label (e.g. OUR IMPACT)
        <input value={draft.topLabel} onChange={(e) => set("topLabel", e.target.value)} />
      </label>

      <label className="he-check">
        <input type="checkbox" checked={draft.showSearch} onChange={(e) => set("showSearch", e.target.checked)} />
        Show search box
      </label>

      <label className="style-row">
        Top bar color
        <input type="color" value={draft.topBg} onChange={(e) => set("topBg", e.target.value)} />
      </label>

      <label className="style-row">
        Main bar color
        <input type="color" value={draft.mainBg} onChange={(e) => set("mainBg", e.target.value)} />
      </label>

      <div className="preview-label">Preview (dashed box = the 250 × 60 logo area)</div>
      <div className="he-preview">
        {draft.showTopBar && (
          <div style={{ background: draft.topBg, color: "#fff", padding: "8px 16px", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>
            {draft.topLabel}
          </div>
        )}
        <div style={{ background: draft.mainBg, color: "#fff", padding: "10px 16px", fontFamily: "Georgia, serif", fontSize: 22 }}>
          {showLogo ? (
            <img
              src={draft.logo}
              alt={draft.siteName}
              style={{
                display: "block", width: 250, height: 60, maxWidth: "100%",
                objectFit: "contain", objectPosition: "left center",
                outline: "1px dashed rgba(255,255,255,.4)",
              }}
            />
          ) : (
            draft.siteName
          )}
        </div>
      </div>

      {msg && <p className="he-msg">{msg}</p>}
      <button className="btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save header"}
      </button>
    </div>
  );
}