import moduleDefaults from "../Defaults/ModuleDefault";

import DrupalFieldTypeController from "./DrupalFieldTypeController";

import { getFirstByClass } from "../Util/HTMLUtil";

export default class FieldHistoryController {
  constructor() {}

  setHistoryData = (fieldId) => {
    const drupalFieldTypeController = new DrupalFieldTypeController();
    let hist = window.transladeConfig.history;
    // get the item that has fieldId className, it contains the type of field
    const subfield = getFirstByClass(fieldId);

    if (!subfield) return;

    const fieldTypeFull = Array.from(subfield.classList).find((className) =>
      className.startsWith("translade-type-"),
    );

    if (!fieldTypeFull) return;

    const fieldType = String(fieldTypeFull).replaceAll("translade-type-", "");
    let input = "";
    switch (fieldType) {
      case "string":
        input = drupalFieldTypeController.getStringTypeValue(subfield);
        break;
      case "string_long":
        input = drupalFieldTypeController.getStringLongTypeValue(subfield);
        break;
      case "text":
        input = drupalFieldTypeController.getStringTypeValue(subfield);
        break;
      case "text_long":
        input = drupalFieldTypeController.getTextLongValue(subfield);
        break;
      case "text_with_summary":
        input = drupalFieldTypeController.getTextWithSummaryValue(subfield);
        break;
    }

    if (!hist[fieldId] || hist[fieldId] === undefined) {
      hist[fieldId.toString()] = [input];
    } else {
      if (
        hist[fieldId.toString()].length >= moduleDefaults.maximumHistoryLength
      ) {
        hist[fieldId.toString()].shift();
      }
      hist[fieldId.toString()].push(input);
    }

    window.transladeConfig.history = hist;
  };

  getLastHistoryRecord = (fieldId) => {
    let hist = window.transladeConfig.history;

    if (!hist) return null;
    if (!hist[fieldId] || hist[fieldId] === undefined) return null;

    return hist[fieldId][hist[fieldId].length - 1];
  };

  restoreFromHistory = (fieldId) => {
    const drupalFieldTypeController = new DrupalFieldTypeController();
    let hist = window.transladeConfig.history;

    if (!hist) return;
    if (!hist[fieldId] || hist[fieldId] === undefined) return;

    if (hist[fieldId].length > 1) {
      hist[fieldId].pop();
    }

    if (hist[fieldId][hist[fieldId].length - 1]) {
      window.transladeConfig.history = hist;
      drupalFieldTypeController.setFieldData(
        fieldId,
        hist[fieldId][hist[fieldId].length - 1],
      );
    }
  };
}
