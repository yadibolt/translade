<?php

namespace Drupal\translade\Interface;
interface TransladeProvider {
  public function __construct();

  public function makeRequest(string $endpoint, string $method = 'GET', array $data = []): mixed;

  public function getModels(): bool|array;

  public function getDefaultModel(): string;
}
