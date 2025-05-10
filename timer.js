import { database, ref, set, onValue, update } from "./firebase.js";

// ======= DOM Elements =======
const startBtn   = document.getElementById("start");
const pauseBtn   = document.getElementById("pause");
const resetBtn   = document.getElementById("reset");
const timerElem  = document.getElementById("timer");
const resultElem = document.getElementById("result");

// ======= Firebase References =======
const timerRef = ref(database, "timer");
const scoreRef = ref(database, "score");

// ======= Constants & State =======
const INITIAL_SECONDS = 15 * 60; // 15 minutos
let counter    = INITIAL_SECONDS;
let intervalId = null;

// ======= Helpers =======
function formatTime(totalSecs) {
  const m = Math.floor(totalSecs / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSecs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateDisplay(sec) {
  timerElem.textContent = formatTime(sec);
}

// ======= Core Timer Logic =======
function startLocalTimer(pushToDb = false) {
  if (intervalId) return;          // já existe um intervalo a correr
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

// ======= Button Event Listeners =======
startBtn.addEventListener("click", () => {
  // inicializa no Firebase e passa pushToDb=true
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

  // restabelece o estado inicial do timer
  counter = INITIAL_SECONDS;
  updateDisplay(counter);
  resultElem.textContent = "";

  // actualiza Firebase
  set(timerRef, { seconds: counter, status: "reset" });
  // faz reset global dos pontos
  set(scoreRef, { A: 0, B: 0 });

  startBtn.disabled = false;
  pauseBtn.disabled = true;
});

// ======= Firebase Listener =======
onValue(timerRef, (snap) => {
  const data = snap.val();
  if (!data) return;

  const { seconds, status } = data;
  counter = seconds;
  updateDisplay(counter);

  if (status === "running") {
    // apenas exibe, sem empurrar updates
    startLocalTimer(false);
  } else {
    // pausa ou reset — limpa intervalo local
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (status === "reset") {
      resultElem.textContent = "";
    }
  }

  if (counter <= 0) {
    clearInterval(intervalId);
    intervalId = null;
    declareWinner();
  }
});
