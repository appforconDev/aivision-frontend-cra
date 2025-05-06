import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const location = useLocation(); // Hämtar den nuvarande platsen i din applikation

  useEffect(() => {
    window.scrollTo(0, 0); // Scrollar till toppen av sidan
  }, [location]); // Denna effekt körs varje gång 'location' ändras, dvs. vid navigering

  return null; // Komponenten behöver inte rendera något
}

export default ScrollToTop;
