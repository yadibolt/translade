import moduleDefaults from "../Defaults/ModuleDefault";

import SessionManager from "../Manager/SessionManager";

import DivTag from "../Elements/DivTag";
import ImageTag from "../Elements/ImageTag";
import SpanTag from "../Elements/SpanTag";
import ATag from "../Elements/ATag";
import OptionTag from "../Elements/OptionTag";
import SelectTag from "../Elements/SelectTag";
import LabelTag from "../Elements/LabelTag";

export default class ActionsController {
  constructor() {}

  createActionsForField(fieldId) {
    let languageOptions = [];
    let contentAIActions = [];

    window.transladeConfig.languages.forEach((language, _) => {
      const values = language.split(":");
      // values[0] is the language ID, values[1] is the language name
      const isSelected =
        values[0] === new SessionManager().getSession().selectedLangId;
      if (window.transladeConfig.contentLanguage === values[0]) return; // remove og lang from options
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
        name: "# Action",
        value: "default",
      }).getDefault(),
    );
    window.transladeConfig.contentAIActions.forEach((action, _) => {
      const values = action.split(":");
      // values[0] is the action ID, values[1] is the action name
      contentAIActions.push(
        new OptionTag({
          name: values[1],
          value: values[0],
        }).getDefault(),
      );
    });

    const wrapper = new DivTag({
      classNames: ["translade-actions-wrapper", "light"], // THEME: dark or light
    }).getDefault();
    const backIcon = new ImageTag({
      src: `${moduleDefaults.assetsFolder}/icons/back.svg`,
      alt: "Back",
    }).getDefault();
    const translateIcon = new ImageTag({
      src: `${moduleDefaults.assetsFolder}/icons/translate.svg`,
      alt: "Translate",
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
      content: "Language to translate to",
      classNames: ["translade-label"],
    }).getDefault();
    const contentAIActionSelectLabel = new LabelTag({
      content: "Choose an action",
      classNames: ["translade-label"],
    }).getDefault();

    const aBack = new ATag({
      classNames: ["translade-action-trigger", "back"],
      title: "Back to previous text",
      dataset: {
        targetField: fieldId,
      },
    }).getDefault();
    aBack.appendChild(backIcon);
    const aTranslate = new ATag({
      classNames: ["translade-action-trigger", "translate"],
      title: "Translate text",
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
      title: "Loading",
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
