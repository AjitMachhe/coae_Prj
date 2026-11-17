export function compressImage(file, { maxWidth = 640, maxBytes = 120000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("Please choose an image file"));
    }
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff"; // JPEG has no transparency
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      for (const q of [0.8, 0.7, 0.6, 0.5, 0.4, 0.3]) {
        const data = canvas.toDataURL("image/jpeg", q);
        if (data.length <= maxBytes) return resolve(data);
      }
      reject(new Error("Image is too detailed to shrink enough. Try a smaller image."));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image"));
    };
    img.src = url;
  });
}