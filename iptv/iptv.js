const playlistURL = "https://iptv-org.github.io/iptv/countries/ar.m3u";

const channelList = document.getElementById("channelList");
const video = document.getElementById("videoPlayer");
const loading = document.getElementById("loading");

let hls;
let channels = [];

async function loadPlaylist() {
  try {
    const response = await fetch(playlistURL);
    const text = await response.text();
    parseM3U(text);
    renderChannels();
  } catch (error) {
    channelList.innerHTML = "<p>Error cargando lista.</p>";
    console.error(error);
  }
}

function parseM3U(data) {
  const lines = data.split("\n");

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {

      const nameMatch = lines[i].match(/,(.*)$/);
      const url = lines[i + 1];

      if (!url || !url.startsWith("http")) continue;

      channels.push({
        name: nameMatch ? nameMatch[1].trim() : "Canal",
        url: url.trim()
      });
    }
  }
}

function renderChannels() {
  if (channels.length === 0) {
    channelList.innerHTML = "<p>No se encontraron canales.</p>";
    return;
  }

  channelList.innerHTML = "";

  channels.forEach((channel, index) => {
    const button = document.createElement("button");
    button.className = "channel-btn";
    button.textContent = channel.name;
    button.onclick = () => selectChannel(index);
    channelList.appendChild(button);
  });

  selectChannel(0);
}

function selectChannel(index) {
  document.querySelectorAll(".channel-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  const selectedBtn = document.querySelectorAll(".channel-btn")[index];
  selectedBtn.classList.add("active");

  playChannel(channels[index].url);
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
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    video.addEventListener("loadedmetadata", () => {
      loading.style.display = "none";
      video.play();
    });
  }
}

loadPlaylist();
