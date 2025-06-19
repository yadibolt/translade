import DivTag from "../Elements/DivTag";
import moduleDefaults from "../Defaults/ModuleDefault";
import ImageTag from "../Elements/ImageTag";
import SpanTag from "../Elements/SpanTag";
import ATag from "../Elements/ATag";

export default class ActionsController {
  constructor() {
  }

  createActionsForField(fieldId) {
    const wrapper = new DivTag(null, ['translade-actions-wrapper'], null).getOfTypeDefault();
    const backIcon = new ImageTag(null, null, `${moduleDefaults.assetsFolder}/icons/back.svg`, 'Back').getOfTypeDefault();
    const translateIcon = new ImageTag(null, null, `${moduleDefaults.assetsFolder}/icons/translate.svg`, 'Translate').getOfTypeDefault();
    const rephraseIcon = new ImageTag(null, null, `${moduleDefaults.assetsFolder}/icons/rephrase.svg`, 'Rephrase').getOfTypeDefault();
    const loaderIcon = new SpanTag(null, ['loader'], null).getOfTypeDefault();
    const aBack = new ATag(
      null, ["translade-action-trigger", "back"],
      null, 'Back to previous text', {
        targetField: fieldId,
      }, null
    ).getOfTypeDefault(); aBack.appendChild(backIcon);
    const aTranslate = new ATag(
      null, ["translade-action-trigger", "translate"],
      null, 'Translate text', {
        targetField: fieldId,
      }, null
    ).getOfTypeDefault(); aTranslate.appendChild(translateIcon);
    const aRephrase = new ATag(
      null, ["translade-action-trigger", "rephrase"],
      null, 'Rephrase text', {
        targetField: fieldId,
      }, null
    ).getOfTypeDefault(); aRephrase.appendChild(rephraseIcon);
    const aLoader = new ATag(
      null, ["translade-action-trigger", "load", "action-hide"],
      null, 'Loading', {
        targetField: fieldId,
      }, null
    ).getOfTypeDefault(); aLoader.appendChild(loaderIcon);

    [aBack, aTranslate, aRephrase, aLoader].forEach((children, _) => {
      wrapper.appendChild(children);
    });

    return wrapper;
  }
}
