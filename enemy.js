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
}

function spawnEnemies() {
    setInterval(() => {
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
        const angle = Math.atan2(canvas.height / 2 - enemyY, canvas.width / 2 - enemyX)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        enemies.push(new Enemy(enemyX, enemyY, radius, color, velocity))
    }, 1000)
}
