import { CommonModule } from '@angular/common';
import { Component, ElementRef, AfterViewInit, ViewChild, OnDestroy, ViewEncapsulation } from '@angular/core';

type PetEffect = {
  hungerChange?: number;
  boredomChange?: number;
  speech?: string;
};

type ShowerDroplet = {
  x: number;
  y: number;
  length: number;
  speed: number;
  spriteIndex: number;
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
  private paused = false;
  loadingScreenOn = true;

  petStatus: string = 'Happy';
  hunger = 100; // 0 to 100
  private hungerInterval!: number;
  boredom = 100;
  private boredomInterval!: number;
  speechText: string = '';
  cleanliness = 100;
  private cleanlinessInterval!: number;
  isShowerMode = false;
  isWaterRunning = false;
  private showerInterval!: number;
  private waterDroplets: ShowerDroplet[] = [];
  private animationFrameId: number = 0;
  private dropletImage: HTMLImageElement = new Image();
  private dropletImages: HTMLImageElement[] = [];
  private showerButton = {
    x: 262,
    y: 240,
    width: 40,
    height: 40,
  };
  private showerCleaningInterval!: number;

  isDead: boolean = false;

  private petImages: { [key: string]: HTMLImageElement } = {};
  private currentMood: 'happy' | 'worried' | 'sad' | 'hungry' | 'dead' = 'happy';

  currentFoodIndex = 0;
  currentToyIndex = 0;
  // foodItems: string[] = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];
  // toyItems: string[] = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'];

  foodItems = [
    { id: 'f1', name: 'Carrot', effect: { hungerChange: +5 }, valueLabel: '+5' },
    { id: 'f2', name: 'Lettuce', effect: { hungerChange: +5 }, valueLabel: '+5' },
    { id: 'f3', name: 'Potato', effect: { hungerChange: +10 }, valueLabel: '+10' },
    { id: 'f4', name: 'Cherries', effect: { hungerChange: +7 }, valueLabel: '+7' },
    { id: 'f5', name: 'Fruit', effect: { hungerChange: +10 }, valueLabel: '+10' },
    { id: 'f6', name: 'Pickles', effect: { hungerChange: +8 }, valueLabel: '+8' },
    { id: 'f7', name: 'Burger', effect: { hungerChange: +15 }, valueLabel: '+15' },
    { id: 'f8', name: 'Full Irish', effect: { hungerChange: +30 }, valueLabel: '+30' },
  ];

  toyItems = [
    { id: 't1', name: 'Ball', effect: { boredomChange: +10 }, valueLabel: '+10' },
    { id: 't2', name: 'Yarn', effect: { boredomChange: +7 }, valueLabel: '+7' },
    { id: 't3', name: 'Teddy Bear', effect: { boredomChange: +12 }, valueLabel: '+12' },
    { id: 't4', name: 'Train', effect: { boredomChange: +10 }, valueLabel: '+10' },
    { id: 't5', name: 'Rubber Duck', effect: { boredomChange: +8 }, valueLabel: '+8' },
    { id: 't6', name: 'Lego', effect: { boredomChange: +15 }, valueLabel: '+15' },
    { id: 't7', name: 'Space Ship', effect: { boredomChange: +20 }, valueLabel: '+20' },
    { id: 't8', name: 'Starfish', effect: { boredomChange: +10 }, valueLabel: '+10' },
  ];

  ngAfterViewInit() {
    this.loadingScreenOn = true;

    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.canvas.nativeElement.addEventListener('click', this.handleCanvasClick.bind(this));

    this.backgroundImage.src = 'assets/room2.png';
    this.loadDropletImages();

    this.backgroundImage.onload = () => {
      this.loadPetImages(() => {
        this.drawPet('happy');

        // const overlay = document.getElementById('screenOverlay');
        // if (overlay) {
        //   overlay.textContent = 'Loading...';
        //   overlay.style.opacity = '1';

        //   setTimeout(() => {
        //     overlay.style.opacity = '0';
        //     setTimeout(() => {
        //       overlay.style.display = 'none';
        //       this.drawPet(this.currentMood);
        //     }, 800);
        //   }, 500);
        // }

        const overlay = document.getElementById('screenOverlay');

        if (overlay) {
          overlay.innerHTML = `<div class="loading-text">DigiPet Loading...</div>`;

          setTimeout(() => {
            overlay.innerHTML = `<div class="white-line"></div>`;

            setTimeout(() => {
              overlay.style.animation = 'fadeOutOverlay 1.5s ease forwards';

              overlay.style.animation = 'fadeOutOverlay 1.5s ease forwards';

              const onAnimationEnd = () => {
                this.loadingScreenOn = false;
                overlay.removeEventListener('animationend', onAnimationEnd);
              };

              overlay.addEventListener('animationend', onAnimationEnd);

              this.loadPetImages(() => {
                this.drawPet('happy');
                this.startAllStats();
              });
            }, 1300);
          }, 1000);
        }
      });
    };

    const nameInput = document.getElementById('digipetName') as HTMLInputElement;

    if (nameInput) {
      nameInput.addEventListener('input', () => {
        localStorage.setItem('digipetName', nameInput.value);
      });
    }

  }

  private handleCanvasClick(event: MouseEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const { x: bx, y: by, width, height } = this.showerButton;

    const isWithinButton = x >= bx && x <= bx + width && y >= by && y <= by + height;

    if (isWithinButton && this.isShowerMode) {
      this.toggleShowerHead();
    }
  }

  loadDropletImages() {
    const imagePaths = [
      'assets/droplet.png',
      'assets/droplet2.png',
      'assets/droplet3.png',
      'assets/droplet4.png',
      'assets/droplet5.png',
      'assets/droplet6.png',
    ];

    imagePaths.forEach((path, index) => {
      const img = new Image();
      img.src = path;
      this.dropletImages[index] = img;
    });
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

      const x = this.isShowerMode ? 260 : (900 - petWidth) / 2;
      const y = this.isShowerMode ? 285 : 255;

      ctx.drawImage(petImg, x, y, petWidth, petHeight);

      if (this.speechText && !this.isShowerMode) {
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

    // Draw the bubble to the left of the pet
    const bubbleX = x - bubbleWidth - 20; // 20 is a margin between pet and bubble

    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#87a5f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bubbleX, y, bubbleWidth, bubbleHeight, 10);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bubbleX + bubbleWidth - 20, y + bubbleHeight);
    ctx.lineTo(bubbleX + bubbleWidth - 10, y + bubbleHeight + 10);
    ctx.lineTo(bubbleX + bubbleWidth - 30, y + bubbleHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'black';
    ctx.fillText(text, bubbleX + padding, y + 25);
  }

  updatePetMood() {

    if (this.isDead) {
      console.log("Pet is dead");
      this.petStatus = 'Dead';
      this.drawPet('dead');
      this.speechText = '';
      return;
    }

    const isHungry = this.hunger <= 60;
    const isBored = this.boredom <= 50;
    const isDirty = this.cleanliness <= 50;
    const isDying = this.hunger <= 25 && this.boredom <= 20 && this.cleanliness <= 15;
    const petHasDied = this.hunger <= 0 && this.boredom <= 0 && this.cleanliness <= 0;

    console.log(this.hunger, this.boredom, this.cleanliness);

    // In bathroom - mood is based only on cleanliness
    if (this.isShowerMode) {
      if (isDirty) {
        console.log("Pet is dirty");
        this.petStatus = 'Dirty';
        this.drawPet('sad');
        // this.drawShowerButton();
      } else {
        this.petStatus = 'Clean';
        this.drawPet('happy');
        // this.drawShowerButton();
      }
      this.speechText = '';
      return;
    }

    if (petHasDied) {
      console.log("Pet is dead");
      this.petStatus = 'Dead';
      this.drawPet('dead');
      this.isDead = true;
      this.speechText = '';
    } else if (isDying) {
      console.log("Pet is dyinggg");
      this.petStatus = 'Dying';
      this.drawPet('dead');
      this.speechText = "Girl, you're killing me";
    } else if (isHungry && isBored && isDirty) {
      console.log("Pet is sad (hungry + bored + dirty)");
      this.petStatus = 'Sad';
      this.drawPet('sad');
      this.speechText = '';
    } else if (isDirty) {
      console.log("Pet is dirty");
      this.petStatus = 'Dirty';
      this.drawPet('worried');
      this.speechText = '';
    } else if (isHungry) {
      console.log("Pet is hungry");
      this.petStatus = 'Hungry';
      this.drawPet('hungry');
      this.speechText = '';
    } else if (isBored) {
      console.log("Pet is bored");
      this.petStatus = 'Bored';
      this.drawPet('worried');
      this.speechText = '';
    } else {
      console.log("Pet is happy");
      this.petStatus = 'Happy';
      this.drawPet('happy');
      this.speechText = '';
    }
  }

  get foodImagePath(): string {
    return `assets/${this.foodItems[this.currentFoodIndex]}.png`;
  }

  get playToyImagePath(): string {
    return `assets/${this.toyItems[this.currentToyIndex]}.png`;
  }

  applyEffect(effect: PetEffect) {
    if (this.isDead) return;

    if (effect.hungerChange) {
      clearInterval(this.hungerInterval);
      this.hunger = Math.max(0, Math.min(100, this.hunger + effect.hungerChange));
      this.resumeSingleStat("hunger");
    }
    if (effect.boredomChange) {
      clearInterval(this.boredomInterval);
      this.boredom = Math.max(0, Math.min(100, this.boredom + effect.boredomChange));
      this.resumeSingleStat("boredom");
    }
    // if (effect.speech) {
    //   this.speechText = effect.speech;
    //   setTimeout(() => {
    //     this.speechText = '';
    //     this.drawPet(this.currentMood);
    //   }, 1500);
    // }

    this.updatePetMood();
  }

  enterBathroom() {
    this.pauseLivingRoomStats();
    this.isShowerMode = true;
    this.backgroundImage.src = 'assets/bathroom-base.png';
    this.backgroundImage.onload = () => {
      this.drawPet(this.currentMood);
      this.updateShowerButtonGlow();
      // this.drawShowerButton();
    };
  }

  updateShowerButtonGlow() {
    const showerButton = document.getElementById('mainBtn');
    if (showerButton && !this.isWaterRunning) {
      showerButton.classList.add('glowing');
    }
  }

  private drawShowerButton() {
    const ctx = this.ctx;
    const { x, y, width, height } = this.showerButton;

    const pastelBlue = '#aee2ff';
    const pastelRed = '#ffc6c6';

    const bgColor = this.isWaterRunning ? pastelRed : pastelBlue;
    const text = this.isWaterRunning ? 'OFF' : 'ON';

    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 10);
    ctx.fillStyle = bgColor;
    ctx.fill();

    ctx.strokeStyle = '#5d7435ff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#1e2b05ff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2 + 2);
  }

  toggleShowerHead() {
    if (!this.isShowerMode) {

      const menuGrid = document.querySelector('.menu-grid');

      if (menuGrid) {
        menuGrid.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });

        const menuItems = document.querySelectorAll('.menu-grid');
        menuItems.forEach(item => {
          item.classList.add('glowing-box-shadow');

          setTimeout(() => {
            item.classList.remove('glowing-box-shadow');
          }, 400);
        });
      }

      return;
    }

    const showerButton = document.getElementById('mainBtn');
    if (showerButton) {
      showerButton.classList.remove('glowing');
    }

    if (this.isWaterRunning) {
      this.stopWaterAnimation();
    } else {
      this.startWaterAnimation();
    }

    this.drawPet(this.currentMood);
    // this.drawShowerButton();
  }

  private startAllStats() {
    this.hungerInterval = window.setInterval(() => {
      if (!this.isShowerMode && !this.isDead) {
        this.hunger = Math.max(0, this.hunger - 9);
        this.updatePetMood();
      }
    }, 2000);

    this.boredomInterval = window.setInterval(() => {
      if (!this.isShowerMode && !this.isDead) {
        this.boredom = Math.max(0, this.boredom - 7);
        this.updatePetMood();
      }
    }, 2800);

    this.cleanlinessInterval = window.setInterval(() => {
      if (!this.isDead) {
        this.cleanliness = Math.max(0, this.cleanliness - 7);
        this.updatePetMood();
      }
    }, 4000);
  }

  private pauseAllStats() {
    this.paused = true;
    clearInterval(this.hungerInterval);
    clearInterval(this.boredomInterval);
    clearInterval(this.cleanliness);
  }

  private pauseLivingRoomStats() {
    this.paused = true;
    clearInterval(this.hungerInterval);
    clearInterval(this.boredomInterval);
  }

  private resumeLivingRoomStats() {
    this.paused = false;

    this.hungerInterval = window.setInterval(() => {
      this.hunger = Math.max(0, Math.min(this.hunger - 9, 100));
      this.updatePetMood();
    }, 2000);

    this.boredomInterval = window.setInterval(() => {
      this.boredom = Math.max(0, Math.min(this.boredom - 7, 100));
      this.updatePetMood();
    }, 2800);
  }

  private resumeSingleStat(stat: String) {
    this.paused = false;

    if (stat == "hunger") {
      this.hungerInterval = window.setInterval(() => {
        this.hunger = Math.max(0, Math.min(this.hunger - 9, 100));
        this.updatePetMood();
      }, 2000);
    }
    else if (stat == "boredom") {

      this.boredomInterval = window.setInterval(() => {
        this.boredom = Math.max(0, Math.min(this.boredom - 7, 100));
        this.updatePetMood();
      }, 2800);
    }
  }

  leaveBathroom() {
    this.isShowerMode = false;
    this.stopWaterAnimation();
    clearInterval(this.showerInterval);
    this.backgroundImage.src = 'assets/room2.png';
    this.backgroundImage.onload = () => {
      this.drawPet('happy');
    };
    const showerButton = document.getElementById('mainBtn');
    if (showerButton) {
      showerButton.classList.remove('glowing');
    }
    this.resumeLivingRoomStats();
  }

  startWaterAnimation() {
    this.isWaterRunning = true;
    this.waterDroplets = [];

    // Clear both intervals before starting new ones
    clearInterval(this.cleanlinessInterval);
    clearInterval(this.showerCleaningInterval);

    const createDroplet = (): ShowerDroplet => ({
      x: 325 + Math.random() * 60,
      y: 195,
      length: 20 + Math.random() * 10,
      speed: 2 + Math.random() * 2,
      spriteIndex: Math.floor(Math.random() * 6)
    });

    let dropletSpawnInterval = setInterval(() => {
      if (!this.isWaterRunning || this.waterDroplets.length >= 30) {
        clearInterval(dropletSpawnInterval);
        return;
      }
      this.waterDroplets.push(createDroplet());
    }, 50);

    this.showerCleaningInterval = window.setInterval(() => {
      if (this.cleanliness > 0) {
        this.cleanliness = Math.max(0, Math.min(this.cleanliness + 4, 100));
        this.updatePetMood();
      }
    }, 1000);

    const animate = () => {
      if (!this.isWaterRunning) return;

      this.animationFrameId = requestAnimationFrame(animate);

      const ctx = this.ctx;
      ctx.clearRect(0, 0, 900, 500);
      if (this.backgroundImage?.complete) {
        ctx.drawImage(this.backgroundImage, 0, 0, 900, 500);
      }

      this.drawPet(this.currentMood);
      // this.drawShowerButton();

      this.waterDroplets.forEach(droplet => {
        droplet.y += droplet.speed;

        if (droplet.y > 310) {
          droplet.y = 200;
          droplet.x = 325 + Math.random() * 60;
        }

        const dropletImage = this.dropletImages[droplet.spriteIndex];

        if (dropletImage?.complete) {
          ctx.drawImage(dropletImage, droplet.x, droplet.y, 10, droplet.length);
        } else {
          ctx.fillStyle = 'blue';
          ctx.fillRect(droplet.x, droplet.y, 2, droplet.length);
        }
      });
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  stopWaterAnimation() {
    this.isWaterRunning = false;
    cancelAnimationFrame(this.animationFrameId);
    clearInterval(this.showerCleaningInterval);
    clearInterval(this.cleanlinessInterval);

    this.waterDroplets = [];

    this.cleanlinessInterval = window.setInterval(() => {
      if (!this.isDead) {
        this.cleanliness = Math.max(0, Math.min(this.cleanliness - 8, 100));
        this.updatePetMood();
      }
    }, 4000);
  }

  revivePet() {
    this.pauseAllStats();

    this.hunger = 100;
    this.boredom = 100;
    this.cleanliness = 100;
    this.petStatus = 'Happy';
    this.isDead = false;
    this.drawPet('happy');
    this.speechText = "I'm back!";

    setTimeout(() => {
      this.speechText = "";
      this.drawPet('happy');

      this.startAllStats();
    }, 2500);
  }

  ngOnDestroy() {
    clearInterval(this.hungerInterval);
    clearInterval(this.boredomInterval);
    clearInterval(this.cleanlinessInterval);
    clearInterval(this.showerInterval);
    clearInterval(this.showerCleaningInterval);
    cancelAnimationFrame(this.animationFrameId);
  }

  killPet() {
    this.hunger = 0;
    this.boredom = 0;
    this.cleanliness = 0;
    this.isDead = true;
  }


  // feedPet() {
  //   clearInterval(this.hungerInterval);

  //   this.hunger = Math.max(this.hunger - 10, 0);
  //   this.updatePetMood();

  //   this.currentFoodIndex = (this.currentFoodIndex + 1) % this.foodItems.length;

  //   this.hungerInterval = window.setInterval(() => {
  //     if (!this.isShowerMode && !this.isDead) {
  //       this.hunger = Math.min(this.hunger + 10, 100);
  //       this.updatePetMood();
  //     }
  //   }, 2900);

  // }

  // playWithPet() {
  //   clearInterval(this.boredomInterval);

  //   this.boredom = Math.max(this.boredom - 10, 0);
  //   this.updatePetMood();

  //   this.currentToyIndex = (this.currentToyIndex + 1) % this.toyItems.length;

  //   this.boredomInterval = window.setInterval(() => {
  //     if (!this.isShowerMode && !this.isDead) {
  //       this.boredom = Math.min(this.boredom + 10, 100);
  //       this.updatePetMood();
  //     }
  //   }, 2700);

  // }

}
