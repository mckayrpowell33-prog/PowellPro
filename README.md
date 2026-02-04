# Powell Projects – AI Operations Website

## Repo summary (150 words max)
This repository contains a complete, static marketing website for an AI Operations consultancy. The site is built with plain HTML, CSS, and JavaScript so it can be deployed directly to GitHub Pages without build tools. It includes dedicated pages for services, pricing, case studies, FAQs, and legal policies, plus a contact flow with a Formspree-ready form and booking link. All assets are local, including a Boise skyline SVG hero background, a roofline chart logo mark, and a lightweight SVG favicon. Copy is written for small businesses, real estate professionals, and local service providers who want practical AI workflows that save time.

## Suggested business names
- Powell Projects
- Boise AI Operations
- Practical Ops Lab
- ClearPath Automations
- Signal Ridge AI

## How to edit content
1. Open the HTML file you want to update (for example, `services.html`).
2. Edit headings and paragraphs directly inside the page.
3. Update shared styling in `assets/css/styles.css`.
4. Update smooth scrolling behavior in `assets/js/main.js` if needed.

## How to swap placeholders
- Email: Replace `Mckayrpowell33@gmail.com` across all pages.
- Phone: Replace `(986) 888-4844` across all pages.
- Booking link: Replace `https://calendar.google.com/` in `contact.html`.
- Formspree: Replace `your-form-id` in the contact form action.
- Domain: Replace `https://example.com` in meta tags, `sitemap.xml`, and `robots.txt`.

## Chatbot Upgrade
### Setup
1. Chat UI loads from `assets/css/chatbot.css` and `assets/js/chatbot.js`.
2. The Knowledge Base lives in `kb.html` and powers the chatbot replies.
3. Local chat logs are stored in browser `localStorage` and can be viewed at `chat-logs.html`.

### Where to edit KB content
- Update the KB copy, bullets, and FAQ directly in `kb.html`.
- Keep the `id` values on each KB section (`services`, `deliverables`, `timeline`, `packages`, `faq`, `contact`) so the chatbot can link to them.

### Where to edit booking link and email
- Edit `CONTACT_EMAIL` and `BOOKING_LINK` in `assets/js/chatbot.js`.
- Update the placeholders in `kb.html` under “Contact + booking link placeholder.”

## Deploy to GitHub Pages
1. Commit and push this repository to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose the `main` branch and `/ (root)` folder.
5. Save. Your site will publish at the provided GitHub Pages URL.

## Connect a custom domain (high level)
1. Buy a domain from your registrar.
2. In GitHub Pages settings, add your custom domain.
3. Update DNS records to point to GitHub Pages (A records or CNAME as instructed).
4. Enable HTTPS in GitHub Pages once DNS is verified.
