

// Startup
const canvas = document.querySelector('canvas');
const scoreEl = document.querySelector('#scoreEl')
const startGameButton = document.querySelector('#startGameButton')

const c = canvas.getContext("2d");
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const x = canvas.width / 2
const y = canvas.height / 2


let player
let projectiles
let enemies
let particles

function init() {
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
}


// Controllers
// ##  On click shoot projectile
window.addEventListener('click', (e) => {
    const angle = Math.atan2(e.clientY - y, e.clientX - x)
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
    }
    projectiles.push(new Projectile(x, y, 5, 'white', velocity))
})

window.addEventListener('touchstart', (e) => {
    const angle = Math.atan2(e.touches[0].clientY - y, e.touches[0].clientX - x)
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
    }
    projectiles.push(new Projectile(x, y, 5, 'white', velocity))
})

function showModal() {
    document.querySelector('#modalEl').style.display = 'flex'
}

function hideModal() {
    document.querySelector('#modalEl').style.display = 'none'
}

function setScore(amount) {
    scoreEl.innerText = amount
    document.querySelector('#bigScoreEl').innerText = amount
}

function getScore() {
    return parseInt(scoreEl.innerText)
}

startGameButton.addEventListener('click', () => {
    clearTimeout()
    setScore(0)
    init()
    hideModal()
    animate()
    spawnEnemies()
})

// Main Game Loop
function animate() {
    const animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)

    player.draw()

    projectiles.forEach((projectile, pIndex) => {
        projectile.update()

        // Remove off-screen projectiles
        const isOffCanvas = projectile.x - projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height;

        if (isOffCanvas) {
            setTimeout(() => {
                projectiles.splice(pIndex, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, eIndex) => {
        enemy.update()

        // Detect Endgame, enemy <--> player collision
        const distance = Math.hypot(
            enemy.x - player.x,
            enemy.y - player.y)
        if (distance < enemy.radius + player.radius) {
            showModal()
            cancelAnimationFrame(animationId)
        }

        // Detect projectile <--> enemy collision
        projectiles.forEach((projectile, pIndex) => {
            const distance = Math.hypot(
                projectile.x - enemy.x,
                projectile.y - enemy.y)

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
                        }))
                }
                // Large enemy -- shrink it
                if (enemy.radius - 10 > 10) {
                    setScore(getScore() + 100)
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    projectiles.splice(pIndex, 1)
                    // Small enemy -- asplode it
                } else {
                    setScore(getScore() + 250)
                    setTimeout(() => {
                        enemies.splice(eIndex, 1)
                        projectiles.splice(pIndex, 1)
                    }, 0)
                }
            }
        })
    })

    particles.forEach((particle, pIndex) => {
        if (particle.alpha <= 0) {
            setTimeout(() => {
                particles.splice(pIndex, 1)
            }, 0)
        } else {
            particle.update()
        }
    })
}
