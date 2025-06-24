<?php

namespace Drupal\translade\Provider;

use Drupal\translade\Interface\TransladeProvider;

class GoogleProvider implements TransladeProvider {
  public function __construct() {}

  public function makeRequest(string $endpoint, string $method = 'GET', array $data = []): mixed {
    // TODO: Implement makeRequest() method.
    return [];
  }

  public function getModels(): bool|array {
    // TODO: Implement getModels() method.
    return [];
  }

  public function getDefaultModel(): string {
    // TODO: Implement getDefaultModel() method.
    return "";
  }
}
