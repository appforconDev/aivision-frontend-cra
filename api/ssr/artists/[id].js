import fetch from "node-fetch";

// Helper function for HTML escaping
const escapeHtml = (s) => String(s || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

// Helper function to generate the HTML response
const generateHtmlResponse = ({ id, title, desc, imageUrl }) => `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8"/>
  <title>${title} – AI Vision Contest</title>
  <meta name="description" content="${desc}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="https://www.aivisioncontest.com/artists/${id}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="AI Vision Contest" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${imageUrl}" />
</head>
<body>
  <p>Du använder en browser – här finns bara metadatan. Navigera gärna till <a href="/artists/${id}">${title}</a>.</p>
</body>
</html>`;

export default async function handler(req, res) {
  console.log('Incoming request headers:', req.headers);
  console.log('User-Agent:', req.headers['user-agent']);
   // Set caching headers
   res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
   res.setHeader("Content-Type", "text/html; charset=utf-8");
  try {
    const { id } = req.query;
    const BACKEND_URL = process.env.BACKEND_URL;

   

    // 1) Fetch artist data
    const artistResponse = await fetch(`${BACKEND_URL}/artist/${id}`);
    if (!artistResponse.ok) {
      throw new Error("Artist not found");
    }
    const artist = await artistResponse.json();

    // 2) Handle image URL (presign if needed)
    let imageUrl = artist.image_url;
    
    if (imageUrl?.includes("amazonaws.com")) {
      try {
        const presignResponse = await fetch(
          `${BACKEND_URL}/presign-image?url=${encodeURIComponent(imageUrl)}`
        );
        if (presignResponse.ok) {
          const { presignedUrl } = await presignResponse.json();
          imageUrl = presignedUrl;
        }
      } catch (e) {
        console.error("Presign failed, using original URL", e);
      }
    }

    // Fallback to default image if needed
    if (!imageUrl?.startsWith("http")) {
      imageUrl = "https://www.aivisioncontest.com/og-image.png";
    }

    // 3) Prepare content
    const title = escapeHtml(artist.name);
    const desc = escapeHtml(artist.background_story).substring(0, 200);

    // 4) Send response
    res.status(200).send(
      generateHtmlResponse({
        id,
        title,
        desc,
        imageUrl
      })
    );

  } catch (err) {
    console.error("SSR Artist Error:", err);
    res.setHeader("Cache-Control", "no-store");
    res.status(500).send(`<html><body><h1>AI Vision Contest</h1><p>Tyvärr ett fel.</p></body></html>`);
  }
}