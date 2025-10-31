async function initAnalytics() {
  try {
    const configResponse = await fetch("/api/config");
    const config = await configResponse.json();

    if (!config.userApi) return;

    await fetch(`${config.userApi}/visitor/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Screen-Resolution": `${window.screen.width}x${window.screen.height}`,
        Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });
  } catch (e) {}
}

window.addEventListener("load", initAnalytics);

const player = document.getElementById("player");
const statusText = document.getElementById("status-text");

async function fetchNowPlaying() {
  try {
    const response = await fetch("/api/now-playing");
    const data = await response.json();

    if (data.title) {
      const progress = data.isPlaying
        ? (data.progress / data.duration) * 100
        : 0;

      statusText.textContent = data.isPlaying ? "" : "last seen listening to";

      player.innerHTML = `
    <div class="track">
      <img src="${data.albumArt}" alt="${
        data.album
      }" class="album-art" style="${data.isPlaying ? "" : "opacity: 0.7;"}">
      <div class="track-info">
        <div class="track-title" style="${
          data.isPlaying ? "" : "color: #999;"
        }">${data.title}</div>
        <div class="track-artist" style="${
          data.isPlaying ? "" : "color: #777;"
        }">${data.artist}</div>
        ${
          data.isPlaying
            ? `
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `;
    } else {
      statusText.textContent = "";
      player.innerHTML = `
        <div class="not-playing">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
          <div>not listening right now ☹️</div>
        </div>
      `;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchNowPlaying();
setInterval(fetchNowPlaying, 5000);
