import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnGameService } from './services/knGame.service';
import { ScoringService } from './services/scoring.service';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-kitchen-nightmare',
  imports: [CommonModule],
  templateUrl: './kitchen-nightmare.component.html',
  styleUrls: ['./kitchen-nightmare.component.css']
})
export class KitchenNightmareComponent implements OnInit {

  public paused = false;

  constructor(
    public knGameService: KnGameService,
    public scoringService: ScoringService
  ) { }

  ngOnInit() {
    this.knGameService.resetGame();
    this.gameLoop();
  }

  resizeTimeout: any;
  viewportHeight = window.visualViewport?.height || window.innerHeight;

  @HostListener('window:resize')
  onResize() {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);

    this.resizeTimeout = setTimeout(() => {
      let width = window.innerWidth;
      let height = window.innerHeight;

      if (window.visualViewport) {
        width = window.visualViewport.width;
        // height = window.visualViewport.height;

        this.viewportHeight = window.visualViewport?.height || window.innerHeight;

      }

      this.knGameService.resizeGame(width, this.viewportHeight);
    }, 150);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (this.paused) return;
    if (event.key === 'ArrowLeft') this.knGameService.movePlayerLeft();
    if (event.key === 'ArrowRight') this.knGameService.movePlayerRight();
    if (event.key === 'p' || event.key === 'P') this.togglePause();
    if (event.key === ' ') this.knGameService.fireBullet();
  }


  // mobile swipes
  isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  touchStartX = 0;
  touchEndX = 0;

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;

    console.log('Touch Start', this.touchStartX);
    console.log('Touch End', this.touchEndX);
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  handleSwipe() {
    const movement = this.touchEndX - this.touchStartX;

    if (Math.abs(movement) < 30 || this.paused) return; // ignore tiny movements

    if (movement > 0) {
      this.knGameService.movePlayerRight();
    } else {
      this.knGameService.movePlayerLeft();
    }
  }

  moveInterval: any;
  startMoving(direction: 'left' | 'right') {
    if (this.moveInterval || this.paused) return;

    const moveFn = direction === 'left'
      ? () => this.knGameService.movePlayerLeft()
      : () => this.knGameService.movePlayerRight();

    moveFn();

    this.moveInterval = setInterval(() => {
      moveFn();
    }, 100); // adjust speed 
  }

  stopMoving() {
    clearInterval(this.moveInterval);
    this.moveInterval = null;
  }

  handleStartAutoFire() {
    if (this.paused) return;
    this.knGameService.startAutoFire();
  }

  togglePause() {
    this.paused = !this.paused;
  }

  gameLoop(timestamp?: number) {
    if (!this.paused && !this.knGameService.gameOver) {
      this.knGameService.moveBullets();
      this.knGameService.checkCollisions();
      this.knGameService.moveEnemies(timestamp || performance.now());
      this.knGameService.cleanupExplosions(timestamp || performance.now());
    }

    if (this.knGameService.gameOver) {
      this.paused = true;

      Swal.fire({
        title: this.knGameService.gameWon ? 'You Win!' : 'Game Over!',
        text: this.knGameService.gameWon
          ? 'All enemies have been defeated!'
          : 'Enemies reached your counter!',
        confirmButtonText: 'Play Again',
        customClass: {
          popup: 'kitchen-alert',
          confirmButton: 'kitchen-button'
        },
        allowOutsideClick: false
      }).then(() => {
        this.knGameService.resetGame();
        this.paused = false;
        this.gameLoop(); // Restart
      });

      return;
    }

    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

}