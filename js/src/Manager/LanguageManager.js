export default class LanguageManager {
  constructor() {}

  async setTranslationSet(languageId) {
    let translationSet = await fetch(`/modules/translade/js/locales/${languageId}.json`);
    if (translationSet.ok) {
      window.transladeConfig.translationSet = await translationSet.json();
    } else {
      let translationSet = await fetch(`/modules/translade/js/locales/en.json`);
      window.transladeConfig.translationSet = await translationSet.json();
    }
  }

  getTranslationSet() {
    return window.transladeConfig.translationSet;
  }
}
