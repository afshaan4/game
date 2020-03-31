//  the funny has arrived
import * as Phaser from "phaser";
import Player from "./player";

export default class TestScene extends Phaser.Scene {
    // lol sprite
    preload() {
        this.load.spritesheet(
            'player',
            'assets/G.png',
            {
                frameWidth: 20,
                frameHeight: 20,
                margin: 0,
                spacing: 0
            }
        );
        // oof
        this.load.image('fin_line', 'assets/finish_line.png');
        this.load.image('tiles', 'assets/tilesets/default.png');
        this.load.tilemapTiledJSON('map', 'assets/maps/platformer-simple.json');
    }

    create() {
        this.level_finished = false;

        const map = this.make.tilemap({ key: 'map' });
        // tilesetname(name of tileset, set by map maker), key
        const tiles = map.addTilesetImage('0x72-industrial-tileset-32px-extruded', 'tiles');

        // make the layers
        map.createStaticLayer('Background', tiles);
        this.groundLayer = map.createStaticLayer('Ground', tiles);
        map.createStaticLayer('Foreground', tiles);

        // spawn in player
        const spawn = map.findObject('Objects', obj => obj.name === 'Spawn Point');
        this.player = new Player(this, spawn.x, spawn.y);

        // physics
        this.groundLayer.setCollisionByProperty({ collides: true });
        this.physics.world.addCollider(this.player.sprite, this.groundLayer);

        // le finish flag
        this.fin_line = this.physics.add.staticGroup();
        this.fin_line.create(map.widthInPixels - 100, 200, 'fin_line');

        //  cam
        this.cameras.main.startFollow(this.player.sprite);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // this.physics.world.addCollider(this.player.sprite, this.fin_line,
        //     onWin, null, this);
    }

    update(time, delta) {
        if (this.level_finished) return; // TODO: make it call the next level
        // player handles itself
        this.player.update(delta);

        // tfw the player finishes a level
        if (this.physics.world.overlap(this.player.sprite, this.fin_line)) {
            this.level_finished = true;
            this.physics.pause();
            this.player.destroy();
            // lol restart
            this.scene.restart();
        } else if (this.player.sprite.y > this.groundLayer.height) {
            // you fell off, get ded
            this.player.destroy();
            this.scene.restart();
        }
    }
}