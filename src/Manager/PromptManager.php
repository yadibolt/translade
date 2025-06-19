<?php

namespace Drupal\translade\Manager;

class PromptManager
{
  public function __construct() {}

  /**
   * @param array $tokens
   * @return string
   */
  public function getTranslationPrompt(array $tokens = []): string {
    $config = \Drupal::config('translade.settings');
    $translation_prompt = $config->get('translation_prompt');

    $prompt = $this->getTranslationRoleDefinition();
    if (!empty($translation_prompt)) {
      $prompt .= $translation_prompt;
    } else {
      $prompt .= $this->getTranslationPromptDefault();
    }

    return $this->formatPrompt($prompt, $tokens);
  }

  /**
   * @param array $tokens
   * @return string
   */
  public function getRephrasePrompt(array $tokens = []): string {
    $config = \Drupal::config('translade.settings');
    $rephrase_prompt = $config->get('rephrase_prompt');

    $prompt = $this->getRephraseRoleDefinition();
    if (!empty($translation_prompt)) {
      $prompt .= $rephrase_prompt;
    } else {
      $prompt .= $this->getRehrasePromptDefault();
    }

    return $this->formatPrompt($prompt, $tokens);
  }

  private function getTranslationRoleDefinition(): string {
    return "You are a helpful translation assistant.
    Your task is to translate the following content from @source_lang to @target_lang.
    DO NOT translate |TRSLD_SPT| to anything else, it is a special tag that has to remain unchanged.\n";
  }

  private function getRephraseRoleDefinition(): string {
    return "You are a helpful assistant that rephrases text.
    Your task is to rephrase the following content without changing its meaning.
    DO NOT change |TRSLD_SPT| to anything else, it is a special tag that has to remain unchanged.\n";
  }

  private function getTranslationPromptDefault(): string {
    return "- Translate only the text content; do not modify or remove any HTML tags, special characters, or formatting.
    - Do not prepend or append any extra text to the translation.
    - The translation must be accurate and preserve the original meaning.
    - Pay close attention to proper nouns like names, places, or organizations — they are often Slovak and may remain untranslated.";
  }

  private function getRehrasePromptDefault(): string {
    return "- Rephrase the text content; do not modify or remove any HTML tags, special characters, or formatting.
    - Do not prepend or append any extra text to the rephrased content.
    - The rephrased content must preserve the original meaning.";
  }

  /**
   * @param string $prompt
   * @param array $tokens
   * @return string
   */
  private function formatPrompt(string $prompt, array $tokens): string {
    $language_manager = new LanguageManager();
    $token_prompt = $prompt;

    foreach ($tokens as $token => $value) {
      $token_prompt = str_replace($token, $language_manager->getLangFromId($value), $token_prompt);
    }

    return $token_prompt;
  }
}
