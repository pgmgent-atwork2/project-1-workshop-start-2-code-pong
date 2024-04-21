// de grootte van een tegel en het aantal rijen en kolommen op het speelbord
// tegelgrootte is in dit geval 32px
let tileSize = 32;
let rows = 16;
let columns = 16;

// variabelen voor het speelbord en de grootte ervan
let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let context;

//vvariabelen voor het ruimteschip
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = (tileSize * columns) / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

// het ruimteschip object met positie en grootte
let ship = {
  x: shipX,
  y: shipY,
  width: shipWidth,
  height: shipHeight,
};

// Definieer variabelen voor het ruimteschipafbeelding en de snelheid van het ruimteschip
let shipImg;
let shipVelocityX = tileSize;

// Definieer variabelen voor de aliens
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize * 1;

// Startcoördinaten voor aliens
let alienX = tileSize;
let alienY = tileSize;

// Variabelen voor afbeeldingen en kenmerken van aliens
let alienImg;
let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;

// Snelheid van de aliens
let alienVelocityX = 1;

// Variabelen voor kogels
let bulletArray = [];
let bulletVelocityY = -10;

// Variabelen voor score en spelstatus
let score = 0;
let gameOver = false;

// Functie die wordt uitgevoerd wanneer de pagina is geladen
window.onload = function () {
  // Vind het speelbord en stel de grootte ervan in
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d");

  // Laad afbeeldingen van het ruimteschip en aliens
  shipImg = new Image();
  shipImg.src = "/img/ship.png";
  shipImg.onload = function () {
    // Tekenen van het ruimteschip
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
  };

  alienImg = new Image();
  alienImg.src = "/img/alien.png";

  // Creëer een groep aliens
  creatAliens();

  // Start de game loop
  requestAnimationFrame(update);

  // Luister naar toetsaanslagen voor beweging van het ruimteschip en schieten
  document.addEventListener("keydown", moveShip);
  // key up om ervoor te zorgen dat je de spatiebalk niet ingedrukt kan houden
  document.addEventListener("keyup", shoot);
};

// Functie voor het updaten van de gamestatus en het tekenen van het speelbord
function update() {
  // Vraag de browser om een nieuwe frame te tekenen
  requestAnimationFrame(update);

  // Stop de update als het spel voorbij is
  if (gameOver) {
    return;
  }

  // Wis het vorige frame van het speelbord
  context.clearRect(0, 0, board.width, board.height);

  // Tekenen van het ruimteschip
  context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

  // Tekenen van de aliens
  for (let i = 0; i < alienArray.length; i++) {
    let alien = alienArray[i];
    if (alien.alive) {
      // Bewegen van aliens en detecteren van aanraken rand van bord
      alien.x += alienVelocityX;
      if (alien.x + alien.width >= board.width || alien.x <= 0) {
        alienVelocityX *= -1;
        alien.x += alienVelocityX * 2;
        // Verplaats de aliens naar beneden als ze de zijkant raken
        for (let j = 0; j < alienArray.length; j++) {
          alienArray[j].y += alienHeight;
        }
      }
      // Tekenen van de alien
      context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);
      // Controleer of aliens het ruimteschip raken
      if (alien.y >= ship.y) {
        gameOver = true;
      }
    }
  }

  // Tekenen van de kogels en detecteren van botsingen met aliens
  for (let i = 0; i < bulletArray.length; i++) {
    let bullet = bulletArray[i];
    bullet.y += bulletVelocityY;
    context.fillStyle = "white";
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    for (let j = 0; j < alienArray.length; j++) {
      let alien = alienArray[j];
      if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
        bullet.used = true;
        alien.alive = false;
        alienCount--;
        score += 100;
      }
    }
  }

  // Opruimen van gebruikte kogels
  while (
    bulletArray.length > 0 &&
    (bulletArray[0].used || bulletArray[0].y < 0)
  ) {
    bulletArray.shift();
  }

  // Start een nieuw level als alle aliens zijn verslagen
  if (alienCount == 0) {
    alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
    alienRows = Math.min(alienRows + 1, rows - 4);
    alienVelocityX += 0.2;
    alienArray = [];
    bulletArray = [];
    creatAliens();
  }

  // Tekenen van de score
  context.fillStyle = "white";
  context.font = "16px courier";
  context.fillText(score, 5, 20);
}

// Functie voor het bewegen van het ruimteschip
function moveShip(e) {
  if (gameOver) {
    return;
  }
  if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
    ship.x -= shipVelocityX;
  } else if (
    e.code == "ArrowRight" &&
    ship.x + shipVelocityX + ship.width <= board.width
  ) {
    ship.x += shipVelocityX;
  }
}

// Functie voor het creëren van een nieuwe groep aliens
function creatAliens() {
  for (let c = 0; c < alienColumns; c++) {
    for (let r = 0; r < alienRows; r++) {
      let alien = {
        img: alienImg,
        x: alienX + c * alienWidth,
        y: alienY + r * alienHeight,
        width: alienWidth,
        height: alienHeight,
        alive: true,
      };
      alienArray.push(alien);
    }
  }
  alienCount = alienArray.length;
}

// Functie voor het schieten van kogels
function shoot(e) {
  if (gameOver) {
    return;
  }
  if (e.code == "Space") {
    let bullet = {
      x: ship.x + (shipWidth * 15) / 32,
      y: ship.y,
      width: tileSize / 8,
      height: tileSize / 2,
      used: false,
    };
    bulletArray.push(bullet);
  }
}

// Functie voor het detecteren van botsingen tussen objecten
function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
