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
    ctx.clearRect(0, 0, 1000, 600); // match your canvas size

    // ✅ Draw preloaded background
    if (this.backgroundImage?.complete) {
      ctx.drawImage(this.backgroundImage, 0, 0, 1000, 600);
    }

    const petImg = this.petImages[mood];

    if (petImg?.complete) {
      const petWidth = 200;
      const petHeight = 200;

      const x = (1000 - petWidth) / 2;
      const y = 340;

      ctx.drawImage(petImg, x, y, petWidth, petHeight);
    } else {
      ctx.fillStyle = 'gray';
      ctx.fillRect(450, 250, 100, 100);
      ctx.fillStyle = 'white';
      ctx.fillText('Loading...', 470, 300);
    }
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
