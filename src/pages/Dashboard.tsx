import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { 
  Music, 
  Plus, 
  Settings, 
  Trophy, 
  User,
  Activity,
  PartyPopper,
  Star,
  Gift,
  Badge,
  MapPin,
  Loader2,
  Award
} from "lucide-react";
import axios from "axios";
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../components/ui/navigation-menu";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { motion } from "framer-motion";
import { useAuth } from "../components/AuthContext"; // Importera AuthContext
import { useToast } from '../hooks/use-toast'; // Anta att du har en toast-hook

type Artist = {
  artist_id: string;
  name: string;
  country: string;
  music_style: string;
  points: number;
  persona: string;
  status: string;
  image_url?: string;
  song_url?: string;
  background_story: string;
};

type AverageRating = {
  average_rating: number;
  total_votes: number;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const { isAuthenticated, logout } = useAuth(); // Hämta isAuthenticated och logout från AuthContext
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [spotlightArtists, setSpotlightArtists] = useState<Artist[]>([]);

  const [spotlightLoading, setSpotlightLoading] = useState(true);
  const [averageRatings, setAverageRatings] = useState<Record<string, AverageRating>>({});
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.log("isAuthenticated in useEffect:", isAuthenticated);
  
    if (!isAuthenticated) {
      navigate("/"); // Om användaren inte är inloggad, navigera till startsidan
      return;
    }
  
    

    // Hämta spotlight-artister och senaste aktiviteter
    const fetchData = async () => {
      try {
        const [spotlightResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/spotlight-artists"),
        ]);
    
        // Uppdatera beroende på hur API:et returnerar data
        const spotlightArtistsData = spotlightResponse.data.artists || [];  // Använd 'artists' istället för direkt array
        setSpotlightArtists(spotlightArtistsData);
    
        // Hämta genomsnittsbetyg för varje artist
        spotlightArtistsData.forEach((artist: Artist) => {
          fetchAverageRating(artist.artist_id);  // Uppdatera till 'artist_id' om det är det nya namnet
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []); 

// Funktion för att hämta medelvärdet för en artist
const fetchAverageRating = async (artistId: string) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/artist/${artistId}/average-rating`
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

  // Komponent för att visa stjärnor
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
    const fetchSpotlightArtists = async () => {
      setSpotlightLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/spotlight-artists');
        console.log("API response:", response.data); // Bra för att felsöka och se exakt vad du får tillbaka
  
        // Ändra för att hantera data som en direkt lista av artister
        if (response.data && Array.isArray(response.data)) {
          setSpotlightArtists(response.data);
  
          // Utför detta för varje artist
          response.data.forEach((artist: Artist) => {
            fetchAverageRating(artist.artist_id);  // Använd artist.artist_id istället för artist_id
          });
        } else {
          setSpotlightArtists([]); // Säkerställ att vi sätter till en tom lista om något är fel
        }
      } catch (error) {
        console.error('Error fetching spotlight artists:', error);
        setSpotlightArtists([]); // Säkerställ att vi sätter till en tom lista vid fel
      } finally {
        setSpotlightLoading(false);
      }
    };
  
    fetchSpotlightArtists();
  }, []);
  
  useEffect(() => {
    const session_id = searchParams.get('session_id');
  
    if (session_id) {
      // Verifiera betalningen med backend
      const verifyPayment = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/stripe/verify-payment?session_id=${session_id}`);
          if (response.data.success) {
            toast({
              title: 'Success!',
              description: 'Your payment was successful.',
            });
          } else {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Payment verification failed.',
            });
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to verify payment. Please try again.',
          });
        }
      };
  
      verifyPayment();
    }
    // Ta bort else-blocket som omdirigerar till '/'
  }, [navigate, searchParams, toast]);
  
  // 🔹 Fetch Recent Activity from Flask API
  const fetchRecentActivity = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/recent-activity");
      setRecentActivity(response.data || []);
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Navigation */}
      <Header />

{/* Hero Section */}
<section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 " />
        <div className="absolute inset-0 " />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
          
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary">
              Win Big with Our AIvisionContest!
            </h1>
            
            <p className="text-lg md:text-xl mb-8 text-white/80">
            Participate in our exciting AIvisionContest by creating your own AI-generated artist and song.            </p>

