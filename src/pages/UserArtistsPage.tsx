import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Importera useParams
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import axios from "axios";
import ArtistCard from "../components/ArtistCard";
import { Artist, AverageRating } from "../components/types";

const ArtistList = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [averageRatings, setAverageRatings] = useState<Record<string, AverageRating>>({});
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArtists, setTotalArtists] = useState(0);
  const artistsPerPage = 6;
  const backendUrl = process.env.REACT_APP_BACKEND_URL


  // Hämta username från URL:en
  const { username } = useParams<{ username: string }>();

  // Filtertillstånd
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [sortByPoints, setSortByPoints] = useState<"asc" | "desc">("desc");

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

  const handleArtistUpdate = (updatedArtist: Artist) => {
    setArtists((prevArtists) =>
      prevArtists.map((artist) =>
        artist.artist_id === updatedArtist.artist_id ? updatedArtist : artist
      )
    );
  };

  // Hämta artister baserat på filter
  const fetchArtists = useCallback(async () => {
    try {
      setLoading(true);
      let url = username
        ? `${backendUrl}/user/${username}/artists?sort=${sortByPoints}&page=${currentPage}&per_page=${artistsPerPage}`
        : `${backendUrl}/artists?sort=${sortByPoints}&page=${currentPage}&per_page=${artistsPerPage}`;
  
      if (countryFilter !== "all") {
        url += `&country=${countryFilter}`;
      }
      if (genreFilter !== "all") {
        url += `&genre=${genreFilter}`;
      }
  
      const response = await axios.get(url);
      const artistsData = response.data.artists || [];
      setArtists(artistsData);
      setTotalArtists(response.data.total_artists || 0);
  
      // Hämta medelvärden för alla artister
      artistsData.forEach((artist: Artist) => {
        fetchAverageRating(artist.artist_id);
      });
    } catch (error) {
      console.error("Error fetching artists:", error);
    } finally {
      setLoading(false);
    }
  }, [username, currentPage, backendUrl, artistsPerPage, countryFilter, genreFilter, sortByPoints]);

  
  // Hämta medelvärden för en artist
  const fetchAverageRating = useCallback(async (artistId: string) => {
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
  }, [backendUrl]);

  // Hämta favoriter
  const fetchFavorites = useCallback(async (user_id: string) => {
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
  }, [backendUrl]);

  // Hantera favoritknappen
  const toggleFavorite = useCallback(async (artistId: string) => {
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
  }, [backendUrl, favorites]);

  // Hantera sidbyten
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  // Beräkna totalt antal sidor
  const totalPages = Math.ceil(totalArtists / artistsPerPage);

  // Generera sidnummer
  const generatePageNumbers = useCallback(() => {
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
  }, [currentPage, totalPages]);

  // Hämta artister och favoriter när komponenten laddas eller filter/sortering ändras
  useEffect(() => {
    if (username) {
      fetchArtists();
      const user_id = localStorage.getItem("user_id");
      if (user_id) {
        fetchFavorites(user_id);
      }
    }
  }, [fetchArtists, fetchFavorites, username]);

  // Callback-funktioner för filterändringar
  const handleCountryChange = useCallback((value: string) => {
    setCountryFilter(value);
    setCurrentPage(1); // Återställ till sid 1 när filter ändras
  }, []);

  const handleGenreChange = useCallback((value: string) => {
    setGenreFilter(value);
    setCurrentPage(1); // Återställ till sid 1 när filter ändras
  }, []);

  const handleSortChange = useCallback((value: "asc" | "desc") => {
    setSortByPoints(value);
    setCurrentPage(1); // Återställ till sid 1 när sortering ändras
  }, []);

  // Memoize artistlistan för att undvika onödiga renderingar
  const memoizedArtists = useMemo(() => {
    return artists.map((artist) => ({
      ...artist,
      averageRating: averageRatings[artist.artist_id],
      isFavorite: favorites.includes(artist.artist_id),
    }));
  }, [artists, averageRatings, favorites]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }




  return (
    <div className="min-h-screen bg-[#0A0A0F] py-24 px-4">
       <div className="max-w-full sm:max-w-[94%] md:max-w-[94%] lg:max-w-[94%] xl:max-w-[94%] mx-auto w-[94%]">
        <div className="flex flex-col md:flex-col justify-between items-center mb-12">
          <div className="flex flex-col justify-center items-center text-center mb-8 mx-auto">
            <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-secondary">
              {username ? `${username}'s Artists` : "AI Artists"}
            </h1>
            <p className="text-xl mb-2 max-w-2xl text-white/80">
              {username
                ? `Explore ${username}'s collection of AI-driven artists.`
                : "Dive into a world where creativity meets technology on our Global AI Artists Leaderboard."}
            </p>
          </div>
        </div>

        {/* ArtistCard-rendering */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memoizedArtists.map((artist) => (
            <ArtistCard
              key={artist.artist_id}
              artist={artist}
              averageRating={artist.averageRating}
              onArtistUpdate={handleArtistUpdate}
              isFavorite={artist.isFavorite}
              onSelectArtist={toggleArtistSelection}
              isSelected={selectedArtists.includes(artist.artist_id)}
              showSpotifyIcon={false} 
              showDeleteIcon={false}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {/* Visa alltid sidnumrering, oavsett om username är satt eller inte */}
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
            No artists found matching the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistList;