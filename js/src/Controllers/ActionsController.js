import moduleDefaults from "../Defaults/ModuleDefaults";

import SessionManager from "../Manager/SessionManager";
import DivTag from "../Elements/DivTag";
import ImageTag from "../Elements/ImageTag";
import SpanTag from "../Elements/SpanTag";
import ATag from "../Elements/ATag";
import OptionTag from "../Elements/OptionTag";
import SelectTag from "../Elements/SelectTag";
import LabelTag from "../Elements/LabelTag";
import LanguageManager from "../Manager/LanguageManager";

export default class ActionsController {
  /**
   *
   * @type {object|null}
   */
  tSet = null;
  constructor() {
    this.tSet = new LanguageManager().getTranslationSet();
  }

  createActionsForField(fieldId) {
    const themeClassName = window.transladeConfig.darkTheme ? "dark" : "light";
    let languageOptions = [];
    let contentAIActions = [];

    window.transladeConfig.languages.forEach((language, _) => {
      const values = language.split(":");
      // values[0] is the language ID, values[1] is the language name
      const isSelected =
        values[0] === new SessionManager().getSession().selectedLangId;

      // current language cannot be removed due to how translation works in Drupal.
      // clicking on "translate" in Drupal will take the original content and that is
      // set to be default for the field. that said, we must let users manually
      // change the language.
      // if (window.transladeConfig.contentLanguage === values[0]) return;

      languageOptions.push(
        new OptionTag({
          name: values[1],
          value: values[0],
          isSelected: isSelected,
        }).getDefault(),
      );
    });

    contentAIActions.push(
      new OptionTag({
        name: this.tSet.actionName,
        value: "default",
      }).getDefault(),
    );
    window.transladeConfig.contentAIActions.forEach((action, _) => {
      const values = action.split(":");

      let translatedValue = values[0];
      if (Object.keys(this.tSet).some((key) => key.toString() === values[0].toString())) {
        translatedValue = this.tSet[values[0]];
      }

      // values[0] is the action ID, values[1] is the action name
      contentAIActions.push(
        new OptionTag({
          name: translatedValue,
          value: values[0],
        }).getDefault(),
      );
    });

    const wrapper = new DivTag({
      classNames: ["translade-actions-wrapper", themeClassName],
    }).getDefault();
    const backIcon = new ImageTag({
      src: `${moduleDefaults.assetsFolder}/icons/back.svg`,
      alt: this.tSet.back,
    }).getDefault();
    const translateIcon = new ImageTag({
      src: `${moduleDefaults.assetsFolder}/icons/translate.svg`,
      alt: this.tSet.translate,
    }).getDefault();
    const languageSelect = new SelectTag({
      classNames: ["translade-languageTo"],
      name: "translade-languageTo",
      options: languageOptions,
    }).getDefault();
    const contentAIActionSelect = new SelectTag({
      classNames: ["translade-contentAIAction"],
      name: "translade-contentAIAction",
      options: contentAIActions,
    }).getDefault();
    const loaderIcon = new SpanTag({ classNames: ["loader"] }).getDefault();

    const languageSelectLabel = new LabelTag({
      content: this.tSet.languageTranslateTo,
      classNames: ["translade-label"],
    }).getDefault();
    const contentAIActionSelectLabel = new LabelTag({
      content: this.tSet.chooseAction,
      classNames: ["translade-label"],
    }).getDefault();

    const aBack = new ATag({
      classNames: ["translade-action-trigger", "back"],
      title: this.tSet.backToPreviousText,
      dataset: {
        targetField: fieldId,
      },
    }).getDefault();
    aBack.appendChild(backIcon);
    const aTranslate = new ATag({
      classNames: ["translade-action-trigger", "translate"],
      title: this.tSet.translateText,
      dataset: {
        targetField: fieldId,
      },
    }).getDefault();
    aTranslate.appendChild(translateIcon);
    const divLanguageSelect = new DivTag({
      classNames: ["translade-action-trigger", "language-select"],
      dataset: {
        targetField: fieldId,
      },
    }).getDefault();
    divLanguageSelect.appendChild(languageSelectLabel);
    divLanguageSelect.appendChild(languageSelect);
    const divContentAIActionsSelect = new DivTag({
      classNames: ["translade-action-trigger", "content-ai-action-select"],
      dataset: {
        targetField: fieldId,
      },
    }).getDefault();
    divContentAIActionsSelect.appendChild(contentAIActionSelectLabel);
    divContentAIActionsSelect.appendChild(contentAIActionSelect);

    const aLoader = new ATag({
      classNames: ["translade-action-trigger", "load", "action-hide"],
      title: this.tSet.loading,
      dataset: {
        targetField: fieldId,
      },
    }).getDefault();
    aLoader.appendChild(loaderIcon);

    [
      aBack,
      aTranslate,
      divLanguageSelect,
      divContentAIActionsSelect,
      aLoader,
    ].forEach((children, _) => {
      wrapper.appendChild(children);
    });

    return wrapper;
  }
}
