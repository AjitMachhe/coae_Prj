import { useState } from "react";
import { uploadMedia, uploadsConfigured } from "../mediaUpload";
import { parseVideo } from "../videoUtil";

export default function VideoField({ value, onChange }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setMsg("Uploading 0%");
    try {
      const url = await uploadMedia(file, "video", (p) => setMsg(`Uploading ${p}%`));
      onChange(url);
      setMsg("Uploaded");
    } catch (err) {
      setMsg(err.message);
    }
    setBusy(false);
  };

  const parsed = parseVideo((value || "").trim());

  return (
    <div className="if">
      <div className="mg-row">
        <input
          placeholder="YouTube / Vimeo link, or video file URL (https://...)"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
        {uploadsConfigured && (
          <input type="file" accept="video/*" onChange={onFile} disabled={busy} />
        )}
        {value && (
          <button type="button" onClick={() => { onChange(""); setMsg(""); }}>Remove</button>
        )}
      </div>
      {!uploadsConfigured && (
        <small>Video upload needs Cloudinary (see .env). Pasting a YouTube, Vimeo or .mp4 link works without it.</small>
      )}
      {msg && <small>{msg}</small>}
      {value && !parsed && <small className="mm-error">Not a valid https:// video link</small>}
      {parsed && <small>Detected: {parsed.kind === "file" ? "video file" : parsed.kind}</small>}
    </div>
  );
}