import { Component, ElementRef, AfterViewInit, ViewChild, OnDestroy, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-digipet',
  standalone: true,
  imports: [],
  templateUrl: './digipet.component.html',
  styleUrl: './digipet.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class DigipetComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  private backgroundImage: HTMLImageElement = new Image();

  petStatus: string = 'Happy';
  hunger = 0; // 0 to 100
  private hungerInterval!: number;
  boredom = 0;
  private boredomInterval!: number;
  speechText: string = '';

  private petImages: { [key: string]: HTMLImageElement } = {};
  private currentMood: 'happy' | 'worried' | 'sad' | 'hungry' | 'dead' = 'happy';

  currentFood: 'carrot' | 'lettuce' = 'carrot';
  currentPlayToy: 'ball' | 'string' = 'ball';

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;

    this.backgroundImage = new Image();
    this.backgroundImage.src = 'assets/room2.png';

    this.backgroundImage.onload = () => {
      this.loadPetImages(() => {
        this.drawPet('happy');

        this.hungerInterval = window.setInterval(() => {
          this.hunger = Math.min(this.hunger + 10, 100);
          this.updatePetMood();
        }, 2900);

        this.boredomInterval = window.setInterval(() => {
          this.boredom = Math.min(this.boredom + 10, 100);
          this.updatePetMood();
        }, 1400);
      });
    };
  }

  loadPetImages(callback: () => void) {
    const moods = ['happy', 'worried', 'sad', 'hungry', 'dead'];
    let loaded = 0;

    moods.forEach(mood => {
      const img = new Image();
      img.src = `assets/fluff_${mood}.png`;
      img.onload = () => {
        loaded++;
        if (loaded === moods.length) callback();
      };
      this.petImages[mood] = img;
    });
  }

  drawPet(mood: 'happy' | 'worried' | 'sad' | 'hungry' | 'dead') {
    this.currentMood = mood;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 900, 500);

    if (this.backgroundImage?.complete) {
      ctx.drawImage(this.backgroundImage, 0, 0, 900, 500);
    }

    const petImg = this.petImages[mood];

    if (petImg?.complete) {
      const petWidth = 200;
      const petHeight = 200;

      const x = (900 - petWidth) / 2;
      const y = 255;

      ctx.drawImage(petImg, x, y, petWidth, petHeight);

      if (this.speechText) {
        this.drawSpeechBubble(x + petWidth / 2, y - 50, this.speechText);
      }

    } else {
      ctx.fillStyle = '#87a5f1';
      ctx.fillRect(450, 250, 100, 100);
      ctx.fillStyle = 'white';
      ctx.fillText('Loading...', 470, 300);
    }
  }

  drawSpeechBubble(x: number, y: number, text: string) {
    const ctx = this.ctx;
    const padding = 10;
    ctx.font = '11px Arial';
    const textWidth = ctx.measureText(text).width;
    const bubbleWidth = textWidth + padding * 2;
    const bubbleHeight = 40;

    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#87a5f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, bubbleWidth, bubbleHeight, 10);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 20, y + bubbleHeight);
    ctx.lineTo(x + 10, y + bubbleHeight + 10);
    ctx.lineTo(x + 30, y + bubbleHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'black';
    ctx.fillText(text, x + padding, y + 25);
  }

  feedPet() {
    this.hunger = Math.max(this.hunger - 10, 0);
    this.updatePetMood();

    this.currentFood = this.currentFood === 'carrot' ? 'lettuce' : 'carrot';

  }

  playWithPet() {
    this.boredom = Math.max(this.boredom - 10, 0);
    this.updatePetMood();

    this.currentPlayToy = this.currentPlayToy === 'ball' ? 'string' : 'ball';

  }

  updatePetMood() {
    const isHungry = this.hunger >= 30;
    const isBored = this.boredom >= 30;
    const isDead = this.hunger >= 80 && this.boredom >= 70;

    if (isDead) {
      console.log("Pet is dead");
      this.petStatus = 'Dead';
      this.drawPet('dead');
      this.speechText = "Girl, you killed me";
    } else if (isHungry && isBored) {
      console.log("Pet is sad (hungry + bored)");
      this.petStatus = 'Sad';
      this.drawPet('sad');
    } else if (isHungry) {
      console.log("Pet is hungry");
      this.petStatus = 'Hungry';
      this.drawPet('hungry');
    } else if (isBored) {
      console.log("Pet is bored");
      this.petStatus = 'Bored';
      this.drawPet('worried');
    } else {
      this.petStatus = 'Happy';
      this.drawPet('happy');
    }
  }

  get foodImagePath(): string {
    return `assets/${this.currentFood}.png`;
  }

  get playToyImagePath(): string {
    return `assets/${this.currentPlayToy}.png`;
  }

  ngOnDestroy() {
    clearInterval(this.hungerInterval);
  }
}
