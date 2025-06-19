import moduleDefaults from "../Defaults/ModuleDefault";

export default class ExceptionManager {
    constructor() {
    }

    throwException(message, error = null, errorCode = null) {
      return new Error(`${moduleDefaults.modulePrefix} ${message}\nErr: ${error}\nCode: ${errorCode ? errorCode : 'N/A'}`);
    }
}
