// entry point
import * as Phaser from "phaser";
import TestScene from "./scene.js";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: TestScene,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 1000
            }
        }
    }
};

// fatt oof
const game = new Phaser.Game(config);
