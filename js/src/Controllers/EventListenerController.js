import moduleDefaults from "../Defaults/ModuleDefault";

import FieldsController from "./FieldsController";
import APIController from "./APIController";
import FieldHistoryController from "./FieldHistoryController";
import SessionManager from "../Manager/SessionManager";

import { getAllByClass, getFirstBySelector } from "../Util/DocumentUtil";

export default class EventListenerController {
  constructor() {}

  addEventListeners() {
    this._evLisBackAction();
    this._evLisTranslateAction();
    this._evListLanguageChange();
    this._evLisAIActions();
  }

  _evLisBackAction() {
    const fields = new FieldsController().getShadowRootFields();

    fields.forEach((field, _) => {
      const actionBack = getFirstBySelector("a.back", field);
      if (!actionBack) return;

      const fieldId = field.id.replaceAll(
        "translade-shadow-root-",
        "translade-field-",
      );

      actionBack.addEventListener("click", (event) => {
        event.preventDefault();

        new FieldHistoryController().restoreFromHistory(fieldId);
      });
    });
  }

  _evLisTranslateAction() {
    const fields = new FieldsController().getShadowRootFields();

    fields.forEach((field, _) => {
      const actionTranslate = getFirstBySelector("a.translate", field);
      if (!actionTranslate) return;

      const fieldId = field.id.replaceAll(
        // we need to transform the field ID to target the the field with value
        "translade-shadow-root-",
        "translade-field-",
      );

      actionTranslate.addEventListener("click", (event) => {
        event.preventDefault();

        return new APIController().translate(fieldId, field);
      });
    });
  }

  _evLisAIActions() {
    const fields = new FieldsController().getShadowRootFields();

    fields.forEach((field, _) => {
      const actionAIActions = getFirstBySelector(
        "div.content-ai-action-select select",
        field,
      );
      if (!actionAIActions) return;

      const fieldId = field.id.replaceAll(
        // we need to transform the field ID to target the the field with value
        "translade-shadow-root-",
        "translade-field-",
      );

      actionAIActions.value = "default";
      actionAIActions.addEventListener("change", (event) => {
        event.preventDefault();

        switch (String(event.target.value)) {
          case "rewriteRephrase":
            new APIController().rephrase(fieldId, field);
            break;
          case "checkGrammar":
            new APIController().checkGrammar(fieldId, field);
            break;
          case "summarize":
            new APIController().summarize(fieldId, field);
            break;
          case "expansionElaboration":
            new APIController().expandContent(fieldId, field);
            break;
          case "shortenCondense":
            new APIController().shortenContent(fieldId, field);
            break;
          case "changeToneProfessional":
            new APIController().changeToneProfessional(fieldId, field);
            break;
          case "changeToneCasual":
            new APIController().changeToneCasual(fieldId, field);
            break;
          case "simplify":
            new APIController().simplifyContent(fieldId, field);
            break;
          case "default":
            return;
        }

        actionAIActions.value = "default";
      });
    });
  }

  _evListLanguageChange() {
    const fields = new FieldsController().getShadowRootFields();

    fields.forEach((field, _) => {
      const actionLanguageChange = getFirstBySelector(
        "div.language-select select",
        field,
      );
      if (!actionLanguageChange) return;

      const sessionManager = new SessionManager();

      if (
        sessionManager.getSession().selectedLangId.toString() ===
        moduleDefaults.selectedLangIdDefault.toString()
      ) {
        // sef default if the value is not set
        sessionManager.updateData({
          selectedLangId: actionLanguageChange.value.toString(),
        });
      }

      actionLanguageChange.addEventListener("change", (event) => {
        event.preventDefault();

        sessionManager.updateData({
          selectedLangId: event.target.value.toString(),
        });

        // update other selects
        const selects = getAllByClass("translade-languageTo", document);
        for (const select of selects) {
          select.value = event.target.value.toString();
        }
      });
    });
  }
}
