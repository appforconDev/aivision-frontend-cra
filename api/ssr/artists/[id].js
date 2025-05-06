// /api/ssr/artists/[id].js
import fetch from "node-fetch";

async function fetchBackstory(url) {
  try {
    const response = await fetch(url);
    return await response.text();
  } catch (error) {
    console.error("Error fetching backstory:", error);
    return "Artist background story";
  }
}

export default async function handler(req, res) {
  // Sätt headers FÖRST
  res.setHeader('Vercel-CDN-Cache-Control', 's-maxage=3600');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  try {
    const { id } = req.query;
    const BACKEND_URL = process.env.BACKEND_URL;

    // Hämta artistdata
    const artistRes = await fetch(`${BACKEND_URL}/artist/${id}`);
    if (!artistRes.ok) throw new Error("Artist not found");
    const artist = await artistRes.json();

    // Hantera bild-URL
    let imageUrl = artist.image_url;
    if (imageUrl?.includes("amazonaws.com")) {
      try {
        const presignRes = await fetch(`${BACKEND_URL}/presign-image?url=${encodeURIComponent(imageUrl)}`);
        if (presignRes.ok) {
          const { presignedUrl } = await presignRes.json();
          imageUrl = presignedUrl;
        }
      } catch (e) {
        console.error("Presign failed:", e);
      }
    }
    imageUrl = imageUrl?.startsWith("http") ? imageUrl : "https://www.aivisioncontest.com/og-image.png";

    // Hantera backstory
    let description = artist.background_story;
    if (description?.startsWith("http") && description.includes("backstory.txt")) {
      description = await fetchBackstory(description);
    }
    description = description?.substring(0, 200) || "AI-generated artist";

    // Generera HTML
    const html = `<!DOCTYPE html>
    <html lang="sv">
    <head>
      <meta charset="utf-8"/>
      <title>${escapeHtml(artist.name)} – AI Vision Contest</title>
      <meta name="description" content="${escapeHtml(description)}" />
      <meta property="og:title" content="${escapeHtml(artist.name)}" />
      <meta property="og:description" content="${escapeHtml(description)}" />
      <meta property="og:image" content="${imageUrl}" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content="https://www.aivisioncontest.com/artists/${id}" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="AI Vision Contest" />
      <meta name="twitter:card" content="summary_large_image" />
    </head>
    <body>
      <p>Redirecting to artist page...</p>
      <script>window.location.href="/artists/${id}";</script>
    </body>
    </html>`;

    res.status(200).send(html);
  } catch (err) {
    console.error("SSR Error:", err);
    res.status(500).send(`<html><body><h1>Error</h1><p>${err.message}</p></body></html>`);
  }
}

function escapeHtml(s) {
  return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}