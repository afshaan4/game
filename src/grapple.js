// handles the animations and "abilities" of g.r.a.p.p.l.e

// import * as Phaser from "phaser";
import Player from "./player.js"

export default class Grapple extends Player {
  constructor(scene, x, y, id = 0, spritesheet = "player") {
    super(scene, x, y, id, spritesheet);
    this.scene = scene;
    this.id = id;
    this.spritesheet = spritesheet; //maybe remove

    this.anchor = -1;
    this.grappleLine;
    this.noChLoop = false;

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
      this.launchGrapple();
    });
    this.keys.z.on('up', () => {
      this.releaseGrapple();
    });

    this.scene.events.on("update", this.chUpdate, this);
    this.scene.events.once("destroy", this.chDestroy, this);
    this.scene.events.once("shutdown", this.chShutdown, this);
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

    if (this.state.facing === 'L') {
      this.anchor = this.scene.matter.add.rectangle(x - 350, y - 75, 1, 1, {
        isStatic: true
      });
    } else {
      this.anchor = this.scene.matter.add.rectangle(x + 350, y - 75, 1, 1, {
        isStatic: true
      });
    }
    // TODO: tweak spring strength
    this.grappleLine = this.scene.matter.add.constraint(this.sprite, this.anchor, 0, 0.007);
  }

  /* destroys the constraint and anchor made my launchGrapple() */
  releaseGrapple() {
    if (this.anchor !== -1) {
      this.scene.matter.world.remove(this.anchor);
      this.scene.matter.world.removeConstraint(this.grappleLine);
    }
  }

  /* ------ Public methods ------ */
  chUpdate() {
    if (this.noChLoop) return;
    super.update();

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

  // doesnt get called on scene restart
  chDestroy() {
    super.destroy();
    this.noChLoop = true;
    this.sprite.destroy();
    this.scene.events.off("update", this.chUpdate, this);
    this.scene.events.off("destroy", this.chDestroy, this);
  }

  // this is being called twice(once per char), fix
  chShutdown() {
    super.shutdown();
    this.noChLoop = true;
    this.scene.events.off("shutdown", this.chShutdown, this);
  }
}