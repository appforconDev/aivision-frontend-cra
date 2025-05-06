// src/components/ForgotPassword.tsx
import React, { useState, FormEvent } from "react";
import axios from "axios";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { useToast } from "hooks/use-toast";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "";

// 1) Prop-typer för ForgotPassword
interface ForgotPasswordProps {
  onCodeSent: (email: string) => void;
  backToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  onCodeSent,
  backToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResetRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${backendUrl}/forgot-password`, { email });
      toast({
        title: "Reset Code Sent",
        description: "A verification code has been sent to your email.",
      });
      onCodeSent(email);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "Failed to send reset code",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetRequest}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="reset-email" className="text-right">
            Email
          </Label>
          <Input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="col-span-3"
            required
          />
        </div>
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={backToLogin}>
          Back to Login
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Code"}
        </Button>
      </div>
    </form>
  );
};


// 2) Prop-typer för ResetPassword
interface ResetPasswordProps {
  email: string;
  onResetComplete: () => void;
  backToForgotPassword: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({
  email,
  onResetComplete,
  backToForgotPassword,
}) => {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const validatePassword = (password: string) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && hasUpperCase && hasSymbol;
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!validatePassword(newPassword)) {
      setError(
        "Password must be at least 6 characters long, contain at least one uppercase letter, and one symbol."
      );
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${backendUrl}/confirm-forgot-password`, {
        email,
        code,
        newPassword,
      });
      toast({
        title: "Password Reset",
        description: "Your password has been reset successfully.",
      });
      onResetComplete();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetPassword}>
      <div className="grid gap-4 py-4">
        {/* Code */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="reset-code" className="text-right">
            Code
          </Label>
          <Input
            id="reset-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="col-span-3"
            required
          />
        </div>
        {/* New password */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="new-password" className="text-right">
            New Password
          </Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="col-span-3"
            required
          />
        </div>
        {/* Confirm password */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="confirm-password" className="text-right">
            Confirm Password
          </Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="col-span-3"
            required
          />
        </div>
      </div>

      {error && (
        <div className="text-center text-destructive mt-2">{error}</div>
      )}

      <div className="flex justify-between mt-4">
        <Button type="button" variant="outline" onClick={backToForgotPassword}>
          Back
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </div>
    </form>
  );
};
