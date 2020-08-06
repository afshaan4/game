// main gameloop state

import {Tilemaps} from "phaser";
import SceneState from "./sceneState.js";
import GameOver from "./gameOver.js";

export default class Racing extends SceneState {
  constructor(scene) {
    super(scene)
  }

  // for player tile collisions
  onPlayerCollide(player, gameObjectB) {
    if (!gameObjectB || !(gameObjectB instanceof Tilemaps.Tile)) return;
    const tile = gameObjectB;

    // lethal things
    if (tile.properties.isLethal) {
      player.jumpToCheckPoint();
    }
    // boostpads
    if (tile.properties.boosts) {
      const boostVel = player.state.facing === 'R' ? 7 : -7;
      player.sprite.setVelocityX(player.sprite.body.velocity.x + boostVel);
    }
  }

  onPlayerWin(player) {
    this.scene.unsubscribeFinishLine(player);
    this.scene.leaderBoard.push(player);
    const ldrBoard = this.scene.leaderBoard.slice();
    // yuck
    let posSuffix = "th";
    if (ldrBoard.length === 1) posSuffix = "st"
    else if (ldrBoard.length === 2) posSuffix = "nd"
    else if (ldrBoard.length === 3) posSuffix = "rd"

    const winMsg = this.scene.add.text(16, 16,
      `${ldrBoard.length}${posSuffix}`, {
        fontSize: "30px",
        padding: {
          x: 10,
          y: 5
        },
        backgroundColor: "#ffffff",
        fill: "#000000"
      });
    winMsg.setScrollFactor(0).setDepth(1000);
    // LMAOOOOOOOOOO
    setTimeout(() => {
      winMsg.destroy();
    }, 3000);
    // genius, i know
    this.scene.cams.forEach((camera, index) => {
      if (index !== player.id) {
        camera.ignore(winMsg);
      }
    });

    // race over, show leaderboard
    if (ldrBoard.length === this.scene.players.length) {
      // this.showLeaderBoard();
      this.scene.setState(new GameOver(this.scene));
    }
  }

  updateCheckpoint(player) {
    player.state.checkpoint = {
      x: player.sprite.x,
      y: player.sprite.y
    }
  }
}