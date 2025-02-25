import { Scene } from 'phaser';

export class Game extends Scene {
    platforms: Phaser.Physics.Arcade.StaticGroup;
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    stars: Phaser.Physics.Arcade.Group
    score = 0;
    bombs: Phaser.Physics.Arcade.Group
    scoreText: any;
    constructor() {
        super('Game');
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude',
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );

    }

    create() {
        this.cursors = this.input.keyboard!.createCursorKeys();

        this.add.image(400, 300, 'sky');

        this.platforms = this.physics.add.staticGroup();
     
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

        this.stars = this.physics.add.group({
            key: "star",
            repeat: 11,
            setXY: {
                x: 12,
                y: 0,
                stepX: 70,
            }
        });

        this.stars.children.iterate((star: any) => {
            star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            return null;
        })
        this.bombs = this.physics.add.group();
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.player, this.bombs, ()=> {})
        this.player = this.physics.add.sprite(100, 450, 'dude');

        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.overlap(
            this.player,
            this.stars,
            (player: any, star: any) => {
                star.disableBody(true, true);
                this.score += 1;
                this.scoreText.setText('score: ' + this.score);
            }, undefined,
            this
        );
        this.scoreText = this.add.text(16,16, "score: 0", { fontSize: '48px', fill: 'magenta'})

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        }
        else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
    }
}
