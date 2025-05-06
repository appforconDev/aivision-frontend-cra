import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChevronLeft, Music, Award, MapPin, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import ArtistCard from "../components/ArtistCard";
import { Artist, AverageRating } from '../components/types';



const backendUrl = process.env.REACT_APP_BACKEND_URL




const MusicStatusHandler = ({
  artistId,
  initialStatus,
  onMusicReady
}: {
  artistId: string;
  initialStatus: string;
  onMusicReady: (songUrl: string) => void;
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const response = await axios.post(
          `${backendUrl}/check-music-status`,
          { artistId },
          { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
        );

        if (response.data.success) {
          if (response.data.song_url) {
            setStatus("completed");
            onMusicReady(response.data.song_url);
          } else if (response.data.status === "pending") {
            timeoutId = setTimeout(checkStatus, 5000); // Poll again after 5 seconds
          }
        } else {
          setError(response.data.error || "Failed to generate music");
          setStatus("error");
        }
      } catch (error) {
        console.error("Error checking music status:", error);
        setError("We are cooking up the song for you. Check back in a while");
        setStatus("error");
      }
    };

    if (status === "pending_music") {
      checkStatus();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [artistId, status, onMusicReady]);

  if (status === "pending_music") {
    return (
      <div className="flex items-center justify-center space-x-2 text-white/60 p-4 bg-white/5 rounded-lg">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Generating music...</span>
      </div>
    );
  }

  if (status === "error" && error) {
    return (
      <div className="text-red-500 p-4 bg-red-500/10 rounded-lg">
        {error}
      </div>
    );
  }

  return null;
};

const StarRating = ({
  artistId,
  currentPoints,
  onVote
}: {
  artistId: string;
  currentPoints: number;
  onVote: (points: number) => void;
}) => {
  const [selectedStars, setSelectedStars] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  const handleStarClick = (stars: number) => {
    if (!hasVoted) {
      setSelectedStars(stars);
      onVote(stars);
      setHasVoted(true);
    }
  };

  return (
    <div className="flex items-center space-x-2 mt-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleStarClick(star)}
          disabled={hasVoted}
          className={`text-2xl ${
            star <= selectedStars ? "text-yellow-400" : "text-gray-400"
          }`}
        >
          ★
        </button>
      ))}
      {hasVoted && (
        <span className="text-sm text-gray-400 ml-2">
          You voted {selectedStars} star(s)
        </span>
      )}
    </div>
  );
};



