import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { GameService } from '../game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-higher-lower',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './higher-lower.component.html',
  styleUrl: './higher-lower.component.css',
  encapsulation: ViewEncapsulation.None
})

export class HigherLowerComponent implements OnInit {
  gameOn = false;
  flipped = true;
  isBusy = false;

  deckId: string | null = null;
  fullCardPool: any[] = [];
  currentCard: any = null;
  nextCard: any = null;
  score = 0;
  previousScore = 0;
  results: string[] = [];
  leaderboard: number[] = [];

  wrongGuessAnim = false;
  cardBacks: string[] = [];
  currentBackIndex = 0;

  scorePopup: string | null = null;
  isPulsing = false;
  streak = 0;

  showStreakEffect = false;
  showLostStreakEffect = false;

  pendingCardSwap = false;
  swapAfterFlip = false;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.initializeDeck();
  }

  initializeDeck(): void {
    this.gameService.newDeck().subscribe(data => {
      this.deckId = data.deck_id;

      const totalBacks = 20;
      this.cardBacks = Array.from({ length: totalBacks }, (_, i) => `card-backs/${i + 1}.png`);

      this.gameService.drawCards(this.deckId!, 52).subscribe((cardData: { cards: any; }) => {
        const base = cardData.cards;
        this.fullCardPool = this.shuffleCards([...base, ...base, ...base, ...base]);
        this.currentCard = this.fullCardPool.shift() || null;

        this.flipped = true;
      });
    });
  }

  get backImageUrl(): string {
    return this.cardBacks[this.currentBackIndex];
  }

  startGame(): void {
    this.gameOn = true;
    this.flipped = false;
  }

  // guess(direction: 'higher' | 'lower'): void {
  //   // reset the streaks
  //   this.showStreakEffect = false;
  //   this.showLostStreakEffect = false;

  //   if (!this.currentCard || this.isBusy || this.fullCardPool.length === 0) return;

  //   this.isBusy = true;
  //   this.flipped = true; // triggers the flip
  //   this.swapAfterFlip = true;
  //   this.currentBackIndex = (this.currentBackIndex + 1) % this.cardBacks.length;

  //   this.nextCard = this.fullCardPool.shift() || null;
  //   if (!this.nextCard) return;

  //   const currentValue = this.getCardNumericValue(this.currentCard.value);
  //   const nextValue = this.getCardNumericValue(this.nextCard.value);

  //   const correctGuess =
  //     (direction === 'higher' && nextValue > currentValue) ||
  //     (direction === 'lower' && nextValue < currentValue);

  //   this.results.push(correctGuess ? 'correct' : 'wrong');

  //   if (correctGuess) {
  //     this.updateScore(1);
  //     this.streak++;

  //     if (this.streak >= 3) {
  //       this.showStreakEffect = true;
  //     }

  //   } else {
  //     if (this.streak >= 3) {
  //       this.showLostStreakEffect = true;
  //     }

  //     this.streak = 0;
  //     this.wrongGuessAnim = true;
  //   }

  //   // Wait for transition to finish before swapping card!!!!!
  //   this.pendingCardSwap = true;
  // }

  guess(direction: 'higher' | 'lower'): void {
    if (!this.currentCard || this.isBusy || this.fullCardPool.length === 0) return;

    this.isBusy = true;
    this.showStreakEffect = false;
    this.showLostStreakEffect = false;
    this.nextCard = this.fullCardPool.shift() || null;

    const currentValue = this.getCardNumericValue(this.currentCard.value);
    const nextValue = this.getCardNumericValue(this.nextCard.value);

    const correctGuess =
      (direction === 'higher' && nextValue > currentValue) ||
      (direction === 'lower' && nextValue < currentValue);

    if (correctGuess) {
      this.updateScore(1);
      this.streak++;
      if (this.streak >= 3) this.showStreakEffect = true;
    } else {
      if (this.streak >= 3) this.showLostStreakEffect = true;
      this.streak = 0;
      this.wrongGuessAnim = true;
    }

    this.flipped = true; // triggers flip
    // this.currentBackIndex = (this.currentBackIndex + 1) % this.cardBacks.length;

    setTimeout(() => {
      this.currentCard = this.nextCard;
      this.nextCard = null;
    }, 250); // match halfway point of 0.5s flip

    // 🌟 Unflip card after the animation
    setTimeout(() => {
      this.flipped = false;
      this.isBusy = false;
      this.wrongGuessAnim = false;
      this.currentBackIndex = (this.currentBackIndex + 1) % this.cardBacks.length;
    }, 500); // match full flip duration
  }

  onCardFlipEnd(): void {
    if (this.swapAfterFlip) {
      this.currentCard = this.nextCard;
      this.nextCard = null;
      this.swapAfterFlip = false;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.flipped = false;
          this.isBusy = false;

          // this.showStreakEffect = false;
          // this.showLostStreakEffect = false;
          this.wrongGuessAnim = false;
        });
      });

      this.wrongGuessAnim = false;
    }
  }

  updateScore(points: number) {
    this.score += points;
    this.scorePopup = `+${points}`;
    this.isPulsing = true;
  }

  onScorePopupEnd(): void {
    this.scorePopup = null;
    this.isPulsing = false;
  }

  getCardNumericValue(value: string): number {
    const faceCards: Record<string, number> = {
      JACK: 11,
      QUEEN: 12,
      KING: 13,
      ACE: 14
    };

    return faceCards[value] || parseInt(value);
  }

  endGame(): void {

    this.currentBackIndex = 0;
    this.flipped = true;
    this.isBusy = true;

    setTimeout(() => {
      this.gameOn = false;
      this.results = [];

      if (this.score > 0) {
        this.previousScore = this.score;
        this.leaderboard.push(this.score);
        this.leaderboard.sort((a, b) => b - a);
        this.leaderboard = this.leaderboard.slice(0, 5);
      }

      this.score = 0;
      this.currentCard = null;
      this.nextCard = null;
      this.isBusy = false;
      this.streak = 0;
      this.showStreakEffect = false;
      this.showLostStreakEffect = false;
      this.scorePopup = null;
      this.isPulsing = false;
      this.wrongGuessAnim = false;

      this.initializeDeck();
    }, 500);
  }

  drawFirstCard(): void {
    if (!this.deckId) return;

    this.gameService.drawCard(this.deckId).subscribe(cardData => {
      this.currentCard = cardData.cards[0];
    });
  }

  shuffleCards(cards: any[]): any[] {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }
}

