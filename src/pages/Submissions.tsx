import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Star, ChevronLeft, ChevronRight, Trash } from "lucide-react";
import { Award, Music, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../components/AuthContext"; // Importera AuthContext
import ArtistCard from "../components/ArtistCard"; // Importera ArtistCard
import type { Artist } from "../components/types";





type AverageRating = {
  average_rating: number;
  total_votes: number;
};

const Submissions = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [averageRatings, setAverageRatings] = useState<Record<string, AverageRating>>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArtists, setTotalArtists] = useState(0);
  const artistsPerPage = 6;
  const navigate = useNavigate();
  const { isAuthenticated, getToken } = useAuth(); // Hämta isAuthenticated och getToken från AuthContext
  const [favorites, setFavorites] = useState<string[]>([]); // Lagra favorit-artist-ID:n
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [username, setUsername] = useState<string>("");
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);

  const toggleArtistSelection = (artistId: string) => {
    console.log("Artist selected:", artistId); // Lägg till denna rad
    setSelectedArtists((prev) =>
      prev.includes(artistId)
        ? prev.filter((id) => id !== artistId) // Avmarkera om redan vald
        : prev.length < 5
        ? [...prev, artistId] // Lägg till om färre än 5 valda
        : prev // Ignorera om redan 5 valda
    );
  };

  const PRICE_IDS = {
    SONG_1: "price_1QwoPwB3kdCfGA3pfkzSBEGp", // Ersätt med ditt price_id för 1 låt
    SONGS_2_5: "price_1Qwoc8B3kdCfGA3pBEnXYDTW", // Ersätt med ditt price_id för 2-5 låtar
  };

  const getPriceId = (songCount: number): string => {
    switch (songCount) {
      case 1:
        return PRICE_IDS.SONG_1;
      case 2:
      case 3:
      case 4:
      case 5:
        return PRICE_IDS.SONGS_2_5;
      default:
        throw new Error("Invalid song count");
    }
  };

  const handlePurchase = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
  
      if (!user_id) {
        toast.error("User ID not found. Please log in again.");
        return;
      }
  
      const priceId = getPriceId(selectedArtists.length);

       // Skicka data till backend för att ladda upp till DynamoDB
    const response = await axios.post(`${backendUrl}/upload-to-dynamo`, {
      user_id: user_id,
      artist_ids: selectedArtists,
    });
  
     // const response = await axios.post("http://localhost:5000/api/stripe/create-checkout-session", {
       // user_id: user_id,
        // price_id: priceId,
       // artist_ids: selectedArtists,
    //  });
  
      if (response.data.url) {
        window.location.href = response.data.url; // Omdirigera till Stripe Checkout
      } else {
        toast.error("No URL received from backend. Please try again.");
      }
    } catch (error) {
      console.error("Error purchasing songs:", error);
      toast.error("Failed to initiate purchase. Please try again.");
    }
  };

  console.log("Selected artists:", selectedArtists); // Lägg till denna rad

  const fetchUserArtists = async () => {
    try {
      setLoading(true);
      const user_id = localStorage.getItem("user_id"); // Hämta user_id från localStorage
      if (!user_id) {
        toast.error("User not logged in");
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${backendUrl}/user/artists?user_id=${user_id}&page=${currentPage}&per_page=${artistsPerPage}`,
        { withCredentials: true }
      );

      if (response.data.error) {
        console.error("Error fetching user artists:", response.data.error);
        toast.error("Failed to fetch submissions. Please try again.");
        return;
      }

      const artistsData = response.data.artists || [];
      setArtists(artistsData);
      setTotalArtists(response.data.total_artists || 0);

      // Spara username om det finns i svaret
      if (response.data.username) {
        setUsername(response.data.username);
      }

      // Hämta medelvärden för alla artister
      artistsData.forEach((artist: Artist) => {
        fetchAverageRating(artist.artist_id);
      });
    } catch (error) {
      console.error("Error fetching user artists:", error);
      toast.error("An error occurred while fetching submissions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageRating = async (artistId: string) => {
    try {
      const response = await axios.get(
        `${backendUrl}/artist/${artistId}/average-rating`
      );
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

  const handleDeleteArtist = async (artistId: string) => {
    if (window.confirm("Are you sure you want to delete this artist?")) {
      if (!isAuthenticated) {
        console.error("User not authenticated");
        navigate("/"); // Om användaren inte är inloggad, navigera till login-sidan
        return;
      }
  
      const token = getToken(); // Hämta access token
      await deleteArtist(artistId, token); // Skicka artistId och token till deleteArtist
    }
  };

  const deleteArtist = async (artistId: string, token: string) => {
    try {
      const response = await axios.delete(
        `${backendUrl}/delete-artist/${artistId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Skicka token i Authorization header
          },
        }
      );

      if (response.data.success) {
        toast.success("Artist deleted successfully!");
        fetchUserArtists(); // Uppdatera listan med artister efter borttagning
      } else {
        toast.error("Failed to delete artist.");
      }
    } catch (error) {
      console.error("Error deleting artist:", error);
      toast.error("An error occurred while deleting the artist.");
    }
  };

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

  useEffect(() => {
    fetchUserArtists();
    fetchUsername();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(totalArtists / artistsPerPage);

  const generatePageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const StarRating = ({ averageRating }: { averageRating: number }) => {
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating - fullStars >= 0.5;

    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < fullStars
                ? "text-yellow-400 fill-yellow-400"
                : hasHalfStar && index === fullStars
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-400"
            }`}
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");

    if (user_id) {
      fetchFavorites(user_id); // Skicka user_id till fetchFavorites
    }
  }, []);

  const fetchFavorites = async (user_id: string) => {
    try {
      const response = await axios.get(`${backendUrl}/favorites`, { params: { user_id } });

      const favoriteArtistIds = response.data.favorites;
      setFavorites(favoriteArtistIds);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async (artistId: string) => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      alert("Please sign in to add favorites.");
      return;
    }

    if (favorites.includes(artistId)) {
      const response = await axios.delete(`${backendUrl}/favorites`, {
        data: { user_id, artist_id: artistId },
      });
      if (response.status === 200) {
        setFavorites((prev) => {
          const updatedFavorites = prev.filter((id) => id !== artistId);
          return updatedFavorites;
        });
      }
    } else {
      const response = await axios.post(`${backendUrl}/favorites`, {
        user_id,
        artist_id: artistId,
      });
      if (response.status === 200) {
        setFavorites((prev) => {
          const updatedFavorites = [...prev, artistId];
          return updatedFavorites;
        });
      }
    }
  };

  const handleArtistUpdate = (updatedArtist: Artist) => {
    setArtists((prevArtists) =>
      prevArtists.map((artist) =>
        artist.artist_id === updatedArtist.artist_id ? updatedArtist : artist
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-24 px-4">
             <div className="max-w-full sm:max-w-[94%] md:max-w-[94%] lg:max-w-[94%] xl:max-w-[94%] mx-auto w-[94%]">

        <div className="flex flex-col justify-center items-center text-center mb-8 mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-secondary">
            {username ? `${username}'s Artists` : "My Artists"}
          </h1>
          <p className="text-xl mb-8 max-w-2xl text-white/80">
            Your own curated gallery of AI-generated music talents. Here, you can browse through the
            artists you've created and delve into the unique musical styles each one embodies. This
            space allows you to keep track of your favorite creations and remove any that no longer
            align with your current tastes. Manage your lineup of digital musicians effortlessly,
            ensuring your artist roster is always perfectly tuned to your preferences.
          </p>
          {selectedArtists.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button
               onClick={handlePurchase}
              className="bg-green-500 hover:bg-green-600"
            >
              Upload to Spotify
            </Button>
          </div>
        )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {artists.map((artist) => (
    <ArtistCard
      key={artist.artist_id}
      artist={artist}
      averageRating={averageRatings[artist.artist_id]}
      onArtistUpdate={handleArtistUpdate}
      isFavorite={favorites.includes(artist.artist_id)}
      onToggleFavorite={toggleFavorite}
      useNeonBorder={false}
      showSpotifyIcon={true} 
      showDeleteIcon={true} // Visa Delete-ikonen
      onDelete={(e) => handleDeleteArtist(artist.artist_id)}
      onSelectArtist={toggleArtistSelection} // Skicka ner funktionen
      isSelected={selectedArtists.includes(artist.artist_id)} // Skicka ner valt tillstånd
    />
  ))}
   
</div>

        {/* Paginering */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {generatePageNumbers().map((page, index) => (
              <Button
                key={index}
                variant={page === currentPage ? "default" : "outline"}
                onClick={() => typeof page === "number" && handlePageChange(page)}
                disabled={page === "..."}
                className={`border-white/10 ${page === "..." ? "cursor-default" : ""}`}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {artists.length === 0 && (
          <div className="text-center text-white/60 mt-8">
            No submissions found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Submissions;