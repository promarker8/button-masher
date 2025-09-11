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

  @HostListener('window:resize')
  onResize() {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);

    this.resizeTimeout = setTimeout(() => {
      let width = window.innerWidth;
      let height = window.innerHeight;

      if (window.visualViewport) {
        width = window.visualViewport.width;
        // height = window.visualViewport.height;

        height = window.visualViewport?.height || window.innerHeight;

      }

      this.knGameService.resizeGame(width, height);
    }, 150);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') this.knGameService.movePlayerLeft();
    if (event.key === 'ArrowRight') this.knGameService.movePlayerRight();

    if (event.key === ' ') this.knGameService.fireBullet();
  }

  gameLoop() {
    this.knGameService.moveBullets();
    this.knGameService.checkCollisions();

    requestAnimationFrame(() => this.gameLoop());
  }
}