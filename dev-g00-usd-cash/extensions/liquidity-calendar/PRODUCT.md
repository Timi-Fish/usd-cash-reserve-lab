# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: a family-office client (the principal) who holds a USD spending reserve and reviews, with their advisor, payments planned for roughly the next three to six months. The client lists the spending dates; the advisor explains the result. Collaborators who do not use this page: the data maintainer (runs the refresh and reads its report) and the group reviewer (accepts or rejects releases).

## Product Purpose

The liquidity calendar answers one question: for each planned spending date, which saved reference Treasury bill matures on or before it, and how many days early? It extends the dashboard's single cash-date check to several dates and to every bill tenor in the same official Treasury source (4 to 52 weeks). Success: the client leaves the discussion knowing which dates line up, which do not, which payments are fixed USD amounts and which are price-sensitive budgets, and what to confirm with the advisor.

## Positioning

Calendar fit only, from official saved quotes. It uses every tenor in the Daily Treasury Bill Rates dataset the dashboard already relies on, keeps the saved quote date and its age on screen, and never ranks bills, recommends a purchase or claims that a payment can be met.

## Operating Context

Used during or before an advisor discussion, on a laptop or a projected screen. The takeaway is a printed or copied discussion summary. Bill data comes from `extensions/auto-refresh/refresh.py`, which writes `bills.js` only after validation. Purchasing-power scenarios stay in the main dashboard (`index.html`).

## Capabilities and Constraints

- Static HTML, CSS and JavaScript; opens by double-click; no external libraries, fonts or network requests.
- Inputs: a handful of spending dates, each with a label and a type (fixed USD payment or price-sensitive budget). No amounts.
- Nothing is stored: inputs live only in the open page, and closing it clears them.
- Out of scope by group decision: spending-amount or target-amount models, reinvestment or roll strategies, cash-flow adequacy or payment-capacity judgments, other asset classes, FX and trading.
- The model starts at the saved quote date. Quotes are not executable offers; purchase, settlement, receipt of funds, taxes and fees are not assessed.
- English UI. Required disclaimer, verbatim: "Educational project. Not investment advice."

## Brand Commitments

Name: USD Cash Reserve Lab; this page is its liquidity calendar. Voice: plain, precise and cautious, using the dashboard's own terms (reference bill, saved quote, calendar fit, purchasing power).

## Evidence on Hand

- `bills.js`: seven reference bills from Daily Treasury Bill Rates, quote date 2026-11-06, retrieved 2026-11-08 by `refresh.py`.
- The dashboard's saved data (`data.js`) and method (`README.md`, `calculations/method.md`).
- No user research, usage data or testimonials exist, and none may be invented.

## Product Principles

1. Timing first: a payment date is met by the calendar, not by a higher return.
2. Fit is not advice: show the nearest earlier maturity and the gap; never rank or recommend.
3. Observed, assumed and modeled values stay visibly distinct; the quote date and its age are always on screen.
4. Nothing leaves the page: no storage, no tracking, no network.
5. Every unassessed step (purchase, settlement, receipt, taxes, the gap after maturity) is named for the advisor conversation.

## Accessibility & Inclusion

Readable on a phone and a projector (course rule); every status is stated in text, not by color alone; full keyboard operation.
