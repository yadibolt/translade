import FieldsController from "./FieldsController";
import ActionsController from "./ActionsController";
import FieldHistoryController from "./FieldHistoryController";

import { getFirstByClass } from "../Util/DocumentUtil";

export default class RendererController {
  constructor() {}

  renderActionsForFields() {
    let actionsController = new ActionsController();
    let fieldHistoryController = new FieldHistoryController();
    let fields = new FieldsController().getShadowRootFields();

    fields.forEach((field, _) => {
      const fieldId = field.id.replaceAll(
        "translade-shadow-root-",
        "translade-field-",
      );

      if (getFirstByClass(fieldId)) {
        const actions = actionsController.createActionsForField(fieldId);
        field.appendChild(actions);
        fieldHistoryController.setHistoryData(fieldId);
      }
    });
  }
}
