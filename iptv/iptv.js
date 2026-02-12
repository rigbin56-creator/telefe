const channelList = document.getElementById("channelList");
const video = document.getElementById("videoPlayer");
const statusMessage = document.getElementById("statusMessage");

let hls;

async function loadM3U() {
  try {
    const response = await fetch("ar.m3u");
    const text = await response.text();
    parseM3U(text);
  } catch (error) {
    statusMessage.textContent = "Error cargando lista M3U";
  }
}

function parseM3U(data) {
  const lines = data.split("\n");
  let channels = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const name = lines[i].split(",")[1];
      const url = lines[i + 1];

      if (url && url.startsWith("http")) {
        channels.push({ name, url });
      }
    }
  }

  renderChannels(channels);
}

function renderChannels(channels) {
  channelList.innerHTML = "";

  channels.forEach(channel => {
    const button = document.createElement("button");
    button.className = "channel-btn";
    button.textContent = channel.name;
    button.onclick = () => playChannel(channel.url, channel.name);
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

    hls.on(Hls.Events.MANIFEST_PARSED, function() {
      video.play();
      statusMessage.textContent = name;
    });

    hls.on(Hls.Events.ERROR, function() {
      statusMessage.textContent = "Error cargando canal";
    });

  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    video.addEventListener("loadedmetadata", function() {
      video.play();
      statusMessage.textContent = name;
    });
  } else {
    statusMessage.textContent = "HLS no soportado";
  }
}

loadM3U();
