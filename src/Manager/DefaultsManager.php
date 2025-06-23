<?php

namespace Drupal\translade\Manager;

use Drupal\Core\Config\ConfigBase;

class DefaultsManager extends ConfigBase {

  public function __construct() {}

  public function getAIActions(): array {
    return [
      "rewriteRephrase" => "Rewrite/Rephrase",
      "checkGrammar" => "Check Grammar",
      "summarize" => "Summarize",
      "expansionElaboration" => "Expansion/Elaboration",
      "shortenCondense" => "Shorten/Condense",
      "changeToneProffessional" => "Change Tone (Professional)",
      "changeToneCasual" => "Change Tone (Casual)",
      "simplify" => "Simplify",
    ];
  }

  public function getSupportedFieldTypes(): array {
    return [
      'string',
      'string_long',
      'text',
      'text_long',
      'text_with_summary',
    ];
  }
}
