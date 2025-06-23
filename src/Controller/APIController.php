<?php

namespace Drupal\translade\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\translade\Connector\OpenAIConnector;
use Drupal\translade\Manager\PromptManager;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
class APIController extends ControllerBase {

  public function __construct() {}

  public function translate(Request $request): JsonResponse {
    $openai_connector = new OpenAIConnector();
    $prompt_manager = new PromptManager();

    $content = json_decode($request->getContent(), TRUE);

    if (!$content) return new JsonResponse(['error' => 'Invalid JSON data.'], 400);

    $form_id = $content['form_id'] ?? '';
    $text = $content['text'] ?? '';
    $trigger_id = $content['trigger_id'] ?? '';
    $source_lang = $content['source_lang'] ?? '';
    $target_lang = $content['target_lang'] ?? '';

    if (empty($form_id) || empty($text) || empty($source_lang) || empty($target_lang) || empty($trigger_id)) {
      return new JsonResponse(['error' => 'Missing required parameters'], 400);
    }

    $prompt = $prompt_manager->getTranslationPrompt([
      '@source_lang' => $source_lang,
      '@target_lang' => $target_lang,
    ]);

    $data = [
      'model' => $openai_connector->getDefaultModel(),
      'temperature' => 0,
      'messages' => [
        [
          'role' => 'system',
          'content' => $prompt,
        ],
        [
          'role' => 'user',
          'content' => $text,
        ],
      ]
    ];
    $response = $openai_connector->makeRequest('chat/completions', 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    if (isset($response['choices'][0]['message']['content'])) {
      $translated_text = trim($response['choices'][0]['message']['content']);
    } else {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'translated_text' => $translated_text,
      'form_id' => $form_id,
      'source_lang' => $source_lang,
      'target_lang' => $target_lang,
      'trigger_id' => $trigger_id,
      'timestamp' => time(),
    ], 200);
  }

  public function rephrase(Request $request): JsonResponse {
    $openai_connector = new OpenAIConnector();
    $prompt_manager = new PromptManager();

    $content = json_decode($request->getContent(), TRUE);

    if (!$content) return new JsonResponse(['error' => 'Invalid JSON data.'], 400);

    $form_id = $content['form_id'] ?? '';
    $text = $content['text'] ?? '';
    $trigger_id = $content['trigger_id'] ?? '';
    $source_lang = $content['source_lang'] ?? '';

    if (empty($form_id) || empty($text) || empty($source_lang) || empty($trigger_id)) {
      return new JsonResponse(['error' => 'Missing required parameters'], 400);
    }

    $prompt = $prompt_manager->getRephrasePrompt();

    $data = [
      'model' => $openai_connector->getDefaultModel(),
      'temperature' => 0,
      'messages' => [
        [
          'role' => 'system',
          'content' => $prompt,
        ],
        [
          'role' => 'user',
          'content' => $text,
        ],
      ]
    ];
    $response = $openai_connector->makeRequest('chat/completions', 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    if (isset($response['choices'][0]['message']['content'])) {
      $rephrased_text = trim($response['choices'][0]['message']['content']);
    } else {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'rephrased_text' => $rephrased_text,
      'form_id' => $form_id,
      'source_lang' => $source_lang,
      'trigger_id' => $trigger_id,
      'timestamp' => time(),
    ], 200);
  }
}
