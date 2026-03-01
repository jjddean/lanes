# Setup & Onboarding Guide

## [WIP] Developer Environment
1. **Environment Variables:**
   - Copy `.env.example` to `.env.local`.
   - Required: `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`.
2. **Installation:**
   - `npm install`
3. **Execution:**
   - `npm run dev` (Runs on port 3005)
   - `npx convex dev` (Backend)

## Core Concepts

### 1. Data Strategy: The "Master JSON" Flow
- **Leads Master:** thousands of company profiles live in `app/dashboard/leads_master.json`.
- **Activation:** The app reads this file but only writes to the **Convex Database** when a lead is "Selected" for a campaign.
- **Benefit:** 
  - **Zero Bloat:** The database only stores what you are actually using.
  - **Speed:** The app doesn't load 50mb of data on every request.
  - **Portability:** You can swap the JSON file anytime to target new regions without changing code.

### 2. Organizations
- **Lead Enrichment:** When importing leads, ensure `laneOrigin` and `laneDestination` are populated for high-quality AI personalization.
- **The "Send Engine":** Messages are queued in Convex and dispatched based on rate limits and daily quotas set in the Organization profile.

## Best Practices for High-Scale Logging
- **Snapshot-First Pattern:** Always log the *frozen feature state* at the time of send to prevent data drift in future ML training.
- **Append-Only Corrections:** Never overwrite intent or status silently. Log a `correction_event`.
- **Traceability:** Every AI message must carry its `promptVersion` and `contextHash`.

## Advanced SaaS Best Practices

### 1. Send Engine Idempotency
- **Never double-send:** Use a `uniqueRequestId` (e.g., `leadId_campaignId_followupN`) when calling Twilio/Resend.
- **Atomic updates:** Update status in Convex immediately to prevent retry collisions.

### 2. Data Normalization (Freight Specific)
- **Standardize Lanes:** Convert "China" -> "CN" or "Shenzhen" -> "CNSZX" (UN/LOCODE) before processing.
- **Phone Formatting:** Strict E.164 for WhatsApp delivery.

### 3. Deliverability & Warm-up
- **The "Slow Burn":** New accounts start with 20 sends/day, increasing by 15% daily to protect reputation.
- **Human-Like Cadence:** Random jitters (2-7 mins) between Sends.

### 4. Cost Governance & Compliance
- **Quota Enforcement:** Check `messageQuota` before every send loop.
- **Universal Opt-Out:** Stop all automation immediately if a "Stop" intent is detected.
