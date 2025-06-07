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
        });
      });
    },
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
