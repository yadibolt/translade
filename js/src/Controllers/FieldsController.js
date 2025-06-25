import ExceptionManager from "../Manager/ExceptionManager";
import {getFirstBySelector} from "../Util/DocumentUtil";

export default class FieldsController {
  constructor() {}

  getShadowRootFields() {
    const fields = document.querySelectorAll(
      `div[id*="translade-shadow-root-"]`,
    );
    if (!fields || fields.length <= 0)
      return new ExceptionManager().throwException(
        "Could not find fields.",
        null,
        null,
      );

    return fields;
  }

  getTranslationTableFields() {
    const tableBody = getFirstBySelector("#edit-strings tbody");

    if (!tableBody) {
      return;
    }

    const childNodes = Array.from(tableBody.childNodes).filter((node) => node.nodeName === "TR");
    if (childNodes.length > 0) return childNodes;

    return null;
  }
}
