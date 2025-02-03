javascript
const gameArea = document.getElementById('gameArea');
const basket = document.getElementById('basket');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('startButton');

let score = 0;
let gameActive = false;
let basketPos = 120; // Начальная позиция корзины

document.addEventListener('keydown', moveBasket);
startButton.addEventListener('click', startGame);

function moveBasket(event) {
    if (!gameActive) return;

    const gameAreaWidth = gameArea.clientWidth;
    const basketWidth = basket.clientWidth;

    if (event.key === 'ArrowLeft' && basketPos > 0) {
        basketPos -= 15;
    } else if (event.key === 'ArrowRight' && basketPos < gameAreaWidth - basketWidth) {
        basketPos += 15;
    }

    basket.style.left = basketPos + 'px';
}

function startGame() {
    score = 0;
    gameActive = true;
    scoreDisplay.textContent = 'Очки: 0';
    startButton.disabled = true;
    dropFruit();
}

function dropFruit() {
    const fruit = document.createElement('div');
    fruit.classList.add('fruit');
    const randomX = Math.floor(Math.random() * (gameArea.clientWidth - 30));
    fruit.style.left = randomX + 'px';
    gameArea.appendChild(fruit);

    let fruitFall = setInterval(() => {
        const fruitPos = fruit.offsetTop + 5;
        fruit.style.top = fruitPos + 'px';

        if (fruitPos > gameArea.clientHeight) {
            clearInterval(fruitFall);
            fruit.remove();
            endGame();
        } else if (isCaught(fruit)) {
            clearInterval(fruitFall);
            fruit.remove();
            score++;
            scoreDisplay.textContent = 'Очки: ' + score;
            dropFruit(); // Появление нового фрукта
        }
    }, 100);
}

function isCaught(fruit) {
    const fruitRect = fruit.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect();
    return (
        fruitRect.bottom >= basketRect.top &&
        fruitRect.left >= basketRect.left &&
        fruitRect.right <= basketRect.right
    );
}

function endGame() {
    gameActive = false;
    alert('Игра окончена! Вы набрали ' + score + ' очков.');
    startButton.disabled = false;
    gameArea.innerHTML = ''; // Очистить игровую область
}
