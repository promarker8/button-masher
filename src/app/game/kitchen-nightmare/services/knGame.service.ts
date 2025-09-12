import { Injectable } from '@angular/core';
import { Bullet } from '../models/bullet.model';
import { Player } from '../models/player.model';
import { Enemy } from '../models/enemy.model';
import { Shield } from '../models/shield.model';

import { PlayerService } from './player.service';
import { EnemyService } from './enemy.service';
import { ShieldService } from './shield.service';

@Injectable({ providedIn: 'root' })
export class KnGameService {
  readonly margin = 50;
  gameWidth = window.innerWidth;
  gameHeight = window.innerHeight;

  public gameOver = false;
  public gameWon = false;

  bullets: Bullet[] = [];
  fireCooldown = false;
  private autoFireInterval: any = null;

  enemies: Enemy[] = [];
  shields: Shield[] = [];
  explosions: { x: number; y: number; timestamp: number }[] = [];
  private rowDirections: { [row: number]: number } = {};
  readonly maxEnemyY = this.playableHeight - 180;

  constructor(
    private playerService: PlayerService,
    private enemyService: EnemyService,
    private shieldService: ShieldService
  ) {
    this.resetGame();
  }

  get player(): Player {
    return this.playerService.getPlayer();
  }

  get playableWidth(): number {
    return this.gameWidth - this.margin * 2;
  }

  get playableHeight(): number {
    return this.gameHeight - this.margin * 2;
  }

  resizeGame(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;

    this.playerService.setGameWidth(width);
    this.playerService.recenterPlayerHorizontally();

    this.resetGame();
  }

  resetGame(): void {
    this.gameWon = false;
    this.gameOver = false;
    this.playerService.resetPlayer();
    this.enemies = this.enemyService.spawnEnemies(this.gameWidth);
    this.shields = this.shieldService.createShields(this.gameWidth);
    this.bullets = [];
    this.explosions = [];
    this.fireCooldown = false;
    this.stopAutoFire();
    this.lastDropTime = 0;

    this.rowDirections = {};
    this.enemies.forEach(enemy => {
      if (enemy.row !== undefined && !(enemy.row in this.rowDirections)) {
        this.rowDirections[enemy.row] = enemy.row % 2 === 0 ? 1 : -1;
      }
    });

  }

  movePlayerLeft(): void {
    this.playerService.moveLeft();
  }

  movePlayerRight(): void {
    this.playerService.moveRight();
  }

  fireBullet(): boolean {
    if (this.fireCooldown) return false;

    this.bullets.push({
      x: Math.max(this.margin, Math.min(this.player.x + 35 - 10, this.gameWidth - this.margin - 20)),
      y: this.gameHeight - this.margin - 110,
      active: true,
      type: this.player.weapon
    });

    this.fireCooldown = true;
    setTimeout(() => (this.fireCooldown = false), 250);

    return true;
  }

  moveBullets(): void {
    const bulletSpeed = 8;
    this.bullets.forEach(bullet => bullet.y -= bulletSpeed);
    this.bullets = this.bullets.filter(b => b.y > 0 && b.active);
  }

  checkCollisions(): void {
    if (this.gameOver) return;

    this.bullets.forEach(bullet => {
      console.log("bullet fired");
      // Check shield collisions
      this.shields.forEach(shield => {
        if (shield.active && bullet.active && this.checkCollision(bullet, shield)) {
          console.log("bullet hit shield");
          bullet.active = false;
          shield.active = false;
        }
      });

      // Check enemy collisions
      this.enemies.forEach(enemy => {
        if (enemy.active && bullet.active && this.checkCollision(bullet, enemy)) {
          console.log("bullet hit enemy");
          bullet.active = false;
          enemy.hp = (enemy.hp || 1) - 1;

          if (enemy.hp <= 0) {
            enemy.active = false;
            this.explosions.push({
              x: enemy.x,
              y: enemy.y,
              timestamp: performance.now()
            });
          }
        }
      });
    });

    const remainingEnemies = this.enemies.filter(e => e.active);
    if (remainingEnemies.length === 0) {
      this.gameOver = true;
      this.gameWon = true;
      console.warn("YOU WIN! All enemies defeated.");
    }

  }


