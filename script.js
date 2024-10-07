const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Center ball properties
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const centralBallRadius = 30; // Radius of the center ball
const cannonRadius = 100; // Radius of the circle where the cannon moves
let cannonAngle = 0; // Angle of the cannon
let cannonballs = []; // Store cannonballs
let cannonColor = "red"; // Initial cannon color
let approachingBalls = []; // Store approaching balls
let spawnInterval = 2000; // Interval for spawning new balls in milliseconds
const colors = ["red", "green"]; // Only two colors for the cannon and approaching balls

// Cannonball constructor
class CannonBall {
  constructor(x, y, angle, color) {
    this.x = x; // Position x
    this.y = y; // Position y
    this.radius = 5; // Radius of the cannonball
    this.speed = 5; // Speed of the cannonball
    this.angle = angle; // Direction of the cannonball
    this.color = color; // Color of the cannonball
  }

  update() {
    // Move the cannonball in the direction of the cannon's mouth
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
  }

  draw() {
    ctx.fillStyle = this.color; // Use cannonball color
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

// Approaching ball constructor
class ApproachingBall {
  constructor(x, y, color) {
    this.x = x; // Position x
    this.y = y; // Position y
    this.radius = 15; // Radius of the approaching ball
    this.color = color; // Color of the approaching ball
    this.speed = 1; // Speed of the approaching ball
  }

  update() {
    // Move towards the center ball
    const angle = Math.atan2(centerY - this.y, centerX - this.x);
    this.x += Math.cos(angle) * this.speed;
    this.y += Math.sin(angle) * this.speed;
  }

  draw() {
    ctx.fillStyle = this.color; // Use approaching ball color
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

// Function to draw the center ball
function drawCentralBall() {
  ctx.fillStyle = "yellow"; // Color of the central ball
  ctx.beginPath();
  ctx.arc(centerX, centerY, centralBallRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

// Function to shoot cannonballs
function shoot() {
  const cannonX = centerX + cannonRadius * Math.cos(cannonAngle);
  const cannonY = centerY + cannonRadius * Math.sin(cannonAngle);
  const cannonBall = new CannonBall(cannonX, cannonY, cannonAngle, cannonColor); // Use cannon color
  cannonballs.push(cannonBall); // Add to cannonballs array
}

// Draw cannon function
function drawCannon() {
  const cannonX = centerX + cannonRadius * Math.cos(cannonAngle);
  const cannonY = centerY + cannonRadius * Math.sin(cannonAngle);

  ctx.save(); // Save the current drawing state
  ctx.translate(cannonX, cannonY); // Move to cannon position
  ctx.rotate(cannonAngle); // Rotate the context to the cannon angle

  ctx.fillStyle = cannonColor; // Use cannon color
  ctx.fillRect(-10, -5, 20, 10); // Draw cannon rectangle
  ctx.restore(); // Restore the previous drawing state
}

// Function to spawn approaching balls
function spawnApproachingBall() {
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  // Randomly choose one of the four edges
  const edge = Math.floor(Math.random() * 4);
  let randomX, randomY;

  switch (edge) {
    case 0: // Top edge
      randomX = Math.random() * canvas.width;
      randomY = 0; // Fixed at the top
      break;
    case 1: // Right edge
      randomX = canvas.width; // Fixed at the right
      randomY = Math.random() * canvas.height;
      break;
    case 2: // Bottom edge
      randomX = Math.random() * canvas.width;
      randomY = canvas.height; // Fixed at the bottom
      break;
    case 3: // Left edge
      randomX = 0; // Fixed at the left
      randomY = Math.random() * canvas.height;
      break;
  }

  const approachingBall = new ApproachingBall(randomX, randomY, randomColor);
  approachingBalls.push(approachingBall); // Add to approaching balls array
}

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  // Draw central ball
  drawCentralBall();

  // Draw cannon
  drawCannon();

  // Update and draw cannonballs
  cannonballs.forEach((cannonBall, index) => {
    cannonBall.update();
    cannonBall.draw();

    // Remove cannonball if it goes off-screen
    if (
      cannonBall.x < 0 ||
      cannonBall.x > canvas.width ||
      cannonBall.y < 0 ||
      cannonBall.y > canvas.height
    ) {
      cannonballs.splice(index, 1);
    }

    // Check for collision with approaching balls
    approachingBalls.forEach((approachingBall, ballIndex) => {
      if (
        Math.hypot(
          cannonBall.x - approachingBall.x,
          cannonBall.y - approachingBall.y
        ) <
        cannonBall.radius + approachingBall.radius
      ) {
        if (cannonBall.color === approachingBall.color) {
          // Remove both balls if they collide and colors match
          cannonballs.splice(index, 1);
          approachingBalls.splice(ballIndex, 1);
        }
      }
    });
  });

  // Update and draw approaching balls
  approachingBalls.forEach((approachingBall, index) => {
    approachingBall.update();
    approachingBall.draw();

    // Remove approaching ball if it goes off-screen or reaches the center
    if (
      approachingBall.x < 0 ||
      approachingBall.x > canvas.width ||
      approachingBall.y < 0 ||
      approachingBall.y > canvas.height
    ) {
      approachingBalls.splice(index, 1);
    }
  });

  requestAnimationFrame(gameLoop); // Request the next frame
}

// Update cannon angle based on mouse position
canvas.addEventListener("mousemove", (event) => {
  const mouseX = event.clientX - canvas.offsetLeft;
  const mouseY = event.clientY - canvas.offsetTop;

  // Calculate angle to rotate cannon towards mouse
  cannonAngle = Math.atan2(mouseY - centerY, mouseX - centerX);
});

// Change cannon color on spacebar press
window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    const currentColorIndex = colors.indexOf(cannonColor);
    const nextColorIndex = (currentColorIndex + 1) % colors.length;
    cannonColor = colors[nextColorIndex]; // Change cannon color
  }
});

// Shoot cannonball on mouse click
canvas.addEventListener("mousedown", () => {
  shoot(); // Call shoot function on mouse click
});

// Spawn approaching balls at a regular interval
setInterval(spawnApproachingBall, spawnInterval); // Spawn a ball every 2 seconds

gameLoop(); // Start the game loop
