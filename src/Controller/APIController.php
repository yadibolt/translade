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
    $data = $this->provider->createChatRequestData($prompt, $text);
    $response = $this->provider->makeRequest($this->provider::CHAT_ENDPOINT, 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    $result_text = $this->provider->processChatResponse($response);
    if ($result_text === null) {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'translated_text' => $result_text,
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
    $data = $this->provider->createChatRequestData($prompt, $text);
    $response = $this->provider->makeRequest($this->provider::CHAT_ENDPOINT, 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    $result_text = $this->provider->processChatResponse($response);
    if ($result_text === null) {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'rephrased_text' => $result_text,
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
    $data = $this->provider->createChatRequestData($prompt, $text);
    $response = $this->provider->makeRequest($this->provider::CHAT_ENDPOINT, 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    $result_text = $this->provider->processChatResponse($response);
    if ($result_text === null) {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'checked_text' => $result_text,
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
    $data = $this->provider->createChatRequestData($prompt, $text);
    $response = $this->provider->makeRequest($this->provider::CHAT_ENDPOINT, 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    $result_text = $this->provider->processChatResponse($response);
    if ($result_text === null) {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'summarized_text' => $result_text,
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
    $data = $this->provider->createChatRequestData($prompt, $text);
    $response = $this->provider->makeRequest($this->provider::CHAT_ENDPOINT, 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    $result_text = $this->provider->processChatResponse($response);
    if ($result_text === null) {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'expanded_text' => $result_text,
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
    $data = $this->provider->createChatRequestData($prompt, $text);
    $response = $this->provider->makeRequest($this->provider::CHAT_ENDPOINT, 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    $result_text = $this->provider->processChatResponse($response);
    if ($result_text === null) {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'shortened_text' => $result_text,
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
    $data = $this->provider->createChatRequestData($prompt, $text);
    $response = $this->provider->makeRequest($this->provider::CHAT_ENDPOINT, 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    $result_text = $this->provider->processChatResponse($response);
    if ($result_text === null) {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'changed_tone_professsional_text' => $result_text,
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
    $data = $this->provider->createChatRequestData($prompt, $text);
    $response = $this->provider->makeRequest($this->provider::CHAT_ENDPOINT, 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    $result_text = $this->provider->processChatResponse($response);
    if ($result_text === null) {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'changed_tone_casual_text' => $result_text,
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
    $data = $this->provider->createChatRequestData($prompt, $text);
    $response = $this->provider->makeRequest($this->provider::CHAT_ENDPOINT, 'POST', $data);

    if (!$response) return new JsonResponse(['error' => 'Failed to connect to OpenAI API'], 500);

    $result_text = $this->provider->processChatResponse($response);
    if ($result_text === null) {
      return new JsonResponse(['error' => 'Translation failed'], 500);
    }

    return new JsonResponse([
      'status' => 'ok',
      'simplified_text' => $result_text,
      'form_id' => $form_id,
      'source_lang' => $source_lang,
      'trigger_id' => $trigger_id,
      'timestamp' => time(),
    ], 200);
  }
}
