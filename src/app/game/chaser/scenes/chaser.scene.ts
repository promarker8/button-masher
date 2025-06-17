import Phaser from 'phaser';
import { ScoreService } from '../services/score.service';

export class ChaserScene extends Phaser.Scene {
    player!: Phaser.Physics.Arcade.Sprite;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    ground!: Phaser.Physics.Arcade.StaticGroup;
    obstacles!: Phaser.Physics.Arcade.Group;
    coins!: Phaser.Physics.Arcade.Group;
    scoreText!: Phaser.GameObjects.Text;
    pauseText!: Phaser.GameObjects.Text;
    gameOver = false;
    paused = false;
    groundHeights: Map<number, number> = new Map();
    gameTime = 0; // in seconds
    timerText!: Phaser.GameObjects.Text;

    // ground stuff
    lastGroundX = 10;
    tileWidth = 400;
    groundHeight = 80;
    maxHeightChange = 150; // pixels up/down
    gapChance = 0.4; // 20% chance of a gap
    currentGroundY = 600; // start flat
    safeTiles = 3;

    // changeable variables
    playerVelocityX = 300;
    obstacleSize = 0.8;
    coinSize = 0.3;

    // jumping
    jumpsMade = 0;
    maxJumps = 2;

    // boost logic
    boostKey!: Phaser.Input.Keyboard.Key;
    boosting = false;
    boostAmount = 160;
    boostDuration = 1000; // milliseconds
    glow!: Phaser.GameObjects.Image;

    constructor(private scoreService: ScoreService) {
        super('ChaserScene');
    }

    preload() {
        this.load.image('ground', '/hill_square.png');
        this.load.image('background', '/sky.png');
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('obstacle', '/fireball.png');
        this.load.image('coin', '/coin.png');
        this.load.image('glow', '/flames.png');
    }

    create() {
        this.scoreService.reset();

        // background
        this.add.image(0, 0, 'background').setOrigin(0).setScrollFactor(0);

        // Ground
        this.ground = this.physics.add.staticGroup();
        this.cameras.main.setBounds(0, 0, 4000, 600); // Game world width, height
        this.physics.world.setBounds(0, 0, 4000, 600); // Physics world bounds

        // this.ground.create(400, 390, 'ground').setScale(2).refreshBody();

        // contintous flat ground that ends
        // const groundY = 580; // Desired top edge of ground
        // const groundHeight = 40;

        // for (let x = 0; x <= 4000; x += 400) {
        //   const platform = this.ground.create(x, groundY + groundHeight / 2, 'ground');
        //   platform.setDisplaySize(400, groundHeight); // visually stretched
        //   platform.body.updateFromGameObject(); // ✅ important: sync physics body to display size
        // }

        // ground with holes and jumps
        this.addGroundTile(this.lastGroundX);

        // Player
        this.player = this.physics.add.sprite(100, 300, 'player').setScale(1.5);
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(1);

        this.physics.add.collider(this.player, this.ground);

        // Input
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.input.keyboard!.on('keydown-P', this.togglePause, this);

        // Obstacles group
        this.obstacles = this.physics.add.group();
        // this.time.addEvent({
        //     delay: 2000,
        //     callback: this.spawnObstacle,
        //     callbackScope: this,
        //     loop: true
        // });
        this.scheduleNextObstacle();
        this.physics.add.collider(this.player, this.obstacles, this.handleGameOver, undefined, this);

        // Coins
        this.coins = this.physics.add.group();
        this.spawnCoin(); // spawn initial coin

        // Spawn coins every second
        this.spawnCoinsRandomly();
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);

        // Auto-run velocity
        this.player.setVelocityX(this.playerVelocityX);
        this.player.anims.play('right', true);

        // follow the character
        this.cameras.main.startFollow(this.player);

        // Timer
        this.timerText = this.add.text(16, 16, 'Time: 0s', {
            fontSize: '24px',
            color: '#275a04'
        }).setScrollFactor(0);

