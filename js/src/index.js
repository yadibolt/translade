import ConfigurationManager from "./Manager/ConfigurationManager";
import SessionManager from "./Manager/SessionManager";
import RendererController from "./Controllers/RendererController";
import EventListenerController from "./Controllers/EventListenerController";
import LanguageManager from "./Manager/LanguageManager";

(function (Drupal, once) {
  "use strict";

  Drupal.behaviors.translade = {
    attach: function (context, settings) {
      once("translade", "body", context).forEach(async function () {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", initModuleScript);
        } else {
          await initModuleScript();
        }
      });
    },
  };

  const initModuleScript = async () => {
    window.transladeConfig = new ConfigurationManager().initConfiguration();
    new SessionManager().initSession();
    await new LanguageManager().setTranslationSet(window.transladeConfig.contentLanguage.toString());

    switch (window.transladeConfig.renderMode) {
      case 'node_edit':
      case 'node_create':
      case 'taxonomy':
        new RendererController().renderActionsForFields();
        new EventListenerController().addEventListeners();
        break;
      case 'translation_table':
        new RendererController().renderActionsForTranslationTableFields();
        new EventListenerController().addEventListenersForTranslationTable();
        break;
    }
  };
})(Drupal, once);
