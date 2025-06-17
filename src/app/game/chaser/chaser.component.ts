import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import Phaser from 'phaser';
import { ScoreService } from './services/score.service';
import { ChaserScene } from './scenes/chaser.scene';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chaser',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chaser.component.html',
  styleUrl: './chaser.component.css',
  encapsulation: ViewEncapsulation.None,
  providers: [ScoreService] // score service instance resets every game
})
export class ChaserComponent implements OnInit, OnDestroy {
  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef<HTMLDivElement>;
  game!: Phaser.Game;
  private scoreService = inject(ScoreService);
  chaserScene!: ChaserScene;
  finalScore = 0;

  ngOnInit() {
    this.startGame();
  }

  startGame() {
    const scene = new ChaserScene(this.scoreService);
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1000,
      height: 600,
      parent: this.gameContainer.nativeElement,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: {
            y: 1000,
            x: 0
          },
          debug: false
        }
      },
      scene: [scene]
    };

    this.game = new Phaser.Game(config);
    this.game.events.once('ready', () => {
      this.chaserScene = this.game.scene.getScene('ChaserScene') as ChaserScene;
    });
  }

  restartGame() {
    this.game.destroy(true);
    this.scoreService.reset();
    this.startGame();
  }

  togglePause() {
    if (this.chaserScene) {
      this.chaserScene.togglePause();
    } else {
      console.log('Chaser scene not initialized yet');
    }
  }

  get gameOver() {
    this.finalScore = this.scoreService.score();
    return this.scoreService.gameOver();
  }

  ngOnDestroy() {
    this.game.destroy(true);
  }
}
