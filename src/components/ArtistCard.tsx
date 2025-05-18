import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Card } from "components/ui/card";
import { Award, Music, MapPin, Loader2, Star, Facebook, Twitter, Linkedin, Trash, X, Instagram } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "components/ui/use-toast";
import MusicStatusHandler from "./MusicStatusHandler";
import { Artist, AverageRating } from './types';
import StarRating from './StarRating';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin, FaTiktok } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import ReactModal from 'react-modal';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { toPng } from 'html-to-image'
import backendUrl from '../config';

const ffmpeg = new FFmpeg({
  log: true,
  corePath:   'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.2/dist/ffmpeg-core.js',
  wasmPath:   'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.2/dist/ffmpeg-core.wasm',
  workerPath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.2/dist/ffmpeg-core.worker.js',
});
let ffmpegReady = false;

async function ensureFFmpegLoaded(): Promise<void> {
  if (ffmpegReady) return;
  console.log("⏳ Laddar FFmpeg...");
  try {
    await ffmpeg.load();
    ffmpegReady = true;
    console.log("✅ FFmpeg laddad!");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("❌ Kunde inte ladda FFmpeg:", e);
    throw new Error("Failed to load FFmpeg: " + msg);
  }
}


interface ArtistCardProps {
  artist: Artist,
  averageRating?: AverageRating;
  isFavorite: boolean;
  onToggleFavorite: (artistId: string) => void;
  onArtistUpdate: (updatedArtist: Artist) => void;
  useNeonBorder?: boolean;
  showDeleteIcon?: boolean; // Prop för att visa/dölja Delete-ikonen
  onDelete?: (artistId: string) => void; // Prop för att hantera borttagning
  showSpotifyIcon?: boolean; // Ny prop för att visa/dölja Spotify-ikonen
  onSelectArtist: (artistId: string) => void; // Ny prop
  isSelected: boolean; // Ny prop
  //backendUrl: string;
}

