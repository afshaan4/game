// handles the animations and "abilities" of <charactername>
import * as Phaser from "phaser";
import Player from "./player.js"

export default class Char extends Player {
  constructor(scene, x, y, id = 0, spritesheet = "player") {
    super(scene, x, y, id, spritesheet);
    this.scene = scene;
    this.id = id;
    this.spritesheet = spritesheet; //maybe remove

    // animations hahahahjasfnkacoaeifcsnkfhlaichlfh
    this.scene.anims.create({
      key: "player-idle",
      frames: this.scene.anims.generateFrameNumbers(this.spritesheet, {
        start: 0,
        end: 3
      }),
      frameRate: 3,
      repeat: -1
    });
    this.scene.anims.create({
      key: "player-run",
      frames: this.scene.anims.generateFrameNumbers(this.spritesheet, {
        start: 8,
        end: 15
      }),
      frameRate: 12,
      repeat: -1
    });

    /* ability key event handlers */
    
    this.keys.z.on('down', () => {
      // console.log("AE");
    });
    this.keys.z.on('up', () => {
      //
    });

    this.scene.events.on("update", this.update, this);
    this.scene.events.once("shutdown", this.destroy, this);
  }

  update() {
    super.update();
    if (this.destroyed) return;

    const isOnGround = this.isTouching.ground;

    // Update the animation/texture based on the state of the player's state
    if (isOnGround) {
      if (this.sprite.body.force.x !== 0) this.sprite.anims.play("player-run", true);
      else this.sprite.anims.play("player-idle", true);
    } else {
      this.sprite.anims.stop();
      this.sprite.setTexture("player", 10);
    }
  }

  destroy() {
    super.destroy();
    this.scene.events.off("update", this.update, this);
    this.scene.events.off("destroy", this.destroy, this);
    this.scene.events.off("shutdown", this.destroy, this);
    this.sprite.destroy();
    // this.destroyed = true; // this is the shared this.destroyed, so buckle up
  }
}