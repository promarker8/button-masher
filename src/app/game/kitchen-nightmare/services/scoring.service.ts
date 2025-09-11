import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScoringService {
  score = 0;
  lives = 3;

  addScore(points: number) {
    this.score += points;
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
  }

  reset() {
    this.score = 0;
    this.lives = 3;
  }
}
