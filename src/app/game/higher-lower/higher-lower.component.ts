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
  gameOn: boolean = false;
  flipped: boolean = true;
  isBusy: boolean = false;

  deckId: string | null = null;
  fullCardPool: any[] = [];
  currentCard: any = null;
  nextCard: any = null;
  score: number = 0;
  previousScore: number = 0;
  results: string[] = [];
  leaderboard: number[] = [];
  // backImageUrl = '';
  wrongGuessAnim = false;

  cardBacks: string[] = [];
  currentBackIndex = 0;

  scorePopup: string | null = null;
  isPulsing = false;
  streak: number = 0;
  showStreakEffect: boolean = false;
  showLostStreakEffect: boolean = false;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.gameService.newDeck().subscribe(data => {
      console.log("Deck:", data);
      this.deckId = data.deck_id;
      // this.drawFirstCard();

      const totalBacks = 20;
      this.cardBacks = Array.from({ length: totalBacks }, (_, i) => `card-backs/${i + 1}.png`);

      this.gameService.drawCards(this.deckId!, 52).subscribe((cardData: { cards: any; }) => {
        const base = cardData.cards;

        this.fullCardPool = this.shuffleCards([...base, ...base, ...base, ...base]);

        this.currentCard = this.fullCardPool.shift() || null;
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

  guess(direction: 'higher' | 'lower'): void {
    if (!this.currentCard || this.isBusy || this.fullCardPool.length === 0) return;

    this.isBusy = true;
    this.flipped = true;
    this.currentBackIndex = (this.currentBackIndex + 1) % this.cardBacks.length;

    // Get next card from local shuffled pool
    this.nextCard = this.fullCardPool.shift() || null;
    if (!this.nextCard) return;

    const currentValue = this.getCardNumericValue(this.currentCard.value);
    const nextValue = this.getCardNumericValue(this.nextCard.value);

    const correctGuess =
      (direction === 'higher' && nextValue > currentValue) ||
      (direction === 'lower' && nextValue < currentValue);

    this.results.push(correctGuess ? 'correct' : 'wrong');

    if (correctGuess) {
      this.updateScore(1);
      this.streak++;

      if (this.streak >= 3) {
        this.showStreakEffect = true;
        setTimeout(() => this.showStreakEffect = false, 1500);
      }
    } else {
      if (this.streak >= 3) {
        this.showLostStreakEffect = true;
        setTimeout(() => this.showLostStreakEffect = false, 1500);
      }

      this.streak = 0;
      this.wrongGuessAnim = true;
      setTimeout(() => this.wrongGuessAnim = false, 800);
    }

    setTimeout(() => {
      this.currentCard = this.nextCard;
      this.nextCard = null;
      this.flipped = false;
      this.isBusy = false;
    }, 550);
  }

  updateScore(points: number) {
    this.score += points;
    this.scorePopup = `+${points}`;
    this.isPulsing = true;

    setTimeout(() => {
      this.scorePopup = null;
    }, 1000);

    setTimeout(() => {
      this.isPulsing = false;
    }, 1000);
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
    this.flipped = true;
    this.currentBackIndex = 0;
    this.drawFirstCard();
  }

  // getRandomBackImage(): string {
  //   const i = Math.floor(Math.random() * this.backImages.length);
  //   return this.backImages[i];
  // }

}
