const btnI = document.getElementById("start");
const btnP = document.getElementById("pause");
const btnR = document.getElementById("reset");

let timer = document.getElementById("timer");

let counter = 900;
let intervaloID;

btnI.addEventListener("click", () => {
    if (!intervaloID) {
        intervaloID = setInterval(counterTime, 1000);
    }
});

btnP.addEventListener("click", () => {
    clearInterval(intervaloID);
    intervaloID = null;
});

btnR.addEventListener("click", () => {
    counter = 900;
    timer.textContent = time(counter);
    clearInterval(intervaloID);
    intervaloID = null;
    result.textContent = "";

    pointsA=0
    pointsB=0
    
    scoreA.textContent = pointsA;
    scoreB.textContent = pointsB;
});


function counterTime() {
    counter--;
    timer.textContent = time(counter);

    if (counter <= 0) {
    clearInterval(intervaloID);
    intervaloID = null;

    const result = document.getElementById("result");

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


    if (counter <= 0) {
        counter = 0; }

    let count = 0;
    let fireworkInterval = setInterval(() => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        count++;
        if (count >= 5) {
            clearInterval(fireworkInterval);
        }
    }, 700); // ms entre cada explosao
}}


function time(totalSecs) {
    let min = Math.floor(totalSecs / 60);
    let sec = totalSecs % 60;

    min = min < 10 ? "0" + min : min;
    sec = sec < 10 ? "0" + sec : sec;

    return `${min}:${sec}`;
}
