import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

interface TicketsContextType {
  tickets: number;
  fetchTickets: () => Promise<void>;
}

const TicketsContext = createContext<TicketsContextType>({
  tickets: 0,
  fetchTickets: async () => {},
});

export const useTickets = () => useContext(TicketsContext);

export const TicketsProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState(0);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const fetchTickets = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      if (user_id) {
        const response = await axios.get(`${backendUrl}/stripe/user/tickets`, {
          params: { user_id },
        });
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  // Hämta tickets när komponenten mountas
  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <TicketsContext.Provider value={{ tickets, fetchTickets }}>
      {children}
    </TicketsContext.Provider>
  );
};