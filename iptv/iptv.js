const masterURL = "https://iptv-org.github.io/iptv/index.country.m3u";

const countryList = document.getElementById("countryList");
const channelList = document.getElementById("channelList");
const video = document.getElementById("videoPlayer");
const loading = document.getElementById("loading");

let hls;
let countries = [];
let channels = [];

/* =========================
   CARGAR LISTA DE PAÍSES
========================= */

async function loadCountries() {
  try {
    const response = await fetch(masterURL);
    const text = await response.text();
    parseCountryM3U(text);
    renderCountries();
  } catch (error) {
    console.error("Error cargando países:", error);
  }
}

function parseCountryM3U(data) {
  const lines = data.split("\n");

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {

      const nameMatch = lines[i].match(/,(.*)$/);
      const url = lines[i + 1];

      if (!url || !url.startsWith("http")) continue;

      countries.push({
        name: nameMatch ? nameMatch[1].trim() : "País",
        url: url.trim()
      });
    }
  }
}

function renderCountries() {
  countryList.innerHTML = "";

  countries.forEach((country, index) => {
    const button = document.createElement("button");
    button.className = "country-btn";
    button.textContent = country.name;
    button.onclick = () => loadChannels(country.url);
    countryList.appendChild(button);
  });
}

/* =========================
   CARGAR CANALES DEL PAÍS
========================= */

async function loadChannels(url) {
  loading.style.display = "block";
  channelList.innerHTML = "";
  channels = [];

  try {
    const response = await fetch(url);
    const text = await response.text();
    parseChannelM3U(text);
    renderChannels();
  } catch (error) {
    console.error("Error cargando canales:", error);
  }

  loading.style.display = "none";
}

function parseChannelM3U(data) {
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
  channelList.innerHTML = "";

  channels.forEach((channel, index) => {
    const button = document.createElement("button");
    button.className = "channel-btn";
    button.textContent = channel.name;
    button.onclick = () => selectChannel(index);
    channelList.appendChild(button);
  });
}

function selectChannel(index) {
  document.querySelectorAll(".channel-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  const selectedBtn = document.querySelectorAll(".channel-btn")[index];
  selectedBtn.classList.add("active");

  playChannel(channels[index].url);
}

/* =========================
   REPRODUCTOR HLS
========================= */

function playChannel(url) {
  if (hls) {
    hls.destroy();
  }

  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    video.play();
  }
}

/* ========================= */

loadCountries();
