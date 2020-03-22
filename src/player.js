/*
  instantiate, update, then destroy when done with it
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
        const keys = this.keys;
        const sprite = this.sprite;
        const onGround = sprite.body.blocked.down;
        const acceleration = onGround ? 600 : 200;
        const gravity = this.scene.physics.config.gravity.y;
        const fallMult = 0.05;
        const lowJumpMult = 0.5;

        // Apply horizontal acceleration when left/a or right/d are applied
        if (keys.left.isDown || keys.a.isDown) {
            sprite.setAccelerationX(-acceleration);
            // No need to have a separate set of graphics for running to the left & to the right. Instead
            // we can just mirror the sprite.
            sprite.setFlipX(true);
        } else if (keys.right.isDown || keys.d.isDown) {
            sprite.setAccelerationX(acceleration);
            sprite.setFlipX(false);
        } else {
            sprite.setAccelerationX(0);
        }

        // Only allow the player to jump if they are on the ground
        if (onGround && (keys.up.isDown || keys.w.isDown)) {
            sprite.setVelocityY(-500);
        }

        // make the jump feel nice fall faster than you rise
        if (sprite.body.velocity.y > 0) {
            sprite.body.velocity.y *= gravity * fallMult * delta;
            // handle variable jump height by increasing gravity
            // if the jump button is released while climbing.
        } else if (sprite.body.velocity.y < 0 && !keys.up.isDown) {
            sprite.body.velocity.y += lowJumpMult *  delta;
        }
    }

    destroy() {
        this.sprite.destroy();
    }
}