import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { id } = req.query;
  // Hämta artistdata från ditt backend
  const artist = await fetch(
    `${process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '')}/artist/${id}`
  ).then(r => r.json());

  res
    .status(200)
    .setHeader('Content-Type', 'text/html; charset=utf-8')
    .send(`<!DOCTYPE html>
<html lang="sv">
  <head>
    <meta charset="utf-8" />
    <title>${artist.name} – AI Vision Contest</title>
    <meta name="description"        content="${artist.background_story}" />
    <meta property="og:title"       content="${artist.name}" />
    <meta property="og:description" content="${artist.background_story}" />
    <meta property="og:image"       content="${artist.image_url}" />
    <meta property="og:url"         content="https://www.aivisioncontest.com/artists/${id}" />
    <meta property="og:type"        content="website" />
    <meta name="twitter:card"       content="summary_large_image" />
    <meta name="twitter:title"      content="${artist.name}" />
    <meta name="twitter:description"content="${artist.background_story}" />
    <meta name="twitter:image"      content="${artist.image_url}" />
  </head>
  <body>
    <script>
      // Riktiga användare vidarebefordras in i CRA-appen
      window.location.replace('/artists/${id}');
    </script>
  </body>
</html>`);
}
