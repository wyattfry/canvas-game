const FORCE_OF_GRAVITY = 0.05
const SPEED_LIMIT = 3
const SPAWN_INTERVAL_MS = 3000

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color
        c.fill()
        return this
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }

    accelerateToward(thingWithLocation) {
        const angle = Math.atan2(thingWithLocation.y - this.y, thingWithLocation.x - this.x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        }
        this.velocity.x += velocity.x * FORCE_OF_GRAVITY
        this.velocity.y += velocity.y * FORCE_OF_GRAVITY
        
        // Enforce Speed Limit
        const h = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y)
        let newMultiplier
        if (h > SPEED_LIMIT) {
            newMultiplier = SPEED_LIMIT / h
        } else {
            newMultiplier = 1
        }
        this.velocity.x *= newMultiplier
        this.velocity.y *= newMultiplier
    }
}

function spawnEnemies() {
    return setInterval(() => {
        const radius = 26 * Math.random() + 4
        let enemyX
        let enemyY
        if (Math.random() < 0.5) {
            enemyX = Math.random() < .5 ? 0 - radius : canvas.width + radius
            enemyY = Math.random() * canvas.height
        } else {
            enemyX = Math.random() * canvas.width
            enemyY = Math.random() < .5 ? 0 - radius : canvas.height + radius
        }
        const angle = Math.random() * Math.PI * 2
        const velocity = {
            x: Math.cos(angle) * 100,
            y: Math.sin(angle) * 100,
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        enemies.push(new Enemy(enemyX, enemyY, radius, color, velocity))
    }, SPAWN_INTERVAL_MS)
}
