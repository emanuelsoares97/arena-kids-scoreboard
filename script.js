let scoreA = document.getElementById("scoreA")
let scoreB = document.getElementById("scoreB")

let btnPlus = document.querySelectorAll(".plus")

let btnMinus = document.querySelectorAll(".minus")


let pointsA = 0;

let pointsB = 0;

btnPlus.forEach(button =>{
    button.addEventListener("click", function() {
        if(button.dataset.team === "A"){
            pointsA++
            scoreA.textContent=pointsA
        }
        else if (button.dataset.team === "B"){
            pointsB++
            scoreB.textContent=pointsB
        }
    })
})

btnMinus.forEach(button => {
    button.addEventListener("click", function () {
        if (button.dataset.team === "A") {
            if (pointsA <= 0) {
                scoreA.textContent = 0;
                return;
            }
            pointsA--;
            scoreA.textContent = pointsA;
        } else if (button.dataset.team === "B") {
            if (pointsB <= 0) {
                scoreB.textContent = 0;
                return;
            }
            pointsB--;
            scoreB.textContent = pointsB;
        }
    });
});

    
