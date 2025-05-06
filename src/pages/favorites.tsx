import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "components/ui/button";
import { Heart, Star, Shuffle, Repeat, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Award, Music, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Artist = {
  artist_id: string;
  name: string;
  country: string;
  music_style: string;
  points: number;
  persona: string;
  status: string;
  image_url?: string;
  song_title: string;
  song_url?: string;
  background_story: string;
};

type AverageRating = {
  average_rating: number;
  total_votes: number;
};

const Favorites = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [averageRatings, setAverageRatings] = useState<Record<string, AverageRating>>({});
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortByPoints, setSortByPoints] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArtists, setTotalArtists] = useState(0);
  const artistsPerPage = 6;
  const navigate = useNavigate();

  // Audio player state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL


  // Fetch favorites
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        console.error("User not logged in");
        return;
      }

      const response = await axios.get(`${backendUrl}/favorites?user_id=${user_id}`);
      const favoriteArtistIds = response.data.favorites || [];
      const artistsData = await fetchArtistsByIds(favoriteArtistIds);
      const validArtistsData = artistsData.filter(artist => artist && artist.name);

      setArtists(validArtistsData);
      setTotalArtists(validArtistsData.length);
      setFavorites(favoriteArtistIds);

      validArtistsData.forEach((artist: Artist) => {
        fetchAverageRating(artist.artist_id);
      });
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtistsByIds = async (artistIds: string[]): Promise<Artist[]> => {

    try {
      console.log("Fetching artists with IDs:", artistIds); // Logga artistIds
  
      const requests = artistIds.map(id => {
        const url = `${backendUrl}/artist/${id}`;
        console.log("Fetching artist from:", url); // Logga URL:en
        return axios.get(url).catch(error => {
          console.error("Error fetching artist:", error); // Logga fel för enskilda förfrågningar
          return null; // Returnera null för misslyckade förfrågningar
        });
      });
  
      const responses = await Promise.allSettled(requests);
      console.log("Responses from backend:", responses); // Logga svaren
  
      const artistsData = responses.map(response => {
        if (response.status === "fulfilled" && response.value && response.value.data) {
          return response.value.data;
        } else {
          return null;
        }
      });
  
      const validArtists = artistsData.filter(artist => artist && artist.name);
      console.log("Valid artists:", validArtists); // Logga giltiga artister
  
      return validArtists;
    } catch (error) {
      console.error("Error fetching artists by IDs:", error);
      return [];
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
        setFavorites((prev) => prev.filter(id => id !== artistId));
        setArtists(artists.filter(artist => artist.artist_id !== artistId));
      }
    } else {
      const response = await axios.post(`${backendUrl}/favorites`, {
        user_id,
        artist_id: artistId,
      });
      if (response.status === 200) {
        setFavorites((prev) => [...prev, artistId]);
        fetchFavorites();
      }
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [currentPage]);

  // Audio player functions
  const handlePlayPause = async (index: number) => {
    if (currentSongIndex === index && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setCurrentSongIndex(index);
      if (audioRef.current) {
        audioRef.current.src = artists[index].song_url || "";
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Error playing audio:", error);
        }
      }
    }
  };

  const handleShuffle = () => {
    setShuffle(!shuffle);
  };

  const handleRepeat = () => {
    setRepeat(!repeat);
  };

  const handleNext = async () => {
    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * artists.length);
    } else {
      nextIndex = (currentSongIndex === null ? 0 : currentSongIndex + 1) % artists.length;
    }
    setCurrentSongIndex(nextIndex);
    if (audioRef.current) {
      audioRef.current.src = artists[nextIndex].song_url || "";
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing next song:", error);
      }
    }
  };

  const handlePrevious = async () => {
    let prevIndex;
    if (shuffle) {
      prevIndex = Math.floor(Math.random() * artists.length);
    } else {
      prevIndex = (currentSongIndex === null ? 0 : currentSongIndex - 1 + artists.length) % artists.length;
    }
    setCurrentSongIndex(prevIndex);
    if (audioRef.current) {
      audioRef.current.src = artists[prevIndex].song_url || "";
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing previous song:", error);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const seekTime = parseFloat(e.target.value);
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleEnded = () => {
    if (repeat) {
      if (audioRef.current) {
        audioRef.current.play();
      }
    } else {
      handleNext();
    }
  };

  // Format time to mm:ss
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Function to change page
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalArtists / artistsPerPage);

  const generatePageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Max number of page numbers to show at once

    if (totalPages <= maxPagesToShow) {
      // Show all page numbers if there are few pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, current page, and last page with "..." for skipped pages
      if (currentPage <= 3) {
        // Show the first 4 pages and the last page
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show the first page and the last 4 pages
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show the first page, current page, and last page with "..." for skipped pages
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

  // Get artists for the current page
  const getArtistsForCurrentPage = () => {
    const startIndex = (currentPage - 1) * artistsPerPage;
    const endIndex = startIndex + artistsPerPage;
    return artists.slice(startIndex, endIndex);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-24 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col justify-center items-center text-center mb-8 mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-secondary via-white to-primary">
            Favorite Artists
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl text-white/80">
            Discover Your Favorite AI Artists – Listen, Enjoy, and Dive into the Soundscapes of Your Personalized Music Collection
          </p>
        </div>
  
        {/* Global Player - Responsive for Mobile */}
        <div className="glass p-4 rounded-lg mb-8 max-w-full sm:max-w-md mx-auto">
          {/* Current song info */}
          <div className="mb-4 text-center">
            {currentSongIndex !== null && (
              <>
                <div className="text-2xl md:text-3xl neon-text mb-2">{artists[currentSongIndex]?.name}</div>
                <div className="text-white/70 text-base md:text-xl italic">{artists[currentSongIndex]?.song_title.replace(/"/g, '')}</div>
              </>
            )}
          </div>
          
          {/* Player controls - now in 2 rows for mobile */}
          <div className="flex flex-col items-center">
            {/* Row 1: Prev, Play, Next */}
            <div className="flex items-center justify-center space-x-6 mb-2">
              <Button variant="ghost" onClick={handlePrevious} className="text-white">
                <SkipBack className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => handlePlayPause(currentSongIndex ?? 0)}
                className="text-white"
              >
                {isPlaying && currentSongIndex !== null ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </Button>
              <Button variant="ghost" onClick={handleNext} className="text-white">
                <SkipForward className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Row 2: Shuffle, Repeat */}
            <div className="flex items-center justify-center space-x-8">
              <Button variant="ghost" onClick={handleShuffle} className={shuffle ? "text-primary" : "text-white"}>
                <Shuffle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" onClick={handleRepeat} className={repeat ? "text-primary" : "text-white"}>
                <Repeat className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-white/40 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
  
        {/* Playlist - Redesigned for mobile */}
        <div className="space-y-4">
          {getArtistsForCurrentPage().map((artist, index) => (
            <div key={artist.artist_id} className="flex flex-col p-4 glass rounded-lg">
              {/* Artist name */}
              <div className="mb-3">
                <h2 className="text-xl font-bold text-white">{artist.name}</h2>
              </div>
              
              {/* Image */}
              <div className="mb-3 flex justify-center">
                <img
                  src={artist.image_url}
                  alt={artist.name}
                  className="w-full max-w-xs h-auto rounded-lg object-cover"
                  onError={(e) => {
                    console.error("Image load error for artist:", {
                      artistName: artist.name,
                      imageUrl: artist.image_url,
                      error: e
                    });
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              
              {/* Location and genre */}
              <div className="flex items-center justify-center space-x-1 text-sm text-white/40 mb-2">
                <MapPin className="h-4 w-4" />
                <span>{artist.country}</span>
                <span className="mx-2">|</span>
                <span className="capitalize">{artist.music_style}</span>
              </div>
              
              {/* Song title */}
              <p className="text-center text-white/60 mb-3">{artist.song_title.replace(/"/g, '')}</p>
              
              {/* Controls */}
              <div className="flex justify-center items-center space-x-6">
                <Button
                  variant="ghost"
                  onClick={() => handlePlayPause(index + (currentPage - 1) * artistsPerPage)}
                  className="text-white"
                >
                  {currentSongIndex === index + (currentPage - 1) * artistsPerPage && isPlaying ? 
                    <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(artist.artist_id);
                  }}
                  className="p-1 hover:text-red-500 transition-colors"
                >
                  {favorites.includes(artist.artist_id) ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6 text-secondary"
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
                      className="h-6 w-6 text-secondary"
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
          ))}
        </div>
  
        {/* Pagination - Made more compact for mobile */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-1 flex-wrap justify-center">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-white/10 h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
  
            {generatePageNumbers().map((page, index) => (
              <Button
                key={index}
                variant={page === currentPage ? "default" : "outline"}
                onClick={() => typeof page === "number" && handlePageChange(page)}
                disabled={page === "..."}
                className={`border-white/10 h-8 px-3 ${page === "..." ? "cursor-default" : ""}`}
              >
                {page}
              </Button>
            ))}
  
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-white/10 h-8 px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
  
        {artists.length === 0 && (
          <div className="text-center text-white/60 mt-8">
            No favorites found.
          </div>
        )}
  
        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      </div>
    </div>
  );
};

export default Favorites;
