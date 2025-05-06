import { Link } from "react-router-dom";
import { Music, Twitter, Facebook, Instagram } from "lucide-react"; // Assuming social media icons are from Lucide

const Footer = () => {
  return (
    <footer className="bg-[#0A0A0F] text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and description */}
          <div className="flex flex-col items-center md:items-start">
            <Music className="h-8 w-8 text-primary mb-2" />
            <p className="text-center md:text-left text-sm">
              Explore the finest AI-generated music with AIVisionContest. Dive into digital creativity.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center">
            <h2 className="font-bold text-lg mb-2">Quick Links</h2>
            <Link to="/contest" className="hover:text-primary transition-colors">Contest</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>

          {/* Social Media */}
          <div className="flex flex-col items-center">
            <h2 className="font-bold text-lg mb-2">Follow Us</h2>
            <div className="flex space-x-4">
              <Link to="#" className="text-white hover:text-primary transition-colors">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link to="#" className="text-white hover:text-primary transition-colors">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link to="#" className="text-white hover:text-primary transition-colors">
                <Instagram className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-white/60 mt-8">
          © {new Date().getFullYear()} <span className="text-primary">AIVisionContest</span> All rights reserved. Brought to you by <Link to="https://winberghmedia.com" className="text-secondary hover:text-primary transition-colors">Winbergh Media</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
