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
        <p className="text-muted">Order #{order.id} — Status: <strong>{order.status}</strong></p>

        <hr />
        {order.items.map((item) => (
          <div key={item.id} className="d-flex justify-content-between">
            <span>{item.quantity} × {item.name}</span>
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