# Project overview and learner journey

## Purpose

Help a person with uneven income repeat one simple decision habit whenever money arrives. The module does not demand a complex monthly budget, a fixed savings rate or a perfect income forecast.

**Core rule:** Do not plan life around the best earning period. First protect the money needed to keep earning, then essential household costs, then a buffer, and only then increase lifestyle spending.

## Who the module is designed for

| Path | Examples | Typical cash-flow issue | First visual order |
|---|---|---|---|
| Daily / cash | Sweepers, vegetable sellers, labourers, auto drivers | Small cash amounts arrive daily; tomorrow's stock, fuel or tools must remain possible | Work First → Home Fixed → Today |
| Weekly / gig / shop | Delivery partners, ride-hailing drivers, kirana shops, technicians | Payouts or sales vary; fuel, maintenance, fees and wastage reduce the money left | Business → Personal draw → Buffer |
| Invoice / project | Freelancers, designers, developers, consultants | Work, invoice date and payment date differ; business costs and taxes continue while waiting | Tax reserve → Business → Personal draw → Buffer |

## Screen-by-screen journey

1. **Welcome:** One rule, a familiar livelihood collage and the three-step method. Learner can go straight to the questions, safety nets, short modules or group facilitation.
2. **Income pattern:** Pick the way money usually arrives. The path can be changed later.
3. **Floor Number:** Add housing/rent, ration and utilities, school and essential health, and work costs. This is the minimum one-month amount, not a lifestyle budget.
4. **Reality Check:** Compare a weak-month income estimate with the Floor Number. Being below the number is treated as information, not failure. The learner is reminded to protect earning ability, reduce avoidable leakage, check eligible support and build a tiny cushion when possible.
5. **Teach:** Five short illustrated cards for the selected tier. Each card follows story → one idea → rupee example → tiny action. Three friendly questions finish the tier lesson.
6. **Practice:** Enter sample money and place it into the tier's labelled boxes. Coins can be dragged, tapped or typed as exact rupee values. The app does not prescribe percentages.
7. **Self-plan:** Write the income pattern, Floor Number, work money and first buffer target. Save on-device, track four pledges and seven daily checks.
8. **Five questions:** A repeatable checklist for every time money comes in.
9. **Further learning:** Six five-minute modules: debt, buffer, digital safety, insurance/pension, tax and peak-season lifestyle.
10. **Safety nets:** Official links with who may qualify, next steps, cautions and last-verified tags.
11. **Facilitator mode:** A 30-minute community lesson that never asks participants to reveal their income, debt or identity details.

## Design rationale

The outer shell uses the main ArthSetu identity: parchment texture, navy and wine, muted gold, editorial serif headings, and Indian livelihood/craft imagery. The work/home/buffer boxes use blue, green and orange. Colour is paired with text and numbering so meaning is not colour-only.

The module has **no global navigation bar**. A visible step order and in-screen buttons keep the next action clear and limit the number of choices on a small phone. English and Hindi are the only language options; there is no Hinglish mode or dark theme.

## Folder structure

```text
modules/irregular-income/
├── index.html
├── app.css
├── app.js
├── content.js
├── manifest.webmanifest
├── service-worker.js
├── icon.svg
├── admin.html
├── My-Irregular-Income-Plan.pdf
├── assets/
├── content/
│   ├── en.json
│   ├── hi.json
│   └── schemes.json
├── docs/
│   ├── PROJECT-OVERVIEW.md
│   ├── FACILITATOR-GUIDE.md
│   ├── TESTING-CHECKLIST.md
│   └── ASSUMPTIONS.md
└── tools/
    └── build_content.py
```

## Storage and information collected

The module has no account or backend. Learning progress, typed practice values, plan fields and habit ticks remain in `localStorage` for this browser. This is convenient but not a secure vault. Shared-device users should not type sensitive details and should clear the stored plan before handing the phone to another person.
