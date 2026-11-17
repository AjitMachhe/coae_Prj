import { useEffect, useState } from "react";
import { isAllowedUrl } from "../linkUtil";

const blank = { type: "none", pageId: "", url: "", newTab: false };

export default function LinkPanel({ item, pages, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...blank, ...(item.link || {}) });
  const [status, setStatus] = useState("");

  useEffect(() => {
    setDraft({ ...blank, ...(item.link || {}) });
    setStatus("");
  }, [item.id]);

  const set = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setStatus("");
  };

  const chosen = pages.find((p) => p.id === draft.pageId);

  const save = async () => {
    const link = { type: draft.type };
    if (draft.type === "page") {
      if (!draft.pageId) return setStatus("Choose a page");
      link.pageId = draft.pageId;
    } else if (draft.type === "url") {
      const url = draft.url.trim();
      if (!isAllowedUrl(url)) {
        return setStatus("URL must start with https://, http://, mailto:, tel: or /");
      }
      link.url = url;
      link.newTab = !!draft.newTab;
    }
    try {
      await onSave(item.id, link);
      setStatus("Saved");
    } catch (err) {
      setStatus(err.code || err.message);
    }
  };

  return (
    <div className="style-panel">
      <div className="style-head">
        <h3>Link: {item.label}</h3>
        <button onClick={onClose}>Close</button>
      </div>

      <label>
        Links to
        <select value={draft.type} onChange={(e) => set("type", e.target.value)}>
          <option value="none">Nothing (plain label)</option>
          <option value="page">A page</option>
          <option value="url">External URL</option>
        </select>
      </label>

      {draft.type === "page" && (
        <>
          <label>
            Page
            <select value={draft.pageId} onChange={(e) => set("pageId", e.target.value)}>
              <option value="">Select...</option>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}{p.status === "draft" ? " (draft)" : ""}
                </option>
              ))}
            </select>
          </label>
          {draft.pageId && !chosen && (
            <p className="mm-error">The linked page no longer exists. Choose another.</p>
          )}
          {chosen && chosen.status === "draft" && (
            <p className="hint">This page is a draft. The menu item won't be clickable until you publish it.</p>
          )}
        </>
      )}

      {draft.type === "url" && (
        <>
          <label>
            URL
            <input
              style={{ width: 220 }}
              placeholder="https://example.com"
              value={draft.url}
              onChange={(e) => set("url", e.target.value)}
            />
          </label>
          <label>
            Open in new tab
            <input
              type="checkbox"
              checked={!!draft.newTab}
              onChange={(e) => set("newTab", e.target.checked)}
            />
          </label>
        </>
      )}

      <div className="style-actions">
        <button className="primary" onClick={save}>Save link</button>
        {status && <span className="style-status">{status}</span>}
      </div>
    </div>
  );
}