import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GameObject {
  x: number;
  y: number;
  active: boolean;
}

@Component({
  standalone: true,
  selector: 'app-space-invaders',
  imports: [CommonModule],
  templateUrl: './space-invaders.component.html',
  styleUrls: ['./space-invaders.component.css']
})
export class SpaceInvadersComponent {
  // Game dimensions
  gameWidth = 600;
  gameHeight = 800;

  // Player
  playerX = 300;
  playerSpeed = 10;

  // Bullets
  bullets: GameObject[] = [];
  bulletSpeed = 8;
  fireCooldown = false;

  // Enemies
  enemies: GameObject[] = [];

  constructor() {
    this.spawnEnemies();
    this.gameLoop();
  }

  // Handle key inputs
  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') this.playerX -= this.playerSpeed;
    if (event.key === 'ArrowRight') this.playerX += this.playerSpeed;

    // Keep player in bounds
    this.playerX = Math.max(0, Math.min(this.playerX, this.gameWidth - 50));

    // Shoot
    if (event.key === ' ' && !this.fireCooldown) {
      this.fireBullet();
    }
  }

  fireBullet() {
    this.bullets.push({ x: this.playerX + 20, y: this.gameHeight - 100, active: true });
    this.fireCooldown = true;

    // Prevent spamming bullets
    setTimeout(() => {
      this.fireCooldown = false;
    }, 300);
  }

  spawnEnemies() {
    const rows = 3;
    const cols = 6;
    const spacingX = 80;
    const spacingY = 60;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.enemies.push({
          x: col * spacingX + 50,
          y: row * spacingY + 50,
          active: true
        });
      }
    }
  }

  gameLoop() {
    // Bullet movement
    this.bullets.forEach(bullet => {
      bullet.y -= this.bulletSpeed;
    });

    // Remove inactive or off-screen bullets
    this.bullets = this.bullets.filter(b => b.y > 0 && b.active);

    // Collision detection
    this.bullets.forEach(bullet => {
      this.enemies.forEach(enemy => {
        if (enemy.active && bullet.active && this.checkCollision(bullet, enemy)) {
          bullet.active = false;
          enemy.active = false;
        }
      });
    });

    // Loop again
    requestAnimationFrame(() => this.gameLoop());
  }

  checkCollision(a: GameObject, b: GameObject): boolean {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.abs(dx) < 30 && Math.abs(dy) < 30;
  }
}
