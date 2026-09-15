const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const volumeValue = document.getElementById("volumeValue");
const titleEl = document.getElementById("songTitle");
const artistEl = document.getElementById("artist");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const playlistEl = document.getElementById("playlist");
const songCountEl = document.getElementById("songCount");
const autoplay = document.getElementById("autoplay");
const shuffleBtn = document.getElementById("shuffleBtn");
const fileInput = document.getElementById("fileInput");
const card = document.querySelector(".player-card");

let songs = [
  {
    title: "Demo Song",
    artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  }
];

let currentIndex = 0;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function renderPlaylist() {
  playlistEl.innerHTML = "";
  songs.forEach((song, index) => {
    const item = document.createElement("div");
    item.className = `track ${index === currentIndex ? "active" : ""}`;
    item.innerHTML = `
      <span class="track-number">${index + 1}</span>
      <span class="track-icon">♫</span>
      <span class="track-info">
        <strong>${escapeHtml(song.title)}</strong>
        <span>${escapeHtml(song.artist)}</span>
      </span>
      <span class="track-duration">${index === currentIndex ? formatTime(audio.duration) : "—"}</span>
    `;
    item.addEventListener("click", () => loadSong(index, true));
    playlistEl.appendChild(item);
  });

  songCountEl.textContent = `${songs.length} ${songs.length === 1 ? "song" : "songs"}`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function loadSong(index, shouldPlay = false) {
  currentIndex = (index + songs.length) % songs.length;
  const song = songs[currentIndex];

  audio.src = song.src;
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  progress.value = 0;
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  renderPlaylist();

  if (shouldPlay) {
    audio.play().catch(() => {});
  }
}

function updatePlayButton() {
  const playing = !audio.paused;
  playBtn.textContent = playing ? "❚❚" : "▶";
  card.classList.toggle("playing", playing);
}

playBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
});

prevBtn.addEventListener("click", () => {
  loadSong(currentIndex - 1, true);
});

nextBtn.addEventListener("click", () => {
  if (autoplay.checked || !audio.paused) {
    loadSong(currentIndex + 1, true);
  } else {
    loadSong(currentIndex + 1, false);
  }
});

audio.addEventListener("play", updatePlayButton);
audio.addEventListener("pause", updatePlayButton);

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
  renderPlaylist();
});

audio.addEventListener("timeupdate", () => {
  if (audio.duration) {
    progress.value = (audio.currentTime / audio.duration) * 100;
  }
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("ended", () => {
  if (autoplay.checked) {
    loadSong(currentIndex + 1, true);
  } else {
    updatePlayButton();
  }
});

progress.addEventListener("input", () => {
  if (audio.duration) {
    audio.currentTime = (progress.value / 100) * audio.duration;
  }
});

volume.addEventListener("input", () => {
  audio.volume = Number(volume.value);
  volumeValue.textContent = `${Math.round(audio.volume * 100)}%`;
});

shuffleBtn.addEventListener("click", () => {
  if (songs.length < 2) return;
  let next;
  do {
    next = Math.floor(Math.random() * songs.length);
  } while (next === currentIndex);
  loadSong(next, true);
});

fileInput.addEventListener("change", (event) => {
  const files = [...event.target.files];

  files.forEach(file => {
    songs.push({
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Local file",
      src: URL.createObjectURL(file)
    });
  });

  renderPlaylist();

  if (files.length && songs.length === files.length + 1) {
    loadSong(1, false);
  }
});

audio.volume = 0.8;
loadSong(0, false);
