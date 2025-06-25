import FieldsController from "./FieldsController";
import ActionsController from "./ActionsController";
import FieldHistoryController from "./FieldHistoryController";

import {getAllBySelector, getFirstByClass, getFirstBySelector} from "../Util/DocumentUtil";

export default class RendererController {
  constructor() {}

  renderActionsForFields() {
    const actionsController = new ActionsController();
    const fieldHistoryController = new FieldHistoryController();
    const fields = new FieldsController().getShadowRootFields();

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

  renderActionsForTranslationTableFields() {
    const actionsController = new ActionsController();
    const fieldHistoryController = new FieldHistoryController();
    const childNodes = new FieldsController().getTranslationTableFields();

    childNodes.forEach((node, _) => {
      const formWrapper = getFirstBySelector('.form-textarea-wrapper', getAllBySelector('td', node)[1]);
      const textarea = getFirstBySelector('.form-textarea-wrapper textarea', getAllBySelector('td', node)[1]);
      const textareaId = textarea.id;
      if (textarea) {
        const actions = actionsController.createActionsForTranslationTableField(textareaId);
        formWrapper.appendChild(actions);
        fieldHistoryController.setHistoryData(textareaId);
      }
    });
  }
}
