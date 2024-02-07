// Global variabledeklaration
let stars = [];
let pellets = [];
let asteroids = [];
let spaceship;
let gameActive = true;
let score = 0;
let lives = 3;
let totalScore = 0;

// Opsætningsfunktion
function setup() {
  createCanvas(windowWidth, windowHeight);
  createStars(500);
  let spaceshipColor = color(255);
  spaceship = new Spaceship(spaceshipColor);
}

// Tegnefunktion
function draw() {
  background(0);

    // Opdater og vis stjerner
  for (let star of stars) {
    star.move();
    star.display();
  }

    // Opdater og vis asteroider
  for (let asteroid of asteroids) {
    asteroid.update();
    asteroid.display();

    // Behandle kollision med rumskibet
    if (gameActive && asteroid.hits(spaceship)) {
      handleAsteroidCollision(asteroid);
    }
  }
  // Behandle kollisioner mellem pellets og asteroider
  handlePelletAsteroidCollisions();
  
  // Opdater og vis rumskibet
  spaceship.update();
  spaceship.display();

  // Vis score og liv
  displayScoreAndLives();
 
  // Vis "Game Over" besked, hvis spillet er slut
  if (!gameActive) {
    displayGameOver();
  }
  // Spawn asteroider efter behov
  spawnAsteroidIfNeeded();
}

// Funktion til at håndtere kollision med asteroid
function handleAsteroidCollision(asteroid) {
  asteroids.splice(asteroids.indexOf(asteroid), 1);
  lives--;

  // Hvis livene er opbrugt, afslut spillet
  if (lives <= 0) {
    gameActive = false;
  } else {
     // Reset rumskibets position og fjern alle asteroider
    resetSpaceshipPosition();
    asteroids = [];
  }
}

// Funktion til at håndtere kollisioner mellem pellets og asteroider
function handlePelletAsteroidCollisions() {
  for (let i = pellets.length - 1; i >= 0; i--) {
    let pellet = pellets[i];
    pellet.update();
    pellet.display();

    for (let j = asteroids.length - 1; j >= 0; j--) {
      let asteroid = asteroids[j];
      if (pellet.hits(asteroid)) {
        handleAsteroidShot(pellet, asteroid);
        break;
      }
    }
  }
}

// Funktion til at håndtere skud mod asteroider
function handleAsteroidShot(pellet, asteroid) {
  // Beregn points baseret på asteroidens størrelse og opdater score
  let asteroidScore = map(asteroid.size, 40, 120, 10, 2);
  score += ceil(asteroidScore);

  pellets.splice(pellets.indexOf(pellet), 1);

  if (asteroid.hits(pellet)) {
    asteroids.splice(asteroids.indexOf(asteroid), 1);
  }
}

// Funktion til at nulstille rumskibets position
function resetSpaceshipPosition() {
  spaceship.setPosition(width / 2, height / 2);
}

// Funktion til at vise score og liv
function displayScoreAndLives() {
  textAlign(LEFT, TOP);
  textSize(40);
  fill(255);
  // Vis score
  text("Score: " + score, 20, 20);

  // Vis liv som hjerteikoner
  textAlign(LEFT, TOP);
  textSize(40);
  fill(255);
  let hearts = "";
  for (let i = 0; i < lives; i++) {
    hearts += "❤️ ";
  }
  text(hearts, 15, 65);
}

// Funktion til at vise "Game Over" besked
function displayGameOver() {
  fill(0);
  rect(0, 0, width, height);

  // Vis "Game Over" og total score
  textSize(32);
  fill(255);
  textAlign(CENTER, CENTER);
  text("Game Over", width / 2, height / 2);

  textSize(24);
  text("Total Score: " + totalScore, width / 2, height / 2 + 40);

  // Opdater total score og nulstil nuværende score
  totalScore += score;
  score = 0;
}

