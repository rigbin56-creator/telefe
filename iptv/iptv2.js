document.addEventListener("DOMContentLoaded", () => {

  const channelList = document.getElementById("channelList");
  const videoPlayer = document.getElementById("videoPlayer");
  const statusMessage = document.getElementById("statusMessage");

  if (!channelList || !videoPlayer) {
    console.error("Elementos HTML no encontrados.");
    return;
  }

  let hls;

  const channels = [
    {
      name: "Canal 13",
      url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_Canal_13_Argentina.png"
    },
    {
      name: "Telefe",
      url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Telefe_logo_2018.png"
    }
  ];

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }

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
      logo.src = channel.logo;
      logo.className = "channel-logo";

      const name = document.createElement("span");
      name.textContent = channel.name;
      name.className = "channel-name";

      const fav = document.createElement("span");
      fav.textContent = "❤️";
      fav.className = "favorite-btn";

      if (favorites.includes(channel.name)) {
        fav.classList.add("favorite-active");
      }

      item.addEventListener("click", () => {
        playChannel(channel.url);
      });

      fav.addEventListener("click", (e) => {
        e.stopPropagation();

        if (favorites.includes(channel.name)) {
          favorites = favorites.filter(f => f !== channel.name);
        } else {
          favorites.push(channel.name);
        }

        saveFavorites();
        renderChannels();
      });

      item.appendChild(logo);
      item.appendChild(name);
      item.appendChild(fav);

      channelList.appendChild(item);
    });
  }

  function playChannel(url) {

    if (statusMessage) {
      statusMessage.style.display = "none";
    }

    if (hls) {
      hls.destroy();
    }

    if (videoPlayer.canPlayType("application/vnd.apple.mpegurl")) {
      videoPlayer.src = url;
      videoPlayer.play();
    } else if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoPlayer);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoPlayer.play();
      });
    } else {
      alert("Tu navegador no soporta HLS");
    }
  }

  renderChannels();

});
