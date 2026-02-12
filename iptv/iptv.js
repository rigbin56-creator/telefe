const playlistUrl = "https://iptv-org.github.io/iptv/index.country.m3u";
const channelContainer = document.getElementById("channels");
const video = document.getElementById("videoPlayer");

async function loadChannels() {
  const response = await fetch(playlistUrl);
  const text = await response.text();

  const lines = text.split("\n");

  let channels = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('tvg-country="AR"')) {
      const nameMatch = lines[i].match(/,(.*)$/);
      const url = lines[i + 1];

      if (nameMatch && url && url.startsWith("http")) {
        channels.push({
          name: nameMatch[1].trim(),
          url: url.trim()
        });
      }
    }
  }

  channels.forEach(channel => {
    const btn = document.createElement("button");
    btn.className = "channel-btn";
    btn.textContent = channel.name;

    btn.onclick = () => playChannel(channel.url);

    channelContainer.appendChild(btn);
  });
}

function playChannel(url) {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
  }
}

loadChannels();
