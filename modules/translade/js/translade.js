(function ($, Drupal, once) {
  "use strict";

  Drupal.behaviors.translade = {
    attach: function (context, settings) {
      once("translade", "body", context).forEach(function (element) {
        const configHTML = document.getElementById(
          "translade-shadow-root-config"
        );
        if (
          !configHTML ||
          configHTML === undefined ||
          String(configHTML.value).length <= 0
        )
          return;
        const configParse = JSON.parse(String(configHTML.value).trim());
        if (!configParse || configParse === undefined) return;

        // Create struct
        const config = {
          languages: String(configParse.languages).trim().split(","),
          form_id: String(configParse.form_id),
        };

        // Remove the config textarea, we do not need it anymore
        configHTML.remove();

        // Config OK. Create a select for languages in the shadow root
        const shadowRoot = document.getElementById(
          "translade-mount-shadow-root"
        );
        if (!shadowRoot || shadowRoot === undefined) return;

        const wrapper = document.createElement("div");
        wrapper.classList.add("translade-wrapper");
        const title = document.createElement("h3");
        title.innerHTML = "Translade";
        const description = document.createElement("p");
        description.innerHTML = "Select languages for Translade service.";
        const languageFrom = createLanguageOptionsSelect(
          config,
          "translade-languageFrom",
          "translade-languageFrom"
        );
        const languageTo = createLanguageOptionsSelect(
          config,
          "translade-languageTo",
          "translade-languageTo"
        );

        wrapper.appendChild(title);
        wrapper.appendChild(languageFrom);
        wrapper.appendChild(languageTo);
        wrapper.appendChild(description);

        // attach the wrapper to the shadow root
        shadowRoot.appendChild(wrapper);

        // get all the fields
        let fields = document.querySelectorAll(
          'div[id*="translade-shadow-root-"]'
        );
        if (!fields || fields === undefined) return;

        fields.forEach((field, _) => {
          const fieldId = field.id.replaceAll(
            "translade-shadow-root-",
            "translade-field-"
          );
          const transladeActions = getTransladeActions(fieldId);
          field.appendChild(transladeActions);

          // shadow data for storing original input
          const shadowData = document.createElement("div");
          shadowData.dataset.targetField = "shadow-" + fieldId;
          shadowData.classList.add("translade-shadow-data");

          field.appendChild(shadowData);

          // check for the type and set default data for shadow data
          setShadowData(fieldId);
        });

        // attach event listeners
        fields.forEach((mainField, _) => {
          const fieldId = mainField.id.replaceAll(
            "translade-shadow-root-",
            "translade-field-"
          );

          let actionBack = mainField.querySelectorAll("a.back")[0];
          let actionTranslate = mainField.querySelectorAll("a.translate")[0];

          if (!actionBack || actionBack === undefined) return;
          actionBack.addEventListener("click", (event) => {
            event.preventDefault();
            // take the shadow data, and insert them into the field
            restoreFromShadowData(fieldId);
          });

          if (!actionTranslate || actionTranslate === undefined) return;
          actionTranslate.addEventListener("click", (event) => {
            event.preventDefault();
            // update the shadow data
            setShadowData(fieldId);

            let shadowData = getShadowData(fieldId);
            // TODO: Call API with shadowData for translation with loader, from lang to lang
          });
        });
      });
    },
  };

  const setShadowData = (fieldId) => {
    // get the item that has fieldId className
    // it contains the type of field
    const mainfield = document.querySelectorAll(
      `div[data-target-field="shadow-${fieldId}"]`
    )[0];
    const subfield = document.getElementsByClassName(fieldId)[0];

    if (!mainfield || mainfield === undefined) return;
    if (!subfield || subfield === undefined) return;

    const fieldTypeFull = Array.from(subfield.classList).find((className) =>
      className.startsWith("translade-type-")
    );

    if (!fieldTypeFull || fieldTypeFull === undefined) return;

    const fieldType = String(fieldTypeFull).replaceAll("translade-type-", "");
    let input = "";
    switch (fieldType) {
      case "string":
        input = getStringTypeValue(subfield);
        break;
      case "string_long":
        input = getStringLongTypeValue(subfield);
        break;
      case "text":
        input = getStringTypeValue(subfield);
        break;
      case "text_long":
        input = getTextLongValue(subfield);
        break;
      case "text_with_summary":
        input = getTextWithSummaryValue(subfield);
        break;
    }

    mainfield.innerHTML = input;
  };

  const getShadowData = (fieldId) => {
    const mainfield = document.querySelectorAll(
      `div[data-target-field="shadow-${fieldId}"]`
    )[0];

    if (!mainfield || mainfield === undefined) return null;

    return mainfield.innerHTML;
  };

  const restoreFromShadowData = (fieldId) => {
    const mainfield = document.querySelectorAll(
      `div[data-target-field="shadow-${fieldId}"]`
    )[0];
    const subfield = document.getElementsByClassName(fieldId)[0];

    if (!mainfield || mainfield === undefined) return;
    if (!subfield || subfield === undefined) return;

    const fieldTypeFull = Array.from(subfield.classList).find((className) =>
      className.startsWith("translade-type-")
    );

    if (!fieldTypeFull || fieldTypeFull === undefined) return;

    const fieldType = String(fieldTypeFull).replaceAll("translade-type-", "");
    switch (fieldType) {
      case "string":
        setStringTypeValue(subfield, mainfield.innerHTML);
        break;
      case "string_long":
        setStringLongTypeValue(subfield, mainfield.innerHTML);
        break;
      case "text":
        setStringTypeValue(subfield, mainfield.innerHTML);
        break;
      case "text_long":
        setTextLongValue(subfield, mainfield.innerHTML);
        break;
      case "text_with_summary":
        setTextWithSummaryValue(subfield, mainfield.innerHTML);
        break;
    }
  };

  const getStringTypeValue = (subfield) => {
    const input = subfield.querySelectorAll("input")[0];
    return String(input.value);
  };

  const setStringTypeValue = (subfield, newValue) => {
    const input = subfield.querySelectorAll("input")[0];
    input.value = String(newValue);
  };

  const getStringLongTypeValue = (subfield) => {
    const input = subfield.querySelectorAll("textarea")[0];
    return String(input.value);
  };

  const setStringLongTypeValue = (subfield, newValue) => {
    const input = subfield.querySelectorAll("textarea")[0];
    input.value = String(newValue);
  };

  const getTextWithSummaryValue = (subfield) => {
    let textWithSummary = subfield.querySelectorAll(".form-textarea-wrapper");
    let summaryFieldWrapper = textWithSummary[0];
    let textFieldWrapper = textWithSummary[1];

    const hasCKEditorEnabled =
      textFieldWrapper.querySelectorAll("div.ck").length > 0;

    if (hasCKEditorEnabled) {
      const ckEditorValue =
        textFieldWrapper.querySelectorAll(".ck .ck.ck-content")[0];
      const summaryValue = summaryFieldWrapper.querySelectorAll("textarea")[0];

      return summaryValue.value + "|TRANSLADE|" + ckEditorValue.innerHTML;
    } else {
      const ckEditorValue = textFieldWrapper.querySelectorAll("textarea")[0];
      const summaryValue = summaryFieldWrapper.querySelectorAll("textarea")[0];

      return summaryValue.value + "|TRANSLADE|" + ckEditorValue.value;
    }
  };

  const setTextWithSummaryValue = (subfield, newValue) => {
    let textWithSummary = subfield.querySelectorAll(".form-textarea-wrapper");
    let summaryFieldWrapper = textWithSummary[0];
    let textFieldWrapper = textWithSummary[1];

    const hasCKEditorEnabled =
      textFieldWrapper.querySelectorAll("div.ck").length > 0;

    if (hasCKEditorEnabled) {
      const summaryValue = summaryFieldWrapper.querySelectorAll("textarea")[0];
      let newValueSplit = newValue.split("|TRANSLADE|");

      // use ckeditor instance to update the dom
      const editorElement = textFieldWrapper.querySelector(
        ".ck-editor__editable"
      );
      const editorInstance = editorElement.ckeditorInstance;

      summaryValue.value = String(newValueSplit[0]);
      if (editorInstance) {
        editorInstance.setData(String(newValueSplit[1]));
      }
    } else {
      const ckEditorValue = textFieldWrapper.querySelectorAll("textarea")[0];
      const summaryValue = summaryFieldWrapper.querySelectorAll("textarea")[0];

      let newValueSplit = newValue.split("|TRANSLADE|");
      summaryValue.value = String(newValueSplit[0]);
      ckEditorValue.value = String(newValueSplit[1]);
    }
  };

  const getTextLongValue = (subfield) => {
    let textWithSummary = subfield.querySelectorAll(".form-textarea-wrapper");
    let textFieldWrapper = textWithSummary[0];

    const hasCKEditorEnabled =
      textFieldWrapper.querySelectorAll("div.ck").length > 0;

    if (hasCKEditorEnabled) {
      const ckEditorValue =
        textFieldWrapper.querySelectorAll(".ck .ck.ck-content")[0];

      return ckEditorValue.innerHTML;
    } else {
      const ckEditorValue = textFieldWrapper.querySelectorAll("textarea")[0];

      return ckEditorValue.value;
    }
  };

  const setTextLongValue = (subfield, newValue) => {
    let textWithSummary = subfield.querySelectorAll(".form-textarea-wrapper");
    let textFieldWrapper = textWithSummary[0];

    const hasCKEditorEnabled =
      textFieldWrapper.querySelectorAll("div.ck").length > 0;

    if (hasCKEditorEnabled) {
      // use ckeditor instance to update the dom
      const editorElement = textFieldWrapper.querySelector(
        ".ck-editor__editable"
      );
      const editorInstance = editorElement.ckeditorInstance;

      if (editorInstance) {
        editorInstance.setData(String(newValue));
      }
    } else {
      const ckEditorValue = textFieldWrapper.querySelectorAll("textarea")[0];

      ckEditorValue.value = String(newValue);
    }
  };

  const createLanguageOptionsSelect = (config, name, id) => {
    const select = document.createElement("select");
    select.id = id;
    select.name = name;

    config.languages.forEach((language, _) => {
      let values = language.split("|");
      select.innerHTML += getOptionTag(values[0], values[1]);
    });

    return select;
  };

  const getOptionTag = (value, name) => {
    return `<option value="${value}">${name}</option>`;
  };

  const getTransladeActions = (uid) => {
    const actionsWrapper = document.createElement("div");
    actionsWrapper.classList.add("translade-actions-wrapper");

    const backIcon = document.createElement("img");
    backIcon.src = "/modules/translade/icons/back.svg";
    backIcon.alt = "Back";

    const translateIcon = document.createElement("img");
    translateIcon.src = "/modules/translade/icons/translate.svg";
    translateIcon.alt = "Translate";

    const aBack = document.createElement("a");
    aBack.classList.add(...["translade-action-trigger", "back"]);
    aBack.dataset.targetField = uid;
    aBack.appendChild(backIcon);

    const aTranslate = document.createElement("a");
    aTranslate.classList.add(...["translade-action-trigger", "translate"]);
    aTranslate.dataset.targetField = uid;
    aTranslate.appendChild(translateIcon);

    actionsWrapper.appendChild(aBack);
    actionsWrapper.appendChild(aTranslate);

    return actionsWrapper;
  };
})(jQuery, Drupal, once);
