// bruuuuh
import * as Phaser from 'phaser'


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'matter',
        matter: {}
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
const GRAVITY = 8;
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
    // le platforms
    let platform = this.matter.add.image(400, 568, 'ground', null,
        { restitution: 0.4, isStatic: true });


    player = this.matter.add.image(400, 200, 'guy', null, { inertia: Infinity });
    // player.body.setMaxSpeed(400);
    // le friction
    player.setFriction(0.3);
    player.setFrictionAir(0.005);

    // cammm
    // this.cameras.main.setBounds(0, 0, 3000, 3000);
    this.cameras.main.startFollow(player, true, 1, 1);
    this.cameras.main.setZoom(1);

    /* player inputs amirite */
    document.addEventListener('keydown', (event) => {
        if (!inputs.includes(event.key)) inputs.push(event.key);
    });
    document.addEventListener('keyup', (event) => {
        let idx = inputs.indexOf(event.key);
        if (idx > -1) inputs.splice(idx, 1);
    });
}

function update() {
    // le dt
    curTime = Date.now();
    let dt = curTime - lastTime;
    lastTime = curTime;


    if (inputs.includes('ArrowLeft') && Math.abs(player.body.velocity.x) < 5) {
        player.applyForce({ x: -0.005, y: 0 });
    } else if (inputs.includes('ArrowRight') && Math.abs(player.body.velocity.x) < 5) {
        player.applyForce({ x: 0.005, y: 0 });
    } else {
        player.applyForce({ x: 0, y: 0 });
    }

    if (inputs.includes('ArrowUp') && Math.abs(player.body.velocity.y) < 5) {
        player.applyForce({x: 0, y: -0.01});
    }

    // fall faster than you rise
    // if falling increase gravity by fallmult
    if (player.body.velocity.y < 0) {
        player.body.velocity.y *= GRAVITY
            * fallMult * dt;
        // handle variable jump height by increasing gravity when button released.
    } else if (player.body.velocity.y > 0 && !inputs.includes('ArrowUp')) {
        player.body.velocity.y *= -lowJumpMult;
    }
}