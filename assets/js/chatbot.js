const CHAT_LOG_KEY = 'powellChatLogs';
// Update these placeholders to connect real contact details.
const CONTACT_EMAIL = 'hello@powellprojects.com';
const BOOKING_LINK = 'https://calendar.google.com/';
const CONTACT_TEMPLATE = `Hi Powell Projects,\n\nI'm interested in AI operations support. My goal is: [share goal].\nTools we use: [list tools].\nTimeline considerations: [optional].\n\nThanks!`;

// Lightweight KB index that mirrors kb.html content for retrieval.
const KB_SECTIONS = [
  {
    id: 'services',
    title: 'Services',
    keywords: ['services', 'ai ops', 'automate', 'automation', 'integrations', 'dashboard', 'chatbot', 'workflow', 'operations'],
    answer: 'We focus on AI operations services: workflow audits, automation builds, integrations across your tools, dashboards for visibility, and guided chatbots with guardrails.',
    cta: 'Want to share your goal and the tools you use?'
  },
  {
    id: 'deliverables',
    title: 'Typical deliverables',
    keywords: ['deliverables', 'outputs', 'what do i get', 'handoff', 'documentation', 'sop', 'playbook'],
    answer: 'Typical deliverables include workflow maps, automation blueprints, documented SOPs, dashboards, and training handoff notes tailored to your team.',
    cta: 'Want to share your goal and tools you use?'
  },
  {
    id: 'timeline',
    title: 'Timeline ranges',
    keywords: ['timeline', 'how long', 'timeframe', 'schedule', 'start', 'delivery'],
    answer: 'Timelines vary by scope. We share typical ranges, but they are not guarantees. We align on scope first and then confirm a plan.',
    cta: 'Want to book a call to align on scope?'
  },
  {
    id: 'packages',
    title: 'Packages and pricing',
    keywords: ['pricing', 'packages', 'cost', 'rate', 'budget', 'price'],
    answer: 'Pricing is shared as placeholders until we confirm scope. We can recommend the best-fit package after a quick discovery call.',
    cta: 'Want me to recommend the best package?'
  },
  {
    id: 'faq',
    title: 'FAQ',
    keywords: ['faq', 'questions', 'security', 'data', 'tools', 'integrations', 'crm', 'ai provider', 'case study', 'case studies', 'examples'],
    answer: 'The FAQ covers common questions about tools, data access, timelines, and safe automations. It also notes that we can share relevant examples once we understand your use case.',
    cta: 'Want me to point you to a specific FAQ?'
  },
  {
    id: 'contact',
    title: 'Contact & booking',
    keywords: ['contact', 'book', 'call', 'meeting', 'schedule', 'talk', 'human'],
    answer: `You can reach us at ${CONTACT_EMAIL} or use the booking link to pick a time that works.`,
    cta: 'Want to book a call?'
  }
];

// Guardrail fallback when no KB match is strong enough.
const fallbackReply = () => {
  return {
    reply: `Thanks for the question. I'm not 100% sure based on the knowledge base. You can email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> or type <strong>HUMAN</strong> for handoff details. What outcome are you aiming for?`,
    fallback: true,
    cta: ''
  };
};

const normalize = (text) => text.toLowerCase().trim();

const stripHtml = (html) => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

const scoreSection = (message, section) => {
  let score = 0;
  const lower = normalize(message);
  section.keywords.forEach((keyword) => {
    if (lower.includes(keyword)) {
      score += keyword.includes(' ') ? 2 : 1;
    }
  });
  return score;
};

// Simple keyword scoring to match a user message to a KB section.
const findBestSection = (message) => {
  let best = null;
  let bestScore = 0;
  KB_SECTIONS.forEach((section) => {
    const score = scoreSection(message, section);
    if (score > bestScore) {
      bestScore = score;
      best = section;
    }
  });
  if (bestScore < 2) {
    return null;
  }
  return best;
};

