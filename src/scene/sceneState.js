// le epic "abstract" state class

export default class SceneState {
  constructor(scene) {
    if (this.constructor === SceneState) {
      throw new Error("State is an abstract class, dont instantiate it");
    }
    this.scene = scene
  }

  start() {
    return null;
  }

  onPlayerCollide() {
    return null;
  }

  onPlayerWin() {
    return null;
  }

  showLeaderBoard() {
    return null;
  }

  updateCheckpoint() {
    return null;
  }
}