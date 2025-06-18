<?php

namespace Drupal\translade\Connector;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;

class OpenAIConnector {
    /**
     * Creates a Guzzle HTTP client connection to the OpenAI API.
     *
     * @return Client|false
     *   Returns a Guzzle HTTP client if the API key is set, otherwise false
     */
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

    /**
     * Executes a request to the OpenAI API.
     * It is used to primarily send requests to the OpenAI API for translations
     * and to fetch model list.
     *
     * @param Client $connection
     *   The Guzzle HTTP client connection
     * @param string $method
     *   The HTTP method to use
     * @param array $data
     *   The data to send with the request e.g. JSON payload
     *
     * @return array|false
     *   Returns the response as an associative array or false on failure
     */
    public function executeRequest(Client $connection, string $method = 'GET', array $data = [], $endpoint = "models"): bool|array {
        try {
            // set the options headers
            $options = [
                'headers' => [
                    'Accept' => 'application/json',
                ],
            ];

            // we add body if the method is not GET
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
     * Returns currently used model that is set in the Drupal configuration.
     *
     * @return string
     *   The model name or 'gpt-4o-mini' as default if not set.
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
     * Returns the OpenAI available models or false if the API key is not set.
     * Note: This method fetches all the models, since there is no option to filter them by type.
     * Make sure you select Language model and not any other type of model.
     * You can look them up here: https://platform.openai.com/docs/models/overview
     *
     * @return array|false
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
