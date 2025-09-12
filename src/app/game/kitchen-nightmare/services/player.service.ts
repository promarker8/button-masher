import { Injectable } from '@angular/core';
import { Player } from '../models/player.model';
import { Bullet } from '../models/bullet.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly margin = 50;
  private gameWidth = window.innerWidth;
  private gameHeight = window.innerHeight;

  // private fireCooldown = false;

  player: Player;

  constructor() {
    this.player = this.createDefaultPlayer();
  }


  get playableWidth(): number {
    return this.gameWidth - this.margin * 2;
  }

  private createDefaultPlayer(): Player {
    return {
      x: this.margin + (this.playableWidth) / 2 - 39,
      y: 50,
      speed: 10,
      lives: 3,
      sprite: 'chef.png',
      weapon: 'knife.png'
    };
  }

  getPlayer(): Player {
    return this.player;
  }

  resetPlayer(): void {
    this.player = this.createDefaultPlayer();
  }

  // setGameDimensions(width: number, height: number): void {
  //   this.gameWidth = width;
  //   this.gameHeight = height;
  // }

  recenterPlayerHorizontally() {
    this.player.x = this.playableWidth / 2 - 39;
  }

  setGameWidth(width: number) {
    this.gameWidth = width;
  }

  moveLeft(): void {
    this.player.x -= this.player.speed;
    this.boundPlayer();
  }

  moveRight(): void {
    this.player.x += this.player.speed;
    this.boundPlayer();
  }

  private boundPlayer(): void {
    this.player.x = Math.max(this.margin, Math.min(this.player.x, this.playableWidth - this.margin + 21)); // hoenstly I dont know why this is working like this
    // this.player.x = Math.max(this.margin, Math.min(this.player.x, this.gameWidth - this.margin - 79));
  }

  // fireBullet(): Bullet | null {
  //   if (this.fireCooldown) return null;

  //   this.fireCooldown = true;
  //   setTimeout(() => (this.fireCooldown = false), 250);

  //   return {
  //     x: Math.max(this.margin, Math.min(this.player.x + 40, this.gameWidth - this.margin - 20)),
  //     y: this.gameHeight - this.margin - 110,
  //     active: true,
  //     type: this.player.weapon
  //   };
  // }
}
