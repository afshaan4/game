// bruuuuh
import * as Phaser from 'phaser'


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
const JUMP_TIME = 200;
let player;
let platforms;
let boosting;

function preload() {
    this.load.image('ground', 'assets/platform.png');
    this.load.image('guy', 'assets/G.png');
}

function create() {
    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(50, 250, 'ground');

    player = this.physics.add.image(100, 450, 'guy');
    player.setCollideWorldBounds(true);
    player.isOnFloor;
    player.body.setMaxSpeed(300);

    this.keys = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        up: Phaser.Input.Keyboard.KeyCodes.UP
    });

    this.physics.add.collider(player, platforms);
}

function update() {
    player.isOnFloor = player.body.touching.down;
    let dragMult = player.isOnFloor ? 1 : 0;
    let accMult = player.isOnFloor ? 1 : 0.7;

    if (this.keys.left.isDown) {
        player.setAccelerationX(-600 * accMult);
    } else if (this.keys.right.isDown) {
        player.setAccelerationX(600 * accMult);
    } else {
        player.setAccelerationX(0);
        player.setDragX(900 * dragMult);
    }

    if (this.keys.up.isDown) {
        let didJump = jump();
        if (!didJump && this.keys.up.getDuration() > JUMP_TIME) {
            stopJumpBoost();
        }
    }

    if (!this.keys.up.isDown) stopJumpBoost();
}

function jump() {
    const JUMP_SPEED = 300;
    if (player.isOnFloor || boosting) {
        player.body.velocity.y = -JUMP_SPEED;
        boosting = true;
    }
    return player.isOnFloor;
}

function stopJumpBoost() {
    boosting = false;
}