# Powell Projects Chatbot (Cloudflare Worker)

This worker provides the `/api/chat` endpoint used by the website chatbot.

## Prerequisites
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- A Cloudflare account
- An OpenAI API key

## Setup
1. From this folder, install Wrangler if needed:
   ```bash
   npm install -g wrangler
   ```
2. Authenticate:
   ```bash
   wrangler login
   ```
3. Configure environment variables:
   ```bash
   wrangler secret put OPENAI_API_KEY
   ```
   You can also edit `wrangler.toml` to set:
   - `ALLOWED_ORIGIN` (e.g., `https://your-github-pages-domain.com`)
   - `RATE_LIMIT_MAX` (requests per minute per IP)
   - `OPENAI_MODEL` (default: `gpt-4o-mini`)
4. Deploy:
   ```bash
   wrangler deploy
   ```

## Connecting the frontend
- The website chat widget uses the endpoint in `data-api-endpoint`.
- If you host the worker on a custom domain like `https://api.yourdomain.com/api/chat`, update the attribute:
  ```html
  <div class="chat-widget" data-chat-widget data-api-endpoint="https://api.yourdomain.com/api/chat">
  ```
- If you proxy `/api/chat` through your main domain, you can keep the default `/api/chat` value.

## Local development
```bash
wrangler dev
```
Then update `data-api-endpoint` to the local dev URL shown by Wrangler.
