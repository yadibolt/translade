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
            'base_uri' => 'https://api.openai.com/v1/',
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
    public function executeRequest(\GuzzleHttp\Client $connection, $method = 'GET', $data = [], $endpoint = "models") {
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
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            \Drupal::logger('translade')->error('OpenAI API request failed: @message', [
                '@message' => $e->getMessage()
            ]);
            return false;
        }
    }

    public function getModel() {
        $config = \Drupal::config('translade.settings');
        $model = $config->get('model');
        if (empty($model)) {
            return 'gpt-4o-mini';
        }
        return $model;
    }

    /**
     * Returns the OpenAI available models or false if the API key is not set.
     *
     * @return array|false
     */
    public function getAvailableModels() {
        $openai_connection = $this->makeConnection();
        if (!$openai_connection) {
            return false;
        }

        $response = $this->executeRequest($openai_connection, 'GET', []);
        if (isset($response['data']) && is_array($response['data'])) {
            return $response['data'];
        }
    }

    public function formatTranslationPrompt($prompt, $source_lang, $target_lang) {
        $formatted_prompt = str_replace('@source_lang', strtoupper($source_lang), $prompt);
        $formatted_prompt = str_replace('@target_lang', strtoupper($target_lang), $formatted_prompt);

        return $formatted_prompt;
    }

    public function getTranslationPrompt() {
        $config = \Drupal::config('translade.settings');
        $override_prompt = $config->get('override_prompt');
        if (!empty($override_prompt)) {
            return $override_prompt;
        }

        // Override prompt is not set, fallback to default.
        return "You are a helpful translation assistant.
        Your task is to translate the following content from @source_lang to @target_lang.
        Do not translate |TRSLD_SPT| to anything else, it is a special tag that should remain unchanged.

        - Translate only the text content; do not modify or remove any HTML tags, special characters, or formatting.
        - Do not prepend or append any extra text to the translation.
        - The translation must be accurate and preserve the original meaning.
        - Pay close attention to proper nouns like names, places, or organizations—they are often Slovak and may remain untranslated.
        ";
    }
}