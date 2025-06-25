<?php

namespace Drupal\translade\Provider;

use Drupal\Core\Config\ImmutableConfig;
use Drupal\translade\Interface\TransladeProvider;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\HttpFoundation\JsonResponse;

class GoogleProvider implements TransladeProvider {
  private ImmutableConfig $config;
  private string $api_key;
  private string $model;
  private Client $client;

  public CONST DEFAULT_TEMPERATURE = 0;
  public CONST DEFAULT_MODEL = 'gemini-2.5-flash';
  public CONST CHAT_ENDPOINT = 'v1beta/models/@modelname:generateContent';
  public CONST MODELS_ENDPOINT = 'v1beta/models';

  public function __construct() {
    $this->config = \Drupal::config('translade.settings') ?: [];
    $this->api_key = $this->config->get('google_api_key') ?: '';
    $this->model = $this->config->get('google_model') ?: self::DEFAULT_MODEL;
    $this->client = new Client([
      'base_uri' => 'https://generativelanguage.googleapis.com/',
      'headers' => [
        'Content-Type' => 'application/json',
        'Accept' => 'application/json',
      ],
      'verify' => true,
      'http_errors' => true,
    ]);
  }

  public function makeRequest(string $endpoint, string $method = 'GET', array $data = [], array $query_params = []): mixed {
    if (empty($this->api_key)) {
      \Drupal::logger('translade')->error('Google API key is not set in the configuration. Please set it in the Translade settings.');
      return new JsonResponse("Requested resource needs valid API key.", 400);
    }

    // Google's chat endpoint model is being replaced with the selected one
    if (strpos($endpoint, '@modelname') !== false) {
      $endpoint = str_replace('@modelname', $this->getDefaultModel(), $endpoint);
    }

    $options = [];
    if ($method === 'POST' && !empty($data)) {
      $options['json'] = $data;
    }

    if (!empty($query_params)) {
      $params = [];
      foreach ($query_params as $key => $value) {
        $params[] = urlencode($key) . '=' . urlencode($value);
      }
      $params = '&' . implode('&', $params);
    } else {
      $params = '';
    }

    try {
      $response = $this->client->request($method, $endpoint . '?key=' . trim($this->api_key) . $params, $options);
      $response_body = (string) $response->getBody();

      return json_decode($response_body, true);
    } catch (RequestException $e) {
      \Drupal::logger('translade')->error("Requested resource ran into an exception: " . $e->getMessage());
    } catch (GuzzleException $e) {
      \Drupal::logger('translade')->error("Requested resource ran into Guzzle exception: " . $e->getMessage());
    }

    return false;
  }

  public function createChatRequestData(string $system_prompt, string $user_text): array {
    return [
      'system_instruction' => ['parts' => [['text' => $system_prompt]]],
      'contents' => [['parts' => [['text' => $user_text]]]],
      'generationConfig' => ["temperature" => self::DEFAULT_TEMPERATURE],
    ];
  }

  public function processChatResponse(array $response): string|null {
    $response_text = $response['candidates'][0]['content']['parts'][0]['text'];
    if (!empty($response_text)) {
      return $response_text;
    }

    return null;
  }

  public function getModels(): bool|array {
    $response = $this->makeRequest(self::MODELS_ENDPOINT);

    if (isset($response['models']) && is_array($response['models'])) {
      return $response['models'];
    } else {
      \Drupal::logger('translade')->error("Failed to fetch available models from Google API.");
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
