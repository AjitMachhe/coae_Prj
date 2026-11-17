import { emptyLink } from "../blockUtil";

export default function LinkField({ value, pages, onChange }) {
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