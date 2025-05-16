import React, { useState, useEffect } from 'react';

function getTimeUntilNextMonth() {
  const now = new Date();
  // Första dagen i nästa månad kl 00:00
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
  const diff = nextMonth.getTime() - now.getTime();

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

export const CountdownToNextMonth: React.FC = () => {
  const [{ days, hours, minutes, seconds }, setTime] = useState(getTimeUntilNextMonth());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getTimeUntilNextMonth());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center mt-4">
    <div className="inline-flex items-baseline space-x-2">
      <span className="font-display text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary">
        {days}d
      </span>
      <span className="font-display text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary">
        {hours}h
      </span>
      <span className="font-display text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary">
        {minutes}m
      </span>
      <span className="font-display text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary">
        {seconds}s
      </span>
    </div>
    <p className="mt-2 text-sm text-white">until the winners are announced!</p>
  </div>
  

  );
};
