import OptionTag from "../Elements/OptionTag";
import SessionManager from "../Manager/SessionManager";
import SelectTag from "../Elements/SelectTag";
import DivTag from "../Elements/DivTag";
import HeadingTag from "../Elements/HeadingTag";
import ParagraphTag from "../Elements/ParagraphTag";
import FieldsController from "./FieldsController";
import ActionsController from "./ActionsController";

import { getById } from "../Util/HTMLUtil";
import FieldHistoryController from "./FieldHistoryController";

export default class RendererController {
  constructor() {}

  renderTopBar() {
    const shadowRoot = getById("translade-mount-shadow-root");

    let languageOptions = [];
    window.transladeConfig.languages.forEach((language, _) => {
      const values = language.split("|");
      const isSelected =
        values[1] === new SessionManager().getSession().selectedLangId;
      // values[0] is the language ID, values[1] is the language name
      languageOptions.push(
        new OptionTag({
          name: values[1],
          value: values[0],
          isSelected: isSelected,
        }).getDefault(),
      );
    });

    const languageSelect = new SelectTag({
      id: "translade-languageTo",
      name: "translade-languageTo",
      options: languageOptions,
    }).getDefault();
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

    [title, languageSelect, description].forEach((children, _) => {
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

      const actions = actionsController.createActionsForField(fieldId);
      field.appendChild(actions);
      fieldHistoryController.setHistoryData(fieldId);
    });
  }
}
