import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ImageUpload from "../components/ImageUpload";
import Toast from "../components/Toast";
import {
  getMyRestaurant, updateRestaurant, getAllMenuItemsForOwner,
  createMenuItem, updateMenuItem, deleteMenuItem,
  getCategoryOrder, updateCategoryOrder
} from "../services/api";

function sortCategories(categoryNames, savedOrder) {
  const orderMap = {};
  savedOrder.forEach((row) => { orderMap[row.category] = row.sort_order; });
  return [...categoryNames].sort((a, b) => {
    const aOrder = orderMap[a] ?? 9999;
    const bOrder = orderMap[b] ?? 9999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.localeCompare(b);
  });
}

export default function OwnerDashboard() {
  const { currentUser } = useAuth();
  const [myRestaurants, setMyRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categoryList, setCategoryList] = useState([]); // ordered array of category names
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [restaurantForm, setRestaurantForm] = useState(null);
  const [newItem, setNewItem] = useState({ category: "", name: "", description: "", price: "", image_url: "" });

  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }

  useEffect(() => {
    if (restaurant) {
      setRestaurantForm({ ...restaurant });
    }
  }, [restaurant]);

  useEffect(() => {
    async function loadList() {
      try {
        const list = await getMyRestaurant(currentUser);
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

  useEffect(() => {
    async function loadSelected() {
      if (!selectedId) return;
      setLoading(true);
      try {
        const r = myRestaurants.find((r) => r.id === selectedId);
        setRestaurant(r);

        const [items, savedOrder] = await Promise.all([
          getAllMenuItemsForOwner(selectedId, currentUser),
          getCategoryOrder(selectedId),
        ]);
        setMenuItems(items);

        const uniqueCategories = [...new Set(items.map((i) => i.category || "Other"))];
        setCategoryList(sortCategories(uniqueCategories, savedOrder));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadSelected();
  }, [selectedId, myRestaurants]);

  async function handleSaveRestaurant() {
    try {
      const updated = await updateRestaurant(restaurantForm.id, restaurantForm, currentUser);
      setRestaurant(updated);
      setMyRestaurants(myRestaurants.map((r) => (r.id === updated.id ? updated : r)));
      showToast("Restaurant details saved");
    } catch (err) {
      showToast(err.message || "Failed to save changes", "error");
    }
  }

  async function handleAddMenuItem() {
    if (!newItem.name || !newItem.price) return;
    const created = await createMenuItem({ ...newItem, restaurant_id: restaurant.id }, currentUser);
    setMenuItems([...menuItems, created]);

    const cat = created.category || "Other";
    if (!categoryList.includes(cat)) {
      setCategoryList([...categoryList, cat]);
    }
    setNewItem({ category: "", name: "", description: "", price: "", image_url: "" });
  }

  async function handleDeleteMenuItem(id) {
    try {
      await deleteMenuItem(id, currentUser);
      setMenuItems(menuItems.filter((i) => i.id !== id));
    } catch (err) {
      alert("This item has order history and can't be permanently deleted — mark it unavailable instead.");
    }
  }

  async function handleToggleAvailability(item) {
    const updated = await updateMenuItem(item.id, { ...item, is_available: !item.is_available }, currentUser);
    setMenuItems(menuItems.map((i) => (i.id === item.id ? updated : i)));
  }

  async function handleUpdateMenuItem(id, updates) {
    const updated = await updateMenuItem(id, updates, currentUser);
    setMenuItems(menuItems.map((i) => (i.id === id ? updated : i)));
  }

  // --- Drag and drop handlers for category reordering ---
  function handleDragStart(category) {
    setDraggedCategory(category);
  }

  function handleDragOver(e, targetCategory) {
    e.preventDefault();
    if (draggedCategory === targetCategory) return;

    const currentIndex = categoryList.indexOf(draggedCategory);
    const targetIndex = categoryList.indexOf(targetCategory);
    if (currentIndex === -1 || targetIndex === -1) return;

    const updated = [...categoryList];
    updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, draggedCategory);
    setCategoryList(updated);
  }

  async function handleDragEnd() {
    setDraggedCategory(null);
    try {
      await updateCategoryOrder(restaurant.id, categoryList, currentUser);
    } catch (err) {
      console.error("Failed to save category order:", err);
    }
  }

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;
  if (myRestaurants.length === 0) return <div className="container mt-5">No restaurant assigned to you yet.</div>;

  return (
    <div className="container mt-5">
      <h2 className="brand-font mb-4">Manage Your Restaurant{myRestaurants.length > 1 ? "s" : ""}</h2>

      {myRestaurants.length > 1 && (
        <select className="form-select mb-4 w-auto" value={selectedId} onChange={(e) => setSelectedId(Number(e.target.value))}>
          {myRestaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      )}

      {restaurant && (
        <>
        {restaurantForm && (
          <div className="card p-3 mb-4">
            <h5>Restaurant Details</h5>
            <input
              className="form-control mb-2"
              value={restaurantForm.name}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
              placeholder="Restaurant Name"
            />
            <textarea
              className="form-control mb-2"
              value={restaurantForm.description || ""}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
              placeholder="Description"
            />
            <input
              className="form-control mb-2"
              value={restaurantForm.address || ""}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
              placeholder="Address"
            />
            <ImageUpload
              folder="restaurants"
              currentUrl={restaurantForm.image_url}
              onUploadComplete={(url) => setRestaurantForm({ ...restaurantForm, image_url: url })}
            />
            <button className="btn btn-primary mt-2" onClick={handleSaveRestaurant}>
              Save Changes
            </button>
          </div>
        )}

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Menu Items</h5>
            {categoryList.length > 1 && (
              <span className="text-muted small">Drag a category header to reorder</span>
            )}
          </div>

          {categoryList.map((category) => {
            const itemsInCategory = menuItems.filter((i) => (i.category || "Other") === category);
            if (itemsInCategory.length === 0) return null;

            return (
              <div
                key={category}
                draggable
                onDragStart={() => handleDragStart(category)}
                onDragOver={(e) => handleDragOver(e, category)}
                onDragEnd={handleDragEnd}
                className="mb-4"
                style={{
                  opacity: draggedCategory === category ? 0.4 : 1,
                  transition: "opacity 0.15s ease",
                }}
              >
                <div
                  className="d-flex align-items-center gap-2 mb-2 p-2"
                  style={{
                    cursor: "grab",
                    background: "var(--dinery-sage)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <span style={{ color: "var(--dinery-forest)", fontSize: "1.1rem" }}>⠿</span>
                  <strong style={{ color: "var(--dinery-forest)" }}>{category}</strong>
                </div>

                {itemsInCategory.map((item) => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    onToggle={() => handleToggleAvailability(item)}
                    onDelete={() => handleDeleteMenuItem(item.id)}
                    onUpdate={(updates) => handleUpdateMenuItem(item.id, updates)}
                  />
                ))}
              </div>
            );
          })}

          <div className="card p-3 mt-4">
            <h6>Add New Menu Item</h6>
            <input className="form-control mb-2" placeholder="Category (e.g. Mains)" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} />
            <input className="form-control mb-2" placeholder="Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            <textarea className="form-control mb-2" placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
            <input className="form-control mb-2" type="number" step="0.01" placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
            <ImageUpload folder="menu-items" onUploadComplete={(url) => setNewItem({ ...newItem, image_url: url })} />
            <button className="btn btn-primary" onClick={handleAddMenuItem}>Add Item</button>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
          </div>
        </>
      )}
    </div>
  );
}

function MenuItemRow({ item, onToggle, onDelete, onUpdate }) {
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
    <div className="card p-3 mb-2 ms-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
      <div>
        <strong>{item.name}</strong> — RM {parseFloat(item.price).toFixed(2)}
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