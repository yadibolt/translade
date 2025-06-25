<?php

namespace Drupal\translade\Provider;

use Drupal\Core\Config\ImmutableConfig;
use Drupal\translade\Interface\TransladeProvider;
use GuzzleHttp\Client;

class GoogleProvider implements TransladeProvider {
  private ImmutableConfig $config;
  private string $api_key;
  private string $model;
  private Client $client;

  public CONST DEFAULT_TEMPERATURE = 0;
  public CONST DEFAULT_MODEL = '';
  public CONST CHAT_ENDPOINT = '';
  public CONST MODELS_ENDPOINT = '';

  public function __construct() {
    $this->config = \Drupal::config('translade.settings') ?: [];
    $this->api_key = $this->config->get('google_api_key');
    $this->model = $this->config->get('google_model');
    $this->client = new Client([
      'base_uri' => '',
      'headers' => [
        'Authorization' => 'Bearer ' . trim($this->api_key),
        'Content-Type' => 'application/json',
        'Accept' => 'application/json',
      ],
      'verify' => true,
      'http_errors' => true,
    ]);
  }

  public function makeRequest(string $endpoint, string $method = 'GET', array $data = []): mixed {
    // TODO: Implement makeRequest() method.
    return [];
  }

  public function createChatRequestData(string $system_prompt, string $user_text): array {
    // TODO: Implement createChatRequestData() method.
    return [];
  }
  public function getModels(): bool|array {
    // TODO: Implement getModels() method.
    return [];
  }

  public function getDefaultModel(): string {
    if (empty($this->model)) {
      return self::DEFAULT_MODEL;
    }
    return $this->model;
  }
}
