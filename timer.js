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
const INITIAL_SECONDS = 10 * 60; // 10 minutos
let counter       = INITIAL_SECONDS;
let intervalId    = null;
let lastStatus    = null;
let isOwner       = false;

// ======= Helpers =======
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateDisplay(sec) {
  timerElem.textContent = formatTime(sec);
}

function clearLocalInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// ======= Timer Logic =======
function startLocalTimer(pushToDb = false) {
  clearLocalInterval();  // limpa qualquer intervalo anterior
  intervalId = setInterval(() => {
    counter--;
    updateDisplay(counter);

    // só o dono (quem clicou Start) empurra ao Firebase
    if (pushToDb) {
      update(timerRef, { seconds: counter });
    }

    if (counter <= 0) {
      clearLocalInterval();
      declareWinner();
    }
  }, 1000);
}

function declareWinner() {
  const ptsA = parseInt(document.getElementById("scoreA").textContent, 10);
  const ptsB = parseInt(document.getElementById("scoreB").textContent, 10);

  if (ptsA > ptsB) {
    resultElem.textContent = "🏆 Equipa A venceu!";
    resultElem.style.color = "blue";
  } else if (ptsB > ptsA) {
    resultElem.textContent = "🏆 Equipa B venceu!";
    resultElem.style.color = "red";
  } else {
    resultElem.textContent = "🤝 Empate!";
    resultElem.style.color = "gray";
  }

  let confCount = 0;
  const firework = setInterval(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    if (++confCount >= 5) clearInterval(firework);
  }, 700);
}

// ======= Event Handlers =======
startBtn.addEventListener("click", () => {
  isOwner = true;
  // define estado inicial e passa a dono
  update(timerRef, { seconds: counter, status: "running" });
});

pauseBtn.addEventListener("click", () => {
  isOwner = false;
  // pausa sem alterar o valor de seconds
  update(timerRef, { status: "paused" });
});

resetBtn.addEventListener("click", () => {
  isOwner = false;
  // reseta timer e pontos globalmente
  update(timerRef, { seconds: INITIAL_SECONDS, status: "reset" });
  set(scoreRef, { A: 0, B: 0 });
});

// ======= Firebase Listener =======
onValue(timerRef, (snap) => {
  const data = snap.val();
  if (!data) return;

  const { seconds, status } = data;

  // atualiza contador local e display
  if (typeof seconds === "number") {
    counter = seconds;
    updateDisplay(counter);
  }

  // reage apenas a mudanças de estado (running, paused, reset)
  if (status !== lastStatus) {
    // limpia qualquer intervalo ativo
    clearLocalInterval();

    if (status === "running") {
      // inicia contagem local; só dono empurra updates
      startLocalTimer(isOwner);

      startBtn.disabled = true;
      pauseBtn.disabled = false;
    }

    if (status === "paused") {
      startBtn.disabled = false;
      pauseBtn.disabled = true;
    }

    if (status === "reset") {
      // reseta display e estado local
      counter = INITIAL_SECONDS;
      updateDisplay(counter);
      resultElem.textContent = "";

      startBtn.disabled = false;
      pauseBtn.disabled = true;
    }

    lastStatus = status;
  }

  // garante declarar vencedor se chegar a zero
  if (counter <= 0) {
    clearLocalInterval();
    declareWinner();
  }
});
