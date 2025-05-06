import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NotFound from "./pages/NotFound";
import CreateArtist from "./pages/CreateArtist";
import VIP from "./pages/VIP";
import Favorites from "./pages/favorites";
import LeaderBoard from "./pages/LeaderBoard";
import ArtistList from "./pages/ArtistList";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/Privacy";
import ScrollToTop from './pages/ScrollToTop';
import SingleArtist from "./pages/SingleArtist";
import "./App.css";
import { Toaster } from "react-hot-toast";
import Submissions from "./pages/Submissions";
import HowItWorks from "./pages/Contest";
import { AuthProvider } from "./components/AuthContext";
import UserArtistsPage from './pages/UserArtistsPage';
import '@fortawesome/fontawesome-free/css/all.min.css';
import PaymentSuccess from "./components/PaymentSuccess";
import { TicketsProvider } from "./components/TicketsContext";
import './index.css';  // Även om den redan importeras i main.tsx


function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <AuthProvider>
       <TicketsProvider>
      <Router>
        <ScrollToTop />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            success: {
              style: {
                background: "hsl(var(--primary))",
                color: "#141516",
              },
              iconTheme: {
                primary: "#141516",
                secondary: "hsl(var(--secondary))",
              },
              className: "neon-border",
            },
            error: {
              style: {
                background: "hsl(var(--secondary))",
                color: "#141516",
              },
              iconTheme: {
                primary: "#141516",
                secondary: "hsl(var(--secondary))",
              },
              className: "neon-border",
            },
          }}
        />
        <Header />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/vip" element={<VIP />} />
          <Route path="/fav" element={<Favorites />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contest" element={<HowItWorks />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/:username" element={<UserArtistsPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />
          <Route path="/create" element={<CreateArtist isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />} />          <Route path="/artists" element={<ArtistList />} />
          <Route path="/artists/:id" element={<SingleArtist />} />
          <Route path="/submissions" element={<Submissions />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </Router>
      </TicketsProvider>
    </AuthProvider>
  );
}

export default App;
