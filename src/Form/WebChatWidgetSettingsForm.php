<?php
// File: web_chat_widget/src/Form/WebChatWidgetSettingsForm.php

namespace Drupal\web_chat_widget\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure Web Chat Widget settings.
 */
class WebChatWidgetSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['web_chat_widget.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'web_chat_widget_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('web_chat_widget.settings');

    $form['enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable Chat Widget'),
      '#default_value' => $config->get('enabled'),
      '#description' => $this->t('Check to enable the chat widget on all pages.'),
    ];

    $form['api_settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('API Settings'),
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
    ];

    $form['api_settings']['api_endpoint'] = [
      '#type' => 'url',
      '#title' => $this->t('API Endpoint'),
      '#default_value' => $config->get('api_endpoint'),
      '#description' => $this->t('The URL of your chatbot API endpoint.'),
      '#required' => TRUE,
    ];

    $form['api_settings']['api_key'] = [
      '#type' => 'textfield',
      '#title' => $this->t('API Key'),
      '#default_value' => $config->get('api_key'),
      '#description' => $this->t('API key for authentication (if required).'),
    ];

    $form['widget_settings'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Widget Settings'),
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
    ];

    $form['widget_settings']['welcome_message'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Welcome Message'),
      '#default_value' => $config->get('welcome_message') ?: 'Hello! How can I help you today?',
      '#description' => $this->t('Initial message displayed when chat opens.'),
    ];

    $form['widget_settings']['position'] = [
      '#type' => 'select',
      '#title' => $this->t('Widget Position'),
      '#options' => [
        'bottom-right' => $this->t('Bottom Right'),
        'bottom-left' => $this->t('Bottom Left'),
      ],
      '#default_value' => $config->get('position') ?: 'bottom-right',
    ];

    $form['widget_settings']['theme'] = [
      '#type' => 'select',
      '#title' => $this->t('Theme'),
      '#options' => [
        'default' => $this->t('Default'),
        'dark' => $this->t('Dark'),
        'minimal' => $this->t('Minimal'),
      ],
      '#default_value' => $config->get('theme') ?: 'default',
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('web_chat_widget.settings')
      ->set('enabled', $form_state->getValue('enabled'))
      ->set('api_endpoint', $form_state->getValue('api_endpoint'))
      ->set('api_key', $form_state->getValue('api_key'))
      ->set('welcome_message', $form_state->getValue('welcome_message'))
      ->set('position', $form_state->getValue('position'))
      ->set('theme', $form_state->getValue('theme'))
      ->save();

    parent::submitForm($form, $form_state);
  }
}
