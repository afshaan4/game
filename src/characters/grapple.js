// handles the animations and "abilities" of grappling hook charachter

import * as Phaser from "phaser";
import {
  Player,
  possibleActions
} from "../player.js";

export default class Grapple extends Player {
  constructor(scene, x, y, id, spritesheet = "player") {
    super(scene, x, y, id, spritesheet);
    this.scene = scene;
    this.id = id;
    this.anchor = -1;
    this.grappleLine;
    this.noChLoop = false;
    // grapple cooldown
    this.canGrapple = true;
    this.grappleCooldownTimer = null;

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
      this.launchGrapple();
    });
    this.keys.ability_1.on('up', () => {
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
    if (!this.canGrapple) return;

    const {
      x,
      y
    } = this.sprite.body.position; // undefined after scene restart, fix
    let canHang = false; // reset each launch

    if (this.state.facing === 'L') {
      this.anchor = this.scene.matter.add.rectangle(x - 350, y - 75, 1, 1, {
        isStatic: true,
        isSensor: true
      });
    } else {
      this.anchor = this.scene.matter.add.rectangle(x + 350, y - 75, 1, 1, {
        isStatic: true,
        isSensor: true
      });
    }
    this.grappleLine = this.scene.matter.add.constraint(this.sprite, this.anchor, 0, 0.007);

    // grapple cooldown
    this.canGrapple = false;
    this.grappleCooldownTimer = this.scene.time.addEvent({
      delay: 4000, // TODO: tweak
      callback: () => (this.canGrapple = true)
    });

    /*
    if the grappling hook hooks onto a map block (walls, roof) then the player
    stays attached to it till the ability key is released: spoderman, but if
    it hooks onto thin air then the anchor point is destoryed upon contacting
    the player, so they keep on flying smoothly. 
    */
    const stickSurface = this.scene.matter.intersectBody(this.anchor);
    stickSurface.forEach(e => {
      if (e.gameObject instanceof Phaser.Physics.Matter.TileBody) {
        canHang = true;
      }
    });

    if (!canHang) {
      this.scene.matterCollision.addOnCollideStart({
        objectA: this.anchor,
        objectB: this.sprite,
        callback: this.releaseGrapple,
        context: this
      });
    }
    this.state.action = possibleActions.specialMove;
  }

  /* destroys the constraint and anchor made by launchGrapple() */
  releaseGrapple() {
    if (this.anchor !== -1) {
      this.scene.matter.world.remove(this.anchor);
      this.scene.matter.world.removeConstraint(this.grappleLine);
      this.scene.matterCollision.removeOnCollideStart({
        objectA: this.anchor,
        objectB: this.sprite
      });
    }
  }

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

  // doesnt get called on scene restart, bruh
  chDestroy() {
    super.destroy();
    this.noChLoop = true;
    this.scene.events.off("update", this.chUpdate, this);
    this.scene.events.off("destroy", this.chDestroy, this);
  }

  // this is being called twice(once per char), fix
  chShutdown() {
    super.shutdown();
    this.noChLoop = true;
    if (this.grappleCooldownTimer) this.grappleCooldownTimer.destroy();
    this.sprite.destroy();
    this.scene.events.off("update", this.chUpdate, this);
    this.scene.events.off("shutdown", this.chShutdown, this);
  }
}