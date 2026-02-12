const channelList = document.getElementById("channelList");
const video = document.getElementById("videoPlayer");
const statusMessage = document.getElementById("statusMessage");

let hls;
let channels = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

async function loadM3U() {
  try {
    const response = await fetch("ar.m3u");
    const text = await response.text();
    parseM3U(text);
  } catch (error) {
    statusMessage.textContent = "Error cargando lista M3U";
    console.error(error);
  }
}

function parseM3U(data) {
  const lines = data.split("\n");
  channels = [];

  for (let i = 0; i < lines.length; i++) {

    if (lines[i].startsWith("#EXTINF")) {

      const infoLine = lines[i];
      const url = lines[i + 1]?.trim();

      if (!url || !url.startsWith("http")) continue;

      const parts = infoLine.split(",");
      let name = parts.length > 1 ? parts[1].trim() : "Canal";

      const logoMatch = infoLine.match(/tvg-logo="([^"]+)"/);
      const logo = logoMatch ? logoMatch[1] : "";

      channels.push({ name, url, logo });
    }
  }

  renderChannels();
}

function renderChannels() {

  channelList.innerHTML = "";

  const sorted = [...channels].sort((a, b) => {
    return favorites.includes(b.name) - favorites.includes(a.name);
  });

  sorted.forEach(channel => {

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
    heart.textContent = "❤️";

    if (favorites.includes(channel.name)) {
      heart.classList.add("active");
    }

    button.addEventListener("click", () => {
      playChannel(channel.url, channel.name);
    });

    heart.addEventListener("click", (e) => {
      e.stopPropagation();

      if (favorites.includes(channel.name)) {
        favorites = favorites.filter(f => f !== channel.name);
      } else {
        favorites.push(channel.name);
      }

      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderChannels();
    });

    button.appendChild(logo);
    button.appendChild(name);
    button.appendChild(heart);

    channelList.appendChild(button);
  });
}

function playChannel(url, name) {

  statusMessage.textContent = "Cargando " + name + "...";

  if (hls) {
    hls.destroy();
  }

  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play();
      statusMessage.textContent = name;
    });

    hls.on(Hls.Events.ERROR, function () {
      statusMessage.textContent = "Error cargando canal";
    });

  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {

    video.src = url;
    video.addEventListener("loadedmetadata", function () {
      video.play();
      statusMessage.textContent = name;
    });

  } else {
    statusMessage.textContent = "HLS no soportado";
  }
}

loadM3U();
