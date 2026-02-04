document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId.length <= 1) {
      return;
    }
    const target = document.querySelector(targetId);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', targetId);
    }
  });
});

const chatWidgets = document.querySelectorAll('[data-chat-widget]');

chatWidgets.forEach((widget) => {
  const toggleButton = widget.querySelector('.chat-toggle');
  const panel = widget.querySelector('.chat-panel');
  const closeButton = widget.querySelector('.chat-close');
  const messagesContainer = widget.querySelector('.chat-messages');
  const form = widget.querySelector('.chat-form');
  const input = widget.querySelector('input[name="message"]');
  const endpoint = widget.dataset.apiEndpoint || '/api/chat';
  const chatHistory = [];

  if (!toggleButton || !panel || !form || !messagesContainer || !input) {
    return;
  }

  const setOpen = (isOpen) => {
    panel.classList.toggle('is-open', isOpen);
    panel.setAttribute('aria-hidden', String(!isOpen));
    toggleButton.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      input.focus();
    }
  };

  toggleButton.addEventListener('click', () => {
    const isOpen = panel.classList.contains('is-open');
    setOpen(!isOpen);
  });

  closeButton?.addEventListener('click', () => setOpen(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
    }
  });

  const appendMessage = (role, content) => {
    const message = document.createElement('div');
    message.className = `chat-message chat-message--${role}`;
    const paragraph = document.createElement('p');
    paragraph.textContent = content;
    message.appendChild(paragraph);
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const setLoading = (isLoading) => {
    form.querySelector('button[type="submit"]').disabled = isLoading;
    input.disabled = isLoading;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) {
      return;
    }
    appendMessage('user', message);
    chatHistory.push({ role: 'user', content: message });
    input.value = '';
    setLoading(true);

    let assistantReply = 'Sorry, something went wrong. Please try again shortly.';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history: chatHistory.slice(-6),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.reply) {
          assistantReply = data.reply;
        }
      }
    } catch (error) {
      console.error('Chat request failed', error);
    }

    appendMessage('assistant', assistantReply);
    chatHistory.push({ role: 'assistant', content: assistantReply });
    setLoading(false);
  });
});
