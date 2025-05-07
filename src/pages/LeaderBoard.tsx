import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ArtistCard from "../components/ArtistCard";
import { Artist, AverageRating } from "../components/types";

const Leaderboard = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [averageRatings, setAverageRatings] = useState<Record<string, AverageRating>>({});
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);

  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL!;

  const toggleArtistSelection = (artistId: string) => {
    setSelectedArtists((prev) =>
      prev.includes(artistId)
        ? prev.filter((id) => id !== artistId)
        : prev.length < 5
        ? [...prev, artistId]
        : prev
    );
  };

  const handleArtistUpdate = (updated: Artist) => {
    setArtists((prev) =>
      prev.map((a) => (a.artist_id === updated.artist_id ? updated : a))
    );
  };

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    const initialize = async () => {
      await fetchTopArtists();
      if (user_id) await fetchFavorites(user_id);
    };
    initialize();
  }, []);

  const fetchFavorites = async (user_id: string) => {
    try {
      const resp = await axios.get(`${backendUrl}/favorites`, { params: { user_id } });
      setFavorites(resp.data.favorites);
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };

  const fetchTopArtists = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${backendUrl}/artists`, {
        params: { page: 1, per_page: 10, sort: "desc" },
      });
      if (Array.isArray(resp.data.artists)) {
        setArtists(resp.data.artists);
        resp.data.artists.forEach((a: Artist) => fetchAverageRating(a.artist_id));
      } else {
        setArtists([]);
      }
    } catch (err) {
      console.error("Error fetching top artists:", err);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageRating = async (artistId: string) => {
    try {
      const resp = await axios.get(`${backendUrl}/artist/${artistId}/average-rating`);
      if (resp.data.success) {
        setAverageRatings((prev) => ({ ...prev, [artistId]: resp.data }));
      }
    } catch (err) {
      console.error("Error fetching average rating:", err);
    }
  };

  const toggleFavorite = async (artistId: string) => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      alert("Please sign in to add favorites.");
      return;
    }
    const isFav = favorites.includes(artistId);
    try {
      if (isFav) {
        await axios.delete(`${backendUrl}/favorites`, { data: { user_id, artist_id: artistId } });
        setFavorites((favs) => favs.filter((id) => id !== artistId));
      } else {
        await axios.post(`${backendUrl}/favorites`, { user_id, artist_id: artistId });
        setFavorites((favs) => [...favs, artistId]);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const leader = artists[0];
  const others = artists.slice(1);

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-24 px-4">
      <div className="max-w-[94%] mx-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-secondary">
            LeaderBoard
          </h1>
          <p className="text-xl mb-8 max-w-2xl text-white/80">
            Welcome to the exclusive Leaderboard showcasing the top 10 AI artists from around the globe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leader && (
            <div className="md:col-span-3 flex justify-center mb-6 relative">
              <span className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-sm font-bold px-2 py-1 rounded">
                #1
              </span>
              <ArtistCard
                key={leader.artist_id}
                artist={leader}
                averageRating={averageRatings[leader.artist_id]}
                onArtistUpdate={handleArtistUpdate}
                isFavorite={favorites.includes(leader.artist_id)}
                onToggleFavorite={toggleFavorite}
                onSelectArtist={toggleArtistSelection}
                isSelected={selectedArtists.includes(leader.artist_id)}
                showSpotifyIcon={false}
                showDeleteIcon={false}
                backendUrl={backendUrl}
              />
            </div>
          )}

          {others.map((artist, idx) => (
            <div key={artist.artist_id} className="relative">
              <span className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-sm font-bold px-2 py-1 rounded">
                #{idx + 2}
              </span>
              <ArtistCard
                artist={artist}
                averageRating={averageRatings[artist.artist_id]}
                onArtistUpdate={handleArtistUpdate}
                isFavorite={favorites.includes(artist.artist_id)}
                onToggleFavorite={toggleFavorite}
                onSelectArtist={toggleArtistSelection}
                isSelected={selectedArtists.includes(artist.artist_id)}
                showSpotifyIcon={false}
                showDeleteIcon={false}
                backendUrl={backendUrl}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
