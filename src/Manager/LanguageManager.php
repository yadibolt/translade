<?php

namespace Drupal\translade\Manager;

use Drupal\Core\Config\ConfigBase;

class LanguageManager extends ConfigBase {
  
  public function __construct() {}

  public function getLangFromId(string $lang_id): string {
    $config = \Drupal::config('translade.settings') ?: [];
    $config_languages = $config->get('languages');

    if (empty($config_languages)) return 'English';

    $languages_arr = explode(',', $config_languages);

    foreach ($languages_arr as $language) {
      if (str_starts_with(strtolower($language), strtolower($lang_id))) {
        return explode(':', $language)[1];
      }
    }

    return "English";
  }
}
