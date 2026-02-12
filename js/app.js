function loadPage(url) {
    document.getElementById("player").src = url;
}

function loadYT(videoId) {
    document.getElementById("player").src =
        "https://www.youtube.com/embed/" + videoId + "?autoplay=1";
}

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("closed");
}

/* FULLSCREEN REAL DEL CONTENEDOR */
function toggleFullscreen() {
    const elem = document.getElementById("playerWrapper");

    if (!document.fullscreenElement) {
        elem.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}
