import moduleDefaults from "../Defaults/ModuleDefault";

import {
  getFirstBySelector,
  getAllByClass,
  getAllBySelector,
  getFirstByClass,
} from "../Util/DocumentUtil";

export default class DrupalFieldTypeController {
  constructor() {}

  getStringTypeValue = (subfield) => {
    const input = getFirstBySelector("input", subfield);
    return String(input.value);
  };

  getStringLongTypeValue = (subfield) => {
    const input = getFirstBySelector("textarea", subfield);
    return String(input.value);
  };

  getTextWithSummaryValue = (subfield) => {
    let textWithSummary = getAllBySelector(".form-textarea-wrapper", subfield);
    let summaryFieldWrapper = null;
    let textFieldWrapper = null;

    if (textWithSummary.length === 1) {
      // in case of e-commerce body
      textFieldWrapper = textWithSummary[0];
    } else {
      summaryFieldWrapper = textWithSummary[0];
      textFieldWrapper = textWithSummary[1];
    }

    const hasCKEditorEnabled =
      getAllBySelector("div.ck", textFieldWrapper).length > 0;

    if (hasCKEditorEnabled) {
      const ckEditorValue = getFirstBySelector(
        ".ck .ck.ck-content",
        textFieldWrapper,
      );
      const summaryValue =
        summaryFieldWrapper !== null
          ? getFirstBySelector("textarea", summaryFieldWrapper)
          : "";

      return (
        summaryValue.value +
        `${moduleDefaults.specialToken}` +
        ckEditorValue.innerHTML
      );
    } else {
      const ckEditorValue = getFirstBySelector("textarea", textFieldWrapper);
      const summaryValue =
        summaryFieldWrapper !== null
          ? getFirstBySelector("textarea", summaryFieldWrapper)
          : "";

      return (
        summaryValue.value +
        `${moduleDefaults.specialToken}` +
        ckEditorValue.value
      );
    }
  };

  getTextLongValue = (subfield) => {
    let textWithSummary = getAllByClass(".form-textarea-wrapper", subfield);
    let textFieldWrapper = textWithSummary[0];

    const hasCKEditorEnabled =
      getAllBySelector("div.ck", textFieldWrapper).length > 0;

    if (hasCKEditorEnabled) {
      const ckEditorValue = getFirstBySelector(
        ".ck .ck.ck-content",
        textFieldWrapper,
      );

      return ckEditorValue.innerHTML;
    } else {
      const ckEditorValue = getFirstBySelector("textarea", textFieldWrapper);

      return ckEditorValue.value;
    }
  };

  setStringTypeValue = (subfield, newValue) => {
    const input = getFirstBySelector("input", subfield);
    input.value = String(newValue);
  };

  setStringLongTypeValue = (subfield, newValue) => {
    const input = getFirstBySelector("textarea", subfield);
    input.value = String(newValue);
  };

  setTextWithSummaryValue = (subfield, newValue) => {
    let textWithSummary = getAllBySelector(".form-textarea-wrapper", subfield);
    let textFieldWrapper = null;
    let summaryFieldWrapper = null;

    if (textWithSummary.length === 1) {
      // in case of e-commerce body
      textFieldWrapper = textWithSummary[0];
    } else {
      summaryFieldWrapper = textWithSummary[0];
      textFieldWrapper = textWithSummary[1];
    }

    const hasCKEditorEnabled =
      getAllBySelector("div.ck", textFieldWrapper).length > 0;

    if (hasCKEditorEnabled) {
      const summaryValue = summaryFieldWrapper
        ? getFirstBySelector("textarea", summaryFieldWrapper)
        : "";
      let newValueSplit = newValue.split(`${moduleDefaults.specialToken}`);

      // use ckeditor instance to update the DOM
      const editorElement = getFirstBySelector(
        ".ck-editor__editable",
        textFieldWrapper,
      );
      const editorInstance = editorElement.ckeditorInstance;

      if (textWithSummary.length === 1) {
        if (editorInstance) {
          editorInstance.setData(String(newValueSplit[1]));
        }
      } else {
        summaryValue.value = String(newValueSplit[0]);
        if (editorInstance) {
          editorInstance.setData(String(newValueSplit[1]));
        }
      }
    } else {
      const ckEditorValue = getFirstBySelector("textarea", textFieldWrapper);
      const summaryValue = summaryFieldWrapper
        ? getFirstBySelector("textarea", summaryFieldWrapper)
        : null;

      let newValueSplit = newValue.split(`${moduleDefaults.specialToken}`);

      if (summaryValue === null) {
        // e-commerce
        ckEditorValue.value = String(newValueSplit[1]);
      } else {
        summaryValue.value = String(newValueSplit[0]);
        ckEditorValue.value = String(newValueSplit[1]);
      }
    }
  };

  setTextLongValue = (subfield, newValue) => {
    let textWithSummary = getAllByClass(".form-textarea-wrapper", subfield);
    let textFieldWrapper = textWithSummary[0];

    const hasCKEditorEnabled =
      getAllBySelector("div.ck", textFieldWrapper).length > 0;

    if (hasCKEditorEnabled) {
      // use ckeditor instance to update the DOM
      const editorElement = getFirstBySelector(
        ".ck-editor__editable",
        textFieldWrapper,
      );
      const editorInstance = editorElement.ckeditorInstance;

      if (editorInstance) {
        editorInstance.setData(String(newValue));
      }
    } else {
      const ckEditorValue = getFirstBySelector("textarea", textFieldWrapper);

      ckEditorValue.value = String(newValue);
    }
  };

  setFieldData = (fieldId, newValue) => {
    const subfield = getFirstByClass(fieldId);

    if (!subfield) return;

    const fieldTypeFull = Array.from(subfield.classList).find((className) =>
      className.startsWith("translade-type-"),
    );

    if (!fieldTypeFull) return;

    const fieldType = String(fieldTypeFull).replaceAll("translade-type-", "");

    switch (fieldType) {
      case "string":
        this.setStringTypeValue(subfield, newValue);
        break;
      case "string_long":
        this.setStringLongTypeValue(subfield, newValue);
        break;
      case "text":
        this.setStringTypeValue(subfield, newValue);
        break;
      case "text_long":
        this.setTextLongValue(subfield, newValue);
        break;
      case "text_with_summary":
        this.setTextWithSummaryValue(subfield, newValue);
        break;
    }
  };
}
