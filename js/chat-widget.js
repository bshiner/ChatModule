(function ($, Drupal, drupalSettings) {
    'use strict';
  
    /**
     * Chat Widget functionality.
     */
    Drupal.behaviors.webChatWidget = {
      attach: function (context, settings) {
        if (typeof settings.webChatWidget === 'undefined') {
          return;
        }
  
        // Create chat widget only once
        if ($('.chat-widget', context).length === 0) {
          this.createChatWidget(settings.webChatWidget);
        }
      },
  
      createChatWidget: function (config) {
        const widget = this.buildWidgetHTML(config);
        $('body').append(widget);
        
        this.initializeEventListeners();
        this.showWelcomeMessage(config.welcomeMessage);
      },
  
      buildWidgetHTML: function (config) {
        const positionClass = 'position-' + (config.position || 'bottom-right');
        const themeClass = 'theme-' + (config.theme || 'default');
        
        return `
          <div class="chat-widget ${positionClass} ${themeClass}">
            <button class="chat-toggle-btn" id="chat-toggle-btn" aria-label="Open chat">
              <span class="chat-icon">💬</span>
              <span class="close-icon" style="display: none;">✕</span>
            </button>
            <div class="chat-window" id="chat-window">
              <div class="chat-header">
                Chat Support
              </div>
              <div class="chat-messages" id="chat-messages">
                <!-- Messages will be added here -->
              </div>
              <div class="typing-indicator" id="typing-indicator">
                Bot is typing...
              </div>
              <div class="chat-input-container">
                <input type="text" class="chat-input" id="chat-input" placeholder="Type your message..." maxlength="500">
                <button class="chat-send-btn" id="chat-send-btn" aria-label="Send message">
                  ➤
                </button>
              </div>
            </div>
          </div>
        `;
      },
  
      initializeEventListeners: function () {
        const self = this;
        
        // Toggle chat window
        $('#chat-toggle-btn').on('click', function () {
          self.toggleChat();
        });
  
        // Send message on button click
        $('#chat-send-btn').on('click', function () {
          self.sendMessage();
        });
  
        // Send message on Enter key
        $('#chat-input').on('keypress', function (e) {
          if (e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            self.sendMessage();
          }
        });
  
        // Auto-resize input on mobile
        $(window).on('resize', function () {
          self.adjustMobileLayout();
        });
      },
  
      toggleChat: function () {
        const $window = $('#chat-window');
        const $btn = $('#chat-toggle-btn');
        const $chatIcon = $('.chat-icon');
        const $closeIcon = $('.close-icon');
  
        if ($window.is(':visible')) {
          $window.hide();
          $btn.removeClass('active');
          $chatIcon.show();
          $closeIcon.hide();
        } else {
          $window.show();
          $btn.addClass('active');
          $chatIcon.hide();
          $closeIcon.show();
          $('#chat-input').focus();
          this.scrollToBottom();
        }
      },
  
      sendMessage: function () {
        const $input = $('#chat-input');
        const message = $input.val().trim();
        
        if (!message) return;
  
        // Add user message to chat
        this.addMessage(message, 'user');
        $input.val('');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Send to API
        this.sendToAPI(message);
      },
  
      addMessage: function (text, sender, timestamp) {
        const time = timestamp || new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const messageHTML = `
          <div class="message ${sender}">
            <div class="message-bubble">
              ${this.escapeHtml(text)}
              <div class="message-time">${time}</div>
            </div>
          </div>
        `;
        
        $('#chat-messages').append(messageHTML);
        this.scrollToBottom();
      },
  
      sendToAPI: function (message) {
        const self = this;
        const config = drupalSettings.webChatWidget;
        
        $.ajax({
          url: '/web-chat-widget/api-proxy',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            message: message,
            timestamp: new Date().toISOString(),
            session_id: this.getSessionId()
          }),
          timeout: 30000,
          success: function (response) {
            self.hideTypingIndicator();
            
            if (response.message) {
              self.addMessage(response.message, 'bot');
            } else if (response.error) {
              self.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
            }
          },
          error: function (xhr, status, error) {
            self.hideTypingIndicator();
            console.error('Chat API Error:', error);
            
            let errorMessage = 'Sorry, I\'m having trouble connecting right now. Please try again later.';
            
            if (xhr.responseJSON && xhr.responseJSON.message) {
              errorMessage = xhr.responseJSON.message;
            }
            
            self.addMessage(errorMessage, 'bot');
          }
        });
      },
  
      showWelcomeMessage: function (message) {
        if (message) {
          this.addMessage(message, 'bot');
        }
      },
  
      showTypingIndicator: function () {
        $('#typing-indicator').addClass('show');
        this.scrollToBottom();
      },
  
      hideTypingIndicator: function () {
        $('#typing-indicator').removeClass('show');
      },
  
      scrollToBottom: function () {
        const $messages = $('#chat-messages');
        $messages.scrollTop($messages[0].scrollHeight);
      },
  
      adjustMobileLayout: function () {
        // Additional mobile-specific adjustments if needed
        if ($(window).width() <= 768) {
          // Mobile-specific code
        }
      },
  
      getSessionId: function () {
        let sessionId = localStorage.getItem('chat_session_id');
        if (!sessionId) {
          sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('chat_session_id', sessionId);
        }
        return sessionId;
      },
  
      escapeHtml: function (text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }
    };
  
  })(jQuery, Drupal, drupalSettings);