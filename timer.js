import { database, ref, set, onValue, update } from "./firebase.js";

// Elementos
const btnI = document.getElementById("start");
const btnP = document.getElementById("pause");
const btnR = document.getElementById("reset");
const timer = document.getElementById("timer");
const result = document.getElementById("result");

// Firebase refs
const timerRef = ref(database, "timer");
const statusRef = ref(database, "timer/status");

// Estado
let counter = 900;
let intervaloID = null;

// Formata o tempo 
function formatTime(totalSecs) {
    const min = Math.floor(totalSecs / 60);
    const sec = totalSecs % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

// Atualiza o cronômetro na tela
function updateDisplay(seconds) {
    timer.textContent = formatTime(seconds);
}

// Lógica de contagem regressiva
function startLocalTimer() {
    if (intervaloID) return;
    intervaloID = setInterval(() => {
        counter--;
        set(timerRef, { seconds: counter, status: "running" });

        if (counter <= 0) {
            clearInterval(intervaloID);
            intervaloID = null;
            declareWinner();
        }
    }, 1000);
}

// Declara o vencedor com base nos pontos
function declareWinner() {
    const pointsA = parseInt(document.getElementById("scoreA").textContent);
    const pointsB = parseInt(document.getElementById("scoreB").textContent);

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

    // Confetti
    let count = 0;
    let fireworkInterval = setInterval(() => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        count++;
        if (count >= 5) clearInterval(fireworkInterval);
    }, 700);
}

// Botão Start
btnI.addEventListener("click", () => {
    set(timerRef, { seconds: counter, status: "running" });
    startLocalTimer();
});

// Botão Pause
btnP.addEventListener("click", () => {
    clearInterval(intervaloID);
    intervaloID = null;
    update(timerRef, { status: "paused" });
});

// Botão Reset
btnR.addEventListener("click", () => {
    clearInterval(intervaloID);
    intervaloID = null;
    counter = 900;
    result.textContent = "";
    updateDisplay(counter);
    set(timerRef, { seconds: counter, status: "reset" });
});

// Escuta mudanças no Firebase
onValue(timerRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const { seconds, status } = data;

    counter = seconds;
    updateDisplay(counter);

    if (status === "paused") {
        clearInterval(intervaloID);
        intervaloID = null;
    }

    if (status === "reset") {
        clearInterval(intervaloID);
        intervaloID = null;
        result.textContent = "";
    }

    if (counter <= 0) {
        clearInterval(intervaloID);
        intervaloID = null;
        declareWinner();
    }
});
