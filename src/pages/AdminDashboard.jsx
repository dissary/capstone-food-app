import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ImageUpload from "../components/ImageUpload";
import { getAllUsers, updateUserRole, createRestaurant, getRestaurants } from "../services/api";

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newRestaurant, setNewRestaurant] = useState({
    name: "", description: "", address: "", phone: "", image_url: "", owner_id: "",
  });

  useEffect(() => {
    async function load() {
      const [u, r] = await Promise.all([getAllUsers(currentUser), getRestaurants()]);
      setUsers(u);
      setRestaurants(r);
      setLoading(false);
    }
    if (currentUser) load();
  }, [currentUser]);

  async function handleRoleChange(userId, newRole) {
    const updated = await updateUserRole(userId, newRole, currentUser);
    setUsers(users.map((u) => (u.id === userId ? updated : u)));
  }

  async function handleCreateRestaurant() {
    if (!newRestaurant.name) return;
    const payload = { ...newRestaurant, owner_id: newRestaurant.owner_id || null };
    const created = await createRestaurant(payload, currentUser);
    setRestaurants([...restaurants, created]);
    setNewRestaurant({ name: "", description: "", address: "", phone: "", image_url: "", owner_id: "" });
  }

  if (loading) return <div className="container mt-5">Loading...</div>;

  const owners = users.filter((u) => u.role === "owner" || u.role === "admin");

  return (
    <div className="container mt-5">
      <h2>Admin Dashboard</h2>

      <h5 className="mt-4">Add Restaurant</h5>
      <div className="card p-3 mb-4">
        <input className="form-control mb-2" placeholder="Name" value={newRestaurant.name} onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })} />
        <textarea className="form-control mb-2" placeholder="Description" value={newRestaurant.description} onChange={(e) => setNewRestaurant({ ...newRestaurant, description: e.target.value })} />
        <input className="form-control mb-2" placeholder="Address" value={newRestaurant.address} onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })} />
        <input className="form-control mb-2" placeholder="Phone" value={newRestaurant.phone} onChange={(e) => setNewRestaurant({ ...newRestaurant, phone: e.target.value })} />
        <ImageUpload folder="restaurants" onUploadComplete={(url) => setNewRestaurant({ ...newRestaurant, image_url: url })} />
        <select className="form-select mb-2" value={newRestaurant.owner_id} onChange={(e) => setNewRestaurant({ ...newRestaurant, owner_id: e.target.value })}>
          <option value="">-- Assign Owner (optional) --</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>{o.email}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={handleCreateRestaurant}>Add Restaurant</button>
      </div>

      <h5>Existing Restaurants</h5>
      {restaurants.map((r) => (
        <div key={r.id} className="card p-2 mb-2">
          <strong>{r.name}</strong> <span className="text-muted small">— {r.address}</span>
        </div>
      ))}

      <h5 className="mt-4">Manage User Roles</h5>
      {users.map((u) => (
        <div key={u.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
          <span>{u.email}</span>
          <select
            className="form-select w-auto"
            value={u.role}
            onChange={(e) => handleRoleChange(u.id, e.target.value)}
          >
            <option value="consumer">Consumer</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      ))}
    </div>
  );
}