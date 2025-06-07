<?php

namespace Drupal\translade;

use Drupal\Core\Config\ConfigFactoryInterface;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class OpenAIConnector {
    /**
     * Creates a Guzzle HTTP client connection to the OpenAI API.
     *
     * @param string $endpoint
     *   The API endpoint to connect to.
     *
     * @return \GuzzleHttp\Client|false
     *   Returns a Guzzle HTTP client if the API key is set, otherwise false.
     */
    public function makeConnection($endpoint = '') {
        $config = \Drupal::config('translade.settings');
        $api_key = $config->get('api_key');
        if (empty($api_key)) {
            return false;
        }

        $client = new \GuzzleHttp\Client([
            'base_uri' => 'https://api.openai.com/v1/' . $endpoint,
            'headers' => [
                'Authorization' => 'Bearer ' . trim($api_key),
                'Content-Type' => 'application/json',
            ],
            'verify' => true,
            'http_errors' => true,
        ]);

        return $client;
    }

    /**
     * Executes a request to the OpenAI API.
     *
     * @param \GuzzleHttp\Client $connection
     *   The Guzzle HTTP client connection.
     * @param string $method
     *   The HTTP method to use (GET, POST, etc.).
     * @param array $data
     *   The data to send with the request.
     *
     * @return array|false
     *   Returns the response as an associative array or false on failure.
     */
    public function executeRequest(\GuzzleHttp\Client $connection, $method = 'GET', $data = []) {
        try {
            $options = [
                'headers' => [
                    'Accept' => 'application/json',
                ],
            ];

            if ($method !== 'GET' && !empty($data)) {
                $options['json'] = $data;
            }
            
            $request_response = $connection->request($method, 'models', $options);
            $response_body = (string) $request_response->getBody();
            return json_decode($response_body, true);
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            \Drupal::logger('translade')->error('OpenAI API request failed: @message', [
                '@message' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Returns the OpenAI available models or false if the API key is not set.
     *
     * @return array|false
     */
    public function getAvailableModels() {
        $openai_connection = $this->makeConnection('models');
        if (!$openai_connection) {
            return false;
        }

        $response = $this->executeRequest($openai_connection, 'GET', []);
        if (isset($response['data']) && is_array($response['data'])) {
            return $response['data'];
        }
    }
}