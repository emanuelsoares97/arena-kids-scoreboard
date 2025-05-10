import { database, ref, set, onValue, update } from "./firebase.js";

// ===== DOM Elements =====
const startBtn   = document.getElementById("start");
const pauseBtn   = document.getElementById("pause");
const resetBtn   = document.getElementById("reset");
const timerElem  = document.getElementById("timer");
const resultElem = document.getElementById("result");

// ===== Firebase References =====
const timerRef = ref(database, "timer");
const scoreRef = ref(database, "score");

// ===== Constants & State =====
const INITIAL_SECONDS = 15 * 60;  // 15 minutos
let counter    = INITIAL_SECONDS;
let intervalId = null;

// ===== Helpers =====
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateDisplay(sec) {
  timerElem.textContent = formatTime(sec);
}

// ===== Core Timer Logic =====
function startLocalTimer(pushToDb = false) {
  if (intervalId) return;  // evita múltiplos intervals
  intervalId = setInterval(() => {
    counter--;
    updateDisplay(counter);

    if (pushToDb) {
      set(timerRef, { seconds: counter, status: "running" });
    }

    if (counter <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      declareWinner();
    }
  }, 1000);
}

function declareWinner() {
  const pointsA = parseInt(document.getElementById("scoreA").textContent, 10);
  const pointsB = parseInt(document.getElementById("scoreB").textContent, 10);

  if (pointsA > pointsB) {
    resultElem.textContent = "🏆 Equipa A venceu!";
    resultElem.style.color = "blue";
  } else if (pointsB > pointsA) {
    resultElem.textContent = "🏆 Equipa B venceu!";
    resultElem.style.color = "red";
  } else {
    resultElem.textContent = "🤝 Empate!";
    resultElem.style.color = "gray";
  }

  let confCount = 0;
  const fireworks = setInterval(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    if (++confCount >= 5) clearInterval(fireworks);
  }, 700);
}

// ===== Button Event Listeners =====
startBtn.addEventListener("click", () => {
  set(timerRef, { seconds: counter, status: "running" });
  startLocalTimer(true);

  startBtn.disabled = true;
  pauseBtn.disabled = false;
});

pauseBtn.addEventListener("click", () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  update(timerRef, { status: "paused" });

  startBtn.disabled = false;
  pauseBtn.disabled = true;
});

resetBtn.addEventListener("click", () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  counter = INITIAL_SECONDS;
  updateDisplay(counter);
  resultElem.textContent = "";

  set(timerRef, { seconds: counter, status: "reset" });
  set(scoreRef, { A: 0, B: 0 });

  startBtn.disabled = false;
  pauseBtn.disabled = true;
});

// ===== Firebase Listener =====
onValue(timerRef, (snap) => {
  const data = snap.val();
  if (!data) return;

  const { seconds, status } = data;
  counter = seconds;
  updateDisplay(seconds);

  // Controla UI e intervalos conforme o status
  if (status === "running") {
    startLocalTimer(false);
    startBtn.disabled = true;
    pauseBtn.disabled = false;
  } else if (status === "paused") {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  } else if (status === "reset") {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    resultElem.textContent = "";
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  if (counter <= 0) {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    declareWinner();
  }
});