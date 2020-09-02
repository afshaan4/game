// original author: https://github.com/mikewesthad/phaser-3-tilemap-blog-posts
// modified by: skittlemittle
// template scene so you can whip us test scenes quickly

import * as Phaser from "phaser";
import Char from "./char.js";

export default class MainScene extends Phaser.Scene {

  preload() {
    this.load.tilemapTiledJSON("map", "../assets/tilemaps/lvl.json");
    this.load.image(
      "kenney-tileset-64px-extruded",
      "../assets/tilesets/kenney-tileset-64px-extruded.png"
    );

    this.load.spritesheet(
      "player",
      "../assets/spritesheets/0x72-industrial-player-32px-extruded.png", {
        frameWidth: 32,
        frameHeight: 32,
        margin: 1,
        spacing: 2
      }
    );
  }

  create() {
    this.players = [];
    const map = this.make.tilemap({
      key: "map"
    });
    const tileset = map.addTilesetImage("kenney-tileset-64px-extruded");
    const groundLayer = map.createDynamicLayer("Ground", tileset, 0, 0);
    const lavaLayer = map.createDynamicLayer("Lava", tileset, 0, 0);
    map.createDynamicLayer("Background", tileset, 0, 0);
    map.createDynamicLayer("Foreground", tileset, 0, 0).setDepth(10);

    // Set colliding tiles before converting the layer to Matter bodies
    groundLayer.setCollisionByProperty({
      collides: true
    });
    lavaLayer.setCollisionByProperty({
      collides: true
    });

    // so the hitboxes arent just squares
    this.matter.world.convertTilemapLayer(groundLayer);
    this.matter.world.convertTilemapLayer(lavaLayer);
    this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // make players
    const {
      x,
      y
    } = map.findObject("Spawn", obj => obj.name === "Spawn Point");
    this.players.push(new Char(this, x, y, 0));

    // make a camera for each player, yuck make better
    const {
      width,
      height
    } = this.sys.game.canvas;
    this.cams = [];
    this.cameras.main.setSize(width, height);
    const cam0 = this.cameras.main;
    this.cams.push(cam0);

    // follow them players
    for (let i = 0; i < this.players.length; i++) {
      this.cams[i].setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      this.cams[i].startFollow(this.players[i].sprite, false, 0.5, 0.5);
    }

    /* =============map features============= */

    /* =============Start up the game=============*/

    /* =============the event handling zone============= */

    this.players.forEach(player => {
      this.unsubscribePlayerCollide = this.matterCollision.addOnCollideStart({
        objectA: player.sprite,
        callback: eventData => {
          const {
            gameObjectB
          } = eventData;
          this.state.onPlayerCollide(player, gameObjectB);
        },
        context: this
      });
    });
  }
}