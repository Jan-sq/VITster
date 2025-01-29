require("dotenv").config();
const express = require("express");
const path = require("path");
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, './public')));

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

app.get("/login", (req, res) => {
  const scopes = [
    "streaming",
    "user-modify-playback-state",
    "user-library-modify",
    "user-library-read",
    "user-read-currently-playing",
    "user-read-email",
    "user-read-private"
  ];
  const authUrl = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authUrl);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const accessToken = data.body["access_token"];
    const refreshToken = data.body["refresh_token"];
    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);
    console.log("Erfolgreich verbunden! Token gespeichert.");
    res.redirect("/index.html");
  } catch (error) {
    console.error(error);
    res.status(500).send("Fehler bei der Authentifizierung");
  }
});

app.get("/getAccessToken", (req, res) => {
  res.send(spotifyApi.getAccessToken());
});

app.get("/getRandomTrack", async (req, res) => {
  try {
    const randomId = await getRandomId();
    const track = await getTrackJSON(randomId);
    res.json(track);
  } catch (err) {
    console.error('Fehler:', err.message);
    res.status(500).send('Fehler beim Abrufen der Daten');
  }
});

async function getRandomId() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id FROM musik', (err, rows) => {
      if (err) {
        console.error('Fehler beim Abrufen der Tracks:', err.message);
        return reject(err);
      }
      if (rows.length === 0) {
        return reject(new Error('Keine Tracks gefunden'));
      }
      const randomTrack = rows[Math.floor(Math.random() * rows.length)];
      resolve(randomTrack.id);
    });
  });
}

async function getTrackJSON(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM musik WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Fehler beim Abrufen des Tracks:', err.message);
        return reject(err);
      }
      resolve(row);
    });
  });
}


app.listen(3000, () => {
  console.log("Server läuft auf http://localhost:3000");
});

//Datenbank
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'db', 'musik.db');
const db = new sqlite3.Database(dbPath, err => {
  if (err) {
    console.error('Datenbank-Fehler:', err.message);
  } else {
    console.log('Datenbank geöffnet.');
  }
});

// Erstelle Tabelle "musik", falls nicht vorhanden
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS musik (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      track_name TEXT,
      artist_name TEXT,
      track_uri TEXT,
      track_cover TEXT,
      release_date TEXT
    )
  `, err => {
    if (err) {
      console.error('Fehler beim Erstellen der Tabelle:', err.message);
    } else {
      console.log('Tabelle "musik" ist bereit');
    }
  });
});

app.post('/savePlaylist', (req, res) => {
  const playlistData = req.body;

  if (!playlistData.items || !Array.isArray(playlistData.items)) {
    return res.status(400).json({ error: 'Ungültiges Format der Playlist-Daten' });
  }

  const insertStmt = db.prepare(`
    INSERT INTO musik (track_name, artist_name, track_uri, track_cover, release_date)
    VALUES (?, ?, ?, ?, ?)
  `);

  playlistData.items.forEach(item => {
    if (item.track) {
      const track = item.track;
      const track_name = track.name || null;
      const artist_name = track.artists && track.artists.length > 0 ? track.artists.map(artist => artist.name).join(', ') : null;
      const track_uri = track.uri || null;
      const release_date = track.album && track.album.release_date ? track.album.release_date : null;

      const track_cover = track.album && track.album.images && track.album.images.length > 0 ? track.album.images[1].url : null;

      insertStmt.run(track_name, artist_name, track_uri, track_cover, release_date, err => {
        if (err) {
          console.error('Fehler beim Einfügen:', err.message);
        }
      });
    }
  });

  insertStmt.finalize();

  res.json({ message: 'Playlist erfolgreich gespeichert.' });
});