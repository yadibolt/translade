<?php

namespace Drupal\translade\Manager;

class PromptManager {
  private LanguageManager $language_manager;
  public function __construct() {
    $this->language_manager = new LanguageManager();
  }

  public function getTranslationPrompt(array $tokens = []): string {
    $prompt = $this->_getTranslationRoleDefinition();
    $prompt .= $this->_getTranslationPromptDefault();

    return $this->formatPrompt($prompt, $tokens);
  }

  public function getRephrasePrompt(array $tokens = []): string {
    $prompt = $this->_getRephraseRoleDefinition();
    $prompt .= $this->_getRephrasePromptDefault();

    return $this->formatPrompt($prompt, $tokens);
  }

  public function getCheckGrammarPrompt(array $tokens = []): string {
    $prompt = $this->_getCheckGrammarRoleDefinition();
    $prompt .= $this->_getCheckGrammarPromptDefault();

    return $this->formatPrompt($prompt, $tokens);
  }

  public function getSummarizePrompt(array $tokens = []): string {
    $prompt = $this->_getSummarizeRoleDefinition();
    $prompt .= $this->_getSummarizePromptDefault();

    return $this->formatPrompt($prompt, $tokens);
  }

  public function getExpandContentPrompt(array $tokens = []): string {
    $prompt = $this->_getExpandContentRoleDefinition();
    $prompt .= $this->_getExpandContentPromptDefault();

    return $this->formatPrompt($prompt, $tokens);
  }

  public function getShortenContentPrompt(array $tokens = []): string {
    $prompt = $this->_getShortenContentRoleDefinition();
    $prompt .= $this->_getShortenContentPromptDefault();

    return $this->formatPrompt($prompt, $tokens);
  }

  public function getChangeToneProfessionalPrompt(array $tokens = []): string {
    $prompt = $this->_getChangeToneProfessionalRoleDefinition();
    $prompt .= $this->_getChangeToneProfessionalPromptDefault();

    return $this->formatPrompt($prompt, $tokens);
  }

  public function getChangeToneCasualPrompt(array $tokens = []): string {
    $prompt = $this->_getChangeToneCasualRoleDefinition();
    $prompt .= $this->_getChangeToneCasualPromptDefault();

    return $this->formatPrompt($prompt, $tokens);
  }

  public function getSimplifyContentPrompt(array $tokens = []): string {
    $prompt = $this->_getSimplifyContentRoleDefinition();
    $prompt .= $this->_getSimplifyContentPromptDefault();

    return $this->formatPrompt($prompt, $tokens);
  }

  private function _getTranslationRoleDefinition(): string {
    return "You are a helpful translation assistant.
    Your task is to translate the following content to @target_lang.
    DO NOT translate |TRSLD_SPT| to anything else if it appears in the text. It is a special tag that has to remain unchanged.\n";
  }

  private function _getRephraseRoleDefinition(): string {
    return "You are a helpful assistant that rephrases text.
    Your task is to rephrase the following content without changing its meaning.
    DO NOT change |TRSLD_SPT| to anything else if it appears in the text. It is a special tag that has to remain unchanged.\n";
  }

  private function _getCheckGrammarRoleDefinition(): string {
    return "You are a helpful assistant that checks grammar.
    Your task is to check the grammar of the following content and correct any mistakes.
    DO NOT change |TRSLD_SPT| to anything else if it appears in the text. It is a special tag that has to remain unchanged.\n";
  }

  private function _getSummarizeRoleDefinition(): string {
    return "You are a helpful assistant that summarizes text.
    Your task is to summarize the following content while preserving its main points.
    DO NOT change |TRSLD_SPT| to anything else if it appears in the text. It is a special tag that has to remain unchanged.\n";
  }

  private function _getExpandContentRoleDefinition(): string {
    return "You are a helpful assistant that expands content.
    Your task is to expand the following content by adding more details and explanations.
    DO NOT change |TRSLD_SPT| to anything else if it appears in the text. It is a special tag that has to remain unchanged.\n";
  }

