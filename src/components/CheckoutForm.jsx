import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function CheckoutForm({ onPaymentSuccess, total }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required", // stay on page instead of redirecting, since we handle success manually
    });

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      onPaymentSuccess(paymentIntent.id);
    } else {
      setError("Payment did not complete. Please try again.");
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p className="text-danger mt-2">{error}</p>}
      <button
        className="btn btn-success btn-lg w-100 mt-3"
        disabled={!stripe || processing}
        type="submit"
      >
        {processing ? "Processing..." : `Pay RM ${total.toFixed(2)}`}
      </button>
    </form>
  );
}