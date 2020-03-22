//  the funny has arrived
import * as Phaser from "phaser";
import Player from "./player";

export default class TestScene extends Phaser.Scene {
    // lol sprite
    preload() {
        this.load.spritesheet(
            "player",
            "assets/G.png",
            {
                frameWidth: 20,
                frameHeight: 20,
                margin: 0,
                spacing: 0
            }
        );
        // oof
        this.load.image('ground', 'assets/platform.png');
    }

    create() {
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        this.platforms.create(50, 250, 'ground');

        this.player = new Player(this, 100, 200);
        this.player.sprite.setCollideWorldBounds(true);
        this.physics.world.addCollider(this.player.sprite, this.platforms);
    }

    update(time, delta) {
        // player handles itself
        this.player.update(delta);
    }
}