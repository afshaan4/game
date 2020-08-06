import * as Phaser from "phaser";
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin/src";
import MainScene from "./scene/scene.js";

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 500,
  scene: MainScene,
  pixelArt: true,
  physics: {
    default: "matter"
  },
  plugins: {
    scene: [{
      plugin: PhaserMatterCollisionPlugin,
      key: "matterCollision",
      mapping: "matterCollision"
    }]
  }
};

window.onload = () => {
  new Phaser.Game(config);
};