import Player from "./player.js";

export default class Slime extends Player {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.extending = false;
        this.length = 0;

        this.sprite = scene.physics.add
            .sprite(x, y, 'player', 0)
            .setDrag(1000, 0)
            .setMaxVelocity(300, 400);

        // events
        // this.keys.x.on('down', this.attack);
        this.keys.z.on('down', () => this.extending = true);
        this.keys.z.on('up', () => this.extending = false);
    }

    update(delta) {
        super.update(delta, this.sprite);

        // l e n g t h e n
        if (this.extending) {
            if (this.length < 5) {
                this.length += 0.3;
                this.sprite.setScale(1, this.length);
            }
        } else if(this.length > 1) {
            this.length -= 0.1;
            this.sprite.setScale(1, this.length);
        }
    }

    destroy() {
        this.sprite.destroy();
    }
}
