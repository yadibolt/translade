<?php

namespace Drupal\translade\Provider;

use Drupal\Core\Config\ImmutableConfig;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\translade\Interface\TransladeProvider;

class OpenAIProvider implements TransladeProvider {
  private ImmutableConfig $config;
  private string $api_key;
  private string $model;
  private Client $client;

  public CONST DEFAULT_TEMPERATURE = 0;
  public CONST DEFAULT_MODEL = 'gpt-4o-mini';
  public CONST CHAT_ENDPOINT = 'chat/completions';
  public CONST MODELS_ENDPOINT = 'models';

  public function __construct() {
    $this->config = \Drupal::config('translade.settings') ?: [];
    $this->api_key = $this->config->get('openai_api_key');
    $this->model = $this->config->get('openai_model');
    $this->client = new Client([
      'base_uri' => 'https://api.openai.com/v1/',
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
    if (!$this->api_key) {
      \Drupal::logger('translade')->error('OpenAI API key is not set in the configuration. Please set it in the Translade settings.');
      return new JsonResponse("Requested resource needs valid API key.", 400);
    }

    $options = [];
    if ($method === 'POST' && !empty($data)) {
      $options['json'] = $data;
    }

    try {
      $response = $this->client->request($method, $endpoint, $options);
      $response_body = (string) $response->getBody();

      return json_decode($response_body, true);
    } catch (RequestException $e) {
      \Drupal::logger('translade')->error("Requested resource ran into an exception: " . serialize($e));
    } catch (GuzzleException $e) {
      \Drupal::logger('translade')->error("Requested resource ran into Guzzle exception: " . serialize($e));
    }

    return false;
  }

  public function createChatRequestData(string $system_prompt, string $user_text): array {
    return [
      'model' => self::DEFAULT_MODEL,
      'temperature' => self::DEFAULT_TEMPERATURE,
      'messages' => [
        [
          'role' => 'system',
          'content' => $system_prompt,
        ],
        [
          'role' => 'user',
          'content' => $user_text,
        ],
      ]
    ];
  }

  public function processChatResponse(array $response): string|null {
    if (isset($response['choices'][0]['message']['content'])) {
      return trim($response['choices'][0]['message']['content']);
    }

    return null;
  }

  public function getModels(): bool|array {
    $response = $this->makeRequest(self::MODELS_ENDPOINT);

    if (isset($response['data']) && is_array($response['data'])) {
      return $response['data'];
    } else {
      \Drupal::logger('translade')->error('Failed to fetch available models from OpenAI API.');
      return false;
    }
  }

  public function getDefaultModel(): string {
    if (empty($this->model)) {
      return self::DEFAULT_MODEL;
    }
    return $this->model;
  }
}
