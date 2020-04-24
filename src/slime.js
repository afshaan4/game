import Player from "./player.js";

export default class Slime extends Player {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;
        this.length = 1;
        this.extending = false;
        this.canLaunch = false;
        this.extbit = undefined;

        this.sprite = this.scene.physics.add
            .sprite(x, y, 'player', 0)
            .setDrag(1000, 0)
            .setMaxVelocity(300, 400);

        this.sprite.originY = 0;

        /* event handlers */
        this.keys.z.on('down', () => {
            this.canLaunch = this.onGround ? true : false;
            this.extending = true;
            // this.sprite.originY = 0;
        });
        this.keys.z.on('up', () => {
            this.extending = false;
            this.spawnExtension();
            this.length = 1;
            // this.sprite.originY = 1;
        });
    }

    //Private methods
    ////////////////////////////////////////////////////////////////////////////

    // spawn in the extension bit to jump off
    spawnExtension() {
        // TODO: rewrite so this pushes up the other sprite.
        if (this.extbit === undefined) {
            this.extbit = this.scene.physics.add
                .sprite(this.sprite.x, this.sprite.y + this.length * 2, 'player', 0)
                .setScale(1, this.length - 1)
                .body.allowGravity = false;
        }
    }

    destroyExtension() {
        // fade out
        this.extbit.destroy();
    }

    // Public methods
    ////////////////////////////////////////////////////////////////////////////
    update(delta) {
        super.update(delta, this.sprite);

        // <<l e n g t h e n>>
        if (this.extending) {
            // stupid if in if, otherwise it has a seizure
            if (this.length < 5) {
                this.length += 0.5;
                this.sprite.setScale(1, this.length);
            }
            // >>squish<<
        } else {
            this.sprite.setScale(1);
            // if (this.canLaunch) this.sprite.setVelocityY(-100000);
        }
    }

    destroy() {
        this.sprite.destroy();
    }
}