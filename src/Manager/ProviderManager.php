<?php

namespace Drupal\translade\Manager;

class ProviderManager {
  public function __construct() {}

  public function checkAnyAPIKeyExists(): bool {
    $config = \Drupal::config('translade.settings');
    return !empty($config->get('openai_api_key')) || !empty($config->get('google_api_key'));
  }

  public function checkSelectedProvider(): bool {
    $config = \Drupal::config('translade.settings');
    $provider_name = $config->get('provider_name') ?: 'openai';

    return !empty($config->get($provider_name . '_api_key'));
  }
}
