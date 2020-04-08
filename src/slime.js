import Player from "./player.js";

export default class Slime extends Player {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.sprite = scene.physics.add
            .sprite(x, y, 'player', 0)
            .setDrag(1000, 0)
            .setMaxVelocity(300, 400);

        // events
        this.keys.x.on('down', this.attack);
    }

    update(delta) {
        super.update(delta, this.sprite);
    }

    destroy() {
        this.sprite.destroy();
    }

    attack() {
        console.log("meme sauce");
    }
}