let score = 0;
let gameRunning = false;
let playerName = '';
let speed = 3000;
let flyTimeout;
let enemyInterval;
let bgMusic = document.getElementById('bgMusic');

const car = document.getElementById('car');
const gameContainer = document.getElementById('gameContainer');
const scoreDisplay = document.getElementById('score');
const finalScore = document.getElementById('finalScore');
const leaderboardList = document.getElementById('leaderboardList');

document.getElementById('menuToggle').onclick = () => {
  document.getElementById('menu').classList.toggle('hidden');
};

function startLogin() {
  const input = document.getElementById('playerName').value.trim();
  if (input) {
    playerName = input;
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('nameDisplay').textContent = playerName;
    startCountdown();
  }
}

function startCountdown() {
  let count = 3;
  const cd = document.getElementById('countdown');
  const interval = setInterval(() => {
    cd.textContent = count;
    if (count-- === 0) {
      clearInterval(interval);
      document.getElementById('startScreen').classList.add('hidden');
      document.getElementById('gameUI').classList.remove('hidden');
      startGame();
    }
  }, 1000);
}

function startGame() {
  score = 0;
  gameRunning = true;
  updateScore();
  bgMusic.play();
  enemyInterval = setInterval(createEnemy, 1000);
}

function pauseGame() {
  gameRunning = false;
  clearInterval(enemyInterval);
  bgMusic.pause();
}

function resumeGame() {
  gameRunning = true;
  bgMusic.play();
  enemyInterval = setInterval(createEnemy, 1000);
}

function restartGame(fromOver = false) {
  clearInterval(enemyInterval);
  document.querySelectorAll('.enemy').forEach(e => e.remove());
  score = 0;
  speed = 3000;
  updateScore();
  car.style.left = "135px";
  document.getElementById('gameOverScreen').classList.add('hidden');
  if (fromOver) document.getElementById('gameUI').classList.remove('hidden');
  gameRunning = true;
  bgMusic.play();
  enemyInterval = setInterval(createEnemy, 1000);
}

function updateScore() {
  scoreDisplay.textContent = "Score: " + score;
}

function moveLeft() {
  let left = car.offsetLeft;
  if (left > 10) car.style.left = (left - 30) + "px";
}

function moveRight() {
  let left = car.offsetLeft;
  if (left < gameContainer.clientWidth - 50) car.style.left = (left + 30) + "px";
}

function activateFly() {
  if (flyTimeout) return;
  car.textContent = "✈️";
  car.style.transform = "translateY(-100px)";
  flyTimeout = setTimeout(() => {
    car.textContent = "🚔";
    car.style.transform = "translateY(0)";
    flyTimeout = null;
  }, 2000);
}

function createEnemy() {
  if (!gameRunning) return;
  const enemy = document.createElement('div');
  enemy.classList.add('enemy');
  enemy.style.left = Math.floor(Math.random() * (gameContainer.offsetWidth - 36)) + 'px';
  enemy.textContent = '🚘';
  enemy.style.animationDuration = `${speed / 1000}s`;
  gameContainer.appendChild(enemy);

  const checkCollision = setInterval(() => {
    if (!gameRunning || !enemy.parentElement) return clearInterval(checkCollision);

    let enemyTop = enemy.offsetTop;
    let carLeft = car.offsetLeft;
    let enemyLeft = enemy.offsetLeft;

    if (
      enemyTop > gameContainer.offsetHeight - 100 &&
      enemyLeft < carLeft + 36 &&
      enemyLeft + 36 > carLeft
    ) {
      if (!flyTimeout) gameOver();
      clearInterval(checkCollision);
    }

    if (enemyTop > gameContainer.offsetHeight) {
      enemy.remove();
      score++;
      updateScore();
      if (score % 10 === 0 && speed > 1000) speed -= 200;
    }
  }, 30);
}

function gameOver() {
  gameRunning = false;
  bgMusic.pause();
  document.getElementById('gameUI').classList.add('hidden');
  document.getElementById('gameOverScreen').classList.remove('hidden');
  finalScore.textContent = score;
  saveLeaderboard();
}

function saveLeaderboard() {
  let data = JSON.parse(localStorage.getItem('leaderboard')) || [];
  data.push({ name: playerName, score });
  data.sort((a, b) => b.score - a.score);
  localStorage.setItem('leaderboard', JSON.stringify(data.slice(0, 5)));

  leaderboardList.innerHTML = "";
  data.slice(0, 5).forEach((entry, i) => {
    leaderboardList.innerHTML += `<li>${i + 1}. ${entry.name} - ${entry.score}</li>`;
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') moveLeft();
  if (e.key === 'ArrowRight') moveRight();
  if (e.key.toLowerCase() === 'g') activateFly();
});
