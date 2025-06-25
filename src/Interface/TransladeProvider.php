<?php

namespace Drupal\translade\Interface;
use Drupal\Core\Config\ImmutableConfig;
use GuzzleHttp\Client;

interface TransladeProvider {
  public function __construct();

  public function makeRequest(string $endpoint, string $method = 'GET', array $data = [], array $query_params = []): mixed;

  public function createChatRequestData(string $system_prompt, string $user_text): array;

  public function processChatResponse(array $response): string|null;

  public function getModels(): bool|array;

  public function getDefaultModel(): string;
}
