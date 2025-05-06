// /api/ssr/test.js
export default async function handler(req, res) {
    res.setHeader("Cache-Control", "s-maxage=3600");
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="Test Title" />
        </head>
        <body>Test</body>
      </html>
    `);
  }