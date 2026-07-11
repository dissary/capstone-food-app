import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ImageUpload from "../components/ImageUpload";
import MenuItemRow from "../components/MenuItemRow";
import {
  getMyRestaurant, updateRestaurant, getAllMenuItemsForOwner,
  createMenuItem, updateMenuItem, deleteMenuItem
} from "../services/api";

export default function OwnerDashboard() {
  const { currentUser } = useAuth();
  const [myRestaurants, setMyRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newItem, setNewItem] = useState({ category: "", name: "", description: "", price: "", image_url: "" });

  // Load the owner's restaurant list once
  useEffect(() => {
    async function loadList() {
      try {
        const list = await getMyRestaurant(currentUser); // now returns an array
        setMyRestaurants(list);
        if (list.length > 0) setSelectedId(list[0].id);
        else setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    if (currentUser) loadList();
  }, [currentUser]);

  // Load the selected restaurant's details + menu whenever selection changes
  useEffect(() => {
    async function loadSelected() {
      if (!selectedId) return;
      setLoading(true);
      try {
        const r = myRestaurants.find((r) => r.id === selectedId);
        setRestaurant(r);
        const items = await getAllMenuItemsForOwner(selectedId, currentUser);
        setMenuItems(items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadSelected();
  }, [selectedId, myRestaurants]);

  async function handleRestaurantUpdate(field, value) {
    const updated = { ...restaurant, [field]: value };
    setRestaurant(updated);
    await updateRestaurant(restaurant.id, updated, currentUser);
    setMyRestaurants(myRestaurants.map((r) => (r.id === updated.id ? updated : r)));
  }

  async function handleAddMenuItem() {
    if (!newItem.name || !newItem.price) return;
    const created = await createMenuItem({ ...newItem, restaurant_id: restaurant.id }, currentUser);
    setMenuItems([...menuItems, created]);
    setNewItem({ category: "", name: "", description: "", price: "", image_url: "" });
  }

  async function handleDeleteMenuItem(id) {
    try {
      await deleteMenuItem(id, currentUser);
      setMenuItems(menuItems.filter((i) => i.id !== id));
    } catch (err) {
      alert("This item has order history and can't be permanently deleted — mark it unavailable instead to remove it from the menu.");
    }
  }

  async function handleUpdateMenuItem(id, updates) {
  const updated = await updateMenuItem(id, updates, currentUser);
  setMenuItems(menuItems.map((i) => (i.id === id ? updated : i)));
}

  async function handleToggleAvailability(item) {
    const updated = await updateMenuItem(item.id, { ...item, is_available: !item.is_available }, currentUser);
    setMenuItems(menuItems.map((i) => (i.id === item.id ? updated : i)));
  }

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;
  if (myRestaurants.length === 0) return <div className="container mt-5">No restaurant assigned to you yet.</div>;

  return (
    <div className="container mt-5">
      <h2 className="brand-font mb-4">Manage Your Restaurant{myRestaurants.length > 1 ? "s" : ""}</h2>

      {myRestaurants.length > 1 && (
        <select
          className="form-select mb-4 w-auto"
          value={selectedId}
          onChange={(e) => setSelectedId(Number(e.target.value))}
        >
          {myRestaurants.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      )}

      {restaurant && (
        <>
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
            <MenuItemRow
              key={item.id}
              item={item}
              onToggle={() => handleToggleAvailability(item)}
              onDelete={() => handleDeleteMenuItem(item.id)}
              onUpdate={(updates) => handleUpdateMenuItem(item.id, updates)}
            />
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
        </>
      )}
    </div>
  );
}