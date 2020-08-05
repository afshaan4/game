// le epic abstract state class

export default class State {
  constructor(scene) {
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