{/* Welcome Section */}


        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 glass border-white/20 rounded-l">
            <div className="flex flex-col items-center text-center space-y-4">
              <Plus className="h-12 w-12 text-primary" />
              <h2 className="text-xl font-bold text-white">Create AIrtist</h2>
              <p className="text-white/60">
                Start the creative process and bring your AIrtist to life
              </p>
              <Button 
                onClick={() => navigate("/create-artist")}
                className="neon-border"
              >
                Get Started
              </Button>
            </div>
          </Card>
          <Card className="p-6 glass border-white/20">
            <div className="flex flex-col items-center text-center space-y-4">
              <Trophy className="h-12 w-12 text-primary" />
              <h2 className="text-xl font-bold text-white">Current Competition</h2>
              <p className="text-white/60">
                View ongoing competition details and standings
              </p>
              <Button 
                onClick={() => navigate("/competition")}
                className="neon-border"
              >
                View Competition
              </Button>
            </div>
          </Card>
        </section>

        <section className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome!
          </h1>
          <p className="text-white/60">
            Create your AIrtist and join the competition today!
          </p>
        </section>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 border border-primary/20 rounded-xl">
                <CardHeader>
                  <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-white">Vinstchans</CardTitle>
                  <CardDescription className="text-white/60">
                    $150 Amazon giftcard to the top 10 from each country.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="p-6 border border-primary/20 rounded-xl">
                <CardHeader>
                  <PartyPopper className="w-12 h-12 text-secondary mx-auto mb-4" />
                  <CardTitle className="text-white">Delta nu</CardTitle>
                  <CardDescription className="text-white/60">
                  Createyour own AI-generated artist and song.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="p-6 border border-primary/20 rounded-xl">
                <CardHeader>
                  <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-white">Visa din talang</CardTitle>
                  <CardDescription className="text-white/60">
                  Unleash your creativity and shine in the competition!
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>



            <p className="mt-8 text-sm text-white/60">
            Note: Terms and conditions apply. Please refer to our official contest rules for more details.            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-black/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
             
              <h2 className="text-2xl md:text-3xl font-bold text-white ">Spotlight AIrtists</h2>
            </div>
            <Button 
              variant="ghost" 
              className="text-primary hover:text-primary/80"
              onClick={() => navigate('/artists')}
            >
              See all AIrtists →
            </Button>
          </div>

          {spotlightLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spotlightArtists.map((artist) => (
                
                <Card
                key={artist.artist_id}
                className="p-6 glass border-white/20 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/artists/${artist.artist_id}`)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Music className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold text-white">{artist.name}</h2>
                  </div>
                  <div className="flex items-center space-x-1 text-primary">
                    <Award className="h-5 w-5" />
                    <span>{artist.points || 0}</span>
                  </div>
                </div>
  
                
  
                {artist.image_url && (
                  <div className="mb-4 rounded-l overflow-hidden">
                    <img
                      src={artist.image_url}
                      alt={artist.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
  
                {artist.status === "pending" && (
                  <div className="flex items-center justify-center space-x-2 text-white/60 mb-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating content...</span>
                  </div>
                )}
  
                <p className="text-white/60 mb-4 line-clamp-3">
                  {artist.background_story || artist.persona}
                </p>
  
                {artist.song_url && (
                  <div className="mb-4">
                    <audio controls className="w-full">
                      <source src={artist.song_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
  
                {averageRatings[artist.artist_id] && (
                  <div className="flex items-center space-x-2 mb-4">
                    <StarRating averageRating={averageRatings[artist.artist_id].average_rating} />
                    <span className="text-sm text-white/60">
                      ({averageRatings[artist.artist_id].total_votes} votes)
                    </span>
                  </div>
                )}
  
                <div className="flex items-center justify-between text-sm text-white/40">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{artist.country}</span>
                  </div>
                  <span className="capitalize">{artist.music_style}</span>
                </div>
              </Card>
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
    </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24">
        

        {/* Recent Activity */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
          <Card className="glass border-white/20">
            <div className="p-4 space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5"
                  >
                    <Activity className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-white">
                        New submission: {activity.artist_name}
                      </p>
                      <p className="text-sm text-white/60">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/60 text-center py-4">
                  No recent activity to show
                </p>
              )}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
