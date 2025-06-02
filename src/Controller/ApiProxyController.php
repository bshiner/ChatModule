<?php
// File: web_chat_widget/src/Controller/ApiProxyController.php

namespace Drupal\web_chat_widget\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use GuzzleHttp\ClientInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * API Proxy Controller for chat widget.
 */
class ApiProxyController extends ControllerBase {

  /**
   * The HTTP client.
   *
   * @var \GuzzleHttp\ClientInterface
   */
  protected $httpClient;

  /**
   * Constructs a new ApiProxyController object.
   *
   * @param \GuzzleHttp\ClientInterface $http_client
   *   The HTTP client.
   */
  public function __construct(ClientInterface $http_client) {
    $this->httpClient = $http_client;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('http_client')
    );
  }

  /**
   * Proxy API requests to external chatbot service.
   */
  public function proxy(Request $request) {
    $config = $this->config('web_chat_widget.settings');
    $api_endpoint = $config->get('api_endpoint');
    $api_key = $config->get('api_key');

    if (!$api_endpoint) {
      return new JsonResponse(['error' => 'API endpoint not configured'], 500);
    }

    try {
      $data = json_decode($request->getContent(), TRUE);
      
      $headers = [
        'Content-Type' => 'application/json',
      ];
      
      if ($api_key) {
        $headers['Authorization'] = 'Bearer ' . $api_key;
      }

      $response = $this->httpClient->post($api_endpoint, [
        'headers' => $headers,
        'json' => $data,
        'timeout' => 30,
      ]);

      $response_data = json_decode($response->getBody(), TRUE);
      
      return new JsonResponse($response_data);
    }
    catch (\Exception $e) {
      \Drupal::logger('web_chat_widget')->error('API request failed: @message', [
        '@message' => $e->getMessage(),
      ]);
      
      return new JsonResponse([
        'error' => 'Failed to process message',
        'message' => 'Sorry, I\'m having trouble connecting right now. Please try again later.'
      ], 500);
    }
  }
}
