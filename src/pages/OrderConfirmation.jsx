import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrder } from "../services/api";

export default function OrderConfirmation() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id, currentUser).then(setOrder).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (!order) return <div className="container mt-5">Order not found.</div>;

  return (
    <div className="container mt-5">
      <div className="card p-4">
      <h2>✅ Order Placed!</h2>
      <p className="text-muted mb-1">
        From <strong>{order.restaurant_name}</strong>
      </p>
      <p className="text-muted">Order #{order.id} — Status: <strong>{order.status}</strong></p>

        <hr />
      {order.items.map((item) => (
        <div key={item.id} className="d-flex justify-content-between align-items-center py-2">
          <div className="d-flex align-items-center gap-3">
            <img
              src={item.image_url || "https://placehold.co/50x50/E8F0EC/1B4B43?text=🍽"}
              alt={item.name}
              style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
            />
            <span>{item.quantity} × {item.name}</span>
          </div>
          <span>RM {(item.price_at_order * item.quantity).toFixed(2)}</span>
        </div>
      ))}
        <hr />
        <h5 className="text-end">Total: RM {parseFloat(order.total_amount).toFixed(2)}</h5>
        <p className="text-muted">Payment: {order.payment_method === "online" ? "Paid Online" : "Pay at Counter"}</p>

        <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
      </div>
    </div>
  );
}