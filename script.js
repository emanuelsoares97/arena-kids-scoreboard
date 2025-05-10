import { database, ref, set, onValue } from "./firebase.js";

let scoreA = document.getElementById("scoreA");
let scoreB = document.getElementById("scoreB");
let btnPlus = document.querySelectorAll(".plus");
let btnMinus = document.querySelectorAll(".minus");

let pointsA = 0;
let pointsB = 0;

function updateFirebase() {
    set(ref(database, "score"), {
        A: pointsA,
        B: pointsB
    });
}

// Escuta as alterações no Firebase
onValue(ref(database, "score"), (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    pointsA = data.A;
    pointsB = data.B;

    scoreA.textContent = pointsA;
    scoreB.textContent = pointsB;
});

// Quando clicam nos botões:
btnPlus.forEach(button => {
    button.addEventListener("click", function () {
        if (button.dataset.team === "A") {
            pointsA++;
        } else if (button.dataset.team === "B") {
            pointsB++;
        }
        updateFirebase();
    });
});

btnMinus.forEach(button => {
    button.addEventListener("click", function () {
        if (button.dataset.team === "A" && pointsA > 0) {
            pointsA--;
        } else if (button.dataset.team === "B" && pointsB > 0) {
            pointsB--;
        }
        updateFirebase();
    });
});
