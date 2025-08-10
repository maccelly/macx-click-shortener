// Geteilte URL-Datenbank (einfache Lösung)
const urlDatabase = new Map();

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(404).send('URL not found');
  }

  try {
    // URL aus Memory abrufen
    const result = urlDatabase.get(code);

    if (!result) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>404 - URL nicht gefunden</h1>
            <p>Die angeforderte kurze URL existiert nicht oder ist abgelaufen.</p>
            <a href="https://macx.click">← Zurück zu macx.click</a>
          </body>
        </html>
      `);
    }

    // Klick zählen
    result.clicks = (result.clicks || 0) + 1;

    // Weiterleitung (301 = permanent redirect)
    res.writeHead(301, { Location: result.original });
    res.end();
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Server error');
  }
}
