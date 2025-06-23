<?php

namespace Drupal\translade\Connector;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\HttpFoundation\JsonResponse;

class OpenAIConnector {

  public function __construct() {}

  public function makeRequest(string $endpoint, string $method = 'GET', array $data = []): mixed {
    $config = \Drupal::config('translade.settings');
    $api_key = $config->get('openai_api_key');

    if (!$api_key) {
      \Drupal::logger('translade')->error('OpenAI API key is not set in the configuration. Please set it in the Translade settings.');
      return new JsonResponse("Requested resource needs valid API key.", 400);
    }

    $options = [];
    $client = new Client([
      'base_uri' => 'https://api.openai.com/v1/',
      'headers' => [
        'Authorization' => 'Bearer ' . trim($api_key),
        'Content-Type' => 'application/json',
        'Accept' => 'application/json',
      ],
      'verify' => true,
      'http_errors' => true,
    ]);
    if ($method === 'POST' && !empty($data)) {
      $options['json'] = $data;
    }

    try {
      $response = $client->request($method, $endpoint, $options);
      $response_body = (string) $response->getBody();

      return json_decode($response_body, true);
    } catch (RequestException $e) {
      \Drupal::logger('translade')->error("Requested resource ran into an exception: " . serialize($e));
    } catch (GuzzleException $e) {
      \Drupal::logger('translade')->error("Requested resource ran into Guzzle exception: " . serialize($e));
    }

    return false;
  }

  public function getOpenAIModels(): bool|array {
    $response = $this->makeRequest('models', 'GET');

    if (isset($response['data']) && is_array($response['data'])) {
      return $response['data'];
    } else {
      \Drupal::logger('translade')->error('Failed to fetch available models from OpenAI API.');
      return false;
    }
  }

  public function getDefaultModel(): string {
    $config = \Drupal::config('translade.settings');
    $model = $config->get('openai_model');
    if (empty($model)) {
      return 'gpt-4o-mini';
    }
    return $model;
  }
}
