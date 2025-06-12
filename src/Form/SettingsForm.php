<?php

namespace Drupal\translade\Form;

use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\translade\OpenAIConnector;
use Drupal\commerce_product\Entity\ProductVariationType;

class SettingsForm extends ConfigFormBase {
  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'translade_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'translade.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['#attached']['library'][] = 'translade/transladecss';

    $weight = 0;
    $config = $this->config('translade.settings') ?: [];

    $form['openai'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('OpenAI Connector'),
      '#weight' => $weight++,
    ];

    // truncate the API key for display purposes
    $truncated_api_key = $config->get('api_key') ? substr($config->get('api_key'), 0, 7) . '-*****-*****-' . substr($config->get('api_key'), -7, 7) : '';

    $form['openai']['api_working'] = [
        '#type' => 'markup',
        '#markup' => $config->get('api_key') ?
            "<p class='translade-apikey-success'>".$this->t('OpenAI API key is set to ') . '<span>' . $truncated_api_key . "</span></p>" :
            "<p class='translade-apikey-error'>".$this->t('OpenAI API key is not set. Please enter your OpenAI API key to enable translation services.')."</p>",
        '#allowed_tags' => ['p', 'span'],
        '#weight' => $weight++,
    ];

    $form['openai']['api_key'] = [
      '#type' => 'textarea',
      '#title' => $this->t('OpenAI API Key'),
      '#rows' => 1,
      '#columns' => 60,
      '#description' => $this->t('Enter your OpenAI API key to enable translation services'),
      '#weight' => $weight++,
    ];

    if ($config->get('api_key') && !empty($config->get('api_key'))) {
      $connector = new OpenAIConnector();
      $models = $connector->getAvailableModels();

      $model_options = [];
      foreach ($models as $model) {
          $model_options[$model['id']] = $model['id'];
      }

      $form['openai']['models'] = [
          '#type' => 'select',
          '#title' => $this->t('Select OpenAI Model'),
          '#description' => $this->t('Select the OpenAI model you want to use for translations.'),
          '#options' => $model_options,
          '#default_value' => $config->get('model') ?: 'gpt-4o-mini',
          '#weight' => $weight++,
      ];
    }

    $form['options'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Translation Options'),
      '#weight' => $weight++,
    ];

    $form['options']['content_types'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Enable translation for these content types:'),
      '#options' => $this->getAvailableContentTypes(),
      '#default_value' => $this->prepareDefaultOptionsFromConfig($config),
      '#weight' => $weight++,
    ];

    $form['options']['override_prompt'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Override Translation Prompt'),
      '#description' => $this->t('You can override the default translation prompt used by OpenAI if you want to. Leaving this field empty will use the default prompt, which is recommended.'),
      '#default_value' => $config->get('override_prompt') ?: '',
      '#weight' => $weight++,
    ];

    $form['languages'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Translation Languages'),
      '#description' => $this->t('Define the languages you want to translate to and from.'),
      '#weight' => $weight++,
    ];

    $form['languages']['languages_area'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Languages'),
      '#description' => $this->t('Enter the languages you want to translate to and from, separated by commas and pipe to define it\'s name. For example: "en|English,fr|French,de|German".'),
      '#default_value' => $config->get('languages') ?: 'en|English,sk|Slovak',
      '#weight' => $weight++,
    ];

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save'),
      '#weight' => $weight++,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    // prompt
    $prompt = $form_state->getValue('override_prompt');
    if (!empty($prompt) && strlen($prompt) < 10) {
      $form_state->setErrorByName('override_prompt', $this->t('The override prompt must be at least 10 characters long.'));
    }

    // language
    $languages = $form_state->getValue('languages_area');
    if (!str_contains($languages, '|')) {
        $form_state->setErrorByName('languages_area', $this->t('Please ensure that each language is defined with a name and a code, separated by a pipe (|). For example: "en|English,fr|French".'));
    }
    if (!preg_match('/^[a-zA-Z|, ]+$/', $languages)) {
        $form_state->setErrorByName('languages_area', $this->t('Please ensure that the languages are defined correctly, using only letters, commas, and pipes.'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('translade.settings');

    // content types
    $selected_content_types = array_filter($form_state->getValue('content_types'));

    // check configured content types against the submitted ones
    $ctypes = $this->prepareOptionsFromFormData($selected_content_types);
    $stypes = $this->prepareDefaultOptionsFromConfig($config);
    sort($ctypes);
    sort($stypes);

    if ($ctypes !== $stypes) {
      // if the content types have changed, update the config, log the change
      $this->config('translade.settings')
          ->set('content_types', $selected_content_types)
          ->save();

      \Drupal::messenger()->addStatus($this->t('Translation content types have been updated.'));
    }

    // api key
    $api_key = $form_state->getValue('api_key');

    if (!empty($api_key)) {
      $this->config('translade.settings')
        ->set('api_key', $api_key)
        ->save();
      \Drupal::messenger()->addStatus($this->t('OpenAI API key has been saved.'));
    }

    // model
    $model = $form_state->getValue('models');

    if (!empty($model)) {
      if ($model !== $this->config('translade.settings')->get('model')) {
        $this->config('translade.settings')
            ->set('model', $model)
            ->save();
        \Drupal::messenger()->addStatus($this->t('OpenAI model has been set to @model.', ['@model' => $model]));
      }
    }

    // override prompt
    // TODO optimize usecases for this
    $override_prompt = $form_state->getValue('override_prompt');
    if ($override_prompt !== $this->config('translade.settings')->get('override_prompt')) {
      $this->config('translade.settings')
        ->set('override_prompt', $override_prompt)
        ->save();
      \Drupal::messenger()->addStatus($this->t('Override translation prompt has been updated.'));
    }

    // languages
    $languages = $form_state->getValue('languages_area');
    if ($languages !== $this->config('translade.settings')->get('languages')) {
      $this->config('translade.settings')
        ->set('languages', str_replace(' ', '', $languages))
        ->save();
      \Drupal::messenger()->addStatus($this->t('Translation languages have been updated.'));
    }
  }

  /**
   * Returns an array of content types that are supported for translation.
   *
   * @return array
   *   An array of supported field types.
   */
  public function getAvailableContentTypes() {
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

    $content_types = \Drupal::entityTypeManager()->getStorage('node_type')->loadMultiple();
    // add normal types
    foreach ($content_types as $type) {
      $options[$type->id()] = $type->label();
    }

    return $options;
  }

  /**
   * Prepares default checkbox options for the form.
   * This method is utilized to get currently configured content types.
   *
   * @param \Drupal\Core\Config\Config|null $config
   *   Drupal configuration object.
   *
   * @return array
   *   An array of options for content types checkboxes.
   */
  public function prepareDefaultOptionsFromConfig($config = NULL) {
    if ($config === NULL) {
      return [];
    }

    $default_options = $config->get('content_types') ?: [];

    if (!is_array($default_options)) {
      $default_options = [];
    }

    return $default_options;
  }

  /**
   * Prepares checkbox options from form data.
   *
   * @param array|null $data
   *   The form data to prepare options from.
   *
   * @return array
   *   An array of options for content types checkboxes.
   */
  public function prepareOptionsFromFormData($data) {
    if ($data === NULL) {
        return [];
    }

    $default_options = $data ?: [];

    if (!is_array($default_options)) {
      $default_options = [];
    }

    return $default_options;
  }
}
