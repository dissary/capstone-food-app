import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../services/api";

export default function OrderHistory() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      getMyOrders(currentUser).then(setOrders).finally(() => setLoading(false));
    }
  }, [currentUser]);

  if (!currentUser) return <div className="container mt-5">Please log in to view your orders.</div>;
  if (loading) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <h2>My Orders</h2>
      {orders.length === 0 && <p>No orders yet.</p>}
      {orders.map((order) => (
        <Link to={`/order-confirmation/${order.id}`} key={order.id} className="text-decoration-none text-dark">
          <div className="card p-3 mb-2">
            <div className="d-flex justify-content-between">
              <span className="fw-bold">{order.restaurant_name}</span>
              <span className="badge bg-secondary">{order.status}</span>
            </div>
            <div className="text-muted small">Order #{order.id}</div>
            <div className="text-muted small">RM {parseFloat(order.total_amount).toFixed(2)} — {new Date(order.created_at).toLocaleDateString()}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}