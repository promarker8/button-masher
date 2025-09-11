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

  getSafeAreaInsetBottom(): number {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom')) || 0;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    // this.knGameService.resizeGame(window.innerWidth, window.innerHeight);

    const safeBottom = this.getSafeAreaInsetBottom();
    const adjustedHeight = window.innerHeight - safeBottom;

    this.knGameService.resizeGame(window.innerWidth, adjustedHeight);

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