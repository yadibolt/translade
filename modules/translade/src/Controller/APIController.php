<?php

namespace Drupal\translade\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\translade\OpenAIConnector;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class APIController extends ControllerBase {

  public function translate(Request $request) {
    $content = json_decode($request->getContent(), TRUE);

    if (!$content) {
      return new JsonResponse(['error' => 'Invalid JSON data'], 400);
    }

    $form_id = $content['form_id'] ?? '';
    $text = $content['text'] ?? '';
    $trigger_id = $content['trigger_id'] ?? '';
    $source_lang = $content['source_lang'] ?? '';
    $target_lang = $content['target_lang'] ?? '';
    
    if (empty($form_id) || empty($text) || empty($source_lang) || empty($target_lang) || empty($trigger_id)) {
      return new JsonResponse(['error' => 'Missing required parameters'], 400);
    }

    $connector = new OpenAIConnector();
    $prompt = $connector->formatTranslationPrompt(
      $connector->getTranslationPrompt(), 
      $source_lang, 
      $target_lang
    );

    $response = $connector->executeRequest(
      $connector->makeConnection(), 
      'POST', 
      [
        'model' => $connector->getModel(),
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
      ],
      'chat/completions'
    );

    if (!$response) {
      return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);
    }

    // log the response
    \Drupal::logger('translade')->debug('OpenAI API response: @response', [
      '@response' => print_r($response, TRUE)
    ]);

    if (isset($response['choices'][0]['message']['content'])) {
      $translated_text = trim($response['choices'][0]['message']['content']);
    } else {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    // Return the translated text as a JSON response
    return new JsonResponse([
      'status' => 'ok',
      'translated_text' => $translated_text,
      'form_id' => $form_id,
      'source_lang' => $source_lang,
      'target_lang' => $target_lang,
      'trigger_id' => $trigger_id,
      'timestamp' => time(),
    ]);
  }

}