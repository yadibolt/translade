<?php

namespace Drupal\translade\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class ProviderForm extends ConfigFormBase {
  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'translade_provider_form';
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
    $openai_masked = $config->get('openai_api_key') ? ': ' . substr($config->get('openai_api_key'), 0, 7) . '-*****-*****-' . substr($config->get('openai_api_key'), -7, 7) : '';
    $google_masked = $config->get('google_api_key') ? ': ' . substr($config->get('google_api_key'), 0, 7) . '-*****-*****-' . substr($config->get('google_api_key'), -7, 7) : '';

    $form['openai'] = [
      '#type' => 'details',
      '#title' => 'OpenAI',
      '#open' => TRUE,
      '#weight' => $weight++,
    ];

    $form['openai']['openai_status'] = [
      '#type' => 'markup',
      '#markup' => $config->get('openai_api_key') ?
        "<p class='translade-success'>".$this->t('OpenAI API key is set to') . '<span>' . $openai_masked . "</span></p>" :
        "<p class='translade-error'>".$this->t('You\'ve provided wrong API key, or the API key is not set')."</p>",
      '#allowed_tags' => ['p', 'span'],
      '#weight' => $weight++,
    ];

    $form['openai']['openai_api_key'] = [
      '#type' => 'textarea',
      '#title' => $this->t('OpenAI API Key'),
      '#description' => $this->t('Enter your OpenAI API key to enable services. Type "clear" here and submit the form to remove the key.'),
      '#rows' => 1,
      '#columns' => 30,
      '#weight' => $weight++,
    ];

    $form['google'] = [
      '#type' => 'details',
      '#title' => 'Google',
      '#open' => FALSE,
      '#weight' => $weight++,
    ];

    $form['google']['google_status'] = [
      '#type' => 'markup',
      '#markup' => $config->get('google_api_key') ?
        "<p class='translade-success'>".$this->t('Google API key is set to') . '<span>' . $google_masked . "</span></p>" :
        "<p class='translade-error'>".$this->t('You\'ve provided wrong API key, or the API key is not set')."</p>",
      '#allowed_tags' => ['p', 'span'],
      '#weight' => $weight++,
    ];

    $form['google']['google_not_supported'] = [
      '#type' => 'markup',
      '#markup' => "<p class='translade-error'>".$this->t('Google Provider is not yet supported by this module.')."</p>",
      '#allowed_tags' => ['p'],
      '#weight' => $weight++,
    ];

    $form['provider'] = [
      '#type' => 'details',
      '#title' => $this->t('Provider'),
      '#open' => TRUE,
      '#weight' => $weight++,
    ];

    $form['provider']['provider_name'] = [
      '#type' => 'select',
      '#title' => $this->t('Provider to use'),
      '#options' => $this->getOptionsProviders(),
      '#default_value' => $config->get('provider_name') ?: 'openai',
      '#description' => $this->t('Select the provider you want to use.'),
      '#weight' => $weight++,
    ];

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save Providers'),
      '#weight' => $weight++,
    ];

    $form['#attached']['library'][] = 'translade/transladecss';

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    if (!empty($form_state->getValue('openai_api_key'))) {
      if (trim($form_state->getValue('openai_api_key')) != 'clear'
      && strlen($form_state->getValue('openai_api_key')) <= 10) {
        $form_state->setErrorByName('openai_api_key', $this->t('Check your OpenAI API key. The value does not seem to be valid.'));
      }
    }
    if (!empty($form_state->getValue('google_api_key'))) {
      if (trim($form_state->getValue('google_api_key')) != 'clear'
        && strlen($form_state->getValue('google_api_key')) <= 10) {
        $form_state->setErrorByName('google_api_key', $this->t('Check your OpenAI API key. The value does not seem to be valid.'));
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $config = $this->config('translade.settings');

    if (!empty($form_state->getValue('openai_api_key'))) {
      if (trim($form_state->getValue('openai_api_key')) === 'clear') {
        $this->config('translade.settings')
          ->set('openai_api_key', '')
          ->save();

        \Drupal::messenger()->addMessage($this->t("OpenAI API key has been removed!"), 'warning');
      } else {
        $api_key = trim($form_state->getValue('openai_api_key'));
        $this->config('translade.settings')
          ->set('openai_api_key', $api_key)
          ->save();

        \Drupal::messenger()->addMessage($this->t("OpenAI API key has been saved."), 'status');
      }
    }
    if (!empty($form_state->getValue('google_api_key'))) {
      if (trim($form_state->getValue('google_api_key')) === 'clear') {
        $this->config('translade.settings')
          ->set('google_api_key', '')
          ->save();

        \Drupal::messenger()->addMessage($this->t("Google API key has been removed!"), 'warning');
      } else {
        $api_key = trim($form_state->getValue('google_api_key'));
        $this->config('translade.settings')
          ->set('google_api_key', $api_key)
          ->save();

        \Drupal::messenger()->addMessage($this->t("Google API key has been saved."), 'status');
      }
    }
    $provider_name = $form_state->getValue('provider_name');
    if (!empty($provider_name)) {
      $saved_provider_name = $config->get('provider_name');
      $this->config('translade.settings')
        ->set('provider_name', $provider_name)
        ->save();

      if ($saved_provider_name !== $provider_name) {
        \Drupal::messenger()->addMessage($this->t("Provider has been changed to: @provider.", ['@provider' => $provider_name]), 'status');
      }
    }
  }

  public function getOptionsProviders(): array {
    return [
      'openai' => 'OpenAI',
      'google' => 'Google',
    ];
  }
}