// Spawn en ny asteroid hver 60 frame, hvis spillet er aktivt
function spawnAsteroidIfNeeded() {
  if (gameActive && frameCount % 60 === 0) {
    spawnAsteroid();
  }
}

// Funktion til at oprette stjerner
function createStars(numStars) {
  for (let i = 0; i < numStars; i++) {
    stars.push(new Star());
  }
}

// Juster lærredets størrelse og nulstil rumskibets position
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  resetSpaceshipPosition();
}

// Event handler for tastetryk
function keyPressed() {
  if (keyCode === UP_ARROW && gameActive) {
    spaceship.isBoosting = true;
  } else if (keyCode === RIGHT_ARROW) {
    spaceship.rotation = 0.1;
  } else if (keyCode === LEFT_ARROW) {
    spaceship.rotation = -0.1;
  } else if (key === ' ' && gameActive) {
    let pellet = new Pellet(spaceship.pos, spaceship.heading);
    pellets.push(pellet);
  }
}

// Event handler for tastetryksslip
function keyReleased() {
  if (keyCode === UP_ARROW) {
    spaceship.isBoosting = false;
  } else if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
    spaceship.rotation = 0;
  }
}

// Funktion til at spawne asteroider
function spawnAsteroid() {
  // Bias-faktor og variabler til position og hastighed
  let biasFactor = 0.8;
  let side = floor(random(4));
  let x, y, velX, velY;
  const speedRange = 3;

  // Initial position af rumskibet
  let initialSpaceshipPos = createVector(spaceship.pos.x, spaceship.pos.y);

  // Bias-værdier for hver side af lærredet
  let bias = {
    0: 1,
    1: 1,
    2: 1,
    3: 1
  };

  // Juster bias baseret på rumskibets position
  if (spaceship.pos.x < width / 2) {
    bias[1] *= biasFactor;
    bias[3] *= biasFactor;
  } else {
    bias[0] *= biasFactor;
    bias[2] *= biasFactor;
  }

  // Beregn total bias og generer tilfældig bias-værdi
  let totalBias = bias[0] + bias[1] + bias[2] + bias[3];
  let randBias = random(totalBias);

  // Bestem spawn side baseret på bias
  if (randBias < bias[0] / totalBias) side = 0;
  else if (randBias < (bias[0] + bias[1]) / totalBias) side = 1;
  else if (randBias < (bias[0] + bias[1] + bias[2]) / totalBias) side = 2;
  else side = 3;

  // Beregn position og hastighed baseret på spawn side
  switch (side) {
    case 0:
      x = random(width);
      y = -40;
      break;
    case 1:
      x = width + 40;
      y = random(height);
      break;
    case 2:
      x = random(width);
      y = height + 40;
      break;
    case 3:
      x = -40;
      y = random(height);
      break;
  }

  // Opret ny asteroid med beregnede værdier
  let asteroidPos = createVector(x, y);
  let direction = p5.Vector.sub(initialSpaceshipPos, asteroidPos).normalize();
  velX = direction.x * speedRange;
  velY = direction.y * speedRange;

  let asteroid = new Asteroid(x, y, velX, velY);
  asteroids.push(asteroid);
}

// Konstruktør for stjerner
class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(1, 5);
    this.color = color(random(200, 255), random(200, 255), random(200, 255), random(150, 255));
    this.speed = random(0.1, 1);
  }

  move() {
    this.x = (this.x - this.speed + width) % width;
  }

  display() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.size, this.size);
  }
}

  // Konstruktør for asteroider
class Asteroid {
  constructor(x, y, velX, velY) {
    this.pos = createVector(x, y);
    this.vel = createVector(velX, velY);
    this.size = random(20, 80);
    this.color = color(random(25, 100));
    this.shapeVertices = this.createAsteroidShape();
    this.hitboxScale = 1.2;
    this.rotationAngle = 0;
    this.rotationSpeed = random(-0.04, 0.04);
  }

