<?php

namespace Drupal\translade\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\translade\OpenAIConnector;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class APIController extends ControllerBase {

  /**
   * Translates text using OpenAI API.
   * This is a callback function for API endpoint /translade/translate.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object containing the translation parameters.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   A JSON response containing the translated text or an error message.
   */
  public function translate(Request $request) {
    // get the JSON content from the request
    $content = json_decode($request->getContent(), TRUE);

    if (!$content) {
      return new JsonResponse(['error' => 'Invalid JSON data.'], 400);
    }

    $form_id = $content['form_id'] ?? '';
    $text = $content['text'] ?? '';
    $trigger_id = $content['trigger_id'] ?? '';
    $source_lang = $content['source_lang'] ?? '';
    $target_lang = $content['target_lang'] ?? '';
    
    // if any field is empty, return an error
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
        'messages' => [ // create 'conversation' array
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
      'chat/completions' // endpoint
    );

    if (!$response) {
      return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);
    }

    if (isset($response['choices'][0]['message']['content'])) {
      $translated_text = trim($response['choices'][0]['message']['content']);
    } else {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    // return the translated text as a JSON response
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