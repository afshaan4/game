// race start countdown

import State from "./State.js"
import Racing from "./racing.js"

export default class CountDown extends State {
  constructor(scene) {
    super(scene)
  }

  start() {
    console.log("3 \n 2 \n 1"); // LOL

    this.scene.setState(new Racing(this.scene));
  }
}