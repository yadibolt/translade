import ExceptionManager from "./ExceptionManager";

import { getById } from "../Util/DocumentUtil";

export default class ConfigurationManager {
  constructor() {}

  initConfiguration() {
    const configuration = getById("translade-shadow-root-config");
    const configurationValue = String(configuration.value);
    if (configurationValue.length <= 0)
      return new ExceptionManager().throwException(
        "Configuration is empty.",
        null,
        null,
      );

    try {
      const parsedConfiguration = JSON.parse(configurationValue.trim());
      if (typeof parsedConfiguration !== "object") {
        return new ExceptionManager().throwException(
          "Parsed configuration is not an object.",
          null,
          null,
        );
      }

      configuration.remove();

      let contentAIActions = [];
      if (Array.isArray(parsedConfiguration.content_ai_actions))
        contentAIActions = parsedConfiguration.content_ai_actions;

      return {
        languages: String(parsedConfiguration.languages).trim().split(","),
        contentLanguage: String(parsedConfiguration.content_language).trim(),
        darkTheme: Boolean(parsedConfiguration.dark_theme),
        contentAIActions: contentAIActions,
        formId: String(parsedConfiguration.form_id),
        history: {},
      };
    } catch (e) {
      return new ExceptionManager().throwException(
        "Tried to parse invalid JSON configuration.",
        e,
        null,
      );
    }
  }
}
