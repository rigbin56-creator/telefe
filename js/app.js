function loadPage(url) {
    document.getElementById("player").src = url;
    document.getElementById("playerWrapper").focus();
}

function loadYT(videoId) {
    document.getElementById("player").src =
        "https://www.youtube.com/embed/" + videoId + "?autoplay=1";
    document.getElementById("playerWrapper").focus();
}

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("closed");
}

function toggleFullscreen() {
    const elem = document.getElementById("playerWrapper");

    if (!document.fullscreenElement) {
        elem.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}
