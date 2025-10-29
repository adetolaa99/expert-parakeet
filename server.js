require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 1000;

app.use(cors());
app.use(express.static("public"));

let accessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const auth = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=refresh_token&refresh_token=" +
      process.env.SPOTIFY_REFRESH_TOKEN,
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + response.data.expires_in * 1000;
  return accessToken;
}

app.get("/api/now-playing", async (req, res) => {
  try {
    const token = await getAccessToken();

    const response = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 204 || !response.data.item) {
      return res.json({ isPlaying: false });
    }

    const { item, is_playing, progress_ms } = response.data;

    res.json({
      isPlaying: is_playing,
      title: item.name,
      artist: item.artists.map((a) => a.name).join(", "),
      album: item.album.name,
      albumArt: item.album.images[0]?.url,
      progress: progress_ms,
      duration: item.duration_ms,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.json({ isPlaying: false });
  }
});

app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});
