import moduleDefaults from "../Defaults/ModuleDefault";

import SessionManager from "../Manager/SessionManager";

import DivTag from "../Elements/DivTag";
import ImageTag from "../Elements/ImageTag";
import SpanTag from "../Elements/SpanTag";
import ATag from "../Elements/ATag";
import OptionTag from "../Elements/OptionTag";
import SelectTag from "../Elements/SelectTag";

export default class ActionsController {
  constructor() {}

  createActionsForField(fieldId) {
    let languageOptions = [];
    window.transladeConfig.languages.forEach((language, _) => {
      const values = language.split("|");
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

    const wrapper = new DivTag({
      classNames: ["translade-actions-wrapper"],
    }).getDefault();
    const languageSelect = new SelectTag({
      classNames: ["translade-languageTo"],
      name: "translade-languageTo",
      options: languageOptions,
    }).getDefault();
    const backIcon = new ImageTag({
      src: `${moduleDefaults.assetsFolder}/icons/back.svg`,
      alt: "Back",
    }).getDefault();
    const translateIcon = new ImageTag({
      src: `${moduleDefaults.assetsFolder}/icons/translate.svg`,
      alt: "Translate",
    }).getDefault();
    const rephraseIcon = new ImageTag({
      src: `${moduleDefaults.assetsFolder}/icons/rephrase.svg`,
      alt: "Rephrase",
    }).getDefault();
    const loaderIcon = new SpanTag({ classNames: ["loader"] }).getDefault();

    const divLanguageSelect = new DivTag({
      classNames: ["translade-action-trigger", "language-select"],
      dataset: {
        targetField: fieldId,
      },
    }).getDefault();
    divLanguageSelect.appendChild(languageSelect);
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
    const aRephrase = new ATag({
      classNames: ["translade-action-trigger", "rephrase"],
      title: "Rephrase text",
      dataset: {
        targetField: fieldId,
      },
    }).getDefault();
    aRephrase.appendChild(rephraseIcon);
    const aLoader = new ATag({
      classNames: ["translade-action-trigger", "load", "action-hide"],
      title: "Loading",
      dataset: {
        targetField: fieldId,
      },
    }).getDefault();
    aLoader.appendChild(loaderIcon);

    [aBack, aTranslate, divLanguageSelect, aRephrase, aLoader].forEach(
      (children, _) => {
        wrapper.appendChild(children);
      },
    );

    return wrapper;
  }
}
