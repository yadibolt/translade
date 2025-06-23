import moduleDefaults from "../Defaults/ModuleDefault";

export default class ExceptionManager {
  constructor() {}

  throwException(message, error = null, errorCode = null, silent = false) {
    if (!silent) {
      console.error(
        `${moduleDefaults.modulePrefix} ${message}\nErr: ${error}\nCode: ${
          errorCode ? errorCode : "N/A"
        }`,
      );
    }

    return false;
  }
}
