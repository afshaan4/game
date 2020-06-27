import * as Phaser from "phaser";
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin/src";
import MainScene from "./scene.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: MainScene,
  pixelArt: true,
  physics: { default: "matter" },
  plugins: {
    scene: [
      {
        plugin: PhaserMatterCollisionPlugin,
        key: "matterCollision",
        mapping: "matterCollision" 
      }
    ]
  }
};

const game = new Phaser.Game(config);
