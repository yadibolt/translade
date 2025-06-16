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
     * @return \GuzzleHttp\Client|false
     *   Returns a Guzzle HTTP client if the API key is set, otherwise false
     */
    public function makeConnection() {
        $config = \Drupal::config('translade.settings');
        $api_key = $config->get('api_key');

        if (empty($api_key)) {
            \Drupal::logger('translade')->error('API key is not set in the configuration. Please set it in the Translade settings.');
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
     * It is used to primarily send requests to the OpenAI API for translations
     * and to fetch model list.
     *
     * @param \GuzzleHttp\Client $connection
     *   The Guzzle HTTP client connection
     * @param string $method
     *   The HTTP method to use
     * @param array $data
     *   The data to send with the request e.g. JSON payload
     *
     * @return array|false
     *   Returns the response as an associative array or false on failure
     */
    public function executeRequest(\GuzzleHttp\Client $connection, $method = 'GET', $data = [], $endpoint = "models") {
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
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            \Drupal::logger('translade')->error('OpenAI API request failed: @message', [
                '@message' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Returns currently used model that is set in the Drupal configuration.
     *
     * @return string|null
     *   The model name or 'gpt-4o-mini' as default if not set.
     */
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
     * Note: This method fetches all the models, since there is no option to filter them by type.
     * Make sure you select Language model and not any other type of model.
     * You can look them up here: https://platform.openai.com/docs/models/overview
     *
     * @return array|false
     */
    public function getAvailableModels() {
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

    /**
     * Formats the translation prompt by replacing placeholders with actual values.
     *
     * @param string $prompt
     *   The prompt template with placeholders.
     * @param string $source_lang
     *   The source language code.
     * @param string $target_lang
     *   The target language code.
     *
     * @return string
     *   The formatted prompt.
     */
    public function formatTranslationPrompt($prompt, $source_lang, $target_lang): string {
        $formatted_prompt = str_replace('@source_lang', strtoupper($source_lang), $prompt);
        $formatted_prompt = str_replace('@target_lang', strtoupper($target_lang), $formatted_prompt);

        return $formatted_prompt;
    }

  /**
   * Formats the rephrase prompt by replacing the source language placeholder.
   *
   * @param $prompt
   * @param $source_lang
   * @return string
   */
    public function formatRephrasePrompt($prompt, $source_lang): string {
        return str_replace('@source_lang', strtoupper($source_lang), $prompt);
    }

    /**
     * Returns the translation prompt from the configuration.
     * If the override prompt is set, that will be returned instead.
     *
     * @return string
     *   The translation prompt.
     */
    public function getTranslationPrompt(): string {
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

  /**
   * Returns the rephrase prompt.
   *
   * @return string
   */
    public function getRephrasePrompt(): string {
      // TODO add more comprehensive prompt for rephrasing
      return "Rephrase the following text in @source_lang without changing its meaning. The language is @source_lang.
      Do not change |TRSLD_SPT| to anything else, it is a special tag that should remain unchanged.";
    }
}
