import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../services/stripe";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder, createPaymentIntent } from "../services/api";
import CheckoutForm from "../components/CheckoutForm";

export default function Cart() {
  const { cart, restaurantId, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("counter");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  // Fetch a new PaymentIntent whenever "online" is selected
  useEffect(() => {
    if (paymentMethod === "online" && cart.length > 0) {
      createPaymentIntent(total, currentUser)
        .then((data) => setClientSecret(data.clientSecret))
        .catch((err) => setError(err.message));
    }
  }, [paymentMethod]);

  async function finalizeOrder(stripePaymentId = null) {
    setError(null);

    if (!currentUser && (!guestName || !guestPhone)) {
      setError("Please enter your name and phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        restaurant_id: restaurantId,
        payment_method: paymentMethod,
        items: cart.map((i) => ({ menu_item_id: i.menu_item_id, quantity: i.quantity })),
        ...(stripePaymentId && { stripe_payment_id: stripePaymentId, status: "paid" }),
        ...(!currentUser && { guest_name: guestName, guest_phone: guestPhone }),
      };

      const order = await createOrder(orderData, currentUser);
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handlePayAtCounter() {
    finalizeOrder(); // no stripe id, stays "pending"
  }

  function handleStripeSuccess(paymentIntentId) {
    finalizeOrder(paymentIntentId); // order created only after payment confirmed
  }

  if (cart.length === 0) {
    return (
      <div className="container mt-5">
        <h2>Your cart is empty</h2>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <button className="btn btn-link mb-3" onClick={() => navigate(-1)}>&larr; Back to Menu</button>
      <h2>Your Order</h2>

      {cart.map((item) => (
        <div key={item.menu_item_id} className="d-flex justify-content-between align-items-center border-bottom py-2">
          <div>
            <strong>{item.name}</strong>
            <p className="text-muted mb-0">RM {item.price.toFixed(2)} each</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}>-</button>
            <span>{item.quantity}</span>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}>+</button>
            <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => removeFromCart(item.menu_item_id)}>✕</button>
          </div>
        </div>
      ))}

      <h4 className="text-end mt-3">Total: RM {total.toFixed(2)}</h4>

      {!currentUser && (
        <div className="mt-4">
          <h5>Your Details (Guest)</h5>
          <input className="form-control mb-2" placeholder="Full Name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
          <input className="form-control mb-2" placeholder="Phone Number" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
        </div>
      )}

      <div className="mt-4">
        <h5>Payment Method</h5>
        <div className="form-check">
          <input type="radio" className="form-check-input" id="counter" checked={paymentMethod === "counter"} onChange={() => setPaymentMethod("counter")} />
          <label className="form-check-label" htmlFor="counter">Pay at Counter</label>
        </div>
        <div className="form-check">
          <input type="radio" className="form-check-input" id="online" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} />
          <label className="form-check-label" htmlFor="online">Pay Online (Stripe)</label>
        </div>
      </div>

      {error && <p className="text-danger mt-2">{error}</p>}

      {paymentMethod === "counter" && (
        <button className="btn btn-success btn-lg w-100 mt-4" disabled={submitting} onClick={handlePayAtCounter}>
          {submitting ? "Placing Order..." : `Place Order (RM ${total.toFixed(2)})`}
        </button>
      )}

      {paymentMethod === "online" && clientSecret && (
        <div className="mt-4">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm onPaymentSuccess={handleStripeSuccess} total={total} />
          </Elements>
        </div>
      )}
    </div>
  );
}