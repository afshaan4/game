// original author: https://github.com/mikewesthad/phaser-3-tilemap-blog-posts
// modified by: skittlemittle

import * as Phaser from "phaser";
import Char from "../characters/char.js";
import Grapple from "../characters/grapple.js";
import createRotatingPlatform from "../map_modules/create-rotating-platform.js";
import CountDown from "./countDown.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super();
    this.state = null;
  }

  // the derived state classes are responsible changing the state
  setState(nextState) {
    this.state = nextState;
    this.state.start();
  }

  preload() {
    this.load.tilemapTiledJSON("map", "../assets/tilemaps/lvl.json");
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
    this.checkpoints = [];
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
    this.players.push(new Grapple(this, x, y, 1));

    // make a camera for each player, yuck make better
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

    map.getObjectLayer("Platform Locations").objects.forEach(point => {
      createRotatingPlatform(this, point.x, point.y);
    });

    const finishRect = map.findObject("Sensors", obj => obj.name === "Celebration");
    const finishLine = this.matter.add.rectangle(
      finishRect.x + finishRect.width / 2,
      finishRect.y + finishRect.height / 2,
      finishRect.width,
      finishRect.height, {
        isSensor: true,
        isStatic: true
      }
    );

    map.getObjectLayer("checkpoints").objects.forEach(checkpoint => {
      const {
        x,
        y,
        width,
        height
      } = checkpoint;
      const cp = this.matter.add.rectangle(
        x + width / 2, y + height / 2, width, height, {
          isSensor: true,
          isStatic: true
        }
      );
      this.checkpoints.push(cp);
    });

    /* =============Start up the game=============*/

    this.setState(new CountDown(this));
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
      // crossing the finish line
      this.matterCollision.addOnCollideStart({
        objectA: player.sprite,
        objectB: finishLine,
        callback: () => {
          this.state.onPlayerWin(player)
        },
        context: this
      });
      // checkpoints
      this.matterCollision.addOnCollideStart({
        objectA: player.sprite,
        objectB: this.checkpoints,
        callback: () => {
          this.state.updateCheckpoint(player)
        },
        context: this
      });
    });

    // called per player bruv
    this.unsubscribeFinishLine = (player) => {
      this.matterCollision.removeOnCollideStart({
        objectA: player.sprite,
        objectB: finishLine
      });
    }
  }
}