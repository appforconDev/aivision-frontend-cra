import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    const BACKEND_URL = process.env.BACKEND_URL;

    // 1) Hämta artist
    const apiRes = await fetch(`${BACKEND_URL}/api/artist/${id}`);
    if (!apiRes.ok) throw new Error("Artist not found");
    const artist = await apiRes.json();

    // 2) Presigna bild om behövs (fallback annars)
    let imageUrl = artist.image_url;
    if (imageUrl && imageUrl.includes("amazonaws.com")) {
      const pre = await fetch(`${BACKEND_URL}/api/presign-image?url=${encodeURIComponent(imageUrl)}`);
      if (pre.ok) {
        const { presignedUrl } = await pre.json();
        imageUrl = presignedUrl;
      }
    }
    if (!imageUrl?.startsWith("http")) {
      imageUrl = "https://www.aivisioncontest.com/og-image.png";
    }

    // 3) Sanitera titlar + beskrivning
    const esc = (s) => String(s||"").replace(/&/g,"&amp;")
                                     .replace(/</g,"&lt;")
                                     .replace(/>/g,"&gt;")
                                     .replace(/"/g,"&quot;");
    const title = esc(artist.name);
    const desc  = esc(artist.background_story).substring(0,200);

    // 4) Returnera ren HTML utan client-side redirect!
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="utf-8"/>
<title>${title} – AI Vision Contest</title>
<meta name="description"        content="${desc}" />
<meta property="og:title"       content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:image"       content="${imageUrl}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height"content="630" />
<meta property="og:url"         content="https://www.aivisioncontest.com/artists/${id}" />
<meta property="og:type"        content="website" />
<meta property="og:site_name"   content="AI Vision Contest" />
<meta name="twitter:card"       content="summary_large_image" />
<meta name="twitter:title"      content="${title}" />
<meta name="twitter:description"content="${desc}" />
<meta name="twitter:image"      content="${imageUrl}" />
</head>
<body>
  <p>Du använder en browser – här finns bara metadatan. Navigera gärna till <a href="/artists/${id}">${title}</a>.</p>
</body>
</html>`);
  } catch (err) {
    console.error(err);
    res.status(500).send(`<html><body><h1>AI Vision Contest</h1><p>Tyvärr ett fel.</p></body></html>`);
  }
}
