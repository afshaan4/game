import Player from "./player.js";

export default class Slime extends Player {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.extending = false;
        this.length = 1;

        this.sprite = scene.physics.add
            .sprite(x, y, 'player', 0)
            .setDrag(1000, 0)
            .setMaxVelocity(300, 400);

        this.sprite.originY = 0;

        // events
        // this.keys.x.on('down', this.attack);
        this.keys.z.on('down', () => this.extending = true);
        this.keys.z.on('up', () => this.extending = false);
    }

    update(delta) {
        super.update(delta, this.sprite);

        // l e n g t h e n | squish
        if (this.extending) {
            if (this.length < 5) {
                this.length += 0.5;
            } else this.extending = false;
        } else if (this.length >= 1.3) {
            this.length -= 0.3;
            this.sprite.setVelocityY(-10000);                
        }

        // // make the jump feel nice: fall faster than you rise
        // // TODO: somehow this broke
        // if (this.sprite.body.velocity.y > 0) {
        //     this.sprite.body.velocity.y *= this.gravity * this.fallMult * delta;
        //     // handle variable jump height by increasing gravity
        //     // if the jump button is released while climbing.
        // } else if (this.sprite.body.velocity.y < 0 && !this.keys.up.isDown) {
        //     this.sprite.body.velocity.y *= -this.lowJumpMult * delta;
        // }

        // launch the thing upwards when its done extending
        // if (!this.extending && this.sprite.body.blocked.down) {
        // }

        this.sprite.setScale(1, this.length);
    }

    destroy() {
        this.sprite.destroy();
    }
}