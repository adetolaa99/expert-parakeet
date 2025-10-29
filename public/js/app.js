const player = document.getElementById("player");

async function fetchNowPlaying() {
  try {
    const response = await fetch("/api/now-playing");
    const data = await response.json();

    if (data.isPlaying) {
      const progress = (data.progress / data.duration) * 100;

      player.innerHTML = `
        <div class="track">
          <img src="${data.albumArt}" alt="${data.album}" class="album-art">
          <div class="track-info">
            <div class="track-title">${data.title}</div>
            <div class="track-artist">${data.artist}</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
          </div>
        </div>
      `;
    } else {
      player.innerHTML = `
        <div class="not-playing">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
          <div>not listening right now 😞</div>
        </div>
      `;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchNowPlaying();
setInterval(fetchNowPlaying, 5000);
