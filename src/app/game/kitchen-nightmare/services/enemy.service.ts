import { Injectable } from '@angular/core';
import { Enemy } from '../models/enemy.model';

@Injectable({ providedIn: 'root' })
export class EnemyService {
  private margin = 50;

  spawnEnemies(gameWidth: number): Enemy[] {
    const playableWidth = gameWidth - this.margin * 2;

    const rows = 4;
    const enemyWidth = 50;
    const spacingX = 25;
    const totalEnemyWidth = enemyWidth + spacingX;
    const cols = Math.floor(playableWidth / totalEnemyWidth);

    const totalEnemies = 65;
    const enemyImages = Array.from({ length: totalEnemies }, (_, i) => `enemies/${i + 1}.svg`);
    const shuffledEnemies = this.shuffleArray([...enemyImages]);

    const totalEnemiesWidth = cols * enemyWidth + (cols - 1) * spacingX;
    const leftoverSpace = playableWidth - totalEnemiesWidth;
    const startX = this.margin + leftoverSpace / 2;

    const enemies: Enemy[] = [];

    let enemyCounter = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        enemies.push({
          x: startX + col * totalEnemyWidth,
          y: row * 60 + 50,
          active: true,
          type: shuffledEnemies[enemyCounter % shuffledEnemies.length],
          hp: 1,
          row: row
        });
        enemyCounter++;
      }
    }

    return enemies;
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}