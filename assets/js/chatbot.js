/**
 * Eluceat AI Chatbot - Frontend Widget
 * Connects to the backend /api/chat endpoint and renders a side popup chat interface.
 */

(function () {
    'use strict';

    // Backend API endpoint.
    // Set window.CHATBOT_API_URL before this script loads to point to your deployed backend,
    // e.g. <script>window.CHATBOT_API_URL = 'https://your-api.example.com';</script>
    // When running the Express server locally alongside the static files, leave it unset
    // so requests go to the same origin at /api/chat.
    const API_URL = (window.CHATBOT_API_URL || '') + '/api/chat';

    // Conversation history sent to the backend with each request
    const conversationHistory = [];

    // Track panel open state
    let isPanelOpen = false;

    /**
     * Initialise DOM references after document is ready.
     */
    function init() {
        const toggle = document.getElementById('chatbotToggle');
        const panel  = document.getElementById('chatbotPanel');
        const closeBtn = document.getElementById('chatbotClose');
        const input  = document.getElementById('chatbotInput');
        const sendBtn = document.getElementById('chatbotSend');
        const messages = document.getElementById('chatbotMessages');

        if (!toggle || !panel) return;

        // Open / close the panel
        toggle.addEventListener('click', function () {
            isPanelOpen = !isPanelOpen;
            panel.classList.toggle('chatbot-open', isPanelOpen);
            toggle.setAttribute('aria-expanded', isPanelOpen ? 'true' : 'false');
            if (isPanelOpen) {
                input.focus();
                hideBadge();
            }
        });

        closeBtn.addEventListener('click', function () {
            isPanelOpen = false;
            panel.classList.remove('chatbot-open');
            toggle.setAttribute('aria-expanded', 'false');
        });

        // Send on button click
        sendBtn.addEventListener('click', handleSend);

        // Send on Enter key (Shift+Enter adds a new line)
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        // Auto-resize the textarea up to its max-height
        input.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });

        /**
         * Reads the input, appends a user message, and fetches the AI reply.
         */
        function handleSend() {
            const text = input.value.trim();
            if (!text) return;

            appendMessage('user', text);
            conversationHistory.push({ role: 'user', content: text });

            input.value = '';
            input.style.height = 'auto';
            sendBtn.disabled = true;

            const typingEl = showTyping();

            fetchReply(conversationHistory)
                .then(function (reply) {
                    removeTyping(typingEl);
                    appendMessage('bot', reply);
                    conversationHistory.push({ role: 'assistant', content: reply });

                    // Show notification badge if panel is closed
                    if (!isPanelOpen) showBadge();
                })
                .catch(function (err) {
                    removeTyping(typingEl);
                    appendMessage('bot', err.message || 'Something went wrong. Please try again.');
                })
                .finally(function () {
                    sendBtn.disabled = false;
                    input.focus();
                });
        }

        /**
         * Calls the backend AI endpoint.
         * @param {Array} msgs - Array of {role, content} message objects
         * @returns {Promise<string>} The assistant's reply text
         */
        function fetchReply(msgs) {
            return fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: msgs }),
            })
            .then(function (res) {
                if (!res.ok) {
                    return res.json().then(function (data) {
                        throw new Error(data.error || 'Server error (' + res.status + ')');
                    });
                }
                return res.json();
            })
            .then(function (data) {
                return data.reply;
            });
        }

        /**
         * Appends a message bubble to the messages container.
         * @param {'user'|'bot'} role
         * @param {string} text
         */
        function appendMessage(role, text) {
            const bubble = document.createElement('div');
            bubble.className = 'chatbot-message ' + role;
            bubble.textContent = text;
            messages.appendChild(bubble);
            scrollToBottom();
        }

        /**
         * Adds a typing indicator to the messages container.
         * @returns {HTMLElement} The typing indicator element (for later removal)
         */
        function showTyping() {
            const el = document.createElement('div');
            el.className = 'chatbot-typing';
            el.innerHTML = '<span></span><span></span><span></span>';
            messages.appendChild(el);
            scrollToBottom();
            return el;
        }

        /**
         * Removes the typing indicator element.
         * @param {HTMLElement} el
         */
        function removeTyping(el) {
            if (el && el.parentNode) el.parentNode.removeChild(el);
        }

        function scrollToBottom() {
            messages.scrollTop = messages.scrollHeight;
        }

        function showBadge() {
            const badge = document.getElementById('chatbotBadge');
            if (badge) badge.style.display = 'flex';
        }

        function hideBadge() {
            const badge = document.getElementById('chatbotBadge');
            if (badge) badge.style.display = 'none';
        }
    }

    // Initialise once the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
