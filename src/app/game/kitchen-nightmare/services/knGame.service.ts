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

  bullets: Bullet[] = [];
  fireCooldown = false;

  enemies: Enemy[] = [];
  shields: Shield[] = [];

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
    this.playerService.resetPlayer();
    this.enemies = this.enemyService.spawnEnemies(this.gameWidth);
    this.shields = this.shieldService.createShields(this.gameWidth);
    this.bullets = [];
    this.fireCooldown = false;
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
      x: Math.max(this.margin, Math.min(this.player.x + 40, this.gameWidth - this.margin - 20)),
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
    this.bullets.forEach(bullet => {
      this.shields.forEach(shield => {
        if (shield.active && bullet.active && this.checkCollision(bullet, shield)) {
          bullet.active = false;
          shield.active = false;
        }
      });
    });
  }

  private checkCollision(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.abs(dx) < 30 && Math.abs(dy) < 30;
  }
}
