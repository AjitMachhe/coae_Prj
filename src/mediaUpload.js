const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;

export const uploadsConfigured = !!(CLOUD && PRESET);

export const LIMITS = { image: 10 * 1024 * 1024, video: 80 * 1024 * 1024 };

// Resize + auto format through the delivery URL. Set false if images show broken.
const OPTIMIZE_IMAGES = true;

function optimized(url, width) {
  if (!OPTIMIZE_IMAGES || !url.includes("/image/upload/")) return url;
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

// kind: "image" | "video". Resolves with the file's https URL.
export function uploadMedia(file, kind, onProgress, width = 1600) {
  return new Promise((resolve, reject) => {
    if (!uploadsConfigured) {
      return reject(new Error("Uploads are not set up yet (see .env)"));
    }
    if (!file.type.startsWith(kind + "/")) {
      return reject(new Error(kind === "video" ? "Please choose a video file" : "Please choose an image file"));
    }
    if (file.size > LIMITS[kind]) {
      return reject(new Error(`File is too large (max ${Math.round(LIMITS[kind] / 1048576)} MB)`));
    }

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD}/${kind}/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data = {};
      try { data = JSON.parse(xhr.responseText); } catch { /* ignore */ }
      if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
        resolve(kind === "image" ? optimized(data.secure_url, width) : data.secure_url);
      } else {
        reject(new Error((data.error && data.error.message) || `Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}