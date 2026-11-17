import { useState } from "react";
import { compressImage } from "../imageUtil";
import { isAllowedImage } from "../linkUtil";
import { uploadMedia, uploadsConfigured } from "../mediaUpload";

export default function ImageField({ value, onChange, maxWidth = 640, maxBytes = 120000 }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const isData = (value || "").startsWith("data:");
  const cloudWidth = maxWidth > 700 ? 1600 : 800;

  const onFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setMsg("Uploading...");
    try {
      if (uploadsConfigured) {
        const url = await uploadMedia(file, "image", (p) => setMsg(`Uploading ${p}%`), cloudWidth);
        onChange(url);
        setMsg("Uploaded");
      } else {
        const data = await compressImage(file, { maxWidth, maxBytes });
        onChange(data);
        setMsg(`Stored inside the page (${Math.round(data.length / 1024)} KB)`);
      }
    } catch (err) {
      setMsg(err.message);
    }
    setBusy(false);
  };

  return (
    <div className="if">
      <div className="mg-row">
        <input
          placeholder="Image URL (https://...) or upload"
          value={isData ? "" : value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={onFile} disabled={busy} />
        {value && (
          <button type="button" onClick={() => { onChange(""); setMsg(""); }}>
            Remove
          </button>
        )}
      </div>
      {isData && !msg && <small>Image stored inside the page ({Math.round(value.length / 1024)} KB)</small>}
      {msg && <small>{msg}</small>}
      {!uploadsConfigured && <small>Cloud storage isn't set up: uploads are shrunk and stored inside the page.</small>}
      {isAllowedImage(value) && <img className="mg-thumb" src={value} alt="" />}
    </div>
  );
}