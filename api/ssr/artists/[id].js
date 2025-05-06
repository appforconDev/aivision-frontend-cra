import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    
    // Använd process.env direkt i serverless-funktioner, inte REACT_APP_ prefix
    const BACKEND_URL = process.env.BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'https://sunny-laughter-production-4c2c.up.railway.app/api';
    
    console.log(`Fetching artist data for id: ${id} from ${BACKEND_URL}/artist/${id}`);
    
    // Hämta artistdata från ditt backend med felhantering
    const response = await fetch(
      `${BACKEND_URL.replace(/\/$/, '')}/artist/${id}`
    );
    
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }
    console.log('Backend response status:', response.status);

    const artist = await response.json();
    
    // Logga för debugging
    console.log(`Artist found: ${artist.name}`);
    
    // Om bilden kommer från S3 eller är en relativ URL, hämta en presignad URL
    let presignedImageUrl = artist.image_url;
    if (artist.image_url && (artist.image_url.includes('amazonaws.com') || !artist.image_url.startsWith('http'))) {
      try {
        // Hämta en presignad URL från backend om bilden behöver det
        const presignEndpoint = `${BACKEND_URL.replace(/\/$/, '')}/presign-image?url=${encodeURIComponent(artist.image_url)}`;
        console.log(`Fetching presigned URL from: ${presignEndpoint}`);
        
        const imageResponse = await fetch(presignEndpoint, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          presignedImageUrl = imageData.presignedUrl || imageData.url;
          console.log(`Got presigned image URL: ${presignedImageUrl}`);
          
          // Testa om presigned URL fungerar
          try {
            const imgTestResponse = await fetch(presignedImageUrl, { 
              method: 'HEAD',
              timeout: 2000
            });
            if (!imgTestResponse.ok) {
              console.error(`Image URL returned status: ${imgTestResponse.status}`);
              presignedImageUrl = 'https://www.aivisioncontest.com/og-image.png';
            }
          } catch (imgTestError) {
            console.error(`Error testing image URL: ${imgTestError.message}`);
            // Behåll den presignade URL:en trots fel, det kan fortfarande fungera för Facebook
          }
        } else {
          console.error(`Failed to get presigned URL: ${imageResponse.status}`);
          // Fallback till en säker bild
          presignedImageUrl = 'https://www.aivisioncontest.com/og-image.png';
        }
      } catch (imageError) {
        console.error(`Error getting presigned URL: ${imageError.message}`);
        presignedImageUrl = 'https://www.aivisioncontest.com/og-image.png';
      }
    }
    
    // Sanitera innehåll för att undvika XSS
    const sanitizeHtml = (str) => {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };
    
    const title = sanitizeHtml(artist.name || 'AI Artist');
    const description = sanitizeHtml(artist.background_story || 'Check out this AI artist');
    
    // Säkerställ att bildURL alltid är en absolut URL med https
    let imageUrl = presignedImageUrl;
    if (!imageUrl || !imageUrl.startsWith('http')) {
      imageUrl = 'https://www.aivisioncontest.com/og-image.png';
    }
    
    // Logg för debugging
    console.log(`Using image URL: ${imageUrl}`);
    
    res
      .status(200)
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .send(`<!DOCTYPE html>
<html lang="sv">
  <head>
    <meta charset="utf-8" />
    <title>${title} – AI Vision Contest</title>
    <meta name="description"        content="${description}" />
    <meta property="og:title"       content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image"       content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url"         content="https://www.aivisioncontest.com/artists/${id}" />
    <meta property="og:type"        content="website" />
    <meta property="og:site_name"   content="AI Vision Contest" />
    <meta name="twitter:card"       content="summary_large_image" />
    <meta name="twitter:title"      content="${title}" />
    <meta name="twitter:description"content="${description}" />
    <meta name="twitter:image"      content="${imageUrl}" />
  </head>
  <body>
    <script>
      // Om detta körs i en webbläsare (inte crawler), omdirigera till CRA-appen
      if (!navigator.userAgent.match(/(facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|Pinterest|Slackbot|TelegramBot|Google.*snippet)/i)) {
        window.location.replace('/artists/${id}');
      } else {
        // För att ge crawlers en statisk HTML att visa
        document.body.innerHTML = '<div><h1>${title}</h1><p>${description}</p><img src="${imageUrl}" alt="${title}" /></div>';
      }
    </script>
  </body>
</html>`);
  } catch (error) {
    console.error('Error in SSR handler:', error);
    
    // Skicka en enkel felsida med grundläggande metadata
    res
      .status(500)
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .send(`<!DOCTYPE html>
<html lang="sv">
  <head>
    <meta charset="utf-8" />
    <title>AI Vision Contest</title>
    <meta name="description" content="Discover AI artists" />
    <meta property="og:title" content="AI Vision Contest" />
    <meta property="og:description" content="Discover AI artists" />
    <meta property="og:image" content="https://www.aivisioncontest.com/og-image.png" />
    <meta property="og:url" content="https://www.aivisioncontest.com" />
    <meta property="og:type" content="website" />
  </head>
  <body>
    <script>
      window.location.replace('/');
    </script>
  </body>
</html>`);
  }
}