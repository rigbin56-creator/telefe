const channelList = document.getElementById("channelList");
const video = document.getElementById("videoPlayer");
const loading = document.getElementById("loading");

let hls;
let channels = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

async function loadChannels() {
  try {
    const response = await fetch("ar.m3u");
    const text = await response.text();
    parseM3U(text);
    renderChannels();
  } catch (error) {
    channelList.innerHTML = "<p>Error cargando lista</p>";
  }
}

function parseM3U(data) {
  const lines = data.split("\n");

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const name = lines[i].split(",")[1]?.trim();
      const logoMatch = lines[i].match(/tvg-logo="(.*?)"/);
      const logo = logoMatch ? logoMatch[1] : null;
      const url = lines[i + 1]?.trim();

      if (url && name) {
        channels.push({ name, url, logo });
      }
    }
  }
}

function renderChannels() {
  channelList.innerHTML = "";

  const favChannels = channels.filter(c => favorites.includes(c.url));
  const normalChannels = channels.filter(c => !favorites.includes(c.url));

  const ordered = [...favChannels, ...normalChannels];

  ordered.forEach(channel => {
    const button = document.createElement("button");
    button.className = "channel-btn";
    button.tabIndex = 0;

    const logo = document.createElement("img");
    logo.className = "channel-logo";
    logo.src = channel.logo || "";
    logo.onerror = () => logo.style.display = "none";

    const name = document.createElement("span");
    name.className = "channel-name";
    name.textContent = channel.name;

    const heart = document.createElement("span");
    heart.className = "favorite-icon";
    heart.innerHTML = "❤";

    if (favorites.includes(channel.url)) {
      heart.classList.add("active");
    }

    heart.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(channel.url);
    });

    button.appendChild(logo);
    button.appendChild(name);
    button.appendChild(heart);

    button.addEventListener("click", () => {
      playChannel(channel.url);
    });

    channelList.appendChild(button);
  });
}

function toggleFavorite(url) {
  if (favorites.includes(url)) {
    favorites = favorites.filter(f => f !== url);
  } else {
    favorites.push(url);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderChannels();
}

function playChannel(url) {
  loading.style.display = "block";

  if (hls) {
    hls.destroy();
  }

  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      loading.style.display = "none";
      video.play();
    });
    hls.on(Hls.Events.ERROR, () => {
      loading.style.display = "none";
      alert("Error cargando canal");
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    video.addEventListener("loadedmetadata", () => {
      loading.style.display = "none";
      video.play();
    });
  }
}

loadChannels();
