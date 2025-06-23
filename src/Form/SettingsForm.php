<?php

namespace Drupal\translade\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\translade\Connector\OpenAIConnector;
use Drupal\commerce_product\Entity\ProductVariationType;
use Drupal\translade\Manager\DefaultsManager;

class SettingsForm extends ConfigFormBase {
  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'translade_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return [
      'translade.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $weight = 0;
    $config = \Drupal::config('translade.settings') ?: [];
    $provider_form_url = \Drupal::urlGenerator()->generateFromRoute('translade.providers');
    $openai_connector = new OpenAIConnector();
    $api_key_exists = $this->checkAPIKeyExists();
    $provider_exists = $this->checkSelectedProvider();

    $form['messages'] = [
      '#type' => 'markup',
      '#weight' => $weight++,
    ];
    if (!$api_key_exists) {
      $form['messages']['api_key_exists'] = [
        '#type' => 'markup',
        '#markup' => "<p class='translade-error'>".$this->t('You have not set any API key. Please, configure providers first') . ". <a href='$provider_form_url'>Configure providers</a>." . "</p>",
        '#allowed_tags' => ['p', 'a'],
      ];
    }
    if (!$provider_exists) {
      $form['messages']['provider_exists'] = [
        '#type' => 'markup',
        '#markup' => "<p class='translade-error'>".$this->t('Selected provider seems to be invalid. Please, configure providers first') . ". <a href='$provider_form_url'>Configure providers</a>." . "</p>",
        '#allowed_tags' => ['p', 'a'],
      ];
    }

    if (!$api_key_exists || !$provider_exists) {
      return $form;
    }

    if ($config->get('provider_name') === 'openai') {
      $models = $openai_connector->getOpenAIModels();
      $model_options = [];
      foreach ($models as $model) {
        $model_options[$model['id']] = $model['id'];
      }

      $form['openai'] = [
        '#type' => 'details',
        '#title' => 'OpenAI Options',
        '#open' => TRUE,
        '#weight' => $weight++,
      ];

      $form['openai']['openai_model'] = [
        '#type' => 'select',
        '#title' => $this->t('Select OpenAI Text Model'),
        '#description' => $this->t('Select the OpenAI model you want to use for translations.'),
        '#options' => $model_options,
        '#default_value' => $config->get('model') ?: 'gpt-4o-mini',
        '#weight' => $weight++,
      ];
    }

    $form['content_options'] = [
      '#type' => 'details',
      '#title' => $this->t('Content Options'),
      '#open' => TRUE,
      '#weight' => $weight++,
    ];

    $form['content_options']['content_types'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Enable translation for these content types:'),
      '#options' => $this->getAvailableContentTypes(),
      '#default_value' => $this->prepareDefaultOptionsContentTypes(),
      '#weight' => $weight++,
    ];

    $form['content_options']['content_ai_actions'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Enable these AI Actions:'),
      '#options' => $this->getAvailableAIActions(),
      '#default_value' => $this->prepareDefaultOptionsAIActions(),
      '#weight' => $weight++,
    ];

    $form['language_options'] = [
      '#type' => 'details',
      '#title' => $this->t('Language Options'),
      '#open' => TRUE,
      '#weight' => $weight++,
    ];

