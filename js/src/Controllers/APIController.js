import moduleDefaults from "../Defaults/ModuleDefault";

import SessionManager from "../Manager/SessionManager";
import FieldHistoryController from "./FieldHistoryController";
import DrupalFieldTypeController from "./DrupalFieldTypeController";

import { getFirstBySelector, swapActiveClassName } from "../Util/HTMLUtil";

export default class APIController {
  constructor() {}

  translate(fieldId, mainField) {
    const config = window.transladeConfig;

    const drupalFieldTypeController = new DrupalFieldTypeController();
    const fieldHistoryController = new FieldHistoryController();
    const session = new SessionManager().getSession();
    const historyRecord = fieldHistoryController.getLastHistoryRecord(fieldId);

    let actionBack = getFirstBySelector("a.back", mainField);
    let actionTranslate = getFirstBySelector("a.translate", mainField);
    let actionRephrase = getFirstBySelector("a.rephrase", mainField);
    let actionLoader = getFirstBySelector("a.load", mainField);

    const body = {
      form_id: String(config.formId),
      text: String(historyRecord),
      trigger_id: String(fieldId),
      source_lang: String(config.contentLanguage),
      target_lang: String(session.selectedLangId),
    };

    swapActiveClassName(
      [actionLoader],
      [actionBack, actionTranslate, actionRephrase],
      "action-hide",
    );

    return new Promise((resolve, reject) => {
      fetch(`${moduleDefaults.baseUrl}${moduleDefaults.translationEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((response) => response.json())
        .then((data) => {
          if (
            !data.form_id ||
            !data.source_lang ||
            !data.target_lang ||
            !data.status ||
            !data.translated_text ||
            !data.trigger_id
          ) {
            swapActiveClassName(
              [actionBack, actionTranslate, actionRephrase],
              [actionLoader],
              "action-hide",
            );
            reject("Returned data do not follow the structure.");
          }

          drupalFieldTypeController.setFieldData(
            data.trigger_id,
            data.translated_text,
          );
          fieldHistoryController.setHistoryData(fieldId);

          swapActiveClassName(
            [actionBack, actionTranslate, actionRephrase],
            [actionLoader],
            "action-hide",
          );

          resolve(data);
        })
        .catch((e) => {
          swapActiveClassName(
            [actionBack, actionTranslate, actionRephrase],
            [actionLoader],
            "action-hide",
          );
          reject(e);
        });
    });
  }

  rephrase(fieldId, mainField) {
    const config = window.transladeConfig;

    const drupalFieldTypeController = new DrupalFieldTypeController();
    const fieldHistoryController = new FieldHistoryController();
    const historyRecord = fieldHistoryController.getLastHistoryRecord(fieldId);

    let actionBack = getFirstBySelector("a.back", mainField);
    let actionTranslate = getFirstBySelector("a.translate", mainField);
    let actionRephrase = getFirstBySelector("a.rephrase", mainField);
    let actionLoader = getFirstBySelector("a.load", mainField);

    const body = {
      form_id: String(config.formId),
      text: String(historyRecord),
      trigger_id: String(fieldId),
      source_lang: String(config.contentLanguage),
    };

    swapActiveClassName(
      [actionLoader],
      [actionBack, actionTranslate, actionRephrase],
      "action-hide",
    );

    return new Promise((resolve, reject) => {
      fetch(`${moduleDefaults.baseUrl}${moduleDefaults.rephraseEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((response) => response.json())
        .then((data) => {
          if (
            !data.form_id ||
            !data.source_lang ||
            !data.status ||
            !data.rephrased_text ||
            !data.trigger_id
          ) {
            swapActiveClassName(
              [actionLoader],
              [actionBack, actionTranslate, actionRephrase],
              "action-hide",
            );
            reject("Returned data do not follow the structure.");
          }

          drupalFieldTypeController.setFieldData(
            data.trigger_id,
            data.rephrased_text,
          );
          fieldHistoryController.setHistoryData(fieldId);

          swapActiveClassName(
            [actionBack, actionTranslate, actionRephrase],
            [actionLoader],
            "action-hide",
          );

          resolve(data);
        })
        .catch((e) => {
          swapActiveClassName(
            [actionBack, actionTranslate, actionRephrase],
            [actionLoader],
            "action-hide",
          );
          reject(e);
        });
    });
  }
}
