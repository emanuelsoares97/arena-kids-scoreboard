import { database, ref, set, update, onValue } from "./firebase.js";

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
const INITIAL_SECONDS = 10 * 60; // 15 minutos
let counter    = INITIAL_SECONDS;
let intervalId = null;
let lastStatus = null;

// ======= Helpers =======
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateDisplay(sec) {
  timerElem.textContent = formatTime(sec);
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

// ======= Event Handlers =======
startBtn.addEventListener("click", () => {
  // inicia o timer e notifica o Firebase
  update(timerRef, { seconds: counter, status: "running" });
});

pauseBtn.addEventListener("click", () => {
  // pausa e notifica o Firebase sem alterar segundos
  update(timerRef, { status: "paused" });
});

resetBtn.addEventListener("click", () => {
  // reset global do timer e dos pontos
  update(timerRef, { seconds: INITIAL_SECONDS, status: "reset" });
  set(scoreRef, { A: 0, B: 0 });
});

// ======= Firebase Listener =======
onValue(timerRef, (snap) => {
  const data = snap.val();
  if (!data) return;

  const { seconds, status } = data;
  counter = typeof seconds === "number" ? seconds : counter;
  updateDisplay(counter);

  // Quando o status mudar, ajusta intervalos e botões
  if (status !== lastStatus) {
    // limpa qualquer timer ativo
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (status === "running") {
      // cliente "ouvinte" inicia contagem local sem push
      intervalId = setInterval(() => {
        counter--;
        updateDisplay(counter);
        update(timerRef, { seconds: counter });

        if (counter <= 0) {
          clearInterval(intervalId);
          intervalId = null;
          declareWinner();
        }
      }, 1000);

      startBtn.disabled = true;
      pauseBtn.disabled = false;
    }

    if (status === "paused") {
      startBtn.disabled = false;
      pauseBtn.disabled = true;
    }

    if (status === "reset") {
      // reset local state
      counter = INITIAL_SECONDS;
      updateDisplay(counter);
      resultElem.textContent = "";

      startBtn.disabled = false;
      pauseBtn.disabled = true;
    }

    lastStatus = status;
  }
});