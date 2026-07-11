import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyRestaurant, getRestaurantOrders, updateOrderStatus, getOrder } from "../services/api";

const STATUS_FLOW = ["pending", "paid", "completed", "cancelled"];

export default function OwnerOrders() {
  const { currentUser } = useAuth();
  const [myRestaurants, setMyRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState({}); // { orderId: { items: [...] } }

  useEffect(() => {
    async function loadList() {
      const list = await getMyRestaurant(currentUser);
      setMyRestaurants(list);
      if (list.length > 0) setSelectedId(list[0].id);
      else setLoading(false);
    }
    if (currentUser) loadList();
  }, [currentUser]);

  useEffect(() => {
    async function loadOrders() {
      if (!selectedId) return;
      setLoading(true);
      const data = await getRestaurantOrders(selectedId, currentUser);
      setOrders(data);
      setLoading(false);
    }
    loadOrders();
  }, [selectedId]);

  async function handleStatusChange(orderId, status) {
    const updated = await updateOrderStatus(orderId, status, currentUser);
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)));
  }

  async function toggleExpand(orderId) {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orderId);
    if (!expandedDetails[orderId]) {
      const full = await getOrder(orderId, currentUser);
      setExpandedDetails((prev) => ({ ...prev, [orderId]: full }));
    }
  }

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (myRestaurants.length === 0) return <div className="container mt-5">No restaurant assigned yet.</div>;

  return (
    <div className="container mt-5 pb-5">
      <h2 className="brand-font mb-4">Incoming Orders</h2>

      {myRestaurants.length > 1 && (
        <select className="form-select mb-4 w-auto" value={selectedId} onChange={(e) => setSelectedId(Number(e.target.value))}>
          {myRestaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      )}

      {orders.length === 0 && <p className="text-muted">No orders yet.</p>}

      {orders.map((order) => (
        <div key={order.id} className="card p-3 mb-2">
          <div
            className="d-flex justify-content-between align-items-center flex-wrap gap-2"
            style={{ cursor: "pointer" }}
            onClick={() => toggleExpand(order.id)}
          >
            <div>
              <strong>Order #{order.id}</strong>
              <span className="text-muted small ms-2">
                {order.guest_name || "Registered user"} — RM {parseFloat(order.total_amount).toFixed(2)}
              </span>
              <div className="text-muted small">
                {new Date(order.created_at).toLocaleString()} · {order.payment_method === "online" ? "Paid Online" : "Pay at Counter"}
              </div>
            </div>
            <div className="d-flex align-items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <select
                className="form-select w-auto"
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
              >
                {STATUS_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span style={{ fontSize: "0.8rem" }}>{expandedId === order.id ? "▲" : "▼"}</span>
            </div>
          </div>

          {expandedId === order.id && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--dinery-sage)" }}>
              {!expandedDetails[order.id] ? (
                <p className="text-muted small">Loading details...</p>
              ) : (
                <>
                  {order.guest_phone && (
                    <p className="text-muted small mb-2">📞 {order.guest_phone}</p>
                  )}
                  {order.table_number && (
                    <p className="text-muted small mb-2">🍽️ Table {order.table_number}</p>
                  )}
                  {expandedDetails[order.id].items.map((item) => (
                    <div key={item.id} className="d-flex justify-content-between py-1">
                      <span>{item.quantity} × {item.name}</span>
                      <span>RM {(item.price_at_order * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}