const SingleArtist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [backgroundStoryError, setBackgroundStoryError] = useState<string | null>(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFullStory, setShowFullStory] = useState(false);
  const [averageRatings, setAverageRatings] = useState<Record<string, AverageRating>>({});
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const toggleArtistSelection = (artistId: string) => {
    setSelectedArtists((prev) =>
      prev.includes(artistId)
        ? prev.filter((id) => id !== artistId)
        : prev.length < 5
        ? [...prev, artistId]
        : prev
    );
  };


  const updateMetaTags = (
    title: string,
    description: string,
    imageUrl: string,
    url: string
  ): void => {
  
    document.title = title;
  
  
    type MetaTag = {
      name?: string;
      property?: string;
      content: string;
    };
    
    const updateMetaTags = (
      title: string,
      description: string,
      imageUrl: string,
      url: string
    ): void => {
      document.title = title;
    
      const metaTags = new Map<string, MetaTag>([
        ["description", { name: "description", content: description }],
        ["og:title", { property: "og:title", content: title }],
        ["og:description", { property: "og:description", content: description }],
        ["og:image", { property: "og:image", content: imageUrl }],
        ["og:url", { property: "og:url", content: url }],
        ["og:type", { property: "og:type", content: "website" }],
        ["twitter:card", { name: "twitter:card", content: "summary_large_image" }],
        ["twitter:title", { name: "twitter:title", content: title }],
        ["twitter:description", { name: "twitter:description", content: description }],
        ["twitter:image", { name: "twitter:image", content: imageUrl }],
      ]);
    
      metaTags.forEach((tag: MetaTag, key: string) => {
        let element = document.querySelector(`meta[${tag.property ? "property" : "name"}="${key}"]`);
    
        if (!element) {
          element = document.createElement("meta");
          if (tag.property) {
            element.setAttribute("property", tag.property);
          } else if (tag.name) {
            element.setAttribute("name", tag.name);
          }
          document.head.appendChild(element);
        }
    
        element.setAttribute("content", tag.content);
      });
    };
    
  };

  // Fetch artist data
  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await axios.get(`${backendUrl}/artist/${id}`);
        const artistData = response.data;
        artistData.points = parseInt(artistData.points, 10) || 0;

        // Update currentPoints after artist is loaded
        setCurrentPoints(artistData.points);

        // Uppdatera metataggar
        updateMetaTags(
          `${artistData.name} - AI Vision Contest`,
          artistData.background_story,
          artistData.image_url,
          `https://www.aivisioncontest.com/artists/${artistData.artist_id}`
        );

        // Check if background_story is a URL
        if (typeof artistData.background_story === 'string' && artistData.background_story.startsWith('http')) {
          try {
            const storyResponse = await axios.get(artistData.background_story);
            artistData.background_story = storyResponse.data;
            setBackgroundStoryError(null);
          } catch (storyError) {
            console.error("Error fetching background story:", storyError);
            artistData.background_story = "Error loading background story.";
            setBackgroundStoryError("Error loading background story.");
          }
        } else {
          setBackgroundStoryError(null);
        }

        setArtist(artistData);
      } catch (error) {
        console.error("Error fetching artist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [id]);

  // Fetch favorites
  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    if (user_id) {
      fetchFavorites(user_id);
    }
  }, [favorites]); // Kör när `favorites` ändras

  const fetchAverageRating = async (artistId: string) => {
    try {
      const response = await axios.get(`${backendUrl}/artist/${artistId}/average-rating`);
      if (response.data.success) {
        setAverageRatings((prev) => ({
          ...prev,
          [artistId]: response.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching average rating:", error);
    }
  };

  const handleArtistUpdate = (updatedArtist: Artist) => {
    setArtist(updatedArtist); // Uppdatera den enskilda artisten
  };
  
const fetchFavorites = async (user_id: string) => {
  try {
    const response = await axios.get(`${backendUrl}/favorites`, {
      params: { user_id },
    });
    const newFavorites = response.data.favorites;

    // Uppdatera bara om favorites har ändrats
    if (JSON.stringify(newFavorites) !== JSON.stringify(favorites)) {
      setFavorites(newFavorites);
    }

    return newFavorites;
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
};
const toggleFavorite = async (artistId: string) => {
  const user_id = localStorage.getItem("user_id");
  if (!user_id) {
    alert("Please sign in to add favorites.");
    return;
  }

  const isFavorite = favorites.includes(artistId);
  try {
    if (isFavorite) {
      await axios.delete(`${backendUrl}/favorites`, {
        data: { user_id, artist_id: artistId },
      });
      // Uppdatera favorites lokalt genom att ta bort artistId
      setFavorites((prev) => prev.filter((id) => id !== artistId));
    } else {
      await axios.post(`${backendUrl}/favorites`, {
        user_id,
        artist_id: artistId,
      });
      // Uppdatera favorites lokalt genom att lägga till artistId
      setFavorites((prev) => [...prev, artistId]);
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
  }
};


const checkLogin = () => {
  const user_id = localStorage.getItem("user_id");
  if (!user_id) {
    toast.error("You must be logged in to vote.");
    navigate("/login");
    return false;
  }
  return true;
};

const handleVote = async (points: number) => {
  if (!checkLogin()) return;

  try {
    const user_id = localStorage.getItem("user_id");
    const voteResponse = await axios.post(
      `${backendUrl}/vote`,
      { artistId: id, points, user_id },
      { withCredentials: true }
    );

    if (voteResponse.data.success) {
      setCurrentPoints((prev) => prev + points);
      toast.success("Vote submitted successfully!");
    } else {
      toast.error(voteResponse.data.error || "Failed to submit vote.");
    }
  } catch (error) {
    console.error("Error submitting vote:", error);
    toast.error("You have already voted for this artist.");
  }
};


  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading artist...</span>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-white">Artist not found</div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-[#0A0A0F] py-6 px-4">
      
      <div className="container mx-auto max-w-xs sm:max-w-md lg:max-w-lg flex flex-col items-center">
        <Button
          variant="ghost"
          onClick={() => navigate("/artists")}
          className="mb-4 mt-4 text-white/60 hover:text-white self-start"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Artists
        </Button>
        <ArtistCard
          key={artist.artist_id}
          artist={artist}
          averageRating={averageRatings[artist.artist_id]}
          onArtistUpdate={handleArtistUpdate}
          showSpotifyIcon={false}
          showDeleteIcon={false}
          onSelectArtist={toggleArtistSelection}
          isSelected={selectedArtists.includes(artist.artist_id)}
          isFavorite={favorites.includes(artist.artist_id)}
          onToggleFavorite={toggleFavorite}
          backendUrl={backendUrl}
          useNeonBorder={false}
        />
      </div>
    </div>
  );
  
};

export default SingleArtist;