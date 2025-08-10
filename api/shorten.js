// Einfache In-Memory-Lösung (funktioniert sofort auf Vercel)
const urlDatabase = new Map();

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    // Prüfen ob URL bereits existiert
    for (const [code, data] of urlDatabase.entries()) {
      if (data.original === url) {
        return res.json({ shortUrl: `https://macx.click/${code}` });
      }
    }

    // Neuen Short Code generieren
    const shortCode = generateShortCode();
    
    // In Memory speichern
    urlDatabase.set(shortCode, {
      original: url,
      created: new Date(),
      clicks: 0
    });

    res.json({ shortUrl: `https://macx.click/${shortCode}` });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Prüfen ob Code bereits existiert
  if (urlDatabase.has(result)) {
    return generateShortCode(); // Rekursiv neuen Code generieren
  }
  
  return result;
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
