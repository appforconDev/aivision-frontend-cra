import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedArtists, totalPrice } = location.state;

  useEffect(() => {
    const handlePayment = async () => {
      const stripe = await loadStripe("your-stripe-publishable-key");

      const response = await fetch("/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedArtists,
          totalPrice,
        }),
      });

      const { clientSecret } = await response.json();

      const { error } = await stripe!.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: "https://www.aivisioncontest.com/", // Navigera till PaymentSuccess efter betalning
        },
      });

      if (error) {
        console.error("Payment failed:", error);
        navigate("/submissions"); // Navigera tillbaka om betalningen misslyckas
      }
    };

    handlePayment();
  }, [selectedArtists, totalPrice, navigate]);

  return <div>Processing payment...</div>;
};

export default Checkout;