<?php

namespace Drupal\translade\Connector;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;

class OpenAIConnector {

  public function __construct() {}

  public function makeConnection(): bool|Client {
    $config = \Drupal::config('translade.settings');
    $api_key = $config->get('api_key');

    if (empty($api_key)) {
      \Drupal::logger('translade')->error('API key is not set in the configuration. Please set it in the Translade settings.');
      return false;
    }

    return new Client([
      'base_uri' => 'https://api.openai.com/v1/',
      'headers' => [
        'Authorization' => 'Bearer ' . trim($api_key),
        'Content-Type' => 'application/json',
      ],
      'verify' => true,
      'http_errors' => true,
    ]);
  }


  public function executeRequest(Client $connection, string $method = 'GET', array $data = [], $endpoint = "models"): bool|array {
    try {
      $options = [
        'headers' => [
          'Accept' => 'application/json',
        ],
      ];

      if ($method !== 'GET' && !empty($data)) {
        $options['json'] = $data;
      }

      $request_response = $connection->request($method, $endpoint, $options);
      $response_body = (string) $request_response->getBody();

      return json_decode($response_body, true);
    } catch (RequestException $e) {
      \Drupal::logger('translade')->error('OpenAI API request failed: @message', [
        '@message' => $e->getMessage()
      ]);

      return false;
    } catch (GuzzleException $e) {
      \Drupal::logger('translade')->error('OpenAI API request failed: @message', [
        '@message' => $e->getMessage()
      ]);

      return false;
    }
  }

  /**
   * @return string
   */
  public function getModel(): string {
    $config = \Drupal::config('translade.settings');
    $model = $config->get('model');
    if (empty($model)) {
      return 'gpt-4o-mini';
    }
    return $model;
  }

  /**
   * @return bool|array
   */
  public function getAvailableModels(): bool|array {
    $openai_connection = $this->makeConnection();

    if (!$openai_connection) {
      \Drupal::logger('translade')->error('Failed to create OpenAI connection. Please check your API key.');

      return false;
    }

    $response = $this->executeRequest($openai_connection, 'GET', []);
    if (isset($response['data']) && is_array($response['data'])) {
      return $response['data'];
    } else {
      \Drupal::logger('translade')->error('Failed to fetch available models from OpenAI API.');
      return false;
    }
  }
}
