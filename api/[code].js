import Database from 'better-sqlite3';

let db;
try {
  db = new Database('/tmp/urls.db');
} catch (error) {
  console.error('Database connection error:', error);
}

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(404).send('URL not found');
  }

  try {
    // URL aus Datenbank abrufen
    const result = db.prepare('SELECT original_url FROM urls WHERE short_code = ?').get(code);

    if (!result) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>404 - URL nicht gefunden</h1>
            <p>Die angeforderte kurze URL existiert nicht.</p>
            <a href="https://macx.click">← Zurück zu macx.click</a>
          </body>
        </html>
      `);
    }

    // Klick zählen
    db.prepare('UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?').run(code);

    // Weiterleitung (301 = permanent redirect)
    res.writeHead(301, { Location: result.original_url });
    res.end();
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Server error');
  }
}
