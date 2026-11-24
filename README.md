# Arthsetu — Financial Literacy Platform

**Arthsetu** bridges India to financial literacy across life stages, from school students to senior citizens, using rich Indian family stories, bilingual audio narration with speed controls, interactive activities, and authoritative regulatory guidance (RBI, SEBI, IRDAI, EPFO, PFRDA, India Post, Income Tax Department).

| Layer | Technology | Where |
|---|---|---|
| Frontend | React (Vite) | `client/` |
| Backend | Node.js + Express | `server/` |
| Database | MongoDB (Mongoose) with Demo/Guest fallback | `server/src/models/User.js` |
| API | REST, JSON, JWT bearer token | `server/src/routes/` |

---

## Life-Stage Tiers Overview

1. **Ages 6–10 ("Little learner" / छोटा सीखने वाला):** Money basics, barter, rupee coins, and digital payments.
2. **Ages 11–14 ("Pocket-money manager" / जेबख़र्च का प्रबंधक):** Budgeting, saving, needs vs. wants, and first bank accounts.
3. **Ages 15–17 ("Teen saver" / किशोर बचतकर्ता):** Banking, interest rates, compounding, digital safety, and cyber awareness.
4. **Ages 18–22 ("Young adult" / युवा वयस्क):** First bank accounts, education loans, emergency fund basics, and PAN cards.
5. **Ages 23–30 ("First earner" / पहली कमाई वाला):** Salary slips, EPF, taxes, mutual fund SIPs, term insurance, and credit scores.
6. **Ages 31–45 ("Family builder" / परिवार निर्माता):** **122 complete topics** covering home loans, child education planning, investments, insurance reviews, and family budgets.
7. **Ages 41–60 ("Zimmedari Se Suraksha Tak" / ज़िम्मेदारी से सुरक्षा तक):** **20 comprehensive modules** covering complete mid-life financial planning, retirement corpus building, multiple income sources, education/marriage planning, home/personal debt management, portfolio diversification, EPF/PPF/NPS, income tax regimes, elder care support, second career after 50, estate planning, and retirement transition.
8. **Ages 60+ ("Sukoon Bhara Kal" / सुकून भरा कल):** **25 comprehensive modules** covering retirement income management, government pensions, EPF/PPF/NPS exits, SCSS (₹30L), Post Office MIS, DICGC-insured FDs, senior healthcare inflation, Ayushman Bharat PM-JAY 70+, reverse mortgage, cyber fraud ("digital arrest") prevention, UPI safety, Will writing, nominee vs legal heir, property transfer, elder care, senior income tax (80TTB, 194P), financial sovereignty, and leaving a lasting legacy.

---

## 8-Part Learning Format for Every Topic

1. **Video Lecture & Storyboard:** Visual scene with animated SVG illustration and synchronized subtitle captions.
2. **Audio Learning:** Browser speech synthesis in separate Hindi and English with Play/Pause, Replay (`↺`), and Speed Controls (`0.8x`, `1.0x`, `1.25x`).
3. **Key Takeaways (Know More):** Core financial facts and rules in bulleted format.
4. **Detailed Explanation:** In-depth breakdown covering What & Why, Strategy & How to Implement, Key Advantages, and Common Pitfalls to Avoid.
5. **Extra Knowledge & Official Sources:** Advanced financial tips and verified badges citing authorized regulatory bodies (RBI, SEBI, IRDAI, EPFO, PFRDA, NHB, India Post, Income Tax Dept) with last-verified year (2026).
6. **Real-Life Examples:** Realistic Indian family scenarios with specific rupee figures and relatable situations.
7. **Practical Activity:** Interactive checklist where users can check off action steps and track completion.
8. **5-Question Quiz:** Five questions per topic with bilingual options, instant feedback, and detailed answer explanations.

---

## Running the Application

### Prerequisites
- Node.js 18+
- (Optional) MongoDB local or MongoDB Atlas cluster. The app includes a Guest/Demo Mode fallback that runs completely standalone without requiring a running database.

### Quick Start
```bash
# 1. Install dependencies
npm run install:all

# 2. Start the Frontend (Vite dev server)
cd client
npm run dev -- --host 127.0.0.1 --port 5173

# 3. (Optional) Start the Backend Server
cd ../server
cp .env.example .env     # configure MONGODB_URI & JWT_SECRET
npm run dev
```

### Production Build
```bash
npm --prefix client run build
npm --prefix server start
```


## Integrated Household Mode

The Household Mode project is now included in the main ArthSetu client. After signing in, open **Household** from the category page to enter the integrated full-screen experience. Use **← All categories** in the Household Mode navigation to return to the category page. Household lessons, images, styles, and data are served from `client/public/household/`.

### Run locally / live preview

From the `arthsetu/client` directory:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). Sign in, then select the **Household mode** category. For a production build, run `npm run build`.

---

## Irregular Income Module

Category **#3 "Irregular income"** on the categories page opens the self-planning module (daily / weekly / invoice income tiers, Floor Number, seven-day practice, quiz, safety-net directory). It lives in `client/public/irregular-income/` and is embedded full-screen at `#irregular`, the same way Household Mode is, with a **← Categories** button and language synced to the main app.


## Fraud Labs integration

Category **#6 "Fraud lab"** opens the Fraud Labs learning experience inside the ArthSetu application shell (with an in-app **← All categories** control). Its HTML, CSS, JavaScript, bilingual content and image assets are served from `client/public/fraud-labs/`; Vite copies these files to `client/dist/fraud-labs/` during a production build. It is an embedded module, not a separately launched website.
deployed on render https://arthsetu-7d9e.onrender.com.
