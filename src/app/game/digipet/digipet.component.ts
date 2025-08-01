import { CommonModule } from '@angular/common';
import { Component, ElementRef, AfterViewInit, ViewChild, OnDestroy, ViewEncapsulation } from '@angular/core';


type PetEffect = {
  hungerChange?: number;
  boredomChange?: number;
  speech?: string;
};

@Component({
  selector: 'app-digipet',
  standalone: true,
  imports: [CommonModule],
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
  cleanliness = 0;
  private cleanlinessInterval!: number;

  isDead: boolean = false;

  private petImages: { [key: string]: HTMLImageElement } = {};
  private currentMood: 'happy' | 'worried' | 'sad' | 'hungry' | 'dead' = 'happy';

  currentFoodIndex = 0;
  currentToyIndex = 0;
  // foodItems: string[] = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];
  // toyItems: string[] = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'];

  foodItems = [
    { id: 'f1', name: 'Carrot', effect: { hungerChange: -5 }, valueLabel: '-5 Hunger' },
    { id: 'f2', name: 'Lettuce', effect: { hungerChange: -5 }, valueLabel: '-5 Hunger' },
    { id: 'f3', name: 'Potato', effect: { hungerChange: -10 }, valueLabel: '-10 Hunger' },
    { id: 'f4', name: 'Cherries', effect: { hungerChange: -7 }, valueLabel: '-7 Hunger' },
    { id: 'f5', name: 'Fruit', effect: { hungerChange: -10 }, valueLabel: '-10 Hunger' },
    { id: 'f6', name: 'Pickles', effect: { hungerChange: -8 }, valueLabel: '-8 Hunger' },
    { id: 'f7', name: 'Burger', effect: { hungerChange: -15 }, valueLabel: '-15 Hunger' },
    { id: 'f8', name: 'Full Irish', effect: { hungerChange: -30 }, valueLabel: '-30 Hunger' },
  ];

  toyItems = [
    { id: 't1', name: 'Ball', effect: { boredomChange: -10 }, valueLabel: '-10 Boredom' },
    { id: 't2', name: 'Yarn', effect: { boredomChange: -7 }, valueLabel: '-7 Boredom' },
    { id: 't3', name: 'Teddy Bear', effect: { boredomChange: -12 }, valueLabel: '-12 Boredom' },
    { id: 't4', name: 'Train', effect: { boredomChange: -10 }, valueLabel: '-10 Boredom' },
    { id: 't5', name: 'Rubber Duck', effect: { boredomChange: -8 }, valueLabel: '-8 Boredom' },
    { id: 't6', name: 'Lego', effect: { boredomChange: -15 }, valueLabel: '-15 Boredom' },
    { id: 't7', name: 'Space Ship', effect: { boredomChange: -20 }, valueLabel: '-20 Boredom' },
    { id: 't8', name: 'Starfish', effect: { boredomChange: -10 }, valueLabel: '-10 Boredom' },
  ];


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
        }, 2000);

        this.cleanlinessInterval = window.setInterval(() => {
          this.cleanliness = Math.min(this.cleanliness + 8, 100);
          this.updatePetMood();
        }, 4000);

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

    this.currentFoodIndex = (this.currentFoodIndex + 1) % this.foodItems.length;
  }

  playWithPet() {
    this.boredom = Math.max(this.boredom - 10, 0);
    this.updatePetMood();

    this.currentToyIndex = (this.currentToyIndex + 1) % this.toyItems.length;
  }

  updatePetMood() {
    const isHungry = this.hunger >= 40;
    const isBored = this.boredom >= 30;
    const isDirty = this.cleanliness >= 50;
    const isDying = this.hunger >= 80 && this.boredom >= 70 && this.cleanliness >= 80;
    const petHasDied = this.hunger >= 90 && this.boredom >= 90 && this.cleanliness >= 80;

    if (petHasDied) {
      console.log("Pet is dead");
      this.petStatus = 'Dead';
      this.drawPet('dead');
      this.isDead = true;
      this.speechText = "";
    } else if (isDying) {
      console.log("Pet is dead");
      this.petStatus = 'Dead';
      this.drawPet('dead');
      this.speechText = "Girl, you're killing me";
    } else if ((isHungry && isBored && isDirty) || this.boredom >= 90) {
      console.log("Pet is sad (hungry + bored)");
      this.petStatus = 'Sad';
      this.drawPet('sad');
      this.speechText = "";
    } else if (isDirty) {
      console.log("Pet is dirty");
      this.petStatus = 'Dirty';
      this.drawPet('worried');
      this.speechText = "";
    } else if (isHungry) {
      console.log("Pet is hungry");
      this.petStatus = 'Hungry';
      this.drawPet('hungry');
      this.speechText = "";
    } else if (isBored) {
      console.log("Pet is bored");
      this.petStatus = 'Bored';
      this.drawPet('worried');
      this.speechText = "";
    } else {
      this.petStatus = 'Happy';
      this.drawPet('happy');
      this.speechText = "";
    }
  }

  get foodImagePath(): string {
    return `assets/${this.foodItems[this.currentFoodIndex]}.png`;
  }

  get playToyImagePath(): string {
    return `assets/${this.toyItems[this.currentToyIndex]}.png`;
  }

  applyEffect(effect: PetEffect) {
    if (effect.hungerChange) {
      this.hunger = Math.max(0, Math.min(100, this.hunger + effect.hungerChange));
    }
    if (effect.boredomChange) {
      this.boredom = Math.max(0, Math.min(100, this.boredom + effect.boredomChange));
    }
    if (effect.speech) {
      this.speechText = effect.speech;
      setTimeout(() => {
        this.speechText = '';
        this.drawPet(this.currentMood);
      }, 2000);
    }

    this.updatePetMood();
  }

  revivePet() {
    this.hunger = 0;
    this.boredom = 0;
    this.petStatus = 'Happy';
    this.isDead = false;
    this.drawPet('happy');
    this.speechText = "I'm back!";
    setTimeout(() => {
      this.speechText = "";
      this.drawPet('happy');
    }, 2500);
  }

  ngOnDestroy() {
    clearInterval(this.hungerInterval);
  }
}
