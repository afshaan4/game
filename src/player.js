// generic player logic
// original author: https://github.com/mikewesthad/phaser-3-tilemap-blog-posts
// modified by: skittlemittle

import * as Phaser from "phaser";

// for animations and the like
export const possibleActions = {
  idle: 0,
  running: 1,
  jumping: 2,
  sliding: 3,
  falling: 4,
  specialMove: 5
};
Object.freeze(possibleActions);

export class Player {
  constructor(scene, x, y, id, spritesheet) {
    this.scene = scene;
    this.id = id;
    this.sprite = this.createPlayerCharachter(x, y, spritesheet);

    // player state, stuff for other classes
    this.state = {
      action: possibleActions.idle,
      destroyed: false,
      facing: 'R',
      checkpoint: {
        x,
        y
      },
    }

    // Track which sensors are touching something
    this.isTouching = {
      left: false,
      right: false,
      ground: false,
      wall: false
    };

    // Jumping is going to have a cooldown
    this.canJump = true;
    this.jumpCooldownTimer = null;
    // give the player a little bonk on the head when they start sliding
    this.boostSlide = true;
    this.canWallJump = true;

    // Before matter's update, reset our record of which surfaces the player is touching.
    scene.matter.world.on("beforeupdate", this.resetTouching, this);

    scene.matterCollision.addOnCollideStart({
      objectA: [this.sensors.bottom, this.sensors.left, this.sensors.right],
      callback: this.onSensorCollide,
      context: this
    });
    scene.matterCollision.addOnCollideActive({
      objectA: [this.sensors.bottom, this.sensors.left, this.sensors.right],
      callback: this.onSensorCollide,
      context: this
    });

    // le inputs
    const {
      I,
      J,
      K,
      L,
      W,
      A,
      S,
      D,
      N,
      M,
      C,
      X
    } = Phaser.Input.Keyboard.KeyCodes;
    this.keys = scene.input.keyboard.addKeys(
      // TODO: janky ass input selector
      this.id === 1 ? {
        left: J,
        right: L,
        up: I,
        down: K,
        ability_1: N,
        ability_2: M
      } : {
        left: A,
        right: D,
        up: W,
        down: S,
        ability_1: C,
        ability_2: X
      }
    );
  }

  // generate characters physics body from a spritesheet
  createPlayerCharachter(x, y, spritesheet) {
    let sprite = this.scene.matter.add.sprite(0, 0, spritesheet, 0);

    // add collision sensors to the sprite
    const {
      Body,
      Bodies
    } = Phaser.Physics.Matter.Matter; // Native Matter modules
    const {
      width: w,
      height: h
    } = sprite;
    const mainBody = Bodies.rectangle(0, 0, w * 0.6, h, {
      chamfer: {
        radius: 10
      }
    });
    this.sensors = {
      bottom: Bodies.rectangle(0, h * 0.5, w * 0.25, 2, {
        isSensor: true
      }),
      left: Bodies.rectangle(-w * 0.35, 0, 2, h * 0.5, {
        isSensor: true
      }),
      right: Bodies.rectangle(w * 0.35, 0, 2, h * 0.5, {
        isSensor: true
      })
    };
    const compoundBody = Body.create({
      parts: [mainBody, this.sensors.bottom, this.sensors.left, this.sensors.right],
      frictionStatic: 0,
      frictionAir: 0.02,
      friction: 0.1
    });
    sprite
      .setExistingBody(compoundBody)
      .setScale(2)
      .setFixedRotation() // Sets inertia to infinity so the player can't rotate
      .setPosition(x, y);

    // HAHAHAHHHAHAJDUASJADOIAHDCOIANSOFUHAOISKFHUOIASCHSAO
    // the origin has to be reset after making a composite body
    sprite.originX = 0.5;
    sprite.originY = 0.5;

    return sprite;
  }

  onSensorCollide({
    bodyA,
    bodyB,
    pair
  }) {
    /*
      Watch for the player colliding with walls/objects on either side and the ground below, so
      that we can use that logic inside of update to move the player.
      Note: we are using the "pair.separation" here. That number tells us how much bodyA and bodyB
      overlap. We want to teleport the sprite away from walls just enough so that the player won't
      be able to press up against the wall and use friction to hang in midair. This formula leaves
      0.5px of overlap with the sensor so that the sensor will stay colliding on the next tick if
      the player doesn't move.
    */
    if (bodyB.isSensor) return; // We only care about collisions with physical objects
    if (bodyA === this.sensors.left) {
      this.isTouching.left = true;
      // is it a wall
      if (bodyB.gameObject instanceof Phaser.Physics.Matter.TileBody) {
        this.isTouching.wall = true;
      }
      if (pair.separation > 0.5) this.sprite.x += pair.separation - 0.5;
    } else if (bodyA === this.sensors.right) {
      this.isTouching.right = true;
      // is it a wall
      if (bodyB.gameObject instanceof Phaser.Physics.Matter.TileBody) {
        this.isTouching.wall = true;
      }
      if (pair.separation > 0.5) this.sprite.x -= pair.separation - 0.5;
    } else if (bodyA === this.sensors.bottom) {
      this.isTouching.ground = true;
    }
  }

