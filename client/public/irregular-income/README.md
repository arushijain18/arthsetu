# ArthSetu · Irregular Income Self-Planning

A small, offline-first learning module for people whose income arrives day by day, week by week, or after a project/invoice. It uses the ArthSetu parchment, textile, navy, wine and antique-gold visual identity, with a second colour system inside the lesson: **blue = work, green = home, orange = buffer**.

## Start here

1. Extract this module folder into the main ArthSetu project at `arthsetu-household/modules/irregular-income/`.
2. To preview it directly, open `preview.html` from the delivered preview file. The standalone preview embeds its lesson content and artwork.
3. To run the project folder locally, open a terminal in this folder and run:

   ```bash
   python3 -m http.server 8000
   ```

   Then open `http://localhost:8000/`.
4. The service worker caches the module after the first successful visit. For a fresh deployment, serve it over HTTPS or localhost; service workers do not work from ordinary `file://` URLs.

No account or server is needed. The saved plan, pledges, practice amounts and learning state are stored in this browser on this device. On a shared phone, another person using the same browser profile may see them. Use the “Clear my saved plan” control before handing a shared phone to someone else.

## Journey

**Welcome → choose income pattern → Floor Number → Reality Check → teach → practice → self-plan → seven-day practice → five questions.** From the start screen, the learner can also open the five questions, short topics, safety-net directory or community facilitator mode without creating an account.

### Three income patterns

- **Tier 1 · Daily/cash:** Work First → Home Fixed → Today.
- **Tier 2 · Weekly/gig/shop:** Business → Personal draw → Buffer.
- **Tier 3 · Invoice/project:** Tax reserve → Business costs → Personal draw → Buffer.

The number of visible money boxes reflects the different jobs money must do. **There is no universal percentage split.** Use the real rupee costs, current obligations, household needs, debt, tax position and local conditions.

## Included files

- `index.html`, `app.css`, `app.js` — working web application.
- `content/en.json`, `content/hi.json` — editable bilingual learning content.
- `content/schemes.json` — government-support directory with official links and last-verified date.
- `content.js` — browser bundle generated from those JSON files; the app uses this for reliable offline and file-based preview.
- `assets/` — locally stored WebP illustrations.
- `manifest.webmanifest`, `service-worker.js`, `icon.svg` — installable PWA shell.
- `admin.html` — simple scheme-data editor/exporter. Serve the module locally to use it.
- `docs/` — overview, facilitator guide, testing checklist and assumptions.
- `My-Irregular-Income-Plan.pdf` — one-page printable plan in English and Hindi.
- `tools/build_content.py` — rebuilds `content.js` from the three JSON files.

## Edit lessons or schemes

1. Edit the relevant language file: `content/en.json` or `content/hi.json`.
2. Edit scheme names, eligibility notes, cautions, official URLs and `lastVerified` in `content/schemes.json`.
3. Run `python3 tools/build_content.py` from this folder to regenerate `content.js`.
4. Test both language choices and the relevant screen before publishing.

The content files are deliberately kept separate from the interface. Add a new language by copying the structure of `en.json`, translating every visible string and adding that language to the language switch.

## Privacy and accessibility

- No login, analytics, remote account connection or backend.
- No real bank details are requested. Never enter passwords, PINs, OTPs, PAN, Aadhaar or account numbers into notes.
- Browser text-to-speech is used where available. Voice availability and Hindi voice quality depend on the phone/browser. There are no pre-recorded audio files.
- Large text and listen-first modes are available in the top controls.
- Buttons have visible labels and keyboard focus; the practice tokens can be tapped as well as dragged.
- Uses local system serif and Devanagari fallbacks; no external font download is required.

## Important content boundary

This is financial education, not individualised investment, lending, insurance or tax advice. Examples are illustrative. Scheme terms change; check the linked official site or a local government help centre before relying on eligibility or applying. The safety-net file records its research date, but the official source takes priority over this learning module.

Before publishing content changes, run:

```bash
python3 tools/validate_content.py
python3 tools/build_content.py
```

The validator checks that both language files have the same structure, all tier and extra-topic quizzes contain three questions, and scheme cards have official HTTPS links and both language fields.
