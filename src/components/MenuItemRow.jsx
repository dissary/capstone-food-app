import { useEffect, useState } from "react";
import ImageUpload from "./ImageUpload";

export default function MenuItemRow({ item, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...item });

  function save() {
    onUpdate(form);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="card p-3 mb-2">
        <input className="form-control mb-2" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" />
        <input className="form-control mb-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
        <textarea className="form-control mb-2" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
        <input className="form-control mb-2" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" />
        <ImageUpload folder="menu-items" currentUrl={form.image_url} onUploadComplete={(url) => setForm({ ...form, image_url: url })} />
        <div className="d-flex gap-2 mt-2">
          <button className="btn btn-sm btn-primary" onClick={save}>Save</button>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-3 mb-2 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
      <div>
        <strong>{item.name}</strong> — RM {parseFloat(item.price).toFixed(2)}
        <p className="text-muted mb-0 small">{item.category}</p>
      </div>
      <div className="d-flex gap-2 align-items-center">
        <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(true)}>Edit</button>
        <button className={`btn btn-sm ${item.is_available ? "btn-outline-success" : "btn-outline-secondary"}`} onClick={onToggle}>
          {item.is_available ? "Available" : "Unavailable"}
        </button>
        <button className="btn btn-sm btn-outline-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}