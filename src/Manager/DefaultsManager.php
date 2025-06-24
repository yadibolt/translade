<?php

namespace Drupal\translade\Manager;

use Drupal\Core\Config\ConfigBase;

class DefaultsManager extends ConfigBase {
  private CONST AI_ACTIONS = [
    "rewriteRephrase" => "Rewrite/Rephrase",
    "checkGrammar" => "Check Grammar",
    "summarize" => "Summarize",
    "expansionElaboration" => "Expansion/Elaboration",
    "shortenCondense" => "Shorten/Condense",
    "changeToneProfessional" => "Change Tone (Professional)",
    "changeToneCasual" => "Change Tone (Casual)",
    "simplify" => "Simplify",
  ];

  private CONST SUPPORTED_FIELD_TYPES = [
    'string',
    'string_long',
    'text',
    'text_long',
    'text_with_summary',
  ];

  public function __construct() {}

  public function getAIActions(): array {
    return self::AI_ACTIONS;
  }

  public function getSupportedFieldTypes(): array {
    return self::SUPPORTED_FIELD_TYPES;
  }
}
