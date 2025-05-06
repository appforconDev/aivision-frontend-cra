import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const updateDynamoDB = async () => {
      const user_id = localStorage.getItem("user_id");
      const selectedArtists = JSON.parse(localStorage.getItem("selectedArtists") || "[]");

      if (!user_id || selectedArtists.length === 0) {
        toast.error("Invalid payment data. Please try again.");
        navigate("/submissions");
        return;
      }

      try {
        // Uppdatera DynamoDB med user_id och artist_ids
        await axios.post("/update-dynamodb", {
          user_id,
          artist_ids: selectedArtists,
        });

        // Rensa localStorage efter lyckad uppdatering
        localStorage.removeItem("selectedArtists");

        // Visa ett meddelande och navigera tillbaka till submissions
        toast.success("Artists successfully uploaded to Spotify!");
        navigate("/submissions");
      } catch (error) {
        console.error("Error updating DynamoDB:", error);
        toast.error("Failed to update artists. Please try again.");
      }
    };

    updateDynamoDB();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Payment Successful!</h1>
        <p className="text-white/80">Your artists are being uploaded to Spotify. Please wait...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;