import moduleDefaults from "../Defaults/ModuleDefaults";

import SessionManager from "../Manager/SessionManager";
import FieldHistoryController from "./FieldHistoryController";
import DrupalFieldTypeController from "./DrupalFieldTypeController";

import {getById, getFirstBySelector, swapActiveClassName} from "../Util/DocumentUtil";

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
    let actionLoader = getFirstBySelector("a.load", mainField);
    let actionLanguageSelect = getFirstBySelector(
      "div.language-select",
      mainField,
    );
    const actionAIActions = getFirstBySelector(
      "div.content-ai-action-select",
      mainField,
    );

    const body = {
      form_id: String(config.formId),
      text: String(historyRecord),
      trigger_id: String(fieldId),
      source_lang: String(config.contentLanguage),
      target_lang: String(session.selectedLangId),
    };

    swapActiveClassName(
      [actionLoader],
      [actionBack, actionTranslate, actionLanguageSelect, actionAIActions],
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
              [
                actionBack,
                actionTranslate,
                actionLanguageSelect,
                actionAIActions,
              ],
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
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );

          resolve(data);
        })
        .catch((e) => {
          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );
          reject(e);
        });
    });
  }

  translateTableField(fieldId, mainField) {
    const config = window.transladeConfig;

    const drupalFieldTypeController = new DrupalFieldTypeController();
    const fieldHistoryController = new FieldHistoryController();
    const session = new SessionManager().getSession();

    // fieldId.split('-')[2] => ID
    let translatableRecord = getById(`edit-strings-${fieldId.split('-')[2]}-original`);
    if (!translatableRecord) return;
    const translatableRecordValue = translatableRecord.value;
    // TODO
    const langOriginal = translatableRecord.parentNode.lang;

    console.log(langOriginal);

    let actionBack = getFirstBySelector("a.back", mainField);
    let actionTranslate = getFirstBySelector("a.translate", mainField);
    let actionLoader = getFirstBySelector("a.load", mainField);

    const body = {
      form_id: String(config.formId),
      text: String(translatableRecordValue),
      trigger_id: String(fieldId),
      source_lang: String(config.contentLanguage),
      target_lang: String(session.selectedLangId),
    };

    swapActiveClassName(
      [actionLoader],
      [actionBack, actionTranslate],
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
              [
                actionBack,
                actionTranslate,
              ],
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
            [
              actionBack,
              actionTranslate,
            ],
            [actionLoader],
            "action-hide",
          );

          resolve(data);
        })
        .catch((e) => {
          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
            ],
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
    let actionLoader = getFirstBySelector("a.load", mainField);
    let actionLanguageSelect = getFirstBySelector(
      "div.language-select",
      mainField,
    );
    const actionAIActions = getFirstBySelector(
      "div.content-ai-action-select",
      mainField,
    );

    const body = {
      form_id: String(config.formId),
      text: String(historyRecord),
      trigger_id: String(fieldId),
      source_lang: String(config.contentLanguage),
    };

    swapActiveClassName(
      [actionLoader],
      [actionBack, actionTranslate, actionLanguageSelect, actionAIActions],
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
              [
                actionBack,
                actionTranslate,
                actionLanguageSelect,
                actionAIActions,
              ],
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
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );

          resolve(data);
        })
        .catch((e) => {
          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );
          reject(e);
        });
    });
  }

  checkGrammar(fieldId, mainField) {
    const config = window.transladeConfig;

    const drupalFieldTypeController = new DrupalFieldTypeController();
    const fieldHistoryController = new FieldHistoryController();
    const historyRecord = fieldHistoryController.getLastHistoryRecord(fieldId);

    let actionBack = getFirstBySelector("a.back", mainField);
    let actionTranslate = getFirstBySelector("a.translate", mainField);
    let actionLoader = getFirstBySelector("a.load", mainField);
    let actionLanguageSelect = getFirstBySelector(
      "div.language-select",
      mainField,
    );
    const actionAIActions = getFirstBySelector(
      "div.content-ai-action-select",
      mainField,
    );

    const body = {
      form_id: String(config.formId),
      text: String(historyRecord),
      trigger_id: String(fieldId),
      source_lang: String(config.contentLanguage),
    };

    swapActiveClassName(
      [actionLoader],
      [actionBack, actionTranslate, actionLanguageSelect, actionAIActions],
      "action-hide",
    );

    return new Promise((resolve, reject) => {
      fetch(`${moduleDefaults.baseUrl}${moduleDefaults.checkGrammarEndpoint}`, {
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
            !data.checked_text ||
            !data.trigger_id
          ) {
            swapActiveClassName(
              [actionLoader],
              [
                actionBack,
                actionTranslate,
                actionLanguageSelect,
                actionAIActions,
              ],
              "action-hide",
            );
            reject("Returned data do not follow the structure.");
          }

          drupalFieldTypeController.setFieldData(
            data.trigger_id,
            data.checked_text,
          );
          fieldHistoryController.setHistoryData(fieldId);

          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );

          resolve(data);
        })
        .catch((e) => {
          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );
          reject(e);
        });
    });
  }

  summarize(fieldId, mainField) {
    const config = window.transladeConfig;

    const drupalFieldTypeController = new DrupalFieldTypeController();
    const fieldHistoryController = new FieldHistoryController();
    const historyRecord = fieldHistoryController.getLastHistoryRecord(fieldId);

    let actionBack = getFirstBySelector("a.back", mainField);
    let actionTranslate = getFirstBySelector("a.translate", mainField);
    let actionLoader = getFirstBySelector("a.load", mainField);
    let actionLanguageSelect = getFirstBySelector(
      "div.language-select",
      mainField,
    );
    const actionAIActions = getFirstBySelector(
      "div.content-ai-action-select",
      mainField,
    );

    const body = {
      form_id: String(config.formId),
      text: String(historyRecord),
      trigger_id: String(fieldId),
      source_lang: String(config.contentLanguage),
    };

    swapActiveClassName(
      [actionLoader],
      [actionBack, actionTranslate, actionLanguageSelect, actionAIActions],
      "action-hide",
    );

    return new Promise((resolve, reject) => {
      fetch(`${moduleDefaults.baseUrl}${moduleDefaults.summarizeEndpoint}`, {
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
            !data.summarized_text ||
            !data.trigger_id
          ) {
            swapActiveClassName(
              [actionLoader],
              [
                actionBack,
                actionTranslate,
                actionLanguageSelect,
                actionAIActions,
              ],
              "action-hide",
            );
            reject("Returned data do not follow the structure.");
          }

          drupalFieldTypeController.setFieldData(
            data.trigger_id,
            data.summarized_text,
          );
          fieldHistoryController.setHistoryData(fieldId);

          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );

          resolve(data);
        })
        .catch((e) => {
          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );
          reject(e);
        });
    });
  }

  expandContent(fieldId, mainField) {
    const config = window.transladeConfig;

    const drupalFieldTypeController = new DrupalFieldTypeController();
    const fieldHistoryController = new FieldHistoryController();
    const historyRecord = fieldHistoryController.getLastHistoryRecord(fieldId);

    let actionBack = getFirstBySelector("a.back", mainField);
    let actionTranslate = getFirstBySelector("a.translate", mainField);
    let actionLoader = getFirstBySelector("a.load", mainField);
    let actionLanguageSelect = getFirstBySelector(
      "div.language-select",
      mainField,
    );
    const actionAIActions = getFirstBySelector(
      "div.content-ai-action-select",
      mainField,
    );

    const body = {
      form_id: String(config.formId),
      text: String(historyRecord),
      trigger_id: String(fieldId),
      source_lang: String(config.contentLanguage),
    };

    swapActiveClassName(
      [actionLoader],
      [actionBack, actionTranslate, actionLanguageSelect, actionAIActions],
      "action-hide",
    );

    return new Promise((resolve, reject) => {
      fetch(`${moduleDefaults.baseUrl}${moduleDefaults.expandContentEndpoint}`, {
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
            !data.expanded_text ||
            !data.trigger_id
          ) {
            swapActiveClassName(
              [actionLoader],
              [
                actionBack,
                actionTranslate,
                actionLanguageSelect,
                actionAIActions,
              ],
              "action-hide",
            );
            reject("Returned data do not follow the structure.");
          }

          drupalFieldTypeController.setFieldData(
            data.trigger_id,
            data.expanded_text,
          );
          fieldHistoryController.setHistoryData(fieldId);

          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );

          resolve(data);
        })
        .catch((e) => {
          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );
          reject(e);
        });
    });
  }

  shortenContent(fieldId, mainField) {
    const config = window.transladeConfig;

    const drupalFieldTypeController = new DrupalFieldTypeController();
    const fieldHistoryController = new FieldHistoryController();
    const historyRecord = fieldHistoryController.getLastHistoryRecord(fieldId);

    let actionBack = getFirstBySelector("a.back", mainField);
    let actionTranslate = getFirstBySelector("a.translate", mainField);
    let actionLoader = getFirstBySelector("a.load", mainField);
    let actionLanguageSelect = getFirstBySelector(
      "div.language-select",
      mainField,
    );
    const actionAIActions = getFirstBySelector(
      "div.content-ai-action-select",
      mainField,
    );

    const body = {
      form_id: String(config.formId),
      text: String(historyRecord),
      trigger_id: String(fieldId),
      source_lang: String(config.contentLanguage),
    };

    swapActiveClassName(
      [actionLoader],
      [actionBack, actionTranslate, actionLanguageSelect, actionAIActions],
      "action-hide",
    );

    return new Promise((resolve, reject) => {
      fetch(`${moduleDefaults.baseUrl}${moduleDefaults.shortenContentEndpoint}`, {
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
            !data.shortened_text ||
            !data.trigger_id
          ) {
            swapActiveClassName(
              [actionLoader],
              [
                actionBack,
                actionTranslate,
                actionLanguageSelect,
                actionAIActions,
              ],
              "action-hide",
            );
            reject("Returned data do not follow the structure.");
          }

          drupalFieldTypeController.setFieldData(
            data.trigger_id,
            data.shortened_text,
          );
          fieldHistoryController.setHistoryData(fieldId);

          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );

          resolve(data);
        })
        .catch((e) => {
          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );
          reject(e);
        });
    });
  }

  changeToneProfessional(fieldId, mainField) {
    const config = window.transladeConfig;

    const drupalFieldTypeController = new DrupalFieldTypeController();
    const fieldHistoryController = new FieldHistoryController();
    const historyRecord = fieldHistoryController.getLastHistoryRecord(fieldId);

    let actionBack = getFirstBySelector("a.back", mainField);
    let actionTranslate = getFirstBySelector("a.translate", mainField);
    let actionLoader = getFirstBySelector("a.load", mainField);
    let actionLanguageSelect = getFirstBySelector(
      "div.language-select",
      mainField,
    );
    const actionAIActions = getFirstBySelector(
      "div.content-ai-action-select",
      mainField,
    );

    const body = {
      form_id: String(config.formId),
      text: String(historyRecord),
      trigger_id: String(fieldId),
      source_lang: String(config.contentLanguage),
    };

    swapActiveClassName(
      [actionLoader],
      [actionBack, actionTranslate, actionLanguageSelect, actionAIActions],
      "action-hide",
    );

    return new Promise((resolve, reject) => {
      fetch(`${moduleDefaults.baseUrl}${moduleDefaults.changeToneProfessionalEndpoint}`, {
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
            !data.changed_tone_professsional_text ||
            !data.trigger_id
          ) {
            swapActiveClassName(
              [actionLoader],
              [
                actionBack,
                actionTranslate,
                actionLanguageSelect,
                actionAIActions,
              ],
              "action-hide",
            );
            reject("Returned data do not follow the structure.");
          }

          drupalFieldTypeController.setFieldData(
            data.trigger_id,
            data.changed_tone_professsional_text,
          );
          fieldHistoryController.setHistoryData(fieldId);

          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );

          resolve(data);
        })
        .catch((e) => {
          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );
          reject(e);
        });
    });
  }

  changeToneCasual(fieldId, mainField) {
    const config = window.transladeConfig;

    const drupalFieldTypeController = new DrupalFieldTypeController();
    const fieldHistoryController = new FieldHistoryController();
    const historyRecord = fieldHistoryController.getLastHistoryRecord(fieldId);

    let actionBack = getFirstBySelector("a.back", mainField);
    let actionTranslate = getFirstBySelector("a.translate", mainField);
    let actionLoader = getFirstBySelector("a.load", mainField);
    let actionLanguageSelect = getFirstBySelector(
      "div.language-select",
      mainField,
    );
    const actionAIActions = getFirstBySelector(
      "div.content-ai-action-select",
      mainField,
    );

    const body = {
      form_id: String(config.formId),
      text: String(historyRecord),
      trigger_id: String(fieldId),
      source_lang: String(config.contentLanguage),
    };

    swapActiveClassName(
      [actionLoader],
      [actionBack, actionTranslate, actionLanguageSelect, actionAIActions],
      "action-hide",
    );

    return new Promise((resolve, reject) => {
      fetch(`${moduleDefaults.baseUrl}${moduleDefaults.changeToneCasualEndpoint}`, {
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
            !data.changed_tone_casual_text ||
            !data.trigger_id
          ) {
            swapActiveClassName(
              [actionLoader],
              [
                actionBack,
                actionTranslate,
                actionLanguageSelect,
                actionAIActions,
              ],
              "action-hide",
            );
            reject("Returned data do not follow the structure.");
          }

          drupalFieldTypeController.setFieldData(
            data.trigger_id,
            data.changed_tone_casual_text,
          );
          fieldHistoryController.setHistoryData(fieldId);

          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );

          resolve(data);
        })
        .catch((e) => {
          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );
          reject(e);
        });
    });
  }

  simplifyContent(fieldId, mainField) {
    const config = window.transladeConfig;

    const drupalFieldTypeController = new DrupalFieldTypeController();
    const fieldHistoryController = new FieldHistoryController();
    const historyRecord = fieldHistoryController.getLastHistoryRecord(fieldId);

    let actionBack = getFirstBySelector("a.back", mainField);
    let actionTranslate = getFirstBySelector("a.translate", mainField);
    let actionLoader = getFirstBySelector("a.load", mainField);
    let actionLanguageSelect = getFirstBySelector(
      "div.language-select",
      mainField,
    );
    const actionAIActions = getFirstBySelector(
      "div.content-ai-action-select",
      mainField,
    );

    const body = {
      form_id: String(config.formId),
      text: String(historyRecord),
      trigger_id: String(fieldId),
      source_lang: String(config.contentLanguage),
    };

    swapActiveClassName(
      [actionLoader],
      [actionBack, actionTranslate, actionLanguageSelect, actionAIActions],
      "action-hide",
    );

    return new Promise((resolve, reject) => {
      fetch(`${moduleDefaults.baseUrl}${moduleDefaults.simplifyContentEndpoint}`, {
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
            !data.simplified_text ||
            !data.trigger_id
          ) {
            swapActiveClassName(
              [actionLoader],
              [
                actionBack,
                actionTranslate,
                actionLanguageSelect,
                actionAIActions,
              ],
              "action-hide",
            );
            reject("Returned data do not follow the structure.");
          }

          drupalFieldTypeController.setFieldData(
            data.trigger_id,
            data.simplified_text,
          );
          fieldHistoryController.setHistoryData(fieldId);

          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );

          resolve(data);
        })
        .catch((e) => {
          swapActiveClassName(
            [
              actionBack,
              actionTranslate,
              actionLanguageSelect,
              actionAIActions,
            ],
            [actionLoader],
            "action-hide",
          );
          reject(e);
        });
    });
  }
}
