// handles the animations and "abilities" of g-swap

import {
  Player,
  possibleActions
} from "./player.js";
// import * as Phaser from "phaser";

export default class Gswap extends Player {
  constructor(scene, x, y, id, spritesheet = "player") {
    super(scene, x, y, id, spritesheet);
    this.scene = scene;
    this.id = id;
    this.noChLoop = false;
    this.boostFlip = true;
    this.attractor = -1;

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
      this.swapGravity();
      if (this.boostFlip) this.sprite.setVelocityY(-11);
      this.boostFlip = false;
    });
    this.keys.ability_1.on('up', () => {
      this.resetGravity();
      this.boostFlip = true;
    });

    this.scene.events.on("update", this.chUpdate, this);
    this.scene.events.once("destroy", this.chDestroy, this);
    this.scene.events.once("shutdown", this.chShutdown, this);
  }

  /* ------ Private methods ------ */
  swapGravity() {
    this.sprite.setIgnoreGravity(true);
    const x = this.sprite.body.position.x;
    this.sprite.setFlipY(true);
    // circle that pulls the player
    if (this.attractor !== null) {
      this.attractor = this.scene.matter.add.circle(x, 0, 1, {
        ignoreGravity: true,
        plugin: {
          attractors: [
            (bodyA, bodyB) => {
              if (bodyB === this.sprite.body) {
                return {
                  x: 0,
                  y: (bodyA.position.y - bodyB.position.y) * 500
                };
              }
            }
          ]
        }
      });
    } else {
      // keep it directly above the player
      this.attractor.body.position.x = x;
    }
  }

  resetGravity() {
    this.sprite.setIgnoreGravity(false);
    this.sprite.setFlipY(false);

    if (this.attractor !== -1) {
      this.scene.matter.world.remove(this.attractor);
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