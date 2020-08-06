// race start countdown

import SceneState from "./sceneState.js"
import Racing from "./racing.js"

export default class CountDown extends SceneState {
  constructor(scene) {
    super(scene)
  }

  start() {
    console.log("3 \n 2 \n 1"); // LOL

    this.scene.setState(new Racing(this.scene));
  }
}