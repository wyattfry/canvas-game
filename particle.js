const FRICTION = 0.99;

class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= FRICTION;
    this.velocity.y *= FRICTION;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= this.alpha <= 0 ? 0 : 0.01;
  }
}
