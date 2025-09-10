import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Enemy } from './enemy.model';
import { Bullet } from './bullet.model';
import { Player } from './player.model';
import { Shield } from './shield.model';

interface GameObject {
  x: number;
  y: number;
  active: boolean;
}

@Component({
  standalone: true,
  selector: 'app-kitchen-nightmare',
  imports: [CommonModule],
  templateUrl: './kitchen-nightmare.component.html',
  styleUrls: ['./kitchen-nightmare.component.css']
})
export class KitchenNightmareComponent {
  // Game dimensions
  gameWidth = window.innerWidth;
  gameHeight = window.innerHeight;

  readonly margin = 40;

  get playableWidth() {
    return this.gameWidth - this.margin * 2;
  }

  get playableHeight() {
    return this.gameHeight - this.margin * 2;
  }

  @HostListener('window:resize')
  onResize() {
    this.gameWidth = window.innerWidth;
    this.gameHeight = window.innerHeight;

    // Regenerate layout
    this.enemies = [];
    this.shields = [];
    this.spawnEnemies();
    this.createShields();

    this.player.x = this.margin + this.playableWidth / 2 - 25;
  }

  // Player
  player: Player = {
    x: this.margin + this.playableWidth / 2 - 25,
    y: 40,
    speed: 10,
    lives: 3,
    sprite: 'chef.png',
    weapon: 'whisk.png'
  };

  // Bullets
  bullets: Bullet[] = [];
  bulletSpeed = 8;
  fireCooldown = false;

  // Enemies
  enemies: Enemy[] = [];

  //Sheild
  shields: Shield[] = [];

  constructor() {
    this.spawnEnemies();
    this.createShields();
    this.gameLoop();
  }

  // createShields() {
  //   const shieldWidth = 90;
  //   const spacing = 140;
  //   const totalShieldSpace = shieldWidth + spacing;

  //   const numShields = Math.floor(this.playableWidth / totalShieldSpace);

  //   // Total width of all shields and spacing (except last spacing)
  //   const totalShieldsWidth = numShields * shieldWidth + (numShields - 1) * spacing;

  //   // Calculate leftover space inside playable width
  //   const leftoverSpace = this.playableWidth - totalShieldsWidth;

  //   // Offset to center shields within playable width
  //   const startX = this.margin + leftoverSpace / 2;

  //   this.shields = [];
  //   for (let i = 0; i < numShields; i++) {
  //     this.shields.push({
  //       x: startX + i * totalShieldSpace,
  //       y: 150,
  //       active: true
  //     });
  //   }
  // }

  // createShields() {
  //   const shieldWidth = 150;
  //   const spacing = 120;
  //   const totalShieldSpace = shieldWidth + spacing;

  //   const numShields = Math.floor(this.playableWidth / totalShieldSpace);

  //   const totalShieldsWidth = numShields * shieldWidth + (numShields - 1) * spacing;
  //   const leftoverSpace = this.playableWidth - totalShieldsWidth;
  //   const startX = this.margin + leftoverSpace / 2;

  //   const totalImages = 15;
  //   const shieldImages = Array.from({ length: totalImages }, (_, i) => `assets/counter/${i + 1}.png`);
  //   const shuffledImages = this.shuffleArray([...shieldImages]);

  //   const alignments: ('left' | 'right' | 'center')[] = ['left', 'right', 'center'];

  //   this.shields = [];
  //   for (let i = 0; i < numShields; i++) {
  //     this.shields.push({
  //       x: startX + i * totalShieldSpace,
  //       y: 150,
  //       active: true,
  //       image: shuffledImages[i % shuffledImages.length],
  //       alignment: alignments[Math.floor(Math.random() * alignments.length)]
  //     });
  //   }
  // }

