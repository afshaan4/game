// handles the animations and "abilities" of g.r.a.p.p.l.e
import * as Phaser from "phaser";
import Player from "./player.js"

export default class Grapple extends Player {
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

    // --- grappling hook controls ---
    this.keys.z.on('down', () => {
      // launch grapple (start grapple acceleration)
      console.log(this.state.facing);
      this.launchGrapple();
    });
    this.keys.z.on('up', () => {
      // release grapple (remove constraint)
      this.releaseGrapple();
    });

    this.scene.events.on("update", this.update, this);
    this.scene.events.once("shutdown", this.destroy, this);
    this.scene.events.once("destroy", this.destroy, this);
  }

  /* ------ Private methods ------ */

  /* 
   pull the player in the direction they are facing, grapple can hook onto
   thin air 
  */
  launchGrapple() {
    const {
      x,
      y
    } = this.sprite.body.position; // null after player dies, fix

    // create anchor body, maybe just hav this move the anchor so we have only
    // one anchor
    if (this.state.facing === 'L') {
      this.anchor = this.scene.matter.add.rectangle(x - 300, y, 10, 10, {
        isStatic: true
      });
    } else {
      this.anchor = this.scene.matter.add.rectangle(x + 300, y, 10, 10, {
        isStatic: true
      });
    }

    // create constraint
    this.scene.matter.add.constraint(this.sprite, this.anchor, 10, 0.1, {
      label: "grappleLine"
    });
  }

  /* destroys the constraint and anchor made my launchGrapple() */
  releaseGrapple() {
    // E
    this.anchor.destroy();
  }

  /* ------ Public methods ------ */
  update() {
    super.update();
    if (this.state.destroyed) return;

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