// statemachine "abstract" class
// TODO: just have this logic in the scene?
import * as Phaser from "phaser";

export default class StateMachine extends Phaser.Scene {
  constructor() {
    super();
    this.state = null;
  }

  // the state classes are responsible for state changes
  setState(nextState) {
    this.state = nextState;
    this.state.start();
  }
}

// 6 minutes in