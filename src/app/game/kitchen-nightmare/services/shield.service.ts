import { Injectable } from '@angular/core';
import { Shield } from '../models/shield.model';

@Injectable({ providedIn: 'root' })
export class ShieldService {
  private margin = 50;

  createShields(gameWidth: number): Shield[] {
    const playableWidth = gameWidth - this.margin * 2;
    const shieldWidth = 150;
    const spacing = 120;
    const totalShieldSpace = shieldWidth + spacing;

    const numShields = Math.floor(playableWidth / totalShieldSpace);
    const totalShieldsWidth = numShields * shieldWidth + (numShields - 1) * spacing;
    const leftoverSpace = playableWidth - totalShieldsWidth;
    const startX = this.margin + leftoverSpace / 2;

    const totalImages = 15;
    const shieldImages = Array.from({ length: totalImages }, (_, i) => `assets/counter/${i + 1}.png`);
    const shuffledImages = this.shuffleArray([...shieldImages]);

    const dualAlignmentOptions = [
      ['bottom-left', 'top-right'],
      ['top-left', 'bottom-right']
    ];

    const shields: Shield[] = [];

    for (let i = 0; i < numShields; i++) {
      const imageIndex = i % shuffledImages.length;
      const imageName = shuffledImages[imageIndex].split('/').pop()?.split('.')[0];

      if (imageName && +imageName !== 2 && +imageName !== 4 && +imageName !== 6) {
        if (Math.random() < 0.6) {
          let secondIndex = (imageIndex + 1) % shuffledImages.length;
          let secondImageName = shuffledImages[secondIndex].split('/').pop()?.split('.')[0];

          while (secondImageName && (+secondImageName === 2 || +secondImageName === 4 || +secondImageName === 6)) {
            secondIndex = (secondIndex + 1) % shuffledImages.length;
            secondImageName = shuffledImages[secondIndex].split('/').pop()?.split('.')[0];
          }

          const chosenAlignments = dualAlignmentOptions[Math.floor(Math.random() * dualAlignmentOptions.length)];

          shields.push({
            x: startX + i * totalShieldSpace,
            y: 150,
            active: true,
            images: [shuffledImages[imageIndex], shuffledImages[secondIndex]],
            alignments: chosenAlignments
          });
          continue;
        }
      }

      const defaultAlignments = ['normal-left', 'normal-right', 'center'];
      const randomAlignment = defaultAlignments[Math.floor(Math.random() * defaultAlignments.length)];

      shields.push({
        x: startX + i * totalShieldSpace,
        y: 150,
        active: true,
        images: [shuffledImages[imageIndex]],
        alignments: [randomAlignment]
      });
    }

    return shields;
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}