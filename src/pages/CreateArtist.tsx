import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { useToast } from "../hooks/use-toast";
import { WaveLoading } from 'respinner'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Ticket } from "lucide-react";
import axios from "axios";
import { useAuth } from "../components/AuthContext";
import { motion } from "framer-motion";
import MusicStatusHandler from '../components/MusicStatusHandler';
import Auth from "../components/Auth"; // Adjust the import path as needed
import { useTickets } from "../components/TicketsContext";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  persona: z.string().min(10).max(500),
  background_story: z.string().min(30).max(1000),
  country: z.string().min(2).max(100),
  music_style: z.string().min(2).max(100),
  lyrics_prompt: z.string().min(20).max(1000),
  image_prompt: z.string().min(20).max(1000),
  gender: z.string().min(4).max(6),
});

type FormValues = z.infer<typeof formSchema>;

type CreateArtistProps = {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const CreateArtist: React.FC<CreateArtistProps> = ({ isDialogOpen, setIsDialogOpen }) =>  {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [createdArtistId, setCreatedArtistId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [insufficientTickets, setInsufficientTickets] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL

  const [showMusicStatus, setShowMusicStatus] = useState(false);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string>("idle");
  const [songUrl, setSongUrl] = useState<string | null>(null);
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 3000;
  const { fetchTickets } = useTickets(); 
  const [showTicketMessage, setShowTicketMessage] = useState(false);

 

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      persona: "",
      background_story: "",
      country: "",
      music_style: "",
      lyrics_prompt: "",
      image_prompt: "",
    },
  });

  const isFormValid = form.formState.isValid;

  

  const retryGeneration = async (artistId: string) => {
    try {
      setRetryCount((prev) => prev + 1);
      setGenerating(true);

      const userId = localStorage.getItem("user_id");
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User ID not found. Please sign in again.",
        });
        navigate("/");
        return;
      }

      const response = await axios.post(
        `${backendUrl}/generate-artist-content`,
        { artistId, userId }, 
        { withCredentials: true }
      );

      if (response.data.success) {
        toast({
          title: "Success!",
          description: "AI artist created! Monitoring music generation status...",
        });

        setArtistId(artistId);
        setShowMusicStatus(true);
        setGenerationStatus("processing");
        setGenerating(false); // Hide the overlay here
        navigate("/submissions");
      } else {
        throw new Error(response.data.error || "Unknown error during generation.");
      }
    } catch (error: any) {
      console.error("Generation retry error:", error);
      setGenerating(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate artist content.",
      });
    }
  };

  const handleMusicReady = (songUrl: string) => {
    console.log("Music is ready! URL:", songUrl);
    toast({
      title: "Music Generated!",
      description: "Your AI artist's song is now available. Redirecting to artists page...",
      duration: 5000,
    });
    setTimeout(() => {
      navigate("/artists");
    }, 3000);
  };

  const handlePollingError = (error: string) => {
    console.error("Music polling error:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: error,
    });
  };



  const onSubmit = async (values: FormValues) => {
    if (loading || generating) return;
    setLoading(true);
    setInsufficientTickets(false);
  
    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User ID not found. Please sign in again.",
        });
        navigate("/");
        setLoading(false);
        return;
      }
  
      const response = await axios.post(
        `${backendUrl}/create-artist`,
        {
          name: values.name,
          persona: values.persona,
          background_story: values.background_story,
          country: values.country,
          music_style: values.music_style,
          lyrics_prompt: values.lyrics_prompt,
          image_prompt: values.image_prompt,
          gender: values.gender,
          user_id: user_id,
        },
        { withCredentials: true }
      );
  
      if (response.data.error) {
        throw new Error(response.data.error);
      }
  
      const artistId = response.data.artistId;
      if (!artistId) {
        throw new Error("Missing artist ID in response");
      }
  
      setCreatedArtistId(artistId);
      // Uppdatera tickets i Header
      await fetchTickets();

  
      toast({
        title: "Artist Created!",
        description: "Starting AI content generation...",
      });
  
      setLoading(false);
      setGenerating(true);
  
      await retryGeneration(artistId);
    } catch (error: unknown) {
      setLoading(false);
      setGenerating(false);
    
      if (axios.isAxiosError(error) && error.response?.data?.error === "Insufficient tickets") {
        setInsufficientTickets(true);
        setShowTicketMessage(true);
        toast({
          variant: "destructive",
          title: "Insufficient Tickets",
          description: error.response.data.message,
        });
      } else if (axios.isAxiosError(error)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to create AI artist",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unexpected error occurred.",
        });
      }
    }
    
  };
  

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };


  const generateRandomArtistName = () => {
    const firstNames = [
      "Luna", "Nova", "Echo", "Zephyr", "Blaze", "Onyx", "Crystal", "Axel", "Raven", "Phoenix",
      "Ember", "Midnight", "Storm", "Vega", "Orion", "Indigo", "Jade", "Neon", "Lyric", "Nebula",
      "Shadow", "Crimson", "Stellar", "Aurora", "Zenith", "Harmony", "Horizon", "Mystic", "Tempest", "Summit",
      "Frost", "Solar", "Cosmic", "Silhouette", "Spark", "Velvet", "Dusk", "Mirage", "Diamond", "Rebel"
    ];
  
    const lastNames = [
      "Wave", "Heart", "Dream", "Soul", "Star", "Mind", "Sky", "Beat", "Fire", "Light", "Wolf",
      "Pulse", "Bliss", "Glow", "Haze", "Mist", "Spirit", "Voice", "Rhythm", "Tiger", "Eagle",
      "Fuse", "Vine", "Core", "Shine", "Steel", "Flow", "Smoke", "Dragon", "Siren", "Thunder",
      "Chaser", "Runner", "Walker", "Rider", "Drifter", "Glider", "Breaker", "Maker", "Bender", "Weaver"
    ];
  
    const singleNames = [
      "Seraphina", "Zayn", "Kaleidoscope", "Maverick", "Valkyrie", "Enigma", "Solace", "Euphoria", "Genesis",
      "Azura", "Vortex", "Eclipse", "Infinity", "Momentum", "Rogue", "Spectra", "Pulse", "Aeon", "Zenith",
      "Elysium", "Ethereal", "Fable", "Phantom", "Paragon", "Nimbus", "Halcyon", "Cascade", "Lumina", "Vertex",
      "Obsidian", "Odyssey", "Axiom", "Fervor", "Mirage", "Tempest", "Labyrinth", "Anthem", "Sonata", "Majesty"
    ];
  
    // Determine style of name (single name or compound)
    const nameStyle = Math.random() < 0.4 ? "single" : "compound";
    
    if (nameStyle === "single") {
      return singleNames[Math.floor(Math.random() * singleNames.length)];
    } else {
      // Sometimes add "DJ", "MC", "Lil", etc. as prefix
      const prefixes = ["", "", "", "", "DJ ", "MC ", "Lil ", "King ", "Queen ", "Sir "];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      
      // 50/50 chance of having a last name
      if (Math.random() < 0.5) {
        return prefix + firstName;
      } else {
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        return prefix + firstName + " " + lastName;
      }
    }
  };

  const generateRandomArtist = () => {
    const genders = ["male", "female"];
    const countries = [
        "Albania", "Armenia", "Australia", "Austria", "Azerbaijan", "Belgium", 
        "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", 
        "France", "Georgia", "Germany", "Greece", "Iceland", "Ireland", 
        "Israel", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", 
        "Montenegro", "Netherlands", "Norway", "Poland", "Portugal", 
        "San Marino", "Serbia", "Slovenia", "Spain", "Sweden", 
        "Switzerland", "Ukraine", "United Kingdom"
    ];
    const musicStyles = [
        "pop", "rock", "hiphop", "electronic", "jazz", "ballad", 
        "classical", "country", "blues", "reggae", "metal"
    ];

    const randomGender = genders[Math.floor(Math.random() * genders.length)];
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const randomMusicStyle = musicStyles[Math.floor(Math.random() * musicStyles.length)];

    const randomName = generateRandomArtistName();
    const randomPersona = `A ${randomGender} ${randomMusicStyle} artist from ${randomCountry} with a unique style.`;
    const randomBackgroundStory = `Born in ${randomCountry}, this ${randomGender} artist has been making waves in the ${randomMusicStyle} scene with their unique sound and style.`;
    const randomLyricsPrompt = `A song about love and heartbreak in the style of ${randomMusicStyle}.`;
    const randomImagePrompt = `A ${randomGender} ${randomMusicStyle} artist from ${randomCountry} with a unique style.`;

    return {
        name: randomName,
        persona: randomPersona,
        background_story: randomBackgroundStory,
        country: randomCountry,
        music_style: randomMusicStyle,
        lyrics_prompt: randomLyricsPrompt,
        image_prompt: randomImagePrompt,
        gender: randomGender,
    };
};

