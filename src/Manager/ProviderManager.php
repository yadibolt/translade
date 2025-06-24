<?php

namespace Drupal\translade\Manager;

use Drupal\Core\Config\ImmutableConfig;
use Drupal\translade\Provider\GoogleProvider;
use Drupal\translade\Provider\OpenAIProvider;

class ProviderManager {
  private ImmutableConfig $config;
  private CONST DEFAULT_PROVIDERS = [
    'openai' => 'OpenAI',
    'google' => 'Google',
  ];

  public function __construct() {
    $this->config = \Drupal::config('translade.settings');
  }

  public static function getProvider(): OpenAIProvider|GoogleProvider|null {
    $config = \Drupal::config('translade.settings');
    return match ($config->get('provider_name') ?: 'openai') {
      'openai' => new OpenAIProvider(),
      'google' => new GoogleProvider(),
      default => null,
    };
  }

  public static function getProviders(): array {
    return self::DEFAULT_PROVIDERS;
  }

  public function checkAnyAPIKeyExists(): bool {
    return !empty($this->config->get('openai_api_key')) || !empty($this->config->get('google_api_key'));
  }

  public function checkSelectedProvider(): bool {
    $provider_name = $this->config->get('provider_name') ?: 'openai';

    return !empty($this->config->get($provider_name . '_api_key'));
  }
}
