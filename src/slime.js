import Player from "./player.js";

export default class Slime extends Player {
    constructor(scene, x, y) {
        super(scene, x, y);
        
        this.scene = scene;

        this.sprite = scene.physics.add
            .sprite(x, y, 'player', 0)
            .setDrag(1000, 0)
            .setMaxVelocity(300, 400);

        const { Z, X } = Phaser.Input.Keyboard.KeyCodes;
        this.spKeys = scene.input.keyboard.addKeys({
            z: Z,
            x: X
        });
    }

    update(delta) {
        super.update(delta, this.sprite);

        // TODO: fix to only call once, pauses everything?
        this.spKeys.x.on('down', this.attack);
        // this.spKeys.z.on('down', this.ability);

    }

    attack() {
        console.log("meme sauce");
    }
}