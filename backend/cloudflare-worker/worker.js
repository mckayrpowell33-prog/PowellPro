const RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_RATE_LIMIT_MAX = 12;
const rateLimitStore = new Map();

const SYSTEM_PROMPT = `You are the Powell Projects website assistant for "Powell Projects — AI Operations & Automation".
Be concise, practical, and helpful for small businesses, real estate teams, and local service companies.
Focus on AI operations, workflow automation, data cleanup, intake, scheduling, reporting, and internal tools.
If a question requires a proposal, scope, pricing, or sensitive details, invite the user to book a call.
If the user asks to contact, book, call, or email, respond with the escalation message.`;

const escalationReply =
  'Happy to connect! Email us at Mckayrpowell33@gmail.com or book a call at https://calendly.com/.';

const buildCorsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

const jsonResponse = (data, status = 200, origin = '*') =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...buildCorsHeaders(origin),
    },
  });

const isEscalationRequest = (message) => {
  const lowered = message.toLowerCase();
  return [
    'contact',
    'call',
    'phone',
    'email',
    'book',
    'booking',
    'schedule',
  ].some((keyword) => lowered.includes(keyword));
};

const checkRateLimit = (key, maxRequests) => {
  const now = Date.now();
  const existing = rateLimitStore.get(key);
  if (!existing || existing.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  if (existing.count >= maxRequests) {
    return { allowed: false, resetAt: existing.resetAt };
  }
  existing.count += 1;
  rateLimitStore.set(key, existing);
  return { allowed: true };
};

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const origin = env.ALLOWED_ORIGIN || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: buildCorsHeaders(origin) });
    }

    if (pathname !== '/api/chat') {
      return new Response('Not found', { status: 404 });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'anonymous';
    const maxRequests = Number(env.RATE_LIMIT_MAX) || DEFAULT_RATE_LIMIT_MAX;
    const rateLimit = checkRateLimit(ip, maxRequests);

    if (!rateLimit.allowed) {
      return jsonResponse(
        { reply: 'Rate limit reached. Please try again in a minute.' },
        429,
        origin,
      );
    }

    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      return jsonResponse({ reply: 'Invalid request payload.' }, 400, origin);
    }

    const message = payload?.message?.toString().trim();
    if (!message) {
      return jsonResponse({ reply: 'Please share a question so I can help.' }, 400, origin);
    }

    if (isEscalationRequest(message)) {
      return jsonResponse({ reply: escalationReply }, 200, origin);
    }

    if (!env.OPENAI_API_KEY) {
      return jsonResponse(
        { reply: 'The assistant is not configured yet. Please try again later.' },
        500,
        origin,
      );
    }

    const history = Array.isArray(payload.history) ? payload.history.slice(-6) : [];
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history
        .filter((item) => item && item.role && item.content)
        .map((item) => ({ role: item.role, content: String(item.content) })),
      { role: 'user', content: message },
    ];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || 'gpt-4o-mini',
          temperature: 0.3,
          messages,
        }),
      });

      if (!response.ok) {
        return jsonResponse(
          { reply: 'The assistant is having trouble right now. Please try again soon.' },
          500,
          origin,
        );
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content?.trim();

      return jsonResponse({ reply: reply || 'Thanks! How else can I help?' }, 200, origin);
    } catch (error) {
      return jsonResponse(
        { reply: 'The assistant is temporarily unavailable. Please try again.' },
        500,
        origin,
      );
    }
  },
};
