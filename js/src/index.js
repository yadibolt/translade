import ConfigurationManager from "./Manager/ConfigurationManager";
import SessionManager from "./Manager/SessionManager";
import RendererController from "./Controllers/RendererController";
import EventListenerController from "./Controllers/EventListenerController";

(function (Drupal, once) {
  "use strict";

  Drupal.behaviors.translade = {
    attach: function (context, settings) {
      once("translade", "body", context).forEach(function () {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", initModuleScript);
        } else {
          initModuleScript();
        }
      });
    },
  };

  const initModuleScript = () => {
    let rendererController = new RendererController();

    window.transladeConfig = new ConfigurationManager().initConfiguration();
    window.transladeInputControl = { suspend: false };

    new SessionManager().initSession();
    rendererController.renderActionsForFields();
    new EventListenerController().addEventListeners();
  };
})(Drupal, once);
