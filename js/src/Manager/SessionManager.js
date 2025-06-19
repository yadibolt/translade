import ExceptionManager from "./ExceptionManager";
import moduleDefaults from "../Defaults/ModuleDefault";
import sessionDefault from "../Defaults/SessionDefault";

export default class SessionManager {
  sessionIdentifier = null;

  constructor() {
    this.sessionIdentifier = moduleDefaults.sessionName;
  }

  initSession() {
    const session = window.sessionStorage.getItem(this.sessionIdentifier);
    if (!session) {
      window.sessionStorage.setItem(this.sessionIdentifier, JSON.stringify(this._getSessionSettingsDefault()));
      return window.sessionStorage.getItem(this.sessionIdentifier);
    }

    return session;
  }

  getSession() {
    const session = window.sessionStorage.getItem(this.sessionIdentifier);
    if (!session) {
      return this.initSession();
    }

    try {
      return JSON.parse(session);
    } catch (e) {
      return new ExceptionManager().throwException("Tried to parse invalid JSON.", e, null)
    }
  }

  updateData(data) {
    if (!this.getSession()) return new ExceptionManager().throwException("Session does not exits", null, null);

    if (typeof data !== 'object') return new ExceptionManager().throwException("Passed data must be an object.", null, null)

    try {
      let sessionData = this.getSession();
      let parsedData = JSON.stringify({
        ...sessionData,
        ...data
      });
      window.sessionStorage.setItem(moduleDefaults.sessionName, parsedData);
    } catch (e) {
      return new ExceptionManager().throwException("Tried to update session with invalid data.", e, null);
    }
  }

  clearSession() {
    this.updateData({})
  }

  destroySession() {
    window.sessionStorage.removeItem(this.sessionIdentifier);
  }

  _getSessionSettingsDefault() {
    return sessionDefault;
  }
}
