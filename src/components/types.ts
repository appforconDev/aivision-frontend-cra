// types.ts
export type Artist = {
    username: string;
    averageRating: AverageRating;
    isFavorite: boolean;
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
    song_title?: string;
    music_task_id?: string;
  };
  
  export type AverageRating = {
    average_rating: number;
    total_votes: number;
  };
  