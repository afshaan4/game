/*
  make, update, then destroy when done with it
*/

// player physics mainly
export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        this.sprite = scene.physics.add
            .sprite(x, y, "player", 0)
            .setDrag(1000, 0)
            .setMaxVelocity(300, 400);

        // le inputs
        const { LEFT, RIGHT, UP, W, A, D } = Phaser.Input.Keyboard.KeyCodes;
        this.keys = scene.input.keyboard.addKeys({
            left: LEFT,
            right: RIGHT,
            up: UP,
            w: W,
            a: A,
            d: D
        });
    }

    update(delta) {
        const onGround = this.sprite.body.blocked.down;
        const acceleration = onGround ? 600 : 200;
        const gravity = this.scene.physics.config.gravity.y;
        const fallMult = 0.05;
        const lowJumpMult = 0.5;

        // sometimes the thing just runs off
        this.sprite.setAccelerationX(0);

        // Apply horizontal acceleration when left/a or right/d are applied
        if (this.keys.left.isDown || this.keys.a.isDown) {
            this.sprite.setAccelerationX(-acceleration);
            // No need to have a separate set of graphics for running to the
            // left & to the right. Instead we can just mirror the sprite.
            this.sprite.setFlipX(true);
        } else if (this.keys.right.isDown || this.keys.d.isDown) {
            this.sprite.setAccelerationX(acceleration);
            this.sprite.setFlipX(false);
        }
        // no
        if (this.keys.left.isUp && this.keys.right.isUp) {
            this.sprite.setAccelerationX(0);
        }

        // jump stuff
        if (onGround && (this.keys.up.isDown || this.keys.w.isDown)) {
            this.sprite.setVelocityY(-500);
        }
        // make the jump feel nice: fall faster than you rise
        if (this.sprite.body.velocity.y > 0) {
            this.sprite.body.velocity.y *= gravity * fallMult * delta;
            // handle variable jump height by increasing gravity
            // if the jump button is released while climbing.
        } else if (this.sprite.body.velocity.y < 0 && !this.keys.up.isDown) {
            this.sprite.body.velocity.y += lowJumpMult * delta;
        }
    }

    destroy() {
        this.sprite.destroy();
    }
}