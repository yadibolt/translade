import ExceptionManager from "../Manager/ExceptionManager";

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
}
