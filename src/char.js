import * as Phaser from "phaser";
import Player from "./player.js"

export default class Char extends Player {
  constructor(scene, x, y, id = 0) {
    super(scene, x, y, id);
    this.scene = scene;
    this.id = id;
    
    // events
    this.keys.z.on('down', () => {
      // console.log("AE");
    });
    this.keys.z.on('up', () => {
      //
    });
  }
}