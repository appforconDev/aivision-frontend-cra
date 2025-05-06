import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Music, StarIcon, Ticket, Menu, X } from "lucide-react";
import { Button } from "components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@radix-ui/react-navigation-menu";
import { navigationMenuTriggerStyle } from "./ui/navigation-menu";
import { useAuth } from "./AuthContext";
import Auth from "./Auth";
import axios from "axios";
import { useTickets } from "./TicketsContext";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [aiArtistsCount, setAiArtistsCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { tickets, fetchTickets } = useTickets();

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user_id"); // Ensure any user-specific data is cleared
  
      // Call the logout function from AuthContext
      await logout();
  
      // Redirect to the home page or login page
      navigate("/");
  
      // Optionally, you can clear any cookies if you're using them for authentication
      // document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } catch (error) {
      console.error("Failed to log out.", error);
    }
  };
  


  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Music className="h-7 w-7 text-primary" />
            <Link to="/" className="font-bold text-lg neon-text">
              AIVisionContest
            </Link>
            <div className="flex items-center space-x-2 hidden-mobile">
              &nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;
              <span className="text-white">{aiArtistsCount}</span>
              
              <StarIcon className="h-7 w-7 text-primary" />
            </div>
          </div>

          {isAuthenticated ? (
            <>
              <NavigationMenu className="hidden md:flex">
                <NavigationMenuList className="flex space-x-4">
                  <NavigationMenuItem>
                    <Link to="/create" className={navigationMenuTriggerStyle()} style={{ backgroundColor: 'transparent' }}>
                      Create AI Artist
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/vip" className={navigationMenuTriggerStyle()} style={{ backgroundColor: 'transparent' }}>
                      VIP &nbsp;
                      <div className="flex items-center space-x-2">
                        <Ticket className="h-7 w-7 text-secondary" />
                        <span className="text-white">{tickets}</span>
                      </div>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/artists" className={navigationMenuTriggerStyle()} style={{ backgroundColor: 'transparent' }}>
                      Browse Artists
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/fav" className={navigationMenuTriggerStyle()} style={{ backgroundColor: 'transparent' }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6 text-secondary heart-pulse"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                        />
                      </svg>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/leaderboard" className={navigationMenuTriggerStyle()} style={{ backgroundColor: 'transparent' }}>
                      LeaderBoard
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/submissions" className={navigationMenuTriggerStyle()} style={{ backgroundColor: 'transparent' }}>
                      My Artists
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <Button
                onClick={handleLogout}
                className="hidden md:flex bg-primary text-primary-foreground hover:bg-primary/90 neon-border rounded"
              >
                Sign Out
              </Button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-white focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </>
          ) : (
            <Auth isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
          )}
        </div>

        {isAuthenticated && isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-2">
            
              <Link
                to="/create"
                className="text-white hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Create AI Artist
              </Link>
              <Link
                to="/vip"
                className="text-white hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                VIP
              </Link>
              <Link
                to="/artists"
                className="text-white hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Artists
              </Link>
              <Link
                to="/fav"
                className="text-white hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Favorites
              </Link>
              <Link
                to="/leaderboard"
                className="text-white hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                LeaderBoard
              </Link>
              <Link
                to="/submissions"
                className="text-white hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                My Artists
              </Link>
             
              <Button
                onClick={handleLogout}
                className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 neon-border rounded"
              >
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
