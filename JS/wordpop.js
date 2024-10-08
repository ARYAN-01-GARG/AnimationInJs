// Get canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 200;
canvas.height = window.innerHeight - 200;
canvas.style.border = "1px solid #fff";
canvas.style.borderRadius = "5px";
canvas.style.margin = "auto";
canvas.style.background = "rgba(0,0,0,0.1)";
const start = document.getElementById("button1");
const wordInput = document.getElementById("wordInput");
const scoreDisplay = document.getElementById("score");
const remainingWordsDisplay = document.getElementById("remainingWords");

let spheres = [];
let gameInterval;
let spawnInterval;
let spawnSpeed = 3000;
let score = 0;
const maxSpheres = 30;

class Sphere {
  constructor(word) {
    this.word = word;
    this.radius = this.calculateRadius(word);
    this.x = Math.random() * (canvas.width - 2 * this.radius) + this.radius;
    this.y = Math.random() * (canvas.height - 2 * this.radius) + this.radius;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.isPopping = false;
    this.popFrame = 0;
  }

  calculateRadius(word) {
    const baseRadius = 30;
    const extraRadius = word.length * 2; // Adjust multiplier as needed
    return baseRadius + extraRadius;
  }

  draw() {
    if (this.isPopping) {
      this.popFrame++;
      if (this.popFrame > 10) {
        return; // Skip drawing if pop animation is done
      }
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isPopping
      ? "rgba(255, 0, 0, 0.7)"
      : "rgba(0, 150, 255, 0.7)";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.font = "22px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.word, this.x, this.y);
  }

  update() {
    if (this.isPopping) {
      this.radius -= 2; // Shrink the sphere during pop animation
      return;
    }
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off walls
    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
      this.vx = -this.vx;
    }
    if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
      this.vy = -this.vy;
    }

    // Bounce off other spheres
    for (let sphere of spheres) {
      if (sphere !== this && this.isCollidingWith(sphere)) {
        this.resolveCollision(sphere);
      }
    }
  }

  isCollidingWith(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + other.radius;
  }

  resolveCollision(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalized direction vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Relative velocity
    const vx = this.vx - other.vx;
    const vy = this.vy - other.vy;

    // Dot product of relative velocity and normalized direction
    const dotProduct = vx * nx + vy * ny;

    // Calculate the impulse scalar
    const impulse = (2 * dotProduct) / (this.radius + other.radius);

    // Apply impulse to the velocities
    this.vx -= impulse * other.radius * nx;
    this.vy -= impulse * other.radius * ny;
    other.vx += impulse * this.radius * nx;
    other.vy += impulse * this.radius * ny;
  }

  pop() {
    this.isPopping = true;
  }
}

const startGame = () => {
  spheres = [];
  score = 0;
  spawnSpeed = 3000;
  updateScore();
  gameInterval = setInterval(updateGame, 30);
  spawnInterval = setInterval(spawnSphere, spawnSpeed);
  wordInput.addEventListener("input", handleInput);
  wordInput.focus();
};

const resetGame = () => {
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  wordInput.removeEventListener("input", handleInput);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const spawnSphere = () => {
  if (spheres.length >= maxSpheres) {
    alert("Game Over! Maximum number of spheres reached.");
    resetGame();
    return;
  }

  let word;
  let newSphere;
  let isColliding;

  do {
    word = generateRandomWord();
    newSphere = new Sphere(word);
    isColliding = spheres.some((sphere) => newSphere.isCollidingWith(sphere));
  } while (isColliding);

  spheres.push(newSphere);
  updateRemainingWords();
};

const generateRandomWord = () => {
  const words = [
    "apple",
    "grape",
    "peach",
    "plum",
    "berry",
    "mango",
    "lemon",
    "melon",
    "olive",
    "kiwi",
    "fig",
    "date",
    "lime",
    "pear",
    "cherry",
    "apric",
    "guava",
    "papay",
    "quinc",
    "tomat",
    "onion",
    "radis",
    "carro",
    "beet",
    "corn",
    "beans",
    "peas",
    "okra",
    "kale",
    "spin",
    "yam",
    "zucch",
    "squas",
    "turni",
    "leek",
  ];
  return words[Math.floor(Math.random() * words.length)];
};

const handleInput = (event) => {
  const typedWord = event.target.value.trim().toLowerCase();
  for (let i = 0; i < spheres.length; i++) {
    if (spheres[i].word === typedWord) {
      spheres[i].pop();
      score++;
      updateScore();
      if (score % 10 === 0) {
        increaseSpawnSpeed();
      }
      event.target.value = ""; // Clear the input field
      break;
    }
  }
};

const updateGame = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  spheres = spheres.filter(
    (sphere) => !sphere.isPopping || sphere.popFrame <= 10
  );
  for (let sphere of spheres) {
    sphere.update();
    sphere.draw();
  }
  updateRemainingWords();
};

const updateScore = () => {
  scoreDisplay.textContent = `Score: ${score}`;
};

const updateRemainingWords = () => {
  remainingWordsDisplay.textContent = `Remaining Words: ${spheres.length}`;
};

const increaseSpawnSpeed = () => {
  clearInterval(spawnInterval);
  spawnSpeed = Math.max(500, spawnSpeed - 500); // Decrease spawn speed, minimum 500ms
  spawnInterval = setInterval(spawnSphere, spawnSpeed);
};

start.addEventListener("click", () => {
  if (start.textContent === "Start") {
    start.textContent = "Stop";
    startGame();
  } else {
    start.textContent = "Start";
    resetGame();
  }
});