  update() {
    this.pos.add(this.vel);
    this.rotationAngle += this.rotationSpeed;
  }

  display() {
    noStroke();
    fill(this.color);

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotationAngle);

    beginShape();
    for (let i = 0; i < this.shapeVertices.length; i += 2) {
      let x = this.shapeVertices[i] * this.size;
      let y = this.shapeVertices[i + 1] * this.size;
      vertex(x, y);
    }
    endShape(CLOSE);

    pop();
  }

  hits(pellet) {
    let isHit = this.pointInsidePolygon(pellet.pos.x, pellet.pos.y);

    if (isHit) {
      this.split();
      return true;
    }

    return false;
  }

  pointInsidePolygon(x, y) {
    let isInside = false;
    let verticesCount = this.shapeVertices.length / 2;

    for (let i = 0, j = verticesCount - 1; i < verticesCount; j = i++) {
      let xi = this.pos.x + this.shapeVertices[i * 2] * this.size;
      let yi = this.pos.y + this.shapeVertices[i * 2 + 1] * this.size;
      let xj = this.pos.x + this.shapeVertices[j * 2] * this.size;
      let yj = this.pos.y + this.shapeVertices[j * 2 + 1] * this.size;

      let intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

      if (intersect) isInside = !isInside;
    }

    return isInside;
  }

  split() {
    if (this.size > 20) {
      let newAsteroid1 = new Asteroid(this.pos.x, this.pos.y, random(-2, 2), random(-2, 2));
      let newAsteroid2 = new Asteroid(this.pos.x, this.pos.y, random(-2, 2), random(-2, 2));
      newAsteroid1.size = this.size / 2;
      newAsteroid2.size = this.size / 2;
      asteroids.push(newAsteroid1);
      asteroids.push(newAsteroid2);
    }
  }

  createAsteroidShape() {
    let vertices = [];
    for (let i = 0; i < 20; i++) {
      let angle = map(i * 18, 0, 360, 0, TWO_PI);
      let radius = 1 + random(-0.3, 0.3);
      vertices.push(cos(angle) * radius, sin(angle) * radius);
    }
    return vertices;
  }
}

// Konstruktør for rumskib
class Spaceship {
  constructor(spaceshipColor) {
    this.pos = createVector(width / 2, height / 2);
    this.r = 20;
    this.heading = 0;
    this.rotation = 0;
    this.vel = createVector(0, 0);
    this.color = spaceshipColor;
    this.isBoosting = false;
  }

  update() {
    this.edges();
    this.pos.add(this.vel);
    this.vel.mult(0.99);
    if (this.isBoosting) {
      this.boost();
    }
    this.heading += this.rotation;
  }

  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    else if (this.pos.x < 0) this.pos.x = width;

    if (this.pos.y > height) this.pos.y = 0;
    else if (this.pos.y < 0) this.pos.y = height;
  }

  boost() {
    let force = p5.Vector.fromAngle(this.heading);
    force.mult(0.1);
    this.vel.add(force);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.heading + PI / 2);

    if (this.isBoosting) {
      fill(255, 165, 0);
      triangle(-this.r / 2, this.r, this.r / 2, this.r, 0, this.r + random(10, 20));
    }

    noFill();
    stroke(this.color);
    triangle(-this.r, this.r, this.r, this.r, 0, -this.r);
    pop();
  }

  setPosition(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }
}

  // Konstruktør for pellets
class Pellet {
  constructor(position, heading) {
    let offset = p5.Vector.fromAngle(heading);
    offset.mult(10);
    this.pos = position.copy().add(offset);
    this.vel = p5.Vector.fromAngle(heading);
    this.vel.mult(8);
    this.color = color(255, 0, 0);
  }

  update() {
    this.pos.add(this.vel);
  }

  display() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, 8, 8);
  }

  hits(asteroid) {
    return asteroid.pointInsidePolygon(this.pos.x, this.pos.y);
  }
}