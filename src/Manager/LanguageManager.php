<?php

namespace Drupal\translade\Manager;

use Drupal\Core\Config\ConfigBase;
use Drupal\Core\Config\ImmutableConfig;

class LanguageManager extends ConfigBase {
  private ImmutableConfig $config;
  private CONST DEFAULT_LANGUAGE = 'English';

  public function __construct() {
    $this->config = \Drupal::config('translade.settings');
  }

  public function getLangFromId(string $lang_id): string {
    $config_languages = $this->config->get('languages');

    if (empty($config_languages)) return self::DEFAULT_LANGUAGE;

    $languages_arr = explode(',', $config_languages);

    foreach ($languages_arr as $language) {
      if (str_starts_with(strtolower($language), strtolower($lang_id))) {
        return explode(':', $language)[1];
      }
    }

    return self::DEFAULT_LANGUAGE;
  }
}
