<?php

namespace Drupal\translade\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\translade\Manager\ProviderManager;
use Drupal\translade\Provider\GoogleProvider;
use Drupal\translade\Provider\OpenAIProvider;
use Drupal\translade\Manager\PromptManager;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
class APIController extends ControllerBase {
  private OpenAIProvider|GoogleProvider $provider;
  private PromptManager $prompt_manager;

  public function __construct() {
    $this->provider = ProviderManager::getProvider();
    $this->prompt_manager = new PromptManager();
  }

  public function translate(Request $request): JsonResponse {
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

    $prompt = $this->prompt_manager->getTranslationPrompt([
      '@source_lang' => $source_lang,
      '@target_lang' => $target_lang,
    ]);

    $data = [
      'model' => $this->provider->getDefaultModel(),
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
    $response = $this->provider->makeRequest('chat/completions', 'POST', $data);

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
    $content = json_decode($request->getContent(), TRUE);

    if (!$content) return new JsonResponse(['error' => 'Invalid JSON data.'], 400);

    $form_id = $content['form_id'] ?? '';
    $text = $content['text'] ?? '';
    $trigger_id = $content['trigger_id'] ?? '';
    $source_lang = $content['source_lang'] ?? '';

    if (empty($form_id) || empty($text) || empty($source_lang) || empty($trigger_id)) {
      return new JsonResponse(['error' => 'Missing required parameters'], 400);
    }

    $prompt = $this->prompt_manager->getRephrasePrompt();

    $data = [
      'model' => $this->provider->getDefaultModel(),
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
    $response = $this->provider->makeRequest('chat/completions', 'POST', $data);

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

  public function checkGrammar(Request $request): JsonResponse {
    $content = json_decode($request->getContent(), TRUE);

    if (!$content) return new JsonResponse(['error' => 'Invalid JSON data.'], 400);

    $form_id = $content['form_id'] ?? '';
    $text = $content['text'] ?? '';
    $trigger_id = $content['trigger_id'] ?? '';
    $source_lang = $content['source_lang'] ?? '';

    if (empty($form_id) || empty($text) || empty($source_lang) || empty($trigger_id)) {
      return new JsonResponse(['error' => 'Missing required parameters'], 400);
    }

    $prompt = $this->prompt_manager->getCheckGrammarPrompt();

    $data = [
      'model' => $this->provider->getDefaultModel(),
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
    $response = $this->provider->makeRequest('chat/completions', 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    if (isset($response['choices'][0]['message']['content'])) {
      $checked_text = trim($response['choices'][0]['message']['content']);
    } else {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'checked_text' => $checked_text,
      'form_id' => $form_id,
      'source_lang' => $source_lang,
      'trigger_id' => $trigger_id,
      'timestamp' => time(),
    ], 200);
  }

  public function summarize(Request $request): JsonResponse {
    $content = json_decode($request->getContent(), TRUE);

    if (!$content) return new JsonResponse(['error' => 'Invalid JSON data.'], 400);

    $form_id = $content['form_id'] ?? '';
    $text = $content['text'] ?? '';
    $trigger_id = $content['trigger_id'] ?? '';
    $source_lang = $content['source_lang'] ?? '';

    if (empty($form_id) || empty($text) || empty($source_lang) || empty($trigger_id)) {
      return new JsonResponse(['error' => 'Missing required parameters'], 400);
    }

    $prompt = $this->prompt_manager->getSummarizePrompt();

    $data = [
      'model' => $this->provider->getDefaultModel(),
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
    $response = $this->provider->makeRequest('chat/completions', 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    if (isset($response['choices'][0]['message']['content'])) {
      $summarized_text = trim($response['choices'][0]['message']['content']);
    } else {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'summarized_text' => $summarized_text,
      'form_id' => $form_id,
      'source_lang' => $source_lang,
      'trigger_id' => $trigger_id,
      'timestamp' => time(),
    ], 200);
  }

  public function expandContent(Request $request): JsonResponse {
    $content = json_decode($request->getContent(), TRUE);

    if (!$content) return new JsonResponse(['error' => 'Invalid JSON data.'], 400);

    $form_id = $content['form_id'] ?? '';
    $text = $content['text'] ?? '';
    $trigger_id = $content['trigger_id'] ?? '';
    $source_lang = $content['source_lang'] ?? '';

    if (empty($form_id) || empty($text) || empty($source_lang) || empty($trigger_id)) {
      return new JsonResponse(['error' => 'Missing required parameters'], 400);
    }

    $prompt = $this->prompt_manager->getExpandContentPrompt();

    $data = [
      'model' => $this->provider->getDefaultModel(),
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
    $response = $this->provider->makeRequest('chat/completions', 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    if (isset($response['choices'][0]['message']['content'])) {
      $expanded_text = trim($response['choices'][0]['message']['content']);
    } else {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'expanded_text' => $expanded_text,
      'form_id' => $form_id,
      'source_lang' => $source_lang,
      'trigger_id' => $trigger_id,
      'timestamp' => time(),
    ], 200);
  }

  public function shortenContent(Request $request): JsonResponse {
    $content = json_decode($request->getContent(), TRUE);

    if (!$content) return new JsonResponse(['error' => 'Invalid JSON data.'], 400);

    $form_id = $content['form_id'] ?? '';
    $text = $content['text'] ?? '';
    $trigger_id = $content['trigger_id'] ?? '';
    $source_lang = $content['source_lang'] ?? '';

    if (empty($form_id) || empty($text) || empty($source_lang) || empty($trigger_id)) {
      return new JsonResponse(['error' => 'Missing required parameters'], 400);
    }

    $prompt = $this->prompt_manager->getShortenContentPrompt();

    $data = [
      'model' => $this->provider->getDefaultModel(),
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
    $response = $this->provider->makeRequest('chat/completions', 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    if (isset($response['choices'][0]['message']['content'])) {
      $shortened_text = trim($response['choices'][0]['message']['content']);
    } else {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'shortened_text' => $shortened_text,
      'form_id' => $form_id,
      'source_lang' => $source_lang,
      'trigger_id' => $trigger_id,
      'timestamp' => time(),
    ], 200);
  }

  public function changeToneProfessional(Request $request): JsonResponse {
    $content = json_decode($request->getContent(), TRUE);

    if (!$content) return new JsonResponse(['error' => 'Invalid JSON data.'], 400);

    $form_id = $content['form_id'] ?? '';
    $text = $content['text'] ?? '';
    $trigger_id = $content['trigger_id'] ?? '';
    $source_lang = $content['source_lang'] ?? '';

    if (empty($form_id) || empty($text) || empty($source_lang) || empty($trigger_id)) {
      return new JsonResponse(['error' => 'Missing required parameters'], 400);
    }

    $prompt = $this->prompt_manager->getChangeToneProfessionalPrompt();

    $data = [
      'model' => $this->provider->getDefaultModel(),
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
    $response = $this->provider->makeRequest('chat/completions', 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    if (isset($response['choices'][0]['message']['content'])) {
      $changed_tone_professsional_text = trim($response['choices'][0]['message']['content']);
    } else {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'changed_tone_professsional_text' => $changed_tone_professsional_text,
      'form_id' => $form_id,
      'source_lang' => $source_lang,
      'trigger_id' => $trigger_id,
      'timestamp' => time(),
    ], 200);
  }

  public function changeToneCasual(Request $request): JsonResponse {
    $content = json_decode($request->getContent(), TRUE);

    if (!$content) return new JsonResponse(['error' => 'Invalid JSON data.'], 400);

    $form_id = $content['form_id'] ?? '';
    $text = $content['text'] ?? '';
    $trigger_id = $content['trigger_id'] ?? '';
    $source_lang = $content['source_lang'] ?? '';

    if (empty($form_id) || empty($text) || empty($source_lang) || empty($trigger_id)) {
      return new JsonResponse(['error' => 'Missing required parameters'], 400);
    }

    $prompt = $this->prompt_manager->getChangeToneCasualPrompt();

    $data = [
      'model' => $this->provider->getDefaultModel(),
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
    $response = $this->provider->makeRequest('chat/completions', 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    if (isset($response['choices'][0]['message']['content'])) {
      $changed_tone_casual_text = trim($response['choices'][0]['message']['content']);
    } else {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'changed_tone_casual_text' => $changed_tone_casual_text,
      'form_id' => $form_id,
      'source_lang' => $source_lang,
      'trigger_id' => $trigger_id,
      'timestamp' => time(),
    ], 200);
  }

  public function simplifyContent(Request $request): JsonResponse {
    $content = json_decode($request->getContent(), TRUE);

    if (!$content) return new JsonResponse(['error' => 'Invalid JSON data.'], 400);

    $form_id = $content['form_id'] ?? '';
    $text = $content['text'] ?? '';
    $trigger_id = $content['trigger_id'] ?? '';
    $source_lang = $content['source_lang'] ?? '';

    if (empty($form_id) || empty($text) || empty($source_lang) || empty($trigger_id)) {
      return new JsonResponse(['error' => 'Missing required parameters'], 400);
    }

    $prompt = $this->prompt_manager->getSimplifyContentPrompt();

    $data = [
      'model' => $this->provider->getDefaultModel(),
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
    $response = $this->provider->makeRequest('chat/completions', 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    if (isset($response['choices'][0]['message']['content'])) {
      $simplified_text = trim($response['choices'][0]['message']['content']);
    } else {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'simplified_text' => $simplified_text,
      'form_id' => $form_id,
      'source_lang' => $source_lang,
      'trigger_id' => $trigger_id,
      'timestamp' => time(),
    ], 200);
  }
}