  private function _getShortenContentRoleDefinition(): string {
    return "You are a helpful assistant that shortens content.
    Your task is to shorten the following content while preserving its main points.
    DO NOT change |TRSLD_SPT| to anything else if it appears in the text. It is a special tag that has to remain unchanged.\n";
  }

  private function _getChangeToneProfessionalRoleDefinition(): string {
    return "You are a helpful assistant that changes the tone of text to professional.
    Your task is to change the tone of the following content to a more professional style.
    DO NOT change |TRSLD_SPT| to anything else if it appears in the text. It is a special tag that has to remain unchanged.\n";
  }

  private function _getChangeToneCasualRoleDefinition(): string {
    return "You are a helpful assistant that changes the tone of text to casual.
    Your task is to change the tone of the following content to a more casual style.
    DO NOT change |TRSLD_SPT| to anything else if it appears in the text. It is a special tag that has to remain unchanged.\n";
  }

  private function _getSimplifyContentRoleDefinition(): string {
    return "You are a helpful assistant that simplifies text.
    Your task is to simplify the following content while preserving its main points.
    DO NOT change |TRSLD_SPT| to anything else if it appears in the text. It is a special tag that has to remain unchanged.\n";
  }

  private function _getTranslationPromptDefault(): string {
    return "- Translate only the text content; do not modify or remove any HTML tags, special characters, or formatting.
    - Do not prepend or append any extra text to the translation.
    - The translation must be accurate and preserve the original meaning.
    - Pay close attention to proper nouns like names, places, or organizations — they are often Slovak and may remain untranslated.";
  }

  private function _getRephrasePromptDefault(): string {
    return "- Rephrase the text content; do not modify or remove any HTML tags, special characters, or formatting.
    - Do not prepend or append any extra text to the rephrased content.
    - The rephrased content must preserve the original meaning.";
  }

  private function _getCheckGrammarPromptDefault(): string {
    return "- Check the grammar of the text content; do not modify or remove any HTML tags, special characters, or formatting.
    - Do not prepend or append any extra text to the corrected content.
    - The corrected content must preserve the original meaning.";
  }

  private function _getSummarizePromptDefault(): string {
    return "- Summarize the text content; do not modify or remove any HTML tags, special characters, or formatting.
    - Do not prepend or append any extra text to the summary.
    - The summary must preserve the main points of the original content.";
  }

  private function _getExpandContentPromptDefault(): string {
    return "- Expand the text content; do not modify or remove any HTML tags, special characters, or formatting.
    - Do not prepend or append any extra text to the expanded content.
    - The expanded content must add more details and explanations while preserving the original meaning.";
  }

  private function _getShortenContentPromptDefault(): string {
    return "- Shorten the text content; do not modify or remove any HTML tags, special characters, or formatting.
    - Do not prepend or append any extra text to the shortened content.
    - The shortened content must preserve the main points of the original content.";
  }

  private function _getChangeToneProfessionalPromptDefault(): string {
    return "- Change the tone of the text content to a professional style; do not modify or remove any HTML tags, special characters, or formatting.
    - Do not prepend or append any extra text to the content.
    - The content must maintain its original meaning while adopting a more professional tone.";
  }

  private function _getChangeToneCasualPromptDefault(): string {
    return "- Change the tone of the text content to a casual style; do not modify or remove any HTML tags, special characters, or formatting.
    - Do not prepend or append any extra text to the content.
    - The content must maintain its original meaning while adopting a more casual tone.";
  }

  private function _getSimplifyContentPromptDefault(): string {
    return "- Simplify the text content; do not modify or remove any HTML tags, special characters, or formatting.
    - Do not prepend or append any extra text to the simplified content.
    - The simplified content must preserve the main points of the original content.";
  }

  private function formatPrompt(string $prompt, array $tokens): string {
    $token_prompt = $prompt;

    foreach ($tokens as $token => $value) {
      $token_prompt = str_replace($token, $this->language_manager->getLangFromId($value), $token_prompt);
    }

    return $token_prompt;
  }
}
