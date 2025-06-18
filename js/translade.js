(function ($, Drupal, once) {
  "use strict";

  const moduleDefaults = {
    sessionName: 'translade-settings',
    assetsFolder: '/modules/translade/',
    selectedLangIdDefault: 'default',
  }

  Drupal.behaviors.translade = {
    attach: function (context, settings) {
      // use once to run this script only once
      // since Drupal attaches it 5 times
      once("translade", "body", context).forEach(function (element) {
        window.transladeHistory = {
          maximumHistoryLength: 10,
          history: {},
        }

        const configHTML = document.getElementById(
          "translade-shadow-root-config",
        );
        if (
          !configHTML ||
          String(configHTML.value).length <= 0
        )
          return;
        const configParse = JSON.parse(String(configHTML.value).trim());
        if (!configParse) return;

        // create config struct
        const config = {
          languages: String(configParse.languages).trim().split(","),
          contentLanguage: String(configParse.content_language).trim(),
          formId: String(configParse.form_id),
        };

        // remove the config textarea, we do not need it anymore
        configHTML.remove();

        // create session or grab existing one
        initializeSession();

        // config OK. create a select for languages in the shadow root
        const shadowRoot = document.getElementById(
          "translade-mount-shadow-root",
        );
        if (!shadowRoot) return;

        // create the top box with lang selects
        const wrapper = document.createElement("div");
        wrapper.classList.add("translade-wrapper");
        const title = document.createElement("h3");
        title.innerHTML = "Translade";
        const description = document.createElement("p");
        description.innerHTML = "Select a language to translate to.";
        const languageTo = createLanguageOptionsSelect(
          config,
          "translade-languageTo",
          "translade-languageTo",
        );

        wrapper.appendChild(title);
        wrapper.appendChild(languageTo);
        wrapper.appendChild(description);

        // attach the wrapper to the shadow root
        shadowRoot.appendChild(wrapper);

        // get all the fields
        let fields = document.querySelectorAll(
          'div[id*="translade-shadow-root-"]',
        );
        if (!fields) return;

        fields.forEach((field, _) => {
          // we want to target the input field, not the 'shadow root' wrapper around it
          const fieldId = field.id.replaceAll(
            "translade-shadow-root-",
            "translade-field-",
          );
          const transladeActions = getTransladeActions(fieldId); // get actions e.g. back, translate, loading state
          field.appendChild(transladeActions); // add them to the DOM
          setHistoryData(fieldId);
        });

        // attach event listeners
        fields.forEach((mainField, _) => {
          // again, we target the fields inside the wrapper
          const fieldId = mainField.id.replaceAll(
            "translade-shadow-root-",
            "translade-field-",
          );

          // target the actions and create event listeners for them
          let actionBack = mainField.querySelectorAll("a.back")[0];
          let actionTranslate = mainField.querySelectorAll("a.translate")[0];
          let actionRephrase = mainField.querySelectorAll("a.rephrase")[0];
          let actionLoader = mainField.querySelectorAll("a.load")[0];
          let selectLang = document.getElementById('translade-languageTo');

          // -- back action
          if (!actionBack) return;
          actionBack.addEventListener("click", (event) => {
            event.preventDefault();
            restoreFromHistory(fieldId);
          });

          // -- translate action
          if (!actionTranslate) return;
          actionTranslate.addEventListener("click", (event) => {
            event.preventDefault();

            let historyRecord = getLastHistoryRecord(fieldId);
            enableActionLoader(actionBack, actionTranslate, actionRephrase, actionLoader);

            const session = getSession();

            // return a promise, fetch the data
            return new Promise((resolve, reject) => {
              if (config.contentLanguage === String(session.selectedLangId))
                reject("Languages are the same.");

              // fetch the API
              fetch("/api/translade/translate", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  form_id: String(config.formId),
                  text: String(historyRecord),
                  trigger_id: String(fieldId),
                  source_lang: String(config.contentLanguage),
                  target_lang: String(languageTo.value),
                }),
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
                    disableActionLoader(
                      actionBack,
                      actionTranslate,
                      actionRephrase,
                      actionLoader,
                    );
                    reject("Returned data do not follow the structure.");
                  }

                  // set the translated data for data.trigger_id
                  setFieldData(data.trigger_id, data.translated_text);

                  setHistoryData(fieldId);

                  disableActionLoader(
                    actionBack,
                    actionTranslate,
                    actionRephrase,
                    actionLoader,
                  );
                  resolve(data);
                })
                .catch((e) => {
                  disableActionLoader(
                    actionBack,
                    actionTranslate,
                    actionRephrase,
                    actionLoader,
                  );
                  reject(e);
                });
            });
          });

          // -- rephrase action
          if (!actionRephrase) return;
          actionRephrase.addEventListener('click', (event) => {
            event.preventDefault();

            let historyRecord = getLastHistoryRecord(fieldId);
            enableActionLoader(actionBack, actionTranslate, actionRephrase, actionLoader);

            // return a promise, fetch the data
            return new Promise((resolve, reject) => {
              // fetch the API
              fetch("/api/translade/rephrase", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  form_id: String(config.formId),
                  text: String(historyRecord),
                  trigger_id: String(fieldId),
                  source_lang: String(config.contentLanguage),
                }),
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
                    disableActionLoader(
                      actionBack,
                      actionTranslate,
                      actionRephrase,
                      actionLoader,
                    );
                    reject("Returned data do not follow the structure.");
                  }

                  // set the translated data for data.trigger_id
                  setFieldData(data.trigger_id, data.rephrased_text);
                  setHistoryData(fieldId);

                  disableActionLoader(
                    actionBack,
                    actionTranslate,
                    actionRephrase,
                    actionLoader,
                  );
                  resolve(data);
                })
                .catch((e) => {
                  disableActionLoader(
                    actionBack,
                    actionTranslate,
                    actionRephrase,
                    actionLoader,
                  );
                  reject(e);
                });
            });
          });

          // -- lang select change event
          if (!selectLang) return;
          if (getSession().selectedLangId.toString() === moduleDefaults.selectedLangIdDefault.toString()) {
            // sef default if the value is not set
            setSelectedLangId(selectLang.value,toString());
          }
          // attach event listener
          selectLang.addEventListener("change", (event) => {
            event.preventDefault();

            setSelectedLangId(event.target.value);
          });

        });
      });
    },
  };

  /**
   * Enables the visual loader.
   *
   * @param {HTMLLinkElement} actionBack
   * @param {HTMLLinkElement} actionTranslate
   * @param {HTMLLinkElement} actionRephrase
   * @param {HTMLLinkElement} actionLoad
   *
   * @returns {null}
   */
  const enableActionLoader = (actionBack, actionTranslate, actionRephrase, actionLoad) => {
    if (!actionBack) return null;
    !actionBack.classList.contains("action-hide")
      ? actionBack.classList.add("action-hide")
      : null;
    if (!actionTranslate) return null;
    !actionTranslate.classList.contains("action-hide")
      ? actionTranslate.classList.add("action-hide")
      : null;

    if (!actionRephrase) return null;
    !actionRephrase.classList.contains("action-hide")
      ? actionRephrase.classList.add("action-hide")
      : null;

    // show loader
    if (!actionLoad) return null;
    actionLoad.classList.contains("action-hide")
      ? actionLoad.classList.remove("action-hide")
      : null;

    return null;
  };

  /**
   * Disables the visual loader.
   *
   * @param {HTMLLinkElement} actionBack
   * @param {HTMLLinkElement} actionTranslate
   * @param {HTMLLinkElement} actionRephrase
   * @param {HTMLLinkElement} actionLoad
   *
   * @returns {null}
   */
  const disableActionLoader = (actionBack, actionTranslate, actionRephrase, actionLoad) => {
    if (!actionBack) return null;
    actionBack.classList.contains("action-hide")
      ? actionBack.classList.remove("action-hide")
      : null;
    if (!actionTranslate) return null;
    actionTranslate.classList.contains("action-hide")
      ? actionTranslate.classList.remove("action-hide")
      : null;
    if (!actionRephrase) return null;
    actionRephrase.classList.contains("action-hide")
      ? actionRephrase.classList.remove("action-hide")
      : null;

    // hide loader
    if (!actionLoad) return null;
    !actionLoad.classList.contains("action-hide")
      ? actionLoad.classList.add("action-hide")
      : null;

    return null;
  };

  /**
   * Sets field data from API to fieldId HTMLElement.
   *
   * @param {string} fieldId - fieldId of a field to change its value
   * @param {string} newValue - translated text
   *
   * @returns {null}
   */
  const setFieldData = (fieldId, newValue) => {
    const subfield = document.getElementsByClassName(fieldId)[0];

    const fieldTypeFull = Array.from(subfield.classList).find((className) =>
      className.startsWith("translade-type-"),
    );

    if (!fieldTypeFull) return null;

    const fieldType = String(fieldTypeFull).replaceAll("translade-type-", "");

    switch (fieldType) {
      case "string":
        setStringTypeValue(subfield, newValue);
        break;
      case "string_long":
        setStringLongTypeValue(subfield, newValue);
        break;
      case "text":
        setStringTypeValue(subfield, newValue);
        break;
      case "text_long":
        setTextLongValue(subfield, newValue);
        break;
      case "text_with_summary":
        setTextWithSummaryValue(subfield, newValue);
        break;
    }

    return null;
  };

  /**
   * Sets the history data for a fieldId.
   *
   * @param fieldId
   */
  const setHistoryData = (fieldId) => {
    const history = window.transladeHistory.history;
    // get the item that has fieldId className, it contains the type of field
    const subfield = document.getElementsByClassName(fieldId)[0];

    if (!subfield) return;

    const fieldTypeFull = Array.from(subfield.classList).find((className) =>
      className.startsWith("translade-type-"),
    );

    if (!fieldTypeFull) return;

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

    // create an object with key as fieldId and value as input
    if (!history[fieldId] || history[fieldId] === undefined) {
      history[fieldId.toString()] = [input];
    } else {
      if (history[fieldId.toString()].length >= window.transladeHistory.maximumHistoryLength) {
        // remove first element if the limit is reached
        history[fieldId.toString()].shift();
      }
      history[fieldId.toString()].push(input);
    }
    window.transladeHistory.history = history;
  }

  /**
   * Gets the last history record for a fieldId.
   *
   * @param fieldId
   * @returns {*|null}
   */
  const getLastHistoryRecord = (fieldId) => {
    const history = window.transladeHistory.history;

    if (!history) return null;
    if (!history[fieldId] || history[fieldId] === undefined) return null;

    // get the last item in the array
    const lastItem = history[fieldId][history[fieldId].length - 1];

    return lastItem;
  }

  /**
   * Restores the last item from history for a fieldId and sets it to the field.
   *
   * @param fieldId
   * @returns {null}
   */
  const restoreFromHistory = (fieldId) => {
    const hist = window.transladeHistory.history;

    if (!hist) return null;
    if (!hist[fieldId] || hist[fieldId] === undefined) return null;

    // get the last item in the array and remove it
    if (hist[fieldId].length > 1) {
      hist[fieldId].pop();
    }

    const lastItem = hist[fieldId][hist[fieldId].length - 1];
    window.transladeHistory.history = hist;

    // reuse fn to restore the data
    setFieldData(fieldId, lastItem);

    return null;
  }

  /**
   * Gets the value from String type value.
   *
   * @param {HTMLElement} subfield
   *
   * @returns {string}
   */
  const getStringTypeValue = (subfield) => {
    const input = subfield.querySelectorAll("input")[0];
    return String(input.value);
  };

  /**
   * Sets the value to String type value.
   *
   * @param {HTMLElement} subfield
   * @param {string} newValue
   *
   * @returns {string}
   */
  const setStringTypeValue = (subfield, newValue) => {
    const input = subfield.querySelectorAll("input")[0];
    input.value = String(newValue);
  };

  /**
   * Gets the value from StringLong type value.
   *
   * @param {HTMLElement} subfield
   *
   * @returns {string}
   */
  const getStringLongTypeValue = (subfield) => {
    const input = subfield.querySelectorAll("textarea")[0];
    return String(input.value);
  };

  /**
   * Sets the value to StringLong type value.
   *
   * @param {HTMLElement} subfield
   * @param {string} newValue
   *
   * @returns {string}
   */
  const setStringLongTypeValue = (subfield, newValue) => {
    const input = subfield.querySelectorAll("textarea")[0];
    input.value = String(newValue);
  };

  /**
   * Gets the value from TextWithSummary type value.
   *
   * @param {HTMLElement} subfield
   *
   * @returns {string}
   */
  const getTextWithSummaryValue = (subfield) => {
    let textWithSummary = subfield.querySelectorAll(".form-textarea-wrapper");
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
      textFieldWrapper.querySelectorAll("div.ck").length > 0;

    if (hasCKEditorEnabled) {
      const ckEditorValue =
        textFieldWrapper.querySelectorAll(".ck .ck.ck-content")[0];
      const summaryValue = summaryFieldWrapper !== null ? summaryFieldWrapper.querySelectorAll("textarea")[0] : "";

      return summaryValue.value + "|TRSLD_SPT|" + ckEditorValue.innerHTML;
    } else {
      const ckEditorValue = textFieldWrapper.querySelectorAll("textarea")[0];
      const summaryValue = summaryFieldWrapper !== null ? summaryFieldWrapper.querySelectorAll("textarea")[0] : "";

      return summaryValue.value + "|TRSLD_SPT|" + ckEditorValue.value;
    }
  };

  /**
   * Sets the value to TextWithSummary type value.
   *
   * @param {HTMLElement} subfield
   * @param {string} newValue
   *
   * @returns {string}
   */
  const setTextWithSummaryValue = (subfield, newValue) => {
    let textWithSummary = subfield.querySelectorAll(".form-textarea-wrapper");
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
      textFieldWrapper.querySelectorAll("div.ck").length > 0;

    if (hasCKEditorEnabled) {
      const summaryValue = summaryFieldWrapper ? summaryFieldWrapper.querySelectorAll("textarea")[0] : "";
      let newValueSplit = newValue.split("|TRSLD_SPT|");

      // use ckeditor instance to update the DOM
      const editorElement = textFieldWrapper.querySelector(
        ".ck-editor__editable",
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
      const ckEditorValue = textFieldWrapper.querySelectorAll("textarea")[0];
      const summaryValue = summaryFieldWrapper ? summaryFieldWrapper.querySelectorAll("textarea")[0] : null;

      let newValueSplit = newValue.split("|TRSLD_SPT|");

      if (summaryValue === null) {
        // e-commerce
        ckEditorValue.value = String(newValueSplit[1]);
      } else {
        summaryValue.value = String(newValueSplit[0]);
        ckEditorValue.value = String(newValueSplit[1]);
      }
    }
  };

  /**
   * Gets the value from TextLong type value.
   *
   * @param {HTMLElement} subfield
   *
   * @returns {string}
   */
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

  /**
   * Sets the value to TextLong type value.
   *
   * @param {HTMLElement} subfield
   * @param {string} newValue
   *
   * @returns {string}
   */
  const setTextLongValue = (subfield, newValue) => {
    let textWithSummary = subfield.querySelectorAll(".form-textarea-wrapper");
    let textFieldWrapper = textWithSummary[0];

    const hasCKEditorEnabled =
      textFieldWrapper.querySelectorAll("div.ck").length > 0;

    if (hasCKEditorEnabled) {
      // use ckeditor instance to update the dom
      const editorElement = textFieldWrapper.querySelector(
        ".ck-editor__editable",
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

  /**
   * Creates language select from config.
   *
   * @param {Object} config - Configuration object
   * @param {string} name - Name of an option
   * @param {string} id - ID of an option
   *
   * @returns {HTMLSelectElement}
   */
  const createLanguageOptionsSelect = (config, name, id) => {
    const select = document.createElement("select");
    select.id = id;
    select.name = name;

    config.languages.forEach((language, _) => {
      let values = language.split("|");
      select.innerHTML += getOptionTag(values[0], values[1], config.contentLanguage);
    });

    return select;
  };

  /**
   * Creates language options for select from config.
   *
   * @param {Object} value - Configuration object
   * @param {string} name - Name of an option
   * @param {string} currentLanguage - Current language of the content
   *
   * @returns {string} - NOTE: as string
   */
  const getOptionTag = (value, name, currentLanguage) => {
    // if (currentLanguage.toString() === value.toString()) return ""; Possibly not useful in Drupal context
    if (value.toString() === getSession().selectedLangId.toString()) {
      return `<option value="${value}" name="${name}" selected>${name}</option>`;
    } else {
      return `<option value="${value}" name="${name}">${name}</option>`;
    }
  };

  /**
   * Creates a div with all neccessary action elements
   *
   * @param {string} uid - uid of a collection
   *
   * @returns {HTMLDivElement}
   */
  const getTransladeActions = (uid) => {
    const actionsWrapper = document.createElement("div");
    actionsWrapper.classList.add("translade-actions-wrapper");

    const backIcon = document.createElement("img");
    backIcon.src = `${moduleDefaults.assetsFolder}/icons/back.svg`;
    backIcon.alt = "Back";

    const translateIcon = document.createElement("img");
    translateIcon.src = `${moduleDefaults.assetsFolder}/icons/translate.svg`;
    translateIcon.alt = "Translate";

    const rephraseIcon = document.createElement("img");
    rephraseIcon.src = `${moduleDefaults.assetsFolder}/icons/rephrase.svg`;
    rephraseIcon.alt = "Rephrase";

    const loaderIcon = document.createElement("span");
    loaderIcon.classList.add("loader");

    const aBack = document.createElement("a");
    aBack.classList.add(...["translade-action-trigger", "back"]);
    aBack.title = 'Back to previous text';
    aBack.dataset.targetField = uid;
    aBack.appendChild(backIcon);

    const aTranslate = document.createElement("a");
    aTranslate.classList.add(...["translade-action-trigger", "translate"]);
    aTranslate.dataset.targetField = uid;
    aTranslate.title = 'Translate text';
    aTranslate.appendChild(translateIcon);

    const aRephrase = document.createElement("a");
    aRephrase.classList.add(...["translade-action-trigger", "rephrase"]);
    aTranslate.dataset.targetField = uid;
    aRephrase.title = 'Rephrase text';
    aRephrase.appendChild(rephraseIcon);

    const aLoader = document.createElement("a");
    aLoader.classList.add(
      ...["translade-action-trigger", "load", "action-hide"],
    );
    aLoader.dataset.targetField = uid;
    aLoader.appendChild(loaderIcon);

    actionsWrapper.appendChild(aBack);
    actionsWrapper.appendChild(aTranslate);
    actionsWrapper.appendChild(aRephrase);
    actionsWrapper.appendChild(aLoader);

    return actionsWrapper;
  };

  const initializeSession = () => {
    const currentSession = window.sessionStorage.getItem(moduleDefaults.sessionName);
    if (!currentSession) {
      window.sessionStorage.setItem(moduleDefaults.sessionName, JSON.stringify(getSessionSettingsDefault()));
      return window.sessionStorage.getItem(moduleDefaults.sessionName);
    }

    return currentSession;
  }

  const getSessionSettingsDefault = () => {
    return {
      'selectedLangId': moduleDefaults.selectedLangIdDefault,
    }
  }

  const getSession = () => {
    const currentSession = window.sessionStorage.getItem(moduleDefaults.sessionName);
    if (!currentSession) return initializeSession();

    try {
      return JSON.parse(currentSession);
    } catch (e) {
      throw new Error("Session data is not valid JSON.");
    }
  }

  const setSession = (dataObject) => {
    if (!getSession()) throw new Error("Session is not initialized.");

    try {
      let data = JSON.stringify(dataObject);
      window.sessionStorage.setItem(moduleDefaults.sessionName, data);
    } catch (e) {
      throw new Error("Data object is not valid JSON.");
    }
  }

  const setSelectedLangId = (langId) => {
    let data = getSession();
    data.selectedLangId = langId;

    setSession(data);
  }
})(jQuery, Drupal, once);
