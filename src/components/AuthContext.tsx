import React, { createContext, useContext, useState, useEffect } from "react";

// Skapa context för autentisering
const AuthContext = createContext({
  isAuthenticated: false,
  login: (token: string) => {},
  logout: () => {},
  getToken: (): string => "", // Ändra detta så att den returnerar en `string`
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kontrollera localStorage vid sidladdning
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);
  }, []);

  // Login-metod
  const login = (token: string) => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("access_token", token); // Spara access token
  };

  // Logout-metod
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("access_token"); // Rensa access token
  };

  // Hämta access token från localStorage
  const getToken = (): string => {
    return localStorage.getItem("access_token") || ""; // Returtyp är nu en string
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
