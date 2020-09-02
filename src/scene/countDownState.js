// race start countdown

import SceneState from "./sceneState.js"
import RacingState from "./racingState.js"

export default class CountDownState extends SceneState {
  constructor(scene) {
    super(scene)
  }

  start() {
    console.log("3 \n 2 \n 1"); // LOL

    this.scene.setState(new RacingState(this.scene));
  }
}