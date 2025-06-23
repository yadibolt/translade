export default class InputManager {
  constructor() {}

  suspendUserInput() {
    if (!window.transladeInputControl) window.transladeInputControl = { suspend: false };
    window.transladeInputControl.suspend = true;
  }

  releaseUserInput() {
    if (!window.transladeInputControl) window.transladeInputControl = { suspend: false };
    window.transladeInputControl.suspend = false;
  }

  isUserInputSuspended() {
    if (!window.transladeInputControl) window.transladeInputControl = { suspend: true };
    return window.transladeInputControl.suspend;
  }
}
