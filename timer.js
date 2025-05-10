import { database, ref, set, onValue, update } from "./firebase.js";

// Elementos do DOM
const btnI = document.getElementById("start");
const btnP = document.getElementById("pause");
const btnR = document.getElementById("reset");
const timerElem = document.getElementById("timer");
const result    = document.getElementById("result");

// Referência no Firebase
const timerRef = ref(database, "timer");

// Estado local
let counter    = 900;   // 15 minutos
let intervaloID = null;

// Formata total de segundos para MM:SS
function formatTime(totalSecs) {
  const min = Math.floor(totalSecs / 60);
  const sec = totalSecs % 60;
  return `${min.toString().padStart(2, "0")}:${sec
    .toString()
    .padStart(2, "0")}`;
}

// Atualiza o display do cronômetro
function updateDisplay(seconds) {
  timerElem.textContent = formatTime(seconds);
}

// Inicia o timer localmente.
// Se pushToDb for true, este cliente envia cada tick ao Firebase.
function startLocalTimer(pushToDb = false) {
  if (intervaloID) return;  // evita múltiplos intervals
  intervaloID = setInterval(() => {
    counter--;
    updateDisplay(counter);

    if (pushToDb) {
      set(timerRef, { seconds: counter, status: "running" });
    }

    if (counter <= 0) {
      clearInterval(intervaloID);
      intervaloID = null;
      declareWinner();
    }
  }, 1000);
}

// Mostra confetti e anúncio do vencedor
function declareWinner() {
  const pointsA = parseInt(document.getElementById("scoreA").textContent, 10);
  const pointsB = parseInt(document.getElementById("scoreB").textContent, 10);

  if (pointsA > pointsB) {
    result.textContent = "🏆 Equipa A venceu!";
    result.style.color = "blue";
  } else if (pointsB > pointsA) {
    result.textContent = "🏆 Equipa B venceu!";
    result.style.color = "red";
  } else {
    result.textContent = "🤝 Empate!";
    result.style.color = "gray";
  }

  let count = 0;
  const fireworkInterval = setInterval(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    if (++count >= 5) clearInterval(fireworkInterval);
  }, 700);
}

// ===== Eventos dos botões =====

// Start: só este cliente “empurra” os ticks ao Firebase
btnI.addEventListener("click", () => {
  set(timerRef, { seconds: counter, status: "running" });
  startLocalTimer(true);
  btnI.disabled = true;
  btnP.disabled = false;
});

// Pause: limpa o intervalo local e notifica o Firebase
btnP.addEventListener("click", () => {
  clearInterval(intervaloID);
  intervaloID = null;
  update(timerRef, { status: "paused" });
  btnI.disabled = false;
  btnP.disabled = true;
});

// Reset: volta ao estado inicial em todos os clientes
btnR.addEventListener("click", () => {
  clearInterval(intervaloID);
  intervaloID = null;
  counter = 900;
  result.textContent = "";
  updateDisplay(counter);
  set(timerRef, { seconds: counter, status: "reset" });

  
  
  pointsA = 0;
  pointsB = 0;

  scoreA.textContent = pointsA;
  scoreB.textContent = pointsB;

  btnI.disabled = false;
  btnP.disabled = true;
});

// ===== Listener do Firebase =====

onValue(timerRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  const { seconds, status } = data;
  counter = seconds;
  updateDisplay(counter);

  if (status === "running") {
    // este cliente apenas exibe, sem empurrar updates
    startLocalTimer(false);
  }

  if (status === "paused" || status === "reset") {
    clearInterval(intervaloID);
    intervaloID = null;
    if (status === "reset") result.textContent = "";
  }

  if (counter <= 0) {
    clearInterval(intervaloID);
    intervaloID = null;
    declareWinner();
  }
});