const handleSurpriseMe = async () => {
  // Show loading state
  setLoading(true);
  setInsufficientTickets(false);
  setShowTicketMessage(false);
  
  try {
    // Generate random values
    const randomArtist = generateRandomArtist();
    
    // Get user ID
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User ID not found. Please sign in again.",
      });
      navigate("/");
      setLoading(false);
      return;
    }
    
    // Send directly to API without updating the form
    const response = await axios.post(
      `${backendUrl}/create-artist`,
      {
        name: randomArtist.name,
        persona: randomArtist.persona,
        background_story: randomArtist.background_story,
        country: randomArtist.country,
        music_style: randomArtist.music_style,
        lyrics_prompt: randomArtist.lyrics_prompt,
        image_prompt: randomArtist.image_prompt,
        gender: randomArtist.gender,
        user_id: user_id,
      },
      { withCredentials: true }
    );
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    const artistId = response.data.artistId;
    if (!artistId) {
      throw new Error("Missing artist ID in response");
    }
    
    setCreatedArtistId(artistId);
    // Update tickets in Header
    await fetchTickets();
    
    toast({
      title: "Random Artist Created!",
      description: "Starting AI content generation...",
    });
    
    setLoading(false);
    setGenerating(true);
    
    await retryGeneration(artistId);
  } catch (error: unknown) {
    console.error("Error in surprise submission:", error);
    setLoading(false);
    setGenerating(false);
  
    if (axios.isAxiosError(error) && error.response?.data?.error === "Insufficient tickets") {
      setInsufficientTickets(true);
      console.log("INGA BILJETTER");
      setShowTicketMessage(true);
      toast({
        variant: "destructive",
        title: "Insufficient Tickets",
        description: error.response.data.message,
      });
    } else if (axios.isAxiosError(error)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create random AI artist",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unexpected error occurred.",
      });
    }
  }
  
};

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-24 px-4">

      {generating && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center space-y-4 neon-text text-center text-2xl">
  <Loader2 className="h-12 w-12 neon-text animate-spin" />
  <WaveLoading />
  <p>Do not close this page. </p>
  <p> Generating artist...</p>
</div>

        </div>
      )}

      <section className="relative flex flex-col items-center justify-center overflow-hidden pt-16">
      <div className="max-w-full ">
      <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4 }}
          >
            <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary">
              Create Your AI Artist
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/80">
              Your journey to stardom starts here! Create your AI artist today and let your music be heard!{" "}
              For just <span className="neon-text">1 VIP</span>{" "}
              <Ticket className="h-7 w-7 text-secondary inline-block align-top" />{" "}
              you can bring your unique creation to life. Stand out and compete for fame and glory that await the most outstanding artists.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-full sm:max-w-[94%] md:max-w-[94%] lg:max-w-[94%] xl:max-w-[94%] mx-auto w-[94%]">
        <Card className="p-6 glass border-white/20">
          <h1 className="text-2xl font-bold text-white mb-6">
            Create Your AI Artist - Step {currentStep} of 3
          </h1>
          <Button
            type="button"
            onClick={handleSurpriseMe}
            className="neon-border mb-6"
        >
            Surprise Me
        </Button>
        {showTicketMessage && (
    <div className="text-secondary text-sm mb-6">
      You need at least 1 VIP ticket to create an artist.{" "}
      <button
        onClick={() => navigate("/vip")}
        className="text-blue-500 hover:underline"
      >
        Purchase VIP Tickets
      </button>
    </div>
  )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Artist Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white/5 border-white/10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="persona"
                    render={({ field }) => {
                      const missingChars = Math.max(20 - field.value.length, 0);
                      return (
                        <FormItem>
                          <FormLabel>Persona</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="bg-white/5 border-white/10"
                              placeholder="Describe your artist's personality..."
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-white/60">
                            {field.value.length < 20 ? (
                              <span className="text-secondary">
                                {missingChars} more characters required (min 20)
                              </span>
                            ) : (
                              <span className="text-green-500"></span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="background_story"
                    render={({ field }) => {
                      const missingChars = Math.max(30 - field.value.length, 0);
                      return (
                        <FormItem>
                          <FormLabel>Background Story</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="bg-white/5 border-white/10"
                              placeholder="Tell us your artist's story..."
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-white/60">
                            {field.value.length < 30 ? (
                              <span className="text-secondary">
                                {missingChars} more characters required (min 30)
                              </span>
                            ) : (
                              <span className="text-green-500"></span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      <p className="text-xs text-secondary mt-1">
                        Note: Gender selection is not guaranteed to be 100% accurate in the generated output.
                      </p>
                    </FormItem>
                    
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10">
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Albania">Albania</SelectItem>
                            <SelectItem value="Armenia">Armenia</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                            <SelectItem value="Austria">Austria</SelectItem>
                            <SelectItem value="Azerbaijan">Azerbaijan</SelectItem>
                            <SelectItem value="Belgium">Belgium</SelectItem>
                            <SelectItem value="Croatia">Croatia</SelectItem>
                            <SelectItem value="Cyprus">Cyprus</SelectItem>
                            <SelectItem value="Czechia">Czechia</SelectItem>
                            <SelectItem value="Denmark">Denmark</SelectItem>
                            <SelectItem value="Estonia">Estonia</SelectItem>
                            <SelectItem value="Finland">Finland</SelectItem>
                            <SelectItem value="France">France</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Germany">Germany</SelectItem>
                            <SelectItem value="Greece">Greece</SelectItem>
                            <SelectItem value="Iceland">Iceland</SelectItem>
                            <SelectItem value="Ireland">Ireland</SelectItem>
                            <SelectItem value="Israel">Israel</SelectItem>
                            <SelectItem value="Italy">Italy</SelectItem>
                            <SelectItem value="Latvia">Latvia</SelectItem>
                            <SelectItem value="Lithuania">Lithuania</SelectItem>
                            <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                            <SelectItem value="Malta">Malta</SelectItem>
                            <SelectItem value="Montenegro">Montenegro</SelectItem>
                            <SelectItem value="Netherlands">Netherlands</SelectItem>
                            <SelectItem value="Norway">Norway</SelectItem>
                            <SelectItem value="Poland">Poland</SelectItem>
                            <SelectItem value="Portugal">Portugal</SelectItem>
                            <SelectItem value="San Marino">San Marino</SelectItem>
                            <SelectItem value="Serbia">Serbia</SelectItem>
                            <SelectItem value="Slovenia">Slovenia</SelectItem>
                            <SelectItem value="Spain">Spain</SelectItem>
                            <SelectItem value="Sweden">Sweden</SelectItem>
                            <SelectItem value="Switzerland">Switzerland</SelectItem>
                            <SelectItem value="Ukraine">Ukraine</SelectItem>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="music_style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Music Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10">
                              <SelectValue placeholder="Select a style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pop">Pop</SelectItem>
                            <SelectItem value="rock">Rock</SelectItem>
                            <SelectItem value="hiphop">Hip Hop</SelectItem>
                            <SelectItem value="electronic">Electronic</SelectItem>
                            <SelectItem value="jazz">Jazz</SelectItem>
                            <SelectItem value="ballad">Ballad</SelectItem>
                            <SelectItem value="classical">Classical</SelectItem>
                            <SelectItem value="country">Country</SelectItem>
                            <SelectItem value="blues">Blues</SelectItem>
                            <SelectItem value="reggae">Reggae</SelectItem>
                            <SelectItem value="metal">Metal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lyrics_prompt"
                    render={({ field }) => {
                      const missingChars = Math.max(20 - field.value.length, 0);
                      return (
                        <FormItem>
                          <FormLabel>Lyrics Prompt</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="bg-white/5 border-white/10"
                              placeholder="Describe the theme and style of lyrics..."
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-white/60">
                            {field.value.length < 20 ? (
                              <span className="text-secondary">
                                {missingChars} more characters required (min 20)
                              </span>
                            ) : (
                              <span className="text-green-500"></span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="image_prompt"
                    render={({ field }) => {
                      const missingChars = Math.max(20 - field.value.length, 0);
                      return (
                        <FormItem>
                          <FormLabel>Artist Image Prompt</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="bg-white/5 border-white/10"
                              placeholder="Describe how your artist should look..."
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-white/60">
                            {field.value.length < 20 ? (
                              <span className="text-secondary">
                                {missingChars} more characters required (min 20)
                              </span>
                            ) : (
                              <span className="text-green-500"></span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  {insufficientTickets && (
                    <div className="text-secondary text-sm mt-2">
                      You need at least 1 VIP ticket to create an artist.{" "}
                      <button
                        onClick={() => navigate("/vip")}
                        className="text-blue-500 hover:underline"
                      >
                        Purchase VIP Tickets
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={loading || generating}
                    className="border-white/10"
                  >
                    Previous
                  </Button>
                )}
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="neon-border ml-auto"
                    disabled={loading || generating}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading || generating}
                    className="ml-auto"
                  >
                    {loading ? "Creating..." : generating ? "Generating..." : "Create Artist"}
                  </Button>
                )}
              </div>

            </form>
          </Form>
        </Card>
        {showMusicStatus && artistId && (
          <MusicStatusHandler
            artistId={artistId}
            onMusicReady={handleMusicReady}
            onError={handlePollingError}
          />
        )}
      </div>
    </div>
  );
};

export default CreateArtist;