  createShields() {
    const shieldWidth = 150;
    const spacing = 120;
    const totalShieldSpace = shieldWidth + spacing;

    const numShields = Math.floor(this.playableWidth / totalShieldSpace);

    const totalShieldsWidth = numShields * shieldWidth + (numShields - 1) * spacing;
    const leftoverSpace = this.playableWidth - totalShieldsWidth;
    const startX = this.margin + leftoverSpace / 2;

    const totalImages = 15;
    const shieldImages = Array.from({ length: totalImages }, (_, i) => `assets/counter/${i + 1}.png`);

    const shuffledImages = this.shuffleArray([...shieldImages]);

    this.shields = [];

    const dualAlignmentOptions = [
      ['bottom-left', 'top-right'],
      ['top-left', 'bottom-right']
    ];

    for (let i = 0; i < numShields; i++) {
      const imageIndex = i % shuffledImages.length;
      const imageName = shuffledImages[imageIndex].split('/').pop()?.split('.')[0];

      if (imageName && +imageName != 2 && +imageName != 4 && +imageName != 6) {
        // 60% chance to add two images
        if (Math.random() < 0.6) {
          // Pick another random image for second slot
          let secondIndex = (imageIndex + 1) % shuffledImages.length;
          let secondImageName = shuffledImages[secondIndex].split('/').pop()?.split('.')[0];

          while (secondImageName && (+secondImageName === 2 || +secondImageName === 4 || +secondImageName === 6)) {
            secondIndex = (secondIndex + 1) % shuffledImages.length;
            secondImageName = shuffledImages[secondIndex].split('/').pop()?.split('.')[0];
          }

          const chosenAlignments = dualAlignmentOptions[Math.floor(Math.random() * dualAlignmentOptions.length)];

          this.shields.push({
            x: startX + i * totalShieldSpace,
            y: 150,
            active: true,
            images: [shuffledImages[imageIndex], shuffledImages[secondIndex]],
            alignments: chosenAlignments
          });
          continue;
        }
      }

      // Default single image centered
      const defaultAlignments = ['normal-left', 'normal-right', 'center'];
      const randomAlignment = defaultAlignments[Math.floor(Math.random() * defaultAlignments.length)];

      this.shields.push({
        x: startX + i * totalShieldSpace,
        y: 150,
        active: true,
        images: [shuffledImages[imageIndex]],
        alignments: [randomAlignment]
      });
    }
  }


  shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Handle key inputs
  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') this.player.x -= this.player.speed;
    if (event.key === 'ArrowRight') this.player.x += this.player.speed;

    // Keep player in bounds
    this.player.x = Math.max(this.margin, Math.min(this.player.x, this.gameWidth - this.margin - 50));

    // Shoot
    if (event.key === ' ' && !this.fireCooldown) {
      this.fireBullet();
    }
  }

  fireBullet() {
    this.bullets.push({
      x: Math.max(this.margin, Math.min(this.player.x + 20, this.gameWidth - this.margin - 20)),
      y: this.gameHeight - this.margin - 50,
      active: true,
      type: this.player.weapon
    });

    this.fireCooldown = true;
    setTimeout(() => {
      this.fireCooldown = false;
    }, 300);
  }

  spawnEnemies() {
    const rows = 4;
    const enemyWidth = 40;
    const spacingX = 25; // gap between enemies
    const totalEnemyWidth = enemyWidth + spacingX;

    const cols = Math.floor(this.playableWidth / totalEnemyWidth);
    const foodAssets = ['eggplant.svg', 'orange.svg'];

    const totalEnemiesWidth = cols * enemyWidth + (cols - 1) * spacingX;
    const leftoverSpace = this.playableWidth - totalEnemiesWidth;
    const startX = this.margin + leftoverSpace / 2;

    this.enemies = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.enemies.push({
          x: startX + col * totalEnemyWidth,
          y: row * 60 + 50,
          active: true,
          type: foodAssets[Math.floor(Math.random() * foodAssets.length)],
          hp: 1
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
      this.shields.forEach(shield => {
        if (shield.active && bullet.active && this.checkCollision(bullet, shield)) {
          bullet.active = false;
          shield.active = false; // one ht for now
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
