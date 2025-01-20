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
    "user-modify-playback-state", // um den Browser zum aktuellen Gerät zu machen
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
    res.send("Erfolgreich verbunden! Token gespeichert.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Fehler bei der Authentifizierung");
  }
});

app.get("/getAccessToken", (req, res) => {
  res.send(spotifyApi.getAccessToken());
});

app.listen(3000, () => {
  console.log("Server läuft auf http://localhost:3000");
});