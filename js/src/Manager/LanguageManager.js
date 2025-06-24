import moduleDefaults from "../Defaults/ModuleDefault";

export default class LanguageManager {
  constructor() {}

  async setTranslationSet(languageId) {
    let translationSet = await fetch(`${moduleDefaults.localesFolder}/${languageId}.json`);
    if (translationSet.ok) {
      window.transladeConfig.translationSet = await translationSet.json();
    } else {
      let translationSet = await fetch(`${moduleDefaults.localesFolder}/en.json`);
      window.transladeConfig.translationSet = await translationSet.json();
    }
  }

  getTranslationSet() {
    return window.transladeConfig.translationSet;
  }
}
