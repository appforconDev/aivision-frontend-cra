import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Paintbrush, Music, Trophy, Upload, Sparkles, Share2 } from 'lucide-react'; // Importera ikoner

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] py-24 px-4">
      <section className="container mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-white neon-text">How It Works</h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            Learn how you can create your own AI artist and unlock exclusive distribution opportunities.
          </p>
        </div>

        {/* Stegvisa kort */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Steg 1: Sign Up & Get Started */}
          <Card className="p-6 glass border-primary/20 hover:border-primary/40 transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <Paintbrush className="h-8 w-8 text-secondary" />
              <h2 className="text-xl font-bold text-white">1. Sign Up & Get Started</h2>
              <p className="text-white/60">
                Join AIVisionContest by signing up with your email or Google account. Once registered, you can access our creative tools.
              </p>
              
            </div>
          </Card>

          {/* Steg 2: Create Your AI Artist */}
          <Card className="p-6 glass border-primary/20 hover:border-primary/40 transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <Music className="h-8 w-8 text-primary" />
              <h2 className="text-xl font-bold text-white">2. Create Your AI Artist</h2>
              <p className="text-white/60">
                Use our guided prompt form to generate your unique AI artist. Provide a background story, song lyrics, and artist appearance.
              </p>
              
            </div>
          </Card>

          {/* Steg 3: Showcase & Compete */}
          <Card className="p-6 glass border-primary/20 hover:border-primary/40 transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <Trophy className="h-8 w-8 text-secondary" />
              <h2 className="text-xl font-bold text-white">3. Showcase & Compete</h2>
              <p className="text-white/60">
                Once your AI artist is created, your entry is displayed on our platform. Users can view and vote on the entries, and you can compete in national and global contests.
              </p>
            </div>
          </Card>

         

          {/* Steg 5: Continuous Innovation */}
          <Card className="p-6 glass border-primary/20 hover:border-primary/40 transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h2 className="text-xl font-bold text-white">. Continuous Innovation</h2>
              <p className="text-white/60">
                We are constantly updating our platform with the latest AI tools and features, ensuring you always have the best resources to bring your artistic vision to life.
              </p>
            </div>
          </Card>

           {/* Steg 4: Spotify Distribution & Earnings */}
           <Card className="p-6 glass border-primary/20 hover:border-primary/40 transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <Upload className="h-8 w-8 text-secondary" />
              <h2 className="text-xl font-bold text-white">5. Spotify Distribution & Earnings</h2>
              <p className="text-white/60">
                Upload your song to Spotify for a small fee or win a contest to get it uploaded for free. Retain 100% of your royalties.
              </p>
              <ul className="list-disc ml-6 text-white/60 text-left">
                <li>Standard Upload: $4.95</li>
                <li>Multi-Song Upload: $9.95</li>
              </ul>
            </div>
          </Card>

          {/* Steg 6: Share Your Artist */}
          <Card className="p-6 glass border-primary/20 hover:border-primary/40 transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <Share2 className="h-8 w-8 text-primary" />
              <h2 className="text-xl font-bold text-white">6. Share Your Artist</h2>
              <p className="text-white/60">
                Share your AI artist with the world! Post your creation on social media and invite friends to vote for your entry.
              </p>
              
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;