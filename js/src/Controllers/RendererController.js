import DivTag from "../Elements/DivTag";
import HeadingTag from "../Elements/HeadingTag";
import ParagraphTag from "../Elements/ParagraphTag";
import FieldsController from "./FieldsController";
import ActionsController from "./ActionsController";
import FieldHistoryController from "./FieldHistoryController";

import {getById, getFirstByClass} from "../Util/DocumentUtil";

export default class RendererController {
  constructor() {}

  renderTopBar() {
    const shadowRoot = getById("translade-mount-shadow-root");

    const wrapper = new DivTag({
      classNames: ["translade-wrapper"],
    }).getDefault();
    const title = new HeadingTag({
      level: 3,
      content: "Translade",
    }).getDefault();
    const description = new ParagraphTag({
      content: "Select a language to translate to.",
    }).getDefault();

    [title, description].forEach((children, _) => {
      wrapper.appendChild(children);
    });

    shadowRoot.appendChild(wrapper);
  }

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