    $form['language_options']['languages'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Languages'),
      '#description' => $this->t('Enter the languages you want to be used. They must be separated by commas and colon. For example: "en:English,fr:French,de:German".'),
      '#default_value' => $config->get('languages') ?: 'en:English,sk:Slovak',
      '#rows' => 3,
      '#columns' => 30,
      '#weight' => $weight++,
    ];

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save Configuration'),
      '#weight' => $weight++,
    ];

    $form['#attached']['library'][] = 'translade/transladecss';

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $languages = $form_state->getValue('languages');
    if (!str_contains($languages, ':')) {
        $form_state->setErrorByName('languages', $this->t('Please ensure that each language is defined with a code and a name, separated by a colon (:). For example: "en:English,fr:French".'));
    }
    if (!preg_match('/^[a-zA-Z:, ]+$/', $languages)) {
        $form_state->setErrorByName('languages', $this->t('Please ensure that the languages are defined correctly, using only letters, commas, and colons.'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $content_types = array_filter($form_state->getValue('content_types'));
    $ai_actions = $form_state->getValue('content_ai_actions');

    $prepared_content_types = $this->prepareFormDataOptionsContentType($content_types);
    $content_types_defaults = $this->prepareDefaultOptionsContentTypes();
    sort($prepared_content_types); sort($content_types_defaults);
    $prepared_ai_actions = $this->prepareFormDataOptionsAIActions($ai_actions);
    $ai_actions_defaults = $this->prepareDefaultOptionsAIActions();
    sort($prepared_ai_actions); sort($ai_actions_defaults);

    if ($prepared_content_types != $content_types_defaults) {
      $this->config('translade.settings')
          ->set('content_types', $content_types)
          ->save();

      \Drupal::messenger()->addStatus($this->t('Content types have been updated.'));
    }

    if ($prepared_ai_actions != $ai_actions_defaults) {
      $this->config('translade.settings')
        ->set('content_types', $ai_actions)
        ->save();

      \Drupal::messenger()->addStatus($this->t('AI Actions have been updated.'));
    }

    $model = $form_state->getValue('openai_model');
    if (!empty($model)) {
      if ($model !== $this->config('translade.settings')->get('openai_model')) {
        $this->config('translade.settings')
            ->set('model', $model)
            ->save();
        \Drupal::messenger()->addStatus($this->t('OpenAI model has been set to @model.', ['@model' => $model]));
      }
    }

    $languages = $form_state->getValue('languages');
    if ($languages !== $this->config('translade.settings')->get('languages')) {
      $this->config('translade.settings')
        ->set('languages', str_replace(' ', '', $languages))
        ->save();
      \Drupal::messenger()->addStatus($this->t('Languages have been updated.'));
    }
  }

  public function checkAPIKeyExists(): bool {
    $config = \Drupal::config('translade.settings');
    return !empty($config->get('openai_api_key')) || !empty($config->get('google_api_key'));
  }

  public function checkSelectedProvider(): bool {
    $config = \Drupal::config('translade.settings');
    $provider_name = $config->get('provider_name') ?: 'openai';

    return !empty($config->get($provider_name . '_api_key'));
  }

  public function getAvailableContentTypes(): array {
    $options = [];
    $module_handler = \Drupal::service('module_handler');

    // check if e-commerce module is enabled
    if ($module_handler->moduleExists('commerce')) {
      $commerce_types = ProductVariationType::loadMultiple();
      // add e-commerce content types
      foreach($commerce_types as $type) {
        $options[$type->id()] = $type->label();
      }
    }

    try {
      $content_types = \Drupal::entityTypeManager()->getStorage('node_type')->loadMultiple();
      // add normal types
      foreach ($content_types as $type) {
        $options[$type->id()] = $type->label();
      }
    } catch (\Exception $e) {
      \Drupal::logger('translade')->error('Failed to load content types: @message', ['@message' => $e->getMessage()]);
    }

    return $options;
  }

  public function getAvailableAIActions(): array {
    $defaults_manager = new DefaultsManager();
    return $defaults_manager->getAIActions();
  }

  public function prepareDefaultOptionsContentTypes(): array {
    $config = $this->config('translade.settings');
    if ($config === NULL) {
      return [];
    }

    $default_options = $config->get('content_types') ?: [];

    if (!is_array($default_options)) {
      $default_options = [];
    }

    return $default_options;
  }

  public function prepareDefaultOptionsAIActions(): array {
    $config = $this->config('translade.settings');
    if ($config === NULL) {
      return [];
    }

    $default_options = $config->get('content_ai_actions') ?: [];

    if (!is_array($default_options)) {
      $default_options = [];
    }

    return $default_options;
  }

  public function prepareFormDataOptionsContentType(array $data): array {
    return $data ?: [];
  }

  public function prepareFormDataOptionsAIActions(array $data): array {
    return $data ?: [];
  }
}
