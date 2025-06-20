import moduleDefaults from "../Defaults/ModuleDefault";

import DivTag from "../Elements/DivTag";
import ImageTag from "../Elements/ImageTag";
import SpanTag from "../Elements/SpanTag";
import ATag from "../Elements/ATag";

export default class ActionsController {
  constructor() {
  }

  createActionsForField(fieldId) {
    const wrapper = new DivTag({classNames: ['translade-actions-wrapper']}).getDefault();
    const backIcon = new ImageTag({src: `${moduleDefaults.assetsFolder}/icons/back.svg`, alt: "Back"}).getDefault();
    const translateIcon = new ImageTag({src: `${moduleDefaults.assetsFolder}/icons/translate.svg`, alt: 'Translate'}).getDefault();
    const rephraseIcon = new ImageTag({src: `${moduleDefaults.assetsFolder}/icons/rephrase.svg`, alt: 'Rephrase'}).getDefault();
    const loaderIcon = new SpanTag({classNames: ['loader']}).getDefault();
    const aBack = new ATag({
      classNames: ["translade-action-trigger", "back"],
      alt: 'Back to previous text',
      dataset: {
        targetField: fieldId,
      }}).getDefault(); aBack.appendChild(backIcon);
    const aTranslate = new ATag({
      classNames: ["translade-action-trigger", "translate"],
      alt: 'Translate text',
      dataset: {
        targetField: fieldId,
      }}).getDefault(); aTranslate.appendChild(translateIcon);
    const aRephrase = new ATag({
      classNames: ["translade-action-trigger", "rephrase"],
      alt: 'Rephrase text',
      dataset: {
        targetField: fieldId,
      }}).getDefault(); aRephrase.appendChild(rephraseIcon);
    const aLoader = new ATag({
      classNames: ["translade-action-trigger", "load", "action-hide"],
      alt: 'Loading',
      dataset: {
        targetField: fieldId,
      }}).getDefault(); aLoader.appendChild(loaderIcon);

    [aBack, aTranslate, aRephrase, aLoader].forEach((children, _) => {
      wrapper.appendChild(children);
    });

    return wrapper;
  }
}