const ArtistCard: React.FC<ArtistCardProps> = React.memo(({
  artist,
  isFavorite,
  onToggleFavorite,
  onArtistUpdate,
  useNeonBorder = false,
  showDeleteIcon = false,
  onDelete,
  showSpotifyIcon = false, // Standardvärde: false
  onSelectArtist, // Ny prop
  isSelected, // Ny prop
  //backendUrl = "",
}) => {
  const navigate = useNavigate();
  const [showMusicStatus, setShowMusicStatus] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>("pending");

  const [generating, setGenerating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [userRating, setUserRating] = useState<number | undefined>(undefined);
  const [averageRating, setAverageRating] = useState<AverageRating | null>(null);
  const [showFullStory, setShowFullStory] = useState(false);
  const shareUrl = `https://www.aivisioncontest.com/api/ssr/artists/${artist.artist_id}`;
  const shareText = `Check out ${artist.name}!`;
  const [username, setUsername] = useState<string>("");
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoGenerating, setVideoGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
const [modalContent, setModalContent] = useState<{title: string; message: string}>({title: '', message: ''});

const showModal = (title: string, message: string) => {
  setModalContent({title, message});
  setIsModalOpen(true);
};

async function proxyAllImagesWithin(el: HTMLElement) {
  const images = Array.from(el.querySelectorAll<HTMLImageElement>('img'));
  const originalSrcs = images.map(img => img.src);

  await Promise.all(images.map(async img => {
    try {
      const res = await fetch(img.src, { mode: 'cors' });
      const blob = await res.blob();
      img.src = URL.createObjectURL(blob);
    } catch (err) {
      console.warn('⚠️ Could not proxy', img.src, err);
    }
  }));

  return () => {
    // restore originals
    images.forEach((img, i) => {
      img.src = originalSrcs[i];
    });
  };
}

const handleTikTokDownload = async () => {
  if (!cardRef.current || !artist.song_url) {
    toast({
      title: "Error",
      description: "Missing card or song",
      variant: "destructive"
    });
    return;
  }

  setVideoGenerating(true);
  setVideoUrl(null);

  try {
    // Skapa PNG av ArtistCard
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#0A0A0F',
      scale: 2,
    });
    const dataUrl = canvas.toDataURL('image/png');

    // Skicka PNG + MP3-URL till backend
    const response = await fetch(`${backendUrl}/create-tiktok-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardImage: dataUrl,
        audioUrl: artist.song_url,
        artistName: artist.name.replace(/\s+/g, '_'),
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to generate video');
    }

    const { url } = await response.json();
    setVideoUrl(url);

  } catch (error) {
    toast({
      variant: "destructive",
      title: "Video Generation Failed",
      description: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    setVideoGenerating(false);
  }
};






  
  const cardClass = useMemo(() => {
    return `p-4 glass border-white/20 max-w-xs sm:max-w-md lg:max-w-2xl ${useNeonBorder ? 'neon-border' : ''} rounded-lg`;
  }, [useNeonBorder]);

  const fetchAverageRating = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/artist/${artist.artist_id}/average-rating`);
      if (response.data.success) {
        setAverageRating(response.data);
      }
    } catch (error) {
      console.error("Error fetching average rating:", error);
    }
  }, [artist.artist_id, backendUrl]);

  const handleRate = useCallback(async (rating: number): Promise<void> => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please sign in to rate.",
        });
        return;
      }

      const response = await axios.post(`${backendUrl}/vote`, {
        artistId: artist.artist_id,
        points: rating,
        user_id: userId,
      });

      if (response.data.success) {
        setUserRating(rating);
        fetchAverageRating();
        toast({
          title: "Success!",
          description: "Your vote has been submitted successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.error || "Failed to submit your vote.",
        });
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  }, [artist.artist_id, backendUrl, fetchAverageRating]);

  useEffect(() => {
    fetchAverageRating();
  }, [fetchAverageRating]);

  

  useEffect(() => {
    if (artist.status === "pending_music" || artist.status === "processing") {
      setShowMusicStatus(true);
      setGenerationStatus(artist.status);
    } else {
      setShowMusicStatus(false);
    }
  }, [artist.status]);




  const retryGeneration = useCallback(async (artistId: string) => {
    try {
      setRetryCount(prev => prev + 1);
      setGenerating(true);

      const userId = localStorage.getItem("user_id");
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User ID not found. Please sign in again.",
        });
        navigate("/");
        return;
      }

      const response = await axios.post(
        `${backendUrl}/generate-artist-content`,
        { artistId, userId },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast({
          title: "Success!",
          description: "AI artist created! Monitoring music generation status...",
        });
        setShowMusicStatus(true);
        setGenerationStatus("processing");
      } else {
        throw new Error(response.data.error || "Unknown error during generation.");
      }
    } catch (error: any) {
      console.error("❌ Generation retry error:", error);
      setGenerating(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate artist content.",
      });
    }
  }, [backendUrl, navigate]);

  useEffect(() => {
    if (artist.song_url) {
      setShowMusicPlayer(true);
    }
  }, [artist.song_url]);

  const handleMusicReady = useCallback((songUrl: string) => {
    console.log("🎵 Music is ready! URL:", songUrl);
    toast({
      title: "Music Generated!",
      description: "Your AI artist's song is now available.",
      duration: 5000,
    });
    setShowMusicStatus(false);
    setGenerating(false);

    onArtistUpdate({
      ...artist,
      song_url: songUrl,
      status: "completed",
    });
  }, [artist, onArtistUpdate]);

  const handlePollingError = useCallback((error: string) => {
    console.error("❌ Music polling error:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Problem med musikgenerering: " + error,
    });
    setGenerating(false);
  }, []);

  const starRatingComponent = useMemo(() => (
    <StarRating
      artistId={artist.artist_id}
      averageRating={averageRating?.average_rating ?? 0}
      onVote={handleRate}
      currentUserRating={userRating}
    />
  ), [artist.artist_id, averageRating?.average_rating, handleRate, userRating]);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) return;

        const response = await axios.get(`${backendUrl}/user/${user_id}/username`, {
          withCredentials: true,
        });

        if (response.data.username) {
          setUsername(response.data.username);
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername();
  }, [backendUrl]);

  useEffect(() => {
    if (artist.status === "completed" && artist.song_url) {
      setShowMusicPlayer(true);
    } else {
      setShowMusicPlayer(false);
    }
  }, [artist.status, artist.song_url]);

  const handleSocialClick = (e: React.MouseEvent, platform: string) => {
    e.stopPropagation();
    const ua = navigator.userAgent;
    const isCrawler = /facebookexternalhit|Twitterbot|Pinterest/i.test(ua);
    
    if (isCrawler) {
      window.open(
        `https://www.aivisioncontest.com/api/ssr/artists/${artist.artist_id}`,
        '_blank'
      );
    }
    // Normal sharing will proceed via the href
  };


  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    
    showModal("Generating image...", "Please wait while we create your shareable image");
  
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0A0A0F',
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = `${artist.name.replace(/\s+/g, '_')}_AI_Artist.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      showModal("Image saved!", "You can now share it on Instagram or TikTok");
    } catch (error) {
      showModal("Error", "Failed to save image");
    }
  };

  const handleInstagramShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  
    // Ersätt toast med din modal
    setModalContent({
      title: "Share to Instagram",
      message: "Choose an option below to share this artist"
    });
    setIsModalOpen(true);
  };

  return (
    
  <Card  ref={cardRef} className={cardClass} onClick={() => navigate(`/artists/${artist.artist_id}`)}>
    {videoGenerating && (
  <div
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-75"
  >
    <div className="loader mb-4"><Loader2 className="h-6 w-6 text-[#FE2C55] animate-spin" /></div>
    <p className="text-white text-lg">Creating video…</p>
  </div>
)}
    <div className="flex items-center justify-between mb-4">
      <Music className="h-6 w-6 text-primary" />
      <div className="flex-grow flex justify-center">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white truncate max-w-xs text-center">
        {artist.name}
      </h2>
    </div>


      <div className="flex items-center space-x-1 text-primary">
        
        <span className="text-xl">{artist.points || 0} </span>
        <Star className="h-6 w-6" />
      </div>
    </div>

    {artist.image_url && (
      <div className="mb-4 rounded-lg overflow-hidden">
        <img
          src={artist.image_url}
          crossOrigin="anonymous"
          alt={artist.name}
          className="w-full h-auto object-contain rounded-lg"
          onError={(e) => {
            console.error("Image load error for artist:", {
              artistName: artist.name,
              imageUrl: artist.image_url,
              error: e,
            });
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    )}

    {artist.status === "pending" && (
      <div className="flex items-center justify-center space-x-2 text-white/60 mb-4">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Generating content...</span>
        
      </div>
    )}

{artist.song_url ? (
  <div className="mb-4 p-2 bg-black/20 rounded-md audio-player-wrapper">
    <h2 className="text-2xl font-semibold text-white mb-4 truncate max-w">
      {artist.song_title
        ? artist.song_title.replace(/"/g, "")
        : "Latest Track"}
    </h2>
    <audio
      controls
      className="w-full"
      src={artist.song_url}
      crossOrigin="anonymous"
    >
      <source src={artist.song_url} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  </div>
) : showMusicStatus && (
  <div className="mb-4 p-2 bg-black/20 rounded-md">
    <MusicStatusHandler
      artistId={artist.artist_id}
      onMusicReady={handleMusicReady}
      onError={handlePollingError}
    />
  </div>
)}


    {averageRating && (
      <div className="flex items-center space-x-2 mb-8">
        <StarRating
          artistId={artist.artist_id}
          averageRating={averageRating.average_rating}
          onVote={handleRate}
          currentUserRating={userRating}
        />
        <span className="text-sm text-white/60">
          ({averageRating.total_votes}  votes)
        </span>
      </div>
    )}

    <div className="w-full">
      
      <p className={`text-white/70 mb-4 ${showFullStory ? '' : 'line-clamp-4'}`}>
        {artist.background_story}
      </p>
      <button
        onClick={() => setShowFullStory(!showFullStory)}
        className="text-primary text-sm"
      >
        {showFullStory ? 'See Less' : 'See More'}
      </button>
    </div>

    <div className="text-sm text-white/40 pt-4">
      <div className="flex justify-center mb-4">
        <div className="flex items-center gap-x-3">
          {username ? (
            <Link
              to={`/${artist.username}`}
              onClick={(e) => e.stopPropagation()}
              className="font-medium hover:text-white transition-colors"
            >
              {artist.username}
            </Link>
          ) : (
            <span className="font-medium">My Artists</span>
          )}
          <MapPin className="h-4 w-4" />
          <span>{artist.country}</span>
          <span className="mx-2">|</span>
          <span className="capitalize">{artist.music_style}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
      <div className="flex items-center gap-x-4">
  {/* Facebook */}
  <a
    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
    target="_blank"
    rel="noopener noreferrer"
    onClick={(e) => {
      e.stopPropagation();
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        'popup',
        'width=600,height=500'
      );
      e.preventDefault();
    }}
  >
    <FaFacebookF className="h-6 w-6 text-white/80 hover:text-[#1877F2] transition-colors" />
  </a>

  {/* Twitter */}
  <a
    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
    target="_blank"
    rel="noopener noreferrer"
    onClick={(e) => {
      e.stopPropagation();
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
        'popup',
        'width=600,height=500'
      );
      e.preventDefault();
    }}
  >
    <FaTwitter className="h-6 w-6 text-white/80 hover:text-[#1DA1F2] transition-colors" />
  </a>

  {/* Instagram - Ny implementation */}
  <button
    onClick={handleInstagramShare}
    className="p-2 hover:text-[#E1306C] transition-colors"
    aria-label="Share on Instagram"
  >
    <FaInstagram className="h-6 w-6 text-white/80 hover:text-[#E1306C]" />
  </button>

  {/* TikTok */}
  <button
  onClick={(e) => {
    e.stopPropagation()
    console.log("TikTok-knappen klickad")
    handleTikTokDownload()
  }}
  disabled={videoGenerating}
  className="p-2 hover:text-[#FE2C55] transition-colors"
>
  {videoGenerating ? (
    <Loader2 className="h-6 w-6 text-[#FE2C55] animate-spin" />
  ) : (
    <FaTiktok className="h-6 w-6 text-white/80 hover:text-[#FE2C55]" />
  )}
</button>
</div>
<ReactModal
  isOpen={isModalOpen}
  onRequestClose={() => setIsModalOpen(false)}
  style={{
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#0A0A0F',
      border: '1px solid #ffffff20',
      borderRadius: '8px',
      padding: '20px',
      color: 'white',
      width: '90%',
      maxWidth: '400px'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)'
    }
  }}
>
  <h2 className="text-xl font-bold mb-2">{modalContent.title}</h2>
  <p className="mb-4">{modalContent.message}</p>
  
  <div className="flex flex-col space-y-3">
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setModalContent({
            title: "Success!",
            message: "Link copied to clipboard!"
          });
        } catch (error) {
          setModalContent({
            title: "Error",
            message: "Failed to copy link"
          });
        }
      }}
      className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
    >
      Copy Profile Link
    </button>
    
    <button
      onClick={() => {
        handleSaveImage();
        setIsModalOpen(false);
      }}
      className="px-3 py-2 bg-[#E1306C] text-white rounded-md hover:bg-[#C13584] flex items-center justify-center"
    >
      <FaInstagram className="mr-2" />
      Save Image for Story
    </button>
    
    <button 
      onClick={() => setIsModalOpen(false)}
      className="mt-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
    >
      Cancel
    </button>
  </div>
</ReactModal>


        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(artist.artist_id);
            }}
            className="p-1 hover:text-red-500 transition-colors"
          >
            {isFavorite ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-8 w-8 text-secondary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-8 w-8 text-secondary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Spotify and Trash icons */}
      {(showSpotifyIcon || showDeleteIcon) && (
        <div className="flex justify-end mt-2">
          {showSpotifyIcon && (
             <button
             onClick={(e) => {
               e.stopPropagation(); // Förhindra att kortets onClick triggas
               onSelectArtist(artist.artist_id);
             }}
             
             className="flex items-center justify-center mx-2"
           >
              <svg
                className={`h-6 w-6 ${
                  isSelected ? "text-green-500" : "text-white/40"
                } hover:text-green-600 transition-colors`}
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.573 17.305c-.23.36-.715.474-1.075.244-2.98-1.82-6.73-2.23-11.14-1.22-.414.1-.8-.17-.9-.58-.1-.41.17-.8.58-.9 4.78-1.16 8.93-.68 12.23 1.38.36.23.47.715.24 1.076zm1.48-3.43c-.28.44-.87.58-1.31.3-3.41-2.09-8.61-2.7-12.64-1.48-.5.15-1.03-.12-1.18-.62-.15-.5.12-1.03.62-1.18 4.63-1.4 10.28-.74 14.16 1.7.44.28.58.87.3 1.31zm.13-3.6c-4.07-2.42-10.79-2.64-14.66-1.46-.6.18-1.23-.14-1.41-.74-.18-.6.14-1.23.74-1.41 4.38-1.32 11.77-1.07 16.43 1.68.56.33.74 1.05.41 1.61-.33.56-1.05.74-1.61.41z"
                />
              </svg>
              </button>
          )}
          {showDeleteIcon && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(artist.artist_id);
              }}
              className="p-1 text-white/40 hover:text-red-600 transition-colors"
            >
              <Trash className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </div>
    {videoUrl && (
  <div className="mt-6 space-y-4 text-center">
    {/* 1) Videopreview */}
    <video
      src={videoUrl}
      controls
      className="mx-auto rounded shadow-lg"
      style={{ maxWidth: "100%", height: "auto" }}
      playsInline
    />

    {/* 2) Instruktion för sparande */}
    <p className="text-gray-300 text-sm">
      För att spara på iPhone: tryck och håll kvar videon ovan och välj “Spara video”.
    </p>

    <div className="flex justify-center space-x-4">
      {/* 3a) Share via Web Share API */}
      {navigator.share && (
        <button
          onClick={async () => {
            try {
              const resp = await fetch(videoUrl);
              const blob = await resp.blob();
              const file = new File(
                [blob],
                `${artist.name.replace(/\s+/g, "_")}_tiktok.mp4`,
                { type: "video/mp4" }
              );
              await navigator.share({
                files: [file],
                title: "Min TikTok-video",
                text: "Här är videon jag skapade!",
              });
            } catch (e) {
              console.warn("Share misslyckades:", e);
            }
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-lg"
        >
          Dela video
        </button>
      )}

      {/* 3b) Fallback-länk som öppnar i ny flik */}
      <a
        href={videoUrl}
        target="_blank"
        rel="noreferrer"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Öppna i ny flik
      </a>
    </div>
  </div>
)}
  </Card>
  
);


});

export default React.memo(ArtistCard);
