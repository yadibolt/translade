import {getById, getFirstBySelector} from "../Util/HTMLUtil";
import FieldsController from "./FieldsController";
import APIController from "./APIController";
import FieldHistoryController from "./FieldHistoryController";
import SessionManager from "../Manager/SessionManager";
import moduleDefaults from "../Defaults/ModuleDefault";

export default class EventListenerController {
  constructor() {
  }

  addEventListeners() {
    this._evLisBackAction();
    this._evLisTranslateAction();
    this._evLisRephraseAction();
    this._evListLanguageChange();
  }

  _evLisBackAction () {
    const fields = new FieldsController().getShadowRootFields();

    fields.forEach((field, _) => {
      const actionBack = getFirstBySelector("a.back", field);
      if (!actionBack) return;

      const fieldId = field.id.replaceAll(
        "translade-shadow-root-",
        "translade-field-",
      );

      actionBack.addEventListener('click', (event) => {
        event.preventDefault();

        console.log(fieldId);

        new FieldHistoryController().restoreFromHistory(fieldId);
      });
    })
  }

  _evLisTranslateAction () {
    const fields = new FieldsController().getShadowRootFields();

    fields.forEach((field, _) => {
      const actionTranslate = getFirstBySelector("a.translate", field);
      if (!actionTranslate) return;

      const fieldId = field.id.replaceAll( // we need to transform the field ID to target the the field with value
        "translade-shadow-root-",
        "translade-field-",
      );

      actionTranslate.addEventListener('click', (event) => {
        event.preventDefault();

        return new APIController().translate(fieldId, field);
      });
    })
  }

  _evLisRephraseAction () {
    const fields = new FieldsController().getShadowRootFields();

    fields.forEach((field, _) => {
      const actionRephrase = getFirstBySelector("a.rephrase", field);
      if (!actionRephrase) return;

      const fieldId = field.id.replaceAll( // we need to transform the field ID to target the the field with value
        "translade-shadow-root-",
        "translade-field-",
      );

      actionRephrase.addEventListener('click', (event) => {
        event.preventDefault();

        return new APIController().rephrase(fieldId, field);
      });
    })
  }

  _evListLanguageChange () {
    const selectLang = getById("translade-languageTo");
    if (!selectLang) return;

    const sessionManager = new SessionManager();

    if (sessionManager.getSession().selectedLangId.toString() === moduleDefaults.selectedLangIdDefault.toString()) {
      // sef default if the value is not set
      sessionManager.updateData({
        selectedLangId: selectLang.value.toString()
      })
    }
    selectLang.addEventListener("change", (event) => {
      event.preventDefault();

      sessionManager.updateData({
        selectedLangId: event.target.value.toString()
      })
    });
  }
}
