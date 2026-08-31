const eventDate = new Date("2026-09-12T15:00:00-05:00").getTime();
const loader = document.getElementById("loader");
const invitation = document.getElementById("invitation");
const musicChoice = document.getElementById("music-choice");
const musicPlayer = document.getElementById("music-player");
const musicToggle = document.getElementById("music-toggle");
const progressCurrent = document.getElementById("progress-current");
const timeDisplay = document.getElementById("time-display");
const audio = new Audio("./assets/music.mp3");

audio.preload = "metadata";
let isPlaying = false;

function updateCountdown() {
    const distance = eventDate - Date.now();

    if (distance <= 0) {
        document.getElementById("countdown").innerHTML = "<p>¡Ya comenzó la celebración!</p>";
        return;
    }

    document.getElementById("days").textContent = String(Math.floor(distance / 86400000)).padStart(2, "0");
    document.getElementById("hours").textContent = String(Math.floor((distance % 86400000) / 3600000)).padStart(2, "0");
    document.getElementById("minutes").textContent = String(Math.floor((distance % 3600000) / 60000)).padStart(2, "0");
    document.getElementById("seconds").textContent = String(Math.floor((distance % 60000) / 1000)).padStart(2, "0");
}

function formatTime(value) {
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderPlayerState() {
    musicToggle.textContent = isPlaying ? "Ⅱ" : "▶";
    musicToggle.setAttribute("aria-label", isPlaying ? "Pausar música" : "Reproducir música");
}

function startMusic() {
    audio.play().then(() => {
        isPlaying = true;
        renderPlayerState();
    }).catch(() => {
        isPlaying = false;
        renderPlayerState();
    });
}

function closeMusicChoice(playMusic) {
    musicChoice.classList.remove("is-visible");
    document.body.classList.remove("choice-open");

    if (playMusic) {
        startMusic();
    } else {
        audio.pause();
        isPlaying = false;
        renderPlayerState();
    }
}

function readPassFromUrl() {
    const raw = window.location.search.slice(1);
    if (!raw) return;

    const parts = decodeURIComponent(raw).split("-");
    if (parts.length < 3) return;

    const firstName = parts[0].trim();
    const lastName = parts[1].trim();
    const passes = Number(parts[2]);

    if (!firstName || !lastName || !Number.isInteger(passes) || passes < 1) return;

    document.getElementById("pass-card").hidden = false;
    document.getElementById("guest-name").textContent = `${firstName} ${lastName}`;
    document.getElementById("pass-number").textContent = passes;
    document.getElementById("pass-title").textContent = passes === 1 ? "Pase" : "Pases";
    document.getElementById("pass-label").textContent = passes === 1 ? "Lugar" : "Lugares";
}

window.addEventListener("load", () => {
    window.setTimeout(() => {
        loader.hidden = true;
        invitation.hidden = false;
        musicPlayer.classList.add("is-visible");
        musicChoice.classList.add("is-visible");
        document.body.classList.add("choice-open");
    }, 6000);
});

document.getElementById("music-yes").addEventListener("click", () => closeMusicChoice(true));
document.getElementById("music-no").addEventListener("click", () => closeMusicChoice(false));

musicToggle.addEventListener("click", () => {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        renderPlayerState();
    } else {
        startMusic();
    }
});

audio.addEventListener("timeupdate", () => {
    const progress = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progressCurrent.style.width = `${progress}%`;
    timeDisplay.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
    timeDisplay.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    startMusic();
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

readPassFromUrl();
updateCountdown();
window.setInterval(updateCountdown, 1000);
