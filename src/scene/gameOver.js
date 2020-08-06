// game over state

import SceneState from "./sceneState.js"

export default class GameOver extends SceneState {
  constructor(scene) {
    super(scene)
  }
  
  start() {
    this.showLeaderBoard();
  }

  showLeaderBoard() {
    let msgStr = "";
    const {
      width
    } = this.scene.sys.game.canvas;

    for (const entry of this.scene.leaderBoard) {
      msgStr += "Player " + entry.id + "\n";
    }
    let leaderBoardMsg = this.scene.add.text(width / 4 - 90, 50,
      msgStr, {
        fontSize: "45px",
        padding: {
          x: 10,
          y: 5
        },
        backgroundColor: "#ffffff",
        fill: "#000000"
      });
    leaderBoardMsg.setScrollFactor(0).setDepth(1000);
  }
}