import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

// Replace with your actual backend URL
const backendUrl = process.env.REACT_APP_BACKEND_URL as string;

// How often to check for status updates (in milliseconds)
const POLLING_INTERVAL = 5000; // 5 sekunder är ofta lagom

interface MusicStatusHandlerProps {
  artistId: string;
  onMusicReady: (songUrl: string) => void;
  onError?: (error: string) => void;
}

const MusicStatusHandler: React.FC<MusicStatusHandlerProps> = ({
  artistId,
  onMusicReady,
  onError
}) => {
  const [hasError, setHasError] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const clearPolling = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const checkStatus = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        throw new Error("User ID not found, please sign in again");
      }

      const { data } = await axios.post(
        `${backendUrl}/check-music-status`,
        { artistId, userId },
        { withCredentials: true }
      );

      if (!data.success) {
        throw new Error(data.error || "Unknown error from server");
      }

      // Om vi fått song_url är vi klara
      if (data.song_url) {
        clearPolling();
        onMusicReady(data.song_url);
      }
      // Annars är det pending, vi gör inget och väntar på nästa poll.

    } catch (err: any) {
      clearPolling();
      const msg = err.response?.data?.error || err.message || "Error checking music status";
      console.error("❌ Music status error:", msg);
      setHasError(true);
      onError?.(msg);
    }
  };

  useEffect(() => {
    // Kör en första gång direkt
    checkStatus();

    // Starta intervallet
    intervalRef.current = window.setInterval(checkStatus, POLLING_INTERVAL);

    // Rensa vid unmount eller fel
    return () => clearPolling();
  }, [artistId]);

  return (
    <div className="flex items-center justify-center space-x-2 text-white/60">
      {hasError ? (
        <span>❌ Failed to generate music.</span>
      ) : (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Generating music...</span>
        </>
      )}
    </div>
  );
};

export default MusicStatusHandler;
