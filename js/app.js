function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');
}

function loadEmbed(url) {
    document.getElementById('player').src = url;
}

function loadYT(videoId) {
    document.getElementById('player').src =
        "https://www.youtube.com/embed/" + videoId + "?autoplay=1";
}
