// Startup
getVersion();

const canvas = document.querySelector('canvas');
const scoreEl = document.querySelector('#scoreEl');
const startGameButton = document.querySelector('#startGameButton');

const c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const x = canvas.width / 2;
const y = canvas.height / 2;

let player;
let projectiles;
let enemies;
let particles;
let intervalId;
const cancellationToken = { expired: false };

function init() {
  player = new Player(x, y, 10, 'white');
  projectiles = [];
  enemies = [];
  particles = [];
  cancellationToken.expired = false;
}

let mouseY;
let mouseX;

document.addEventListener('mousemove', (e) => {
  mouseY = e.clientY;
  mouseX = e.clientX;
});

function shootHandler(e) {
  const angle = Math.atan2(mouseY - y, mouseX - x);
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  projectiles.push(new Projectile(x, y, 5, 'white', velocity));
}

// Controllers
// ##  On click shoot projectile
window.addEventListener('click', shootHandler);
window.addEventListener('keyup', (event) => {
  if (event.code === 'Space') {
    shootHandler();
  }
});

window.addEventListener('touchstart', (e) => {
  const angle = Math.atan2(e.touches[0].clientY - y, e.touches[0].clientX - x);
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  projectiles.push(new Projectile(x, y, 5, 'white', velocity));
});

function showModal() {
  document.querySelector('#modalEl').style.display = 'flex';
}

function hideModal() {
  document.querySelector('#modalEl').style.display = 'none';
}

function setScore(amount) {
  scoreEl.innerText = amount;
  document.querySelector('#bigScoreEl').innerText = amount;
}

function getScore() {
  return parseInt(scoreEl.innerText);
}

startGameButton.addEventListener('click', () => {
  setScore(0);
  init();
  hideModal();
  animate();
  intervalId = spawnEnemies(cancellationToken);
});

// Main Game Loop
function animate() {
  const animationId = requestAnimationFrame(animate);
  c.fillStyle = 'rgba(0,0,0, 0.1)';
  c.fillRect(0, 0, canvas.width, canvas.height);

  player.draw();

  projectiles.forEach((projectile, pIndex) => {
    projectile.update();

    // Remove off-screen projectiles
    const isOffCanvas = projectile.x - projectile.radius < 0
            || projectile.x - projectile.radius > canvas.width
            || projectile.y + projectile.radius < 0
            || projectile.y - projectile.radius > canvas.height;

    if (isOffCanvas) {
      setTimeout(() => {
        projectiles.splice(pIndex, 1);
      }, 0);
    }
  });

  const enemiesToAdd = [];

  enemies.forEach((enemy, eIndex) => {
    // Accelerate Enemies toward Player
    enemy.accelerateToward(player);

    enemy.update();

    // Detect Endgame, enemy <--> player collision
    const distance = Math.hypot(
      enemy.x - player.x,
      enemy.y - player.y,
    );
    if (distance < enemy.radius + player.radius) {
      cancelAnimationFrame(animationId);
      cancellationToken.expired = true;
      clearInterval(intervalId);
      let playerName = '';
      while (playerName.length < 1 || playerName.length > 3) {
        playerName = prompt('Enter your name (three characters max)');
      }
      // record score
      fetch(`/scores?name=${playerName}&score=${getScore()}`, { method: 'POST' })
        .then(updateLeaderboard)
        .then(showModal);
    }

    // Detect projectile <--> enemy collision
    projectiles.forEach((projectile, pIndex) => {
      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y,
      );

      // Collision detected
      if (distance < projectile.radius + enemy.radius) {
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(new Particle(
            projectile.x + Math.random() * 10,
            projectile.y + Math.random() * 10,
            2 * Math.random(),
            enemy.color,
            {
              x: (Math.random() - 0.5) * (Math.random() * 6),
              y: (Math.random() - 0.5) * (Math.random() * 6),
            },
          ));
        }
        // Large enemy -- shrink it
        if (enemy.radius > 20) {
          setScore(getScore() + 100);
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          projectiles.splice(pIndex, 1);

          // Spawn N smaller child enemies
          for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = {
              x: Math.cos(angle) * 100,
              y: Math.sin(angle) * 100,
            };
            enemiesToAdd.push(new Enemy(enemy.x, enemy.y, enemy.radius / 2, enemy.color, velocity));
          }

          // Small enemy -- asplode it
        } else {
          setScore(getScore() + 250);
          setTimeout(() => {
            enemies.splice(eIndex, 1);
            projectiles.splice(pIndex, 1);
          }, 0);
        }
      }
    });
  });

  enemies = [...enemies, ...enemiesToAdd];

  particles.forEach((particle, pIndex) => {
    if (particle.alpha <= 0) {
      setTimeout(() => {
        particles.splice(pIndex, 1);
      }, 0);
    } else {
      particle.update();
    }
  });
}
