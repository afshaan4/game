// original author: https://github.com/mikewesthad/phaser-3-tilemap-blog-posts
// modified by: skittlemittle

import * as Phaser from "phaser";
import Char from "./char.js";
import Grapple from "./grapple";
import createRotatingPlatform from "./create-rotating-platform.js";

export default class MainScene extends Phaser.Scene {
  preload() {
    this.load.tilemapTiledJSON("map", "../assets/tilemaps/level.json");
    this.load.image(
      "kenney-tileset-64px-extruded",
      "../assets/tilesets/kenney-tileset-64px-extruded.png"
    );

    this.load.image("wooden-plank", "../assets/images/wooden-plank.png");
    this.load.image("block", "../assets/images/block.png");

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
    this.leaderBoard = [];
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

    // Get the layers registered with Matter. Any colliding tiles will be given a Matter body. We
    // haven't mapped our collision shapes in Tiled so each colliding tile will get a default
    // rectangle body (similar to AP).
    this.matter.world.convertTilemapLayer(groundLayer);
    this.matter.world.convertTilemapLayer(lavaLayer);
    this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // The spawn point is set using a point object inside of Tiled (within the "Spawn" object layer)
    this.players = [];
    const {
      x,
      y
    } = map.findObject("Spawn", obj => obj.name === "Spawn Point");
    this.players.push(new Char(this, x, y, 1));
    this.players.push(new Grapple(this, x, y, 0));

    /* make a camera for each player, yuck make better */
    const {
      width,
      height
    } = this.sys.game.canvas;
    this.cams = [];
    this.cameras.main.setSize(width / 2, height);
    const cam0 = this.cameras.main;
    const cam1 = this.cameras.add(width / 2 + 2, 0, width / 2, height);
    this.cams.push(cam0);
    this.cams.push(cam1);

    // follow them players
    for (let i = 0; i < this.players.length; i++) {
      this.cams[i].setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      this.cams[i].startFollow(this.players[i].sprite, false, 0.5, 0.5);
    }

    /* =============map features============= */

    // Load up some crates from the "Crates" object layer created in Tiled
    map.getObjectLayer("Crates").objects.forEach(crateObject => {
      const {
        x,
        y,
        width,
        height
      } = crateObject;

      // Tiled origin for coordinate system is (0, 1), but we want (0.5, 0.5)
      this.matter.add
        .image(x + width / 2, y - height / 2, "block")
        .setBody({
          shape: "rectangle",
          density: 0.001
        });
    });

    // Create platforms at the point locations in the "Platform Locations" layer created in Tiled
    map.getObjectLayer("Platform Locations").objects.forEach(point => {
      createRotatingPlatform(this, point.x, point.y);
    });

    // Create a sensor at rectangle object created in Tiled (under the "Sensors" layer)
    const rect = map.findObject("Sensors", obj => obj.name === "Celebration");
    const finishLine = this.matter.add.rectangle(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      rect.width,
      rect.height, {
        isSensor: true, // It shouldn't physically interact with other bodies
        isStatic: true // It shouldn't move
      }
    );

    /* =============the event handling zone============= */

    this.players.forEach(player => {
      this.unsubscribePlayerCollide = this.matterCollision.addOnCollideStart({
        objectA: player.sprite,
        callback: this.onPlayerCollide,
        context: this
      });
    });

    // wen the player finishes
    this.players.forEach(player => {
      this.matterCollision.addOnCollideStart({
        objectA: player.sprite,
        objectB: finishLine,
        callback: () => {
          this.onPlayerWin(player)
        },
        context: this
      });
    });

    // has to be a declaration coz i want it in here
    this.unsubscribeFinishLine = (player) => {
      this.matterCollision.removeOnCollideStart({
        objectA: player.sprite,
        objectB: finishLine
      });
    }
  }

  onPlayerCollide({
    gameObjectB
  }) {
    if (!gameObjectB || !(gameObjectB instanceof Phaser.Tilemaps.Tile)) return;

    const tile = gameObjectB;

    // Check the tile property set in Tiled (you could also just check the index if you aren't using
    // Tiled in your game)
    this.players.forEach(player => {
      if (tile.properties.isLethal) {
        // Unsubscribe from collision events so that this logic is run only once
        this.unsubscribePlayerCollide();

        player.freeze();
        this.scene.restart()
        // const cam = this.cameras.main;
        // cam.fade(250, 0, 0, 0);
        // cam.once("camerafadeoutcomplete", () => this.scene.restart());
      }
    });
  }

  onPlayerWin(player) {
    this.leaderBoard.push(player.id);
    player.hasFinished = true;
    console.log(this.leaderBoard);
    this.unsubscribeFinishLine(player);
  }
}