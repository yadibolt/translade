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
    new RendererController().renderActionsForFields();
    new EventListenerController().addEventListeners();
  };
})(Drupal, once);
