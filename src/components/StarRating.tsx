import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  artistId: string; // Artistens ID för att hantera röstning
  averageRating: number; // Medelbetyget
  onVote: (rating: number) => void; // Funktion för att hantera användarens betyg
  currentUserRating?: number; // Användarens nuvarande betyg (om det finns)
}

const StarRating: React.FC<StarRatingProps> = ({
  artistId,
  averageRating,
  onVote,
  currentUserRating,
}) => {
  const [selectedStars, setSelectedStars] = useState(currentUserRating || 0); // Användarens valda betyg
  const [hasVoted, setHasVoted] = useState(!!currentUserRating); // Har användaren röstat?

  // Hantera när användaren klickar på en stjärna
  const handleStarClick = (e: React.MouseEvent, stars: number) => {
    e.stopPropagation(); // Stoppa event-bubbling
    if (!hasVoted) {
      setSelectedStars(stars); // Uppdatera valda stjärnor
      onVote(stars); // Skicka betyget till föräldern
      setHasVoted(true); // Markera att användaren har röstat
    }
  };

  // Beräkna hur många stjärnor som ska fyllas
  const displayRating = hasVoted ? selectedStars : averageRating;
  const fullStars = Math.floor(displayRating);
  const hasHalfStar = displayRating - fullStars >= 0.5;

  return (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= fullStars || (hasHalfStar && starValue === fullStars + 1);

        return (
          <button
            key={index}
            onClick={(e) => handleStarClick(e, starValue)} // Lägg till event-parameter här
            disabled={hasVoted}
            className={`cursor-pointer ${
              isFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
            }`}
          >
            <Star className="h-6 w-6" />
          </button>
        );
      })}
      {hasVoted && (
        <span className="text-sm text-gray-400 ml-2">
          You voted {selectedStars} star(s)
        </span>
      )}
    </div>
  );
};

export default StarRating;