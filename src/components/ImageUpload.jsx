import { useState } from "react";
import { uploadImage } from "../services/upload";

export default function ImageUpload({ folder, currentUrl, onUploadComplete }) {
  const [preview, setPreview] = useState(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file)); // instant local preview
    setUploading(true);
    setError(null);

    try {
      const url = await uploadImage(file, folder);
      onUploadComplete(url);
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mb-3">
      {preview && (
        <img src={preview} alt="preview" style={{ width: "150px", height: "150px", objectFit: "cover" }} className="d-block mb-2 rounded" />
      )}
      <input type="file" accept="image/*" className="form-control" onChange={handleFileChange} disabled={uploading} />
      {uploading && <p className="text-muted small mt-1">Uploading...</p>}
      {error && <p className="text-danger small mt-1">{error}</p>}
    </div>
  );
}