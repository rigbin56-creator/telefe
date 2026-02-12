document.addEventListener("DOMContentLoaded", () => {

  const channelList = document.getElementById("channelList");
  const videoPlayer = document.getElementById("videoPlayer");
  const statusMessage = document.getElementById("statusMessage");

  let hls;
  let channels = [];
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (!channelList || !videoPlayer || !statusMessage) {
    console.error("Faltan elementos HTML.");
    return;
  }

  // ----------------------------
  // CARGAR ARCHIVO M3U LOCAL
  // ----------------------------
  fetch("ar.m3u")
    .then(res => res.text())
    .then(data => {
      parseM3U(data);
      renderChannels();
    })
    .catch(err => {
      console.error("Error cargando ar.m3u:", err);
      statusMessage.innerText = "Error cargando lista IPTV";
    });

  // ----------------------------
  // PARSER M3U REAL
  // ----------------------------
  function parseM3U(data) {
    const lines = data.split("\n");

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("#EXTINF")) {

        const infoLine = lines[i];
        const url = lines[i + 1]?.trim();

        if (!url || url.startsWith("#")) continue;

        const nameMatch = infoLine.match(/,(.+)$/);
        const logoMatch = infoLine.match(/tvg-logo="([^"]+)"/);

        const name = nameMatch ? nameMatch[1].trim() : "Canal";
        const logo = logoMatch ? logoMatch[1] : "";

        channels.push({ name, url, logo });
      }
    }
  }

  // ----------------------------
  // RENDERIZAR LISTA
  // ----------------------------
  function renderChannels() {

    channelList.innerHTML = "";

    const sorted = [...channels].sort((a, b) => {
      return favorites.includes(b.name) - favorites.includes(a.name);
    });

    sorted.forEach(channel => {

      const item = document.createElement("div");
      item.className = "channel-item";
      item.tabIndex = 0;

      const logo = document.createElement("img");
      logo.src = channel.logo || "";
      logo.className = "channel-logo";
      logo.onerror = () => logo.style.display = "none";

      const name = document.createElement("span");
      name.textContent = channel.name;
      name.className = "channel-name";

      const fav = document.createElement("span");
      fav.innerText = "❤️";
      fav.className = "favorite-btn";

      if (favorites.includes(channel.name)) {
        fav.classList.add("favorite-active");
      }

      // CLICK CANAL
      item.addEventListener("click", () => {
        playChannel(channel.url, channel.name);
      });

      // FAVORITO
      fav.addEventListener("click", (e) => {
        e.stopPropagation();

        if (favorites.includes(channel.name)) {
          favorites = favorites.filter(f => f !== channel.name);
        } else {
          favorites.push(channel.name);
        }

        localStorage.setItem("favorites", JSON.stringify(favorites));
        renderChannels();
      });

      item.appendChild(logo);
      item.appendChild(name);
      item.appendChild(fav);

      channelList.appendChild(item);
    });
  }

  // ----------------------------
  // REPRODUCIR CANAL
  // ----------------------------
  function playChannel(url, name) {

    statusMessage.style.display = "block";
    statusMessage.innerText = "Cargando: " + name;

    if (hls) {
      hls.destroy();
    }

    videoPlayer.pause();
    videoPlayer.removeAttribute("src");
    videoPlayer.load();

    if (videoPlayer.canPlayType("application/vnd.apple.mpegurl")) {

      videoPlayer.src = url;
      videoPlayer.play();

    } else if (Hls.isSupported()) {

      hls = new Hls({
        maxBufferLength: 30
      });

      hls.loadSource(url);
      hls.attachMedia(videoPlayer);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoPlayer.play();
      });

      hls.on(Hls.Events.ERROR, function () {
        statusMessage.innerText = "Error cargando canal";
      });

    } else {
      statusMessage.innerText = "HLS no soportado";
    }

    videoPlayer.onplaying = () => {
      statusMessage.style.display = "none";
    };

    videoPlayer.onerror = () => {
      statusMessage.innerText = "No se pudo reproducir el canal";
    };
  }

});
