import { useState,  ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { useToast } from "components/ui/use-toast";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { ForgotPassword, ResetPassword } from "./ForgotPassword";

interface AuthProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

const Auth: React.FC<AuthProps> = ({ isDialogOpen, setIsDialogOpen }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRequestNewCodeInput, setShowRequestNewCodeInput] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Nya state för lösenordsåterställning
  const [resetMode, setResetMode] = useState("none"); // none, request, reset
  const [resetEmail, setResetEmail] = useState("");



  // Validera username
  const validateUsername = (username: string): boolean => {
    const regex = /^[a-zA-Z0-9-]+$/; // Tillåt endast bokstäver, siffror och bindestreck
    return regex.test(username);
  };

  // Kontrollera om username är ledigt
  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${backendUrl}/check-username`, {
        params: { username },
      });
      return response.data.available; // Förväntar sig { available: true/false } från backend
    } catch (error) {
      console.error("Error checking username availability:", error);
      return false;
    }
  };

  // Hantera ändring av username
  const handleUsernameChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const newUsername = e.target.value;
    setUsername(newUsername);

    if (!validateUsername(newUsername)) {
      setUsernameError("Username can only contain letters, numbers, and hyphens.");
      return;
    } else {
      setUsernameError("");
    }

    // Kontrollera om username är ledigt
    const isAvailable = await checkUsernameAvailability(newUsername);
    if (!isAvailable) {
      setUsernameError("Username is already taken.");
    } else {
      setUsernameError("");
    }
  };

  const handleAuth = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
  
    // Validera e-post
    if (!validateEmail(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      setLoading(false);
      return;
    }
  
    // Validera lösenord
    if (!validatePassword(password)) {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description:
          "Password must be at least 6 characters long, contain at least one uppercase letter, one number, and one symbol.",
      });
      setLoading(false);
      return;
    }
  
    // Validera username vid registrering
    if (isSignUp) {
      if (!validateUsername(username)) {
        toast({
          variant: "destructive",
          title: "Invalid Username",
          description: "Username can only contain letters, numbers, and hyphens.",
        });
        setLoading(false);
        return;
      }
  
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        toast({
          variant: "destructive",
          title: "Username Taken",
          description: "Please choose a different username.",
        });
        setLoading(false);
        return;
      }
    }
  
    try {
      if (isSignUp) {
        await axios.post(`${backendUrl}/register`, { email, password, username });
        setIsSignUp(false);
        toast({
          title: "Registration Successful!",
          description: "Your account has been created. Please sign in with your credentials.",
        });
      } else {
        const response = await axios.post(`${backendUrl}/login`, { email, password }, { withCredentials: true });
        const { access_token, user_id } = response.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("user_id", user_id);
        login(access_token);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        setIsDialogOpen(false); // Stäng dialogen vid lyckad inloggning
        navigate("/");
      }
    } catch (error: any) {

      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "An error occurred during authentication",
      });
    } finally {
      setLoading(false);
    }
  };

  // Hantera ny verifieringskod
  const requestNewCode = async () => {
    setLoading(true);
    try {
      if (!email) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Email is required to request a new code.",
        });
        return;
      }

      const response = await axios.post(`${backendUrl}/request-new-code`, { email });
      toast({
        title: "New Code Requested",
        description: "A new verification code has been sent to your email.",
      });
      setShowRequestNewCodeInput(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to request a new verification code.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Nya funktioner för lösenordsåterställning
  const handlePasswordResetRequest = (email: string): void => {
    setResetEmail(email);
    setResetMode("reset");
  };

  const handlePasswordResetComplete = () => {
    setResetMode("none");
    setIsSignUp(false); // Återgå till inloggning
  };

  const handleOpenChange = (open: boolean): void => {
    setIsDialogOpen(open);
    if (!open) {
      // Återställ alla formulärlägen när dialogen stängs
      setResetMode("none");
    }
  };
  const validatePassword = (password: string): boolean => { 
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasNumber &&
      hasSymbol
    );
  };
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Enkel e-postvalidering
    return regex.test(email);
  };

  // Rendera innehåll baserat på nuvarande läge
  const renderContent = () => {
    if (resetMode === "request") {
      return (
        <ForgotPassword
          onCodeSent={handlePasswordResetRequest}
          backToLogin={() => setResetMode("none")}
        />
      );
    } else if (resetMode === "reset") {
      return (
        <ResetPassword
          email={resetEmail}
          onResetComplete={handlePasswordResetComplete}
          backToForgotPassword={() => setResetMode("request")}
        />
      );
    } else {
      return (
        <>
          <form onSubmit={handleAuth}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="email" className="text-left">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-1"
                  required
                />
                {!validateEmail(email) && email.length > 0 && (
                  <div className="col-span-1 text-center">
                    <p className="text-sm text-secondary">Please enter a valid email address.</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="password" className="text-left">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-1"
                  required
                />
                {!validatePassword(password) && password.length > 0 && (
                  <div className="col-span-1 text-center">
                    <p className="text-sm text-red-500">
                      Password must be at least 6 characters long, contain at least one uppercase letter, one number, and one symbol.
                    </p>
                  </div>
                )}
              </div>
              {isSignUp && (
                <>
                  <div className="grid grid-cols-1 items-center gap-4">
                    <Label htmlFor="username" className="text-left">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      className="col-span-1"
                      required
                    />
                    {usernameError && (
                      <div className="col-span-1 text-center">
                        <p className="text-sm text-secondary">{usernameError}</p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 items-center gap-4">
                    <div className="flex items-center">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="mr-2"
                        required
                      />
                      <Label htmlFor="terms" className="text-sm">
                        By clicking this you agree with our{" "}
                        <a href="/terms" className="text-primary">
                          Terms of service
                        </a>.
                      </Label>
                    </div>
                  </div>
                </>
              )}
            </div>
            <Button type="submit" disabled={loading || (isSignUp && !agreeToTerms)} className="w-full">
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>
  
          {/* Återställ lösenord-länk (endast vid inloggning) */}
          {!isSignUp && (
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => setResetMode("request")}
                className="text-sm text-primary hover:underline"
              >
                Forgot your password?
              </button>
            </div>
          )}
  
          {/* Växla mellan Sign In och Sign Up */}
          <div className="text-center mt-4">
            {isSignUp ? (
              <p className="text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-primary hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p className="text-sm">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-primary hover:underline"
                >
                  Sign Up
                </button>
              </p>
            )}
          </div>
        </>
      );
    }
  };
  

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 neon-border rounded-xl">
          {isSignUp ? "Sign Up" : "Sign In"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass border-white/20">
        <DialogHeader>
          <DialogTitle>
            {resetMode === "request"
              ? "Reset Password"
              : resetMode === "reset"
              ? "Enter Verification Code"
              : isSignUp
              ? "Sign Up"
              : "Sign In"}
          </DialogTitle>
          <DialogDescription>
            {resetMode === "request"
              ? "Enter your email to receive a reset code"
              : resetMode === "reset"
              ? "Check your email for the verification code"
              : isSignUp
              ? "Create a new account"
              : "Sign in to your account"}
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default Auth;