// template for charachters

import {
  Player,
  possibleActions
} from "./player.js";
// import * as Phaser from "phaser";

export default class Char extends Player {
  constructor(scene, x, y, id, spritesheet = "player") {
    super(scene, x, y, id, spritesheet);
    this.scene = scene;
    this.id = id;
    this.noChLoop = false;

    // animations hahahahjasfnkacoaeifcsnkfhlaichlfh
    this.scene.anims.create({
      key: "player-idle",
      frames: this.scene.anims.generateFrameNumbers(spritesheet, {
        start: 0,
        end: 3
      }),
      frameRate: 3,
      repeat: -1
    });
    this.scene.anims.create({
      key: "player-run",
      frames: this.scene.anims.generateFrameNumbers(spritesheet, {
        start: 8,
        end: 15
      }),
      frameRate: 12,
      repeat: -1
    });

    /* ability key event handlers */
    this.keys.ability_1.on('down', () => {
      // console.log("AE");
    });
    this.keys.ability_1.on('up', () => {
      //
    });

    this.scene.events.on("update", this.chUpdate, this);
    this.scene.events.once("destroy", this.chDestroy, this);
    this.scene.events.once("shutdown", this.chShutdown, this);
  }

  /* ------ Private methods ------ */

  /* ------ Public methods ------ */
  chUpdate() {
    if (this.noChLoop) return;
    super.update();

    const isOnGround = this.isTouching.ground;

    // change animations
     if (this.state.action === possibleActions.idle) {
      this.sprite.anims.play("player-idle", true);
    } else if (this.state.action == possibleActions.running && isOnGround) {
      this.sprite.anims.play("player-run", true);
    } else {
      this.sprite.anims.stop();
      this.sprite.setTexture("player", 10);
    }
  }

  chDestroy() {
    super.destroy();
    this.noChLoop = true;
    this.sprite.destroy();
    this.scene.events.off("update", this.chUpdate, this);
    this.scene.events.off("destroy", this.chDestroy, this);
  }

  chShutdown() {
    super.shutdown();
    this.noChLoop = true;
    this.scene.events.off("shutdown", this.chShutdown, this);
  }
}