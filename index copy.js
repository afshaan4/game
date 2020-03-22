// bruuuuh
import * as Phaser from "phaser";
import Player from "./player.js";


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

// fatt oof
const game = new Phaser.Game(config);
let player;
let platforms;
let inputs = []; // what keys are pressed
let cursors;
let lastTime = Date.now();;
let curTime;
const fallMult = 0.00011; // magic number
const lowJumpMult = 1 * Math.pow(10, -24); // needs tuning

function preload() {
    this.load.image('ground', 'assets/platform.png');
    this.load.image('guy', 'assets/G.png');
}

function create() {
    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(50, 250, 'ground');

    player = this.physics.add.image(100, 200, 'guy');
    player.setCollideWorldBounds(true);
    player.body.setMaxSpeed(400);
    // le friction
    player.setDragX(1600);

    /* player inputs amirite */
    cursors = this.input.keyboard.createCursorKeys();

    document.addEventListener('keydown', (event) => {
        if (!inputs.includes(event.key)) inputs.push(event.key);
    });
    document.addEventListener('keyup', (event) => {
        let idx = inputs.indexOf(event.key);
        if (idx > -1) inputs.splice(idx, 1);
    });

    this.physics.add.collider(player, platforms);
}

function update() {
    // le dt
    curTime = Date.now();
    let dt = curTime - lastTime;
    lastTime = curTime;

    // TODO strafing while falling is very slow, velocity.x seems to be
    // getting effected by the falling thing
    // cursors.left.isDown
    if (inputs.includes('ArrowLeft')) {
        player.setAccelerationX(-100 * dt);
    } else if (inputs.includes('ArrowRight')) {
        player.setAccelerationX(100 * dt);
    } else {
        player.setAccelerationX(0);
    }

    if (inputs.includes('ArrowUp') && player.body.touching.down) {
        player.setVelocityY(-Math.pow(10, 5));
    }

    // fall faster than you rise
    // if falling increase gravity by fallmult
    if (player.body.velocity.y > 0) {
        player.body.velocity.y *= config.physics.arcade.gravity.y
            * fallMult * dt;
        // handle variable jump height by increasing gravity when button released.
    } else if (player.body.velocity.y < 0 && !inputs.includes('ArrowUp')) {
        player.body.velocity.y *= -lowJumpMult;
    }
}