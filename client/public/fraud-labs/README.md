# ArthSetu · Fraud Labs

A small, offline-friendly financial-safety practice module. It is designed as a separate add-on that can sit beside the existing `irregular-income` module.

## Add it to ArthSetu

1. Extract this ZIP into the main project.
2. Copy `arthsetu-household/modules/fraud-labs/` into the same `modules/` folder that contains `irregular-income/`.
3. Open `modules/fraud-labs/index.html` to run it, or serve the parent project over localhost/HTTPS.
4. No server, account, analytics or backend is required.

The included `preview.html` is a self-contained browser preview. It can be opened directly without a local server.

## What is included

- **Fraud Labs home:** three direct choices — Spot the scam, Fraud map, and I was cheated — help.
- **Spot the scam:** 11 shuffled, fictional examples. Each shows one message or call, Real/Scam choices, the warning sign, what the scammer wants and one safer next step.
- **Fraud map:** a compact Who / Why / How view, followed by three quick checks: pause, verify and protect.
- **Help:** tap-to-call 1930, the National Cyber Crime Reporting Portal, four calm steps, a short evidence checklist and a reminder to preserve evidence.
- English and Hindi content in `content/en.json` and `content/hi.json`.
- Browser text-to-speech. Audio availability and Hindi voice quality depend on the device/browser.
- Larger text and listen-first controls.

## Edit content

Edit the matching English and Hindi JSON files, then rebuild `content.js`:

```bash
python3 tools/build_content.py
```

Run the structural check:

```bash
python3 tools/validate_content.py
```

The UI uses the same visual direction as the supplied ArthSetu reference module: parchment, navy, wine and antique gold; serif display headings; Hindi system-font fallback; rounded paper cards; large controls. The reference ZIP is a standalone HTML/CSS/JS module, so this add-on intentionally uses that same stack rather than React/Vite or Express.

## Privacy and safety

- No login, analytics, remote account connection or backend.
- No personal banking details are requested or stored.
- All 11 practice scenarios are fictional and use no real bank, brand, person or phone number.
- Do not share OTPs, PINs, CVVs, passwords or screen-sharing access.
- This module is educational, not legal or banking advice. Contact your bank immediately if money or account access is at risk.

## Sources and content boundary

The reporting steps and safety guidance are grounded in official Indian sources. The module deliberately avoids a simplified promise about zero liability or a universal three-working-day rule. RBI customer-liability rules depend on the transaction facts, bank category and the applicable effective date. See `docs/SOURCES.md` for the sources checked and the rule intentionally left out.

## Branding

The nav bar logo is the ArthSetu bull emblem (`assets/arthsetu-bull.png`, 192×192, circular). It is also used as the browser tab icon.
