# Neutral Content integration

- Category 5 (Neutral content) is connected to the `#/neutral` route.
- The Neutral Content experience is served from `/neutral-content/index.html` inside the main app full-screen shell.
- Cover, English/Hindi toggle, learning levels, search, expand/collapse, progress tracking and source links are retained.
- Back to categories returns to the main ArthSetu category screen through same-origin postMessage routing.
- Assets are stored under `client/public/neutral-content/assets/cover/`.

## Local preview

```bash
cd client
npm install
npm run dev
```

Open the localhost URL printed by Vite, sign in, then select **Neutral content** (Category 5).
