import Player from "./player.js";

export default class Slime extends Player {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.extending = false;
        this.length = 1;
        this.canLaunch = false;

        this.sprite = scene.physics.add
            .sprite(x, y, 'player', 0)
            .setDrag(1000, 0)
            .setMaxVelocity(300, 400);

        this.sprite.originY = 1;

        // events
        // this.keys.x.on('down', this.attack);
        this.keys.z.on('down', () => {
            this.canLaunch = this.onGround ? true : false;
            this.extending = true;
            this.sprite.originY = 0;
            console.log("yeet");
        });
        this.keys.z.on('up', () => {
            this.extending = false;
            this.sprite.originY = 1;
        });
    }

    update(delta) {
        super.update(delta, this.sprite);

        // <<l e n g t h e n>>
        if (this.extending) {
            if (this.length < 5) {
                this.length += 0.5;
                this.sprite.setScale(1, this.length);
            } else this.extending = false;
            // >>squish and jump<<
        } else if (this.length >= 1.3) {
            this.length -= 0.3;
            this.sprite.setScale(1, this.length);
            if (this.canLaunch) this.sprite.setVelocityY(-100000);
        }
    }

    destroy() {
        this.sprite.destroy();
    }
}