        // Score Text
        this.scoreText = this.add.text(16, 48, 'Coins: 0', { fontSize: '24px', color: '#275a04' });
        this.scoreText.setScrollFactor(0); // Keeps text fixed to the camera

        this.pauseText = this.add.text(500, 300, 'Paused', { fontSize: '48px', color: '#275a04' })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setVisible(false);

        // timer updates and adding things with time
        this.time.addEvent({
            delay: 1000, // every second
            loop: true,
            callback: () => {
                if (!this.paused && !this.scoreService.gameOver()) {
                    this.gameTime++;
                    this.timerText.setText(`Time: ${this.gameTime}s`);

                    if (this.gameTime % 10 === 0 && this.playerVelocityX <= 600) {
                        this.increaseDifficulty(50); // add difficulty
                    }
                }
            }
        });

        // boost button
        this.boostKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.glow = this.add.image(this.player.x, this.player.y, 'glow')
            .setScale(.8)
            .setAlpha(0)
            .setDepth(0);
        this.glow.setScrollFactor(1);

        // score update loop
        // this.time.addEvent({
        //     delay: 1000,
        //     loop: true,
        //     callback: () => {
        //         if (!this.scoreService.gameOver() && !this.paused) {
        //             this.scoreService.increment();
        //             this.scoreText.setText('Score: ' + this.scoreService.score());
        //         }
        //     }
        // });
    }

    override update(): void {
        if (this.scoreService.gameOver() || this.paused) return;

        if ((this.cursors.space?.isDown || this.cursors.up?.isDown) && this.player.body!.touching.down) {
            this.player.setVelocityY(-280);
        }

        const onGround = this.player.body?.touching.down;
        // console.log('Touching down:', isTouchingDown);

        if (onGround) {
            this.jumpsMade = 0; // Reset on landing
        }

        if ((Phaser.Input.Keyboard.JustDown(this.cursors.space) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) && this.jumpsMade < this.maxJumps) {
            this.player.setVelocityY(-500);
            this.jumpsMade++;
        }

        this.obstacles.getChildren().forEach((obstacle: any) => {
            obstacle.x -= 4;
            if (obstacle.x < -50) {
                this.obstacles.remove(obstacle, true, true);
            }
        });

        const buffer = 1000;
        if (this.player.x + buffer > this.lastGroundX) {
            this.addGroundTile(this.lastGroundX + this.tileWidth);
        }

        this.coins.getChildren().forEach((coin: any) => {
            if (coin.x < this.cameras.main.scrollX - 100) {
                this.coins.remove(coin, true, true);
            }
        });

        if (!this.boosting) {
            this.player.setVelocityX(this.playerVelocityX);
        }

        if (Phaser.Input.Keyboard.JustDown(this.boostKey) && !this.boosting) {
            this.activateBoost();
        }

        if (this.glow) {
            this.glow.setPosition(this.player.x - 20, this.player.y);
        }

    }

    togglePause() {
        this.paused = !this.paused;
        this.physics.world.isPaused = this.paused;
        this.pauseText.setVisible(this.paused);
    }

    randomDelta(min: number, max: number, minStep: number) {
        let delta = 0;
        while (Math.abs(delta) < minStep) {
            delta = Phaser.Math.Between(min, max);
        }
        return delta;
    }

    addGroundTile(x: number) {
        this.physics.world.setBounds(0, 0, this.lastGroundX + this.tileWidth, 600);
        this.cameras.main.setBounds(0, 0, this.lastGroundX + this.tileWidth, 600);

        // only allow jumps and gaps after a few safe tiles
        const allowVariations = this.safeTiles <= 0;

        // if i want holes
        // if (allowVariations && Math.random() < this.gapChance) {
        //   this.lastGroundX = x;
        //   return;
        // }

        // Vary height within limits
        const delta = allowVariations
            ? this.randomDelta(-this.maxHeightChange, this.maxHeightChange, 40)
            : 0;

        this.currentGroundY = Phaser.Math.Clamp(this.currentGroundY + delta, 400, 580);

        // stretch ground down to bottom of screen
        const heightFromYToBottom = 600 - this.currentGroundY;
        const platform = this.ground.create(x, this.currentGroundY + heightFromYToBottom / 2, 'ground');
        platform.setDisplaySize(this.tileWidth, heightFromYToBottom);
        platform.body.updateFromGameObject();

        this.groundHeights.set(x, this.currentGroundY);

        this.lastGroundX = x;
        if (this.safeTiles > 0) this.safeTiles--; // count down safe tiles
    }

    spawnObstacle() {
        // const obstacle = this.obstacles.create(850, 150, 'obstacle');
        // const obstacle = this.obstacles.create(this.player.x + 600, 250, 'obstacle');
        if (this.paused || this.scoreService.gameOver()) return;

        const y = Phaser.Math.Between(150, 350); // Much higher up the screen
        const obstacle = this.obstacles.create(this.player.x + 600, y, 'obstacle');

        obstacle.setImmovable(true);
        // obstacle.setVelocityX(-200);
        obstacle.setVelocityX(-Phaser.Math.Between(100, 400));
        // obstacle.setAngularVelocity(180);
        obstacle.setGravityY(0);
        obstacle.setSize(30, 30);
        obstacle.setScale(this.obstacleSize);
        obstacle.setCollideWorldBounds(false);

    }

    scheduleNextObstacle() {
        const delay = Phaser.Math.Between(1000, 3000);
        this.time.delayedCall(delay, () => {
            this.spawnObstacle();
            this.scheduleNextObstacle();
        });
    }

    spawnCoin() {
        const x = this.player.x + Phaser.Math.Between(300, 600);
        // const y = Phaser.Math.Between(this.currentGroundY - 250, this.currentGroundY - 50);
        const y = Phaser.Math.Between(0, 50);

        const coin = this.coins.create(x, y, 'coin');
        coin.setScale(this.coinSize);
        coin.setBounce(.4);
        coin.setGravityY(500);
        coin.setCollideWorldBounds(false);

        this.physics.add.collider(coin, this.ground);
    }

    spawnCoinsRandomly() {
        const minDelay = 1200;
        const maxDelay = 3000;

        const delay = Phaser.Math.Between(minDelay, maxDelay);

        this.time.addEvent({
            delay,
            callback: () => {
                if (!this.paused && !this.scoreService.gameOver()) {
                    this.spawnCoin();
                }
                this.spawnCoinsRandomly(); // still reschedules itself
            },
            callbackScope: this
        });
    }

    collectCoin(player: any, coin: any) {
        coin.disableBody(true, true);

        this.scoreService.increment();
        this.scoreText.setText('Coins: ' + this.scoreService.score());

        // Optional: play a sound, particle effect, etc.
    }

    increaseDifficulty(speedUp: number) {
        // const newSpeed = this.player.body!.velocity.x + 900;
        // this.player.setVelocityX(newSpeed);
        this.playerVelocityX += speedUp;
        this.boostAmount += 20;
        console.log("speed is now:", this.playerVelocityX);
        console.log("boostAmount is now:", this.boostAmount);

        const speedText = this.add.text(this.player.x, this.player.y - 100, 'Speeding up!', {
            fontSize: '32px',
            color: '#ff0000'
        }).setOrigin(0.5).setScrollFactor(1).setDepth(10);

        this.tweens.add({
            targets: speedText,
            alpha: { from: 1, to: 0 },
            duration: 1000,
            ease: 'Power1',
            onComplete: () => speedText.destroy()
        });
    }

    activateBoost() {
        this.boosting = true;
        this.player.setVelocityX(this.playerVelocityX + this.boostAmount);

        this.glow.setAlpha(0.6);

        // console.log(this.boostAmount);

        this.time.delayedCall(450, () => {
            this.boosting = false;
            this.player.setVelocityX(this.playerVelocityX);
            this.glow.setAlpha(0);
        });
    }

    handleGameOver() {
        this.physics.pause();
        this.scoreService.setGameOver();
        this.timerText.setColor('#ff0000');
        this.scoreText.setText('');
        this.player.setTint(0xff0000);
    }
}