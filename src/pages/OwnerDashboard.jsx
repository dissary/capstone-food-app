import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ImageUpload from "../components/ImageUpload";
import {
  getMyRestaurant, updateRestaurant, getMenuItems,
  createMenuItem, updateMenuItem, deleteMenuItem
} from "../services/api";

export default function OwnerDashboard() {
  const { currentUser } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New menu item form state
  const [newItem, setNewItem] = useState({ category: "", name: "", description: "", price: "", image_url: "" });

  useEffect(() => {
    async function load() {
      try {
        const r = await getMyRestaurant(currentUser);
        setRestaurant(r);
        const items = await getMenuItems(r.id);
        setMenuItems(items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (currentUser) load();
  }, [currentUser]);

  async function handleRestaurantUpdate(field, value) {
    const updated = { ...restaurant, [field]: value };
    setRestaurant(updated);
    await updateRestaurant(restaurant.id, updated, currentUser);
  }

  async function handleAddMenuItem() {
    if (!newItem.name || !newItem.price) return;
    const created = await createMenuItem({ ...newItem, restaurant_id: restaurant.id }, currentUser);
    setMenuItems([...menuItems, created]);
    setNewItem({ category: "", name: "", description: "", price: "", image_url: "" });
  }

  async function handleDeleteMenuItem(id) {
    await deleteMenuItem(id, currentUser);
    setMenuItems(menuItems.filter((i) => i.id !== id));
  }

  async function handleToggleAvailability(item) {
    const updated = await updateMenuItem(item.id, { ...item, is_available: !item.is_available }, currentUser);
    setMenuItems(menuItems.map((i) => (i.id === item.id ? updated : i)));
  }

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <h2>Manage Your Restaurant</h2>

      <div className="card p-3 mb-4">
        <h5>Restaurant Details</h5>
        <input
          className="form-control mb-2"
          value={restaurant.name}
          onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
          onBlur={(e) => handleRestaurantUpdate("name", e.target.value)}
          placeholder="Restaurant Name"
        />
        <textarea
          className="form-control mb-2"
          value={restaurant.description || ""}
          onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })}
          onBlur={(e) => handleRestaurantUpdate("description", e.target.value)}
          placeholder="Description"
        />
        <input
          className="form-control mb-2"
          value={restaurant.address || ""}
          onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })}
          onBlur={(e) => handleRestaurantUpdate("address", e.target.value)}
          placeholder="Address"
        />
        <ImageUpload
          folder="restaurants"
          currentUrl={restaurant.image_url}
          onUploadComplete={(url) => handleRestaurantUpdate("image_url", url)}
        />
      </div>

      <h5>Menu Items</h5>
      {menuItems.map((item) => (
        <div key={item.id} className="card p-3 mb-2 d-flex flex-row justify-content-between align-items-center">
          <div>
            <strong>{item.name}</strong> — RM {parseFloat(item.price).toFixed(2)}
            <p className="text-muted mb-0 small">{item.category}</p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <button
              className={`btn btn-sm ${item.is_available ? "btn-outline-success" : "btn-outline-secondary"}`}
              onClick={() => handleToggleAvailability(item)}
            >
              {item.is_available ? "Available" : "Unavailable"}
            </button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteMenuItem(item.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}

      <div className="card p-3 mt-4">
        <h6>Add New Menu Item</h6>
        <input className="form-control mb-2" placeholder="Category (e.g. Mains)" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} />
        <input className="form-control mb-2" placeholder="Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
        <textarea className="form-control mb-2" placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
        <input className="form-control mb-2" type="number" step="0.01" placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
        <ImageUpload folder="menu-items" onUploadComplete={(url) => setNewItem({ ...newItem, image_url: url })} />
        <button className="btn btn-primary" onClick={handleAddMenuItem}>Add Item</button>
      </div>
    </div>
  );
}