  cleanupExplosions(currentTime: number): void {
    const duration = 800;
    this.explosions = this.explosions.filter(explosion => currentTime - explosion.timestamp < duration);
  }

  private lastDropTime = 0;
  private dropInterval = 300; // ms
  private readonly enemyWidth = 40;

  moveEnemies(timestamp: number): void {
    if (this.gameOver) return; // Don't move if game over
    if (!this.lastDropTime) this.lastDropTime = timestamp;

    if (timestamp - this.lastDropTime > this.dropInterval) {
      const dx = 6;
      const dy = 7;

      const activeEnemies = this.enemies.filter(e => e.active);
      const rows = new Map<number, Enemy[]>();

      activeEnemies.forEach(enemy => {
        const row = enemy.row ?? 0;
        if (!rows.has(row)) rows.set(row, []);
        rows.get(row)!.push(enemy);
      });

      rows.forEach((enemiesInRow, row) => {
        const direction = this.rowDirections[row] ?? 1;

        const leftmostX = Math.min(...enemiesInRow.map(e => e.x));
        const rightmostX = Math.max(...enemiesInRow.map(e => e.x));

        const hitLeftBoundary = leftmostX <= this.margin;
        const hitRightBoundary = rightmostX >= this.gameWidth - this.margin - this.enemyWidth - 10;

        if ((direction === -1 && hitLeftBoundary) || (direction === 1 && hitRightBoundary)) {
          this.rowDirections[row] = -direction;

          enemiesInRow.forEach(enemy => {
            if (enemy.y + dy >= this.maxEnemyY) {
              this.gameOver = true;
              this.gameWon = false;
              console.warn("GAME OVER: Enemies reached the bottom!");
            } else {
              enemy.y += dy;
            }
          });
        } else {
          enemiesInRow.forEach(enemy => enemy.x += dx * direction);
        }
      });

      this.lastDropTime = timestamp;
    }
  }

  // private enemyDirection = 1; // 1: right, -1: left

  // moveEnemies(): void {
  //   const dx = 1;
  //   const dy = 20;

  //   // Filter active enemies once
  //   const activeEnemies = this.enemies.filter(e => e.active);
  //   if (activeEnemies.length === 0) return;

  //   // Find leftmost and rightmost enemies
  //   const leftmostX = Math.min(...activeEnemies.map(e => e.x));
  //   const rightmostX = Math.max(...activeEnemies.map(e => e.x));

  //   // Check if we need to drop and reverse direction
  //   const hitLeftBoundary = leftmostX <= this.margin;
  //   const hitRightBoundary = rightmostX >= this.gameWidth - this.margin - 40;

  //   if (hitLeftBoundary && this.enemyDirection === -1) {
  //     this.enemyDirection = 1;
  //     activeEnemies.forEach(e => e.y += dy);
  //   } else if (hitRightBoundary && this.enemyDirection === 1) {
  //     this.enemyDirection = -1;
  //     activeEnemies.forEach(e => e.y += dy);
  //   }

  //   // Move all active enemies horizontally
  //   activeEnemies.forEach(enemy => {
  //     enemy.x += dx * this.enemyDirection;
  //   });
  // }


  private checkCollision(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
    const bulletX = a.x + 10; // Bullet is 20px so center = +10
    const bulletY = a.y + 10;
    const enemyX = b.x + 20;  // Enemy is 40px wide so center = +20
    const enemyY = b.y - 25; // go to centre not edge

    const dx = bulletX - enemyX;
    const dy = bulletY - enemyY;
    return Math.abs(dx) < 20 && Math.abs(dy) < 10;

    // circular hit point, rather than sqaure?
    // const distance = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    // return distance < 20;

  }

  startAutoFire(): void {
    if (this.autoFireInterval !== null) return;

    // Fire once immediately
    this.fireBullet();

    this.autoFireInterval = setInterval(() => {
      this.fireBullet();
    }, 300);
  }

  stopAutoFire(): void {
    if (this.autoFireInterval !== null) {
      clearInterval(this.autoFireInterval);
      this.autoFireInterval = null;
    }
  }

}
