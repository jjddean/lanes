# Project History & Decision Log

## [2026-02-26] MVP Definition & AI Strategy
- **Core Product:** Automated outbound system for freight and trade companies.
- **Technology Stack:** Next.js, Clerk, Convex, Stripe, Meta (WhatsApp), Resend (Email), OpenAI.
- **AI Strategy Decision:** 
    - Start with LLM-powered personalization (GPT-4o).
    - Implement **Feature Freezing** at send-time to ensure historical data remains valid for future ML training.
    - Path to custom fine-tuned intent models once ~3,000-5,000 labeled messages are reached.
- **Database Decision:** Use Convex with an append-only logging pattern for interaction "corrections" to maintain high-quality training sets.

## [2026-02-26] Phase 1 – Data & Auth (Completed)
- **Schema Update**: Added freight company profile fields (`website`, `mainTradeLane`) and `connectionStatus` to Convex.
- **Onboarding Flow**: Implemented multi-step wizard and global `OnboardingGuard` for redirection.
- **Clerk Integration**: Synced organizations and user roles from Clerk to Convex.

## [2026-02-26] Phase 2 – Messaging Core (Completed)
- **Provider Wrappers**: Built abstraction layers for **Meta WhatsApp Cloud API** and **Resend Email**.
- **Lead Strategy**: Implemented "Just-in-Time" lead activation. Total scale: 300 leads per country for 10 countries (~3,000 total).
- **Message Queue**: Built a priority-based background dispatcher with exponential backoff and idempotency.
- **WhatsApp Webhooks**: Implemented real-time delivery and read status tracking.
- **Configuration**: Set up Meta WhatsApp Business Account (`1394114815845003`) and test environment.

## [2026-02-26] Phase 3 – AI Layer (Completed)
- **Ollama Integration**: Built provider wrapper for local LLM usage, configured with **Phi-3**.
- **AI Logic**: Automated personalization of outbound messages and classification of incoming replies.
- **Intent Models**: Implemented intent detection (Interested, Question, Stop).

## [2026-02-26] Phase 4 – Automation Engine (Completed)
- **Follow-up Engine**: Automated 48-hour follow-up loops (capped at 3).
- **Rate Limiting**: Implemented daily send quotas per organization.
- **Smart Worker**: Integrated AI generation directly into the background dispatcher.

## [2026-02-26] Phase 5 – Billing & Entitlements (Completed)
- **Stripe Integration**: Implemented provider for checkout sessions and webhook verification.
- **Entitlement Logic**: Added guards to the message dispatcher and AI layer to enforce plan-based limits.
- **Billing Dashboard**: Created 'Billing & Usage' UI with real-time progress bars for daily quotas.
- **Monetization**: Set up Pro ($99/mo) and Enterprise ($299/mo) tiers.

## [2026-03-01] Phase 6 – UI Standardization & Cleanup (Completed)
- **Feature Cleanup**: Removed the "Log Win" legacy feature (modal, state, and `convex/deals.ts` logic) to streamline the deal flow.
- **UI Design System**: 
    - **Button Standardization**: Standardized all primary buttons (New Lead, New Message, Quick Create, Reply, Send) to a consistent Slate-based "Dashboard Light" look with subtle borders and shadows.
    - **Rounding Correction**: Eliminated excessive rounding (3xl/2xl) in favor of professional `rounded-xl` and `rounded-lg` containers across the app.
    - **Typography Refinement**: "Straightened" all KPI numbers by removing italics from scores and volumes across Billing, Leads, Wins, and the Command Center.
- **Wins Dashboard**: Built a professional trade-win tracker with mock data, summary metrics, and KPI card layout synchronized with the Command Center.
- **AI Activity Stream**: Refined real-time logs on the dashboard with professional descriptions (e.g., "Strategic win captured") and standardized `rounded-lg` icon treatments.
- **Strategy Branding**: Updated the Engine page to "Recalibrate Strategy DNA" to emphasize the dynamic nature of Lane discovery.
- **AI Assistant**: Synchronized the AI reply console in the Inbox with the `calculateNeedScore` logic for context-aware drafting.

