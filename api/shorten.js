import Database from 'better-sqlite3';
import { join } from 'path';

// Datenbank initialisieren
let db;
try {
  db = new Database('/tmp/urls.db');
  db.exec(`
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      short_code TEXT UNIQUE,
      original_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      clicks INTEGER DEFAULT 0
    )
  `);
} catch (error) {
  console.error('Database initialization error:', error);
}

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
    const existing = db.prepare('SELECT short_code FROM urls WHERE original_url = ?').get(url);
    if (existing) {
      return res.json({ shortUrl: `https://macx.click/${existing.short_code}` });
    }

    // Neuen Short Code generieren
    const shortCode = generateShortCode();
    
    // In Datenbank speichern
    db.prepare('INSERT INTO urls (short_code, original_url) VALUES (?, ?)').run(shortCode, url);

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
  const existing = db.prepare('SELECT id FROM urls WHERE short_code = ?').get(result);
  if (existing) {
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
