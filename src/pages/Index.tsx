import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Paintbrush, Trophy, Vote, Plus, MapPin, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ArtistCard from "../components/ArtistCard"; // Importera ArtistCard
import { Artist, AverageRating } from "../components/types"; // Importera typer

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [spotlightArtists, setSpotlightArtists] = useState<Artist[]>([]);
  const [spotlightLoading, setSpotlightLoading] = useState(true);
  const [averageRatings, setAverageRatings] = useState<Record<string, AverageRating>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const backendUrl = process.env.REACT_APP_BACKEND_URL
  const [aiArtistsCount, setAiArtistsCount] = useState(0);

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


  // Hämta spotlight-artister och favoriter när komponenten laddas
  useEffect(() => {
    console.log("Backend URL:", process.env.REACT_APP_BACKEND_URL
    );
    const fetchData = async () => {
      try {
        const [spotlightResponse] = await Promise.all([
          axios.get(`${backendUrl}/spotlight-artists`),
        ]);

        const spotlightArtistsData = spotlightResponse.data.artists || [];
        setSpotlightArtists(spotlightArtistsData);

        // Hämta genomsnittsbetyg för varje artist
        spotlightArtistsData.forEach((artist: Artist) => {
          fetchAverageRating(artist.artist_id);
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hämta spotlight-artister
  useEffect(() => {
    const fetchSpotlightArtists = async () => {
      setSpotlightLoading(true);
      try {
        const response = await axios.get(`${backendUrl}/spotlight-artists`);
        console.log("Backend URL:", backendUrl);
        if (response.data && Array.isArray(response.data)) {
          setSpotlightArtists(response.data);

          // Hämta medelvärden för varje artist
          response.data.forEach((artist: Artist) => {
            fetchAverageRating(artist.artist_id);
          });
        } else {
          setSpotlightArtists([]);
        }
      } catch (error) {
        console.error("Error fetching spotlight artists:", error);
        setSpotlightArtists([]);
      } finally {
        setSpotlightLoading(false);
      }
    };

    fetchSpotlightArtists();
  }, []);

  // Hämta medelvärden för en artist
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

  // Hämta favoriter
  const fetchFavorites = async (user_id: string) => {
    if (user_id) {
      try {
        const response = await axios.get(`${backendUrl}/favorites`, {
          params: { user_id },
        });
        const favoriteArtistIds = response.data.favorites;
        setFavorites(favoriteArtistIds);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    }
  };

  const handleArtistUpdate = (updatedArtist: Artist) => {
    setSpotlightArtists((prevArtists) =>
      prevArtists.map((artist) =>
        artist.artist_id === updatedArtist.artist_id ? updatedArtist : artist
      )
    );
  };

  // Hantera favoritknappen
  const toggleFavorite = async (artistId: string) => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      alert("Please sign in to add favorites.");
      return;
    }

    try {
      if (favorites.includes(artistId)) {
        await axios.delete(`${backendUrl}/favorites`, {
          data: { user_id, artist_id: artistId },
        });
        setFavorites((prev) => prev.filter((id) => id !== artistId));
      } else {
        await axios.post(`${backendUrl}/favorites`, {
          user_id,
          artist_id: artistId,
        });
        setFavorites((prev) => [...prev, artistId]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Hämta favoriter när komponenten laddas
  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    if (user_id) {
      fetchFavorites(user_id);
    }
  }, []);

  useEffect(() => {
    fetchAiArtistsCount();
  }, []);

  const fetchAiArtistsCount = async () => {
    console.log("Backend URL HEADER:", process.env.REACT_APP_BACKEND_URL);
    try {
      const response = await axios.get(`${backendUrl}/ai-artists/count`);
      setAiArtistsCount(response.data.count);
    } catch (error) {
      console.error('Error fetching AI Artists count:', error);
    }
  };



  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <section className="relative flex items-center justify-center overflow-hidden pt-16">
        <section className="relative flex flex-col items-center justify-center overflow-hidden pt-16">
          <div className="container mx-auto px-4 z-10 mb-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4 }}
            >
              <Badge variant="outline" className="mb-4 py-2 px-4 border-primary text-primary neo-text">
                Europe's Premier AI Music Competition
              </Badge>
              <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary">
              AIVision<span className="break-mobile"></span>Contest
              </h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-white/80">
                Create Your AI Artist – Compete, Vote, and Win in Europe's Most Innovative Digital
                Music Competition
              </p>
              <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Paintbrush className="h-8 w-8 mb-4 text-secondary" />,
                title: "Create Your AI Artist",
                description:
                  "Design unique personas with compelling backstories and original music",
              },
              {
                icon: <Trophy className="h-8 w-8 mb-4 text-primary" />,
                title: "Compete Nationally",
                description:
                  "Enter your country's contest and showcase your creation to a wider audience",
              },
              {
                icon: <Vote className="h-8 w-8 mb-4 text-secondary" />,
                title: "Vote & Share",
                description:
                  "Support your favorite entries and share them across social media",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-6 text-center animate-on-scroll glass hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40"
              >
                <div className="flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </Card>
            ))}
          </div>
          <Link to="/create">
                <Button size="lg" className="mt-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 neon-border">
                  Get Started
                </Button>
              </Link>
              <div>
                <h2 className="text-3xl md:text-3xl font-bold text-secondary my-6">Total Prize Pool: ${(aiArtistsCount * 0.30).toFixed(2)} </h2>
                <p className="mt-6 text-sm text-white/60">
                The prize pool is weighted toward the top three finishers—20 % / 15 % / 10 %—while the remaining 55 % is split evenly among places 4–10 (about 8 % each).
          </p>
              </div>
              

              
              <p className="mt-2 text-sm text-white/60">
            <Link to="/terms" className="text-white hover:text-primary transition-colors">Terms</Link> and conditions apply. Please refer to our <Link to="/contest" className="text-white hover:text-primary transition-colors">official contest</Link> rules for more
            details.
          </p>
            </motion.div>
          </div>

          
        </section>
      </section>

      


      <section className="py-24 bg-[#0A0A0F]">
        <div className="container mx-auto px-4 mb-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white neon-text">Spotlight Artists</h2>
              </div>
              <Button
                variant="ghost"
                className="text-primary hover:text-primary/80"
                onClick={() => navigate("/artists")}
              >
                See all AI Artists →
              </Button>
            </div>

            {spotlightLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spotlightArtists.slice(0, 3).map((artist) => (
                  <ArtistCard
                                key={artist.artist_id}
                                artist={artist}
                                averageRating={artist.averageRating}
                                onArtistUpdate={handleArtistUpdate}
                                isFavorite={artist.isFavorite}
                                showSpotifyIcon={false}
                                showDeleteIcon={false}
                                onSelectArtist={toggleArtistSelection}
                                isSelected={selectedArtists.includes(artist.artist_id)}
                                onToggleFavorite={toggleFavorite}
                                backendUrl={backendUrl}
                              />
                ))}

                {spotlightArtists.length === 0 && (
                  <div className="col-span-full text-center text-white/60 py-12">
                    Inga artister har skapats än. Var först med att skapa en!
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        <div className="container mx-auto px-4 mt-20">
          <div className="max-w-4xl mx-auto text-center animate-on-scroll">
            <Badge variant="outline" className="mb-4 border-secondary text-secondary">
              Unleash Your Creativity
            </Badge>
            <h2 className="text-4xl font-bold mb-6 text-white">Join the Creative Revolution</h2>
            <p className="text-xl text-white/80 mb-8">
              Start creating your AI artist today and compete for amazing prizes
            </p>
            <Link to="/create">
              <Button size="lg" className="rounded-full bg-secondary text-white hover:bg-secondary/90 neon-border">
                Start Creating
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 z-10">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 glass border-white/20 rounded-l">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Plus className="h-12 w-12 text-secondary" />
                  <h2 className="text-xl font-bold text-white">Create AI Artist</h2>
                  <p className="text-white/60">
                    Start the creative process and bring your AIrtist to life
                  </p>
                  <Button onClick={() => navigate("/create")} className="neon-border rounded">
                    Get Started
                  </Button>
                </div>
              </Card>
              <Card className="p-6 glass border-white/20">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Trophy className="h-12 w-12 text-secondary" />
                  <h2 className="text-xl font-bold text-white">Current LeaderBoard</h2>
                  <p className="text-white/60">
                    View ongoing competition details and standings
                  </p>
                  <Button onClick={() => navigate("/leaderboard")} className="neon-border rounded">
                    View LeaderBoard
                  </Button>
                </div>
              </Card>
            </section>
          </div>
      

    </div>
  );
};

export default Index;