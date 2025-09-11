import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnGameService } from './services/knGame.service';
import { ScoringService } from './services/scoring.service';

@Component({
  standalone: true,
  selector: 'app-kitchen-nightmare',
  imports: [CommonModule],
  templateUrl: './kitchen-nightmare.component.html',
  styleUrls: ['./kitchen-nightmare.component.css']
})
export class KitchenNightmareComponent implements OnInit {
  constructor(
    public knGameService: KnGameService,
    public scoringService: ScoringService
  ) { }

  ngOnInit() {
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
    if (event.key === 'ArrowLeft') this.knGameService.movePlayerLeft();
    if (event.key === 'ArrowRight') this.knGameService.movePlayerRight();

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

    if (Math.abs(movement) < 30) return; // ignore tiny movements

    if (movement > 0) {
      this.knGameService.movePlayerRight();
    } else {
      this.knGameService.movePlayerLeft();
    }
  }

  moveInterval: any;
  startMoving(direction: 'left' | 'right') {
    if (this.moveInterval) return;

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

  gameLoop(timestamp?: number) {
    this.knGameService.moveBullets();
    this.knGameService.checkCollisions();

    this.knGameService.moveEnemies(timestamp || performance.now());

    requestAnimationFrame((ts) => this.gameLoop(ts));
  }
}