// Builds structured response: Acknowledge → Answer → CTA (clarify only when needed).
const buildAssistantReply = (message) => {
  const section = findBestSection(message);
  if (!section) {
    return fallbackReply();
  }
  const ack = 'Got it.';
  const answer = `${section.answer} <a href="kb.html#${section.id}">Read more</a>.`;
  return {
    reply: `${ack} ${answer} ${section.cta}`,
    fallback: false,
    cta: section.cta
  };
};

// Human handoff content for the HUMAN trigger and quick action.
const buildHumanReply = () => {
  return {
    reply: `Got it. Here are the best ways to reach a human:\n\n<strong>Email:</strong> <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>\n<strong>Copy/paste template:</strong> ${CONTACT_TEMPLATE.replace(/\n/g, '<br>')}\n<a class="button" href="${BOOKING_LINK}" target="_blank" rel="noreferrer">Book a call</a>`,
    fallback: false
  };
};

// Persist logs locally for iteration.
const logChat = ({ userMessage, botReply, quickAction, fallback }) => {
  const existing = JSON.parse(localStorage.getItem(CHAT_LOG_KEY) || '[]');
  existing.push({
    timestamp: new Date().toISOString(),
    userMessage,
    botReply,
    quickAction: quickAction || '',
    fallback: Boolean(fallback)
  });
  localStorage.setItem(CHAT_LOG_KEY, JSON.stringify(existing));
};

// Future provider hook: swap this function to call a real AI API later.
const generateReply = (message) => {
  return buildAssistantReply(message);
};

const chatWidgets = document.querySelectorAll('[data-chat-widget]');

chatWidgets.forEach((widget) => {
  const toggleButton = widget.querySelector('.chat-toggle');
  const panel = widget.querySelector('.chat-panel');
  const closeButton = widget.querySelector('.chat-close');
  const messagesContainer = widget.querySelector('.chat-messages');
  const form = widget.querySelector('.chat-form');
  const input = widget.querySelector('input[name="message"]');
  const quickButtons = widget.querySelectorAll('[data-quick-action]');

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

  const appendMessage = (role, content, allowHtml = false) => {
    const message = document.createElement('div');
    message.className = `chat-message chat-message--${role}`;
    const paragraph = document.createElement('p');
    if (allowHtml) {
      paragraph.innerHTML = content;
    } else {
      paragraph.textContent = content;
    }
    message.appendChild(paragraph);
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const handleAssistantReply = (message, quickAction) => {
    const trimmed = normalize(message);
    const result = trimmed === 'human' ? buildHumanReply() : generateReply(message);

    appendMessage('assistant', result.reply, true);
    logChat({
      userMessage: message,
      botReply: stripHtml(result.reply),
      quickAction,
      fallback: result.fallback
    });
  };

  const handleHumanReply = (userMessage, quickAction) => {
    const result = buildHumanReply();
    appendMessage('assistant', result.reply, true);
    logChat({
      userMessage,
      botReply: stripHtml(result.reply),
      quickAction,
      fallback: false
    });
  };

  const setLoading = (isLoading) => {
    form.querySelector('button[type="submit"]').disabled = isLoading;
    input.disabled = isLoading;
  };

  const submitMessage = (message, quickAction) => {
    if (!message) {
      return;
    }
    appendMessage('user', message);
    setLoading(true);
    input.value = '';

    window.setTimeout(() => {
      handleAssistantReply(message, quickAction);
      setLoading(false);
    }, 150);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = input.value.trim();
    submitMessage(message, '');
  });

  quickButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const quickAction = button.dataset.quickAction || '';
      const prompt = button.dataset.prompt || quickAction;
      const isHuman = button.dataset.human === 'true';

      if (isHuman) {
        appendMessage('user', quickAction);
        handleHumanReply(quickAction, quickAction);
        return;
      }

      submitMessage(prompt, quickAction);
    });
  });
});