  resetTouching() {
    this.isTouching.left = false;
    this.isTouching.right = false;
    this.isTouching.ground = false;
    this.isTouching.wall = false;
  }

  /* ------ Public methods ------ */
  freeze() {
    this.sprite.setStatic(true);
  }

  jumpToCheckPoint() {
    this.sprite.x = this.state.checkpoint.x;
    this.sprite.y = this.state.checkpoint.y;
  }

  update() {
    if (this.state.destroyed) return;

    const sprite = this.sprite;
    const velocity = sprite.body.velocity;
    const isRightKeyDown = this.keys.right.isDown;
    const isLeftKeyDown = this.keys.left.isDown;
    const isJumpKeyDown = this.keys.up.isDown;
    const isSlideKeyDown = this.keys.down.isDown;
    const isOnGround = this.isTouching.ground;
    const isInAir = !isOnGround;
    if (isOnGround) this.canWallJump = true;

    // --- Move the player horizontally ---

    // Adjust the movement so that the player is slower in the air
    const moveForce = isOnGround ? 0.01 : 0.005;

    if (isLeftKeyDown) {
      sprite.setFlipX(true);
      this.state.facing = 'L';
      // Don't let the player push things left if they in the air
      if (!(isInAir && this.isTouching.left)) {
        sprite.applyForce({
          x: -moveForce,
          y: 0
        });
        this.state.action = possibleActions.running;
      }
    } else if (isRightKeyDown) {
      sprite.setFlipX(false);
      this.state.facing = 'R';
      // Don't let the player push things right if they in the air
      if (!(isInAir && this.isTouching.right)) {
        sprite.applyForce({
          x: moveForce,
          y: 0
        });
        this.state.action = possibleActions.running;
      }
    }

    // Limit horizontal and vertical speed, no fun allowed
    if (velocity.x > 10) sprite.setVelocityX(10);
    else if (velocity.x < -10) sprite.setVelocityX(-10);

    if (velocity.y > 20) sprite.setVelocityY(20);
    else if (velocity.y < -20) sprite.setVelocityY(-20);

    // --- Move the player vertically ---

    if (isJumpKeyDown && this.canJump && isOnGround) {
      sprite.setVelocityY(-11);
      // Add a slight delay between jumps since the bottom sensor will
      // still collide for a few frames after a jump is initiated
      this.canJump = false;
      this.jumpCooldownTimer = this.scene.time.addEvent({
        delay: 250,
        callback: () => (this.canJump = true)
      });
      this.state.action = possibleActions.jumping;
    }
    // le walljump? jesus FUCK
    if (isInAir && this.canWallJump && isJumpKeyDown && this.isTouching.wall) {
      sprite.setVelocityY(-11);
      this.canWallJump = false;
      this.state.action = possibleActions.jumping;
    }

    // --- Super mario world style crouch slide thing ---
    if (isSlideKeyDown) {
      if (this.boostSlide) sprite.setVelocityY(11);
      sprite.body.friction = 0.01;
      this.boostSlide = false;
      this.state.action = possibleActions.sliding;
    } else {
      sprite.body.friction = 0.1;
      this.boostSlide = true;
    }

    // -- idle states --
    if (this.sprite.body.force.x === 0) {
      if (isOnGround) {
        this.state.action = possibleActions.idle;
      } else if (this.sprite.body.velocity.y >= 0) {
        this.state.action = possibleActions.falling;
      } else {
        this.state.action = possibleActions.jumping;
      }
    }
  }

  destroy() {
    // Clean up any listeners that might trigger events after the player is officially destroyed
    if (this.scene.matter.world) {
      this.scene.matter.world.off("beforeupdate", this.resetTouching, this);
    }
    const sensors = [this.sensors.bottom, this.sensors.left, this.sensors.right];
    this.scene.matterCollision.removeOnCollideStart({
      objectA: sensors
    });
    this.scene.matterCollision.removeOnCollideActive({
      objectA: sensors
    });
    if (this.jumpCooldownTimer) this.jumpCooldownTimer.destroy();

    this.state.destroyed = true;
  }

  shutdown() {
    // You should free-up any resources that may be in use by your Scene in this
    // event handler, on the understanding that the Scene may, at any time,
    // become active again. A shutdown Scene is not 'destroyed', it's simply not
    // currently active.
    this.state.destroyed = true; // rename var?
  }
}