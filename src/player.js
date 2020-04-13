/*
  generic player
*/

export default class Player {
    constructor(scene, fMult = 0.04, ljMult = 0.5) {
        this.scene = scene;
        this.gravity = this.scene.physics.config.gravity.y;
        this.fallMult = fMult;
        this.lowJumpMult = ljMult;

        // le inputs
        const {
            LEFT,
            RIGHT,
            UP,
            Z,
            X
        } = Phaser.Input.Keyboard.KeyCodes;
        this.keys = scene.input.keyboard.addKeys({
            left: LEFT,
            right: RIGHT,
            up: UP,
            z: Z,
            x: X
        });
    }

    update(delta, sprite) {
        const onGround = sprite.body.blocked.down;
        const acceleration = onGround ? 600 : 200; //TODO: are those MAGICC NUMBERS?

        // sometimes the thing just runs off
        sprite.setAccelerationX(0);

        // Apply horizontal acceleration when left/a or right/d are applied
        if (this.keys.left.isDown) {
            sprite.setAccelerationX(-acceleration);
            // No need to have a separate set of graphics for running to the
            // left & to the right. Instead we can just mirror the sprite.
            sprite.setFlipX(true);
        } else if (this.keys.right.isDown) {
            sprite.setAccelerationX(acceleration);
            sprite.setFlipX(false);
        }
        // no do the run
        if (this.keys.left.isUp && this.keys.right.isUp) {
            sprite.setAccelerationX(0);
        }

        // jump stuff
        if (onGround && (this.keys.up.isDown)) {
            sprite.setVelocityY(-500);
        }

        // make the jump feel nice: fall faster than you rise
        if (sprite.body.velocity.y > 0) {
            sprite.body.velocity.y *= this.gravity * this.fallMult * delta;
            // handle variable jump height by increasing gravity
            // if the jump button is released while climbing.
        } else if (sprite.body.velocity.y < 0 && !this.keys.up.isDown) {
            sprite.body.velocity.y *= -this.lowJumpMult * delta;
        }
    }
}
