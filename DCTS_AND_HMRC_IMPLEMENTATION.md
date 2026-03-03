# LanesAI Whole App Technical Documentation
Last updated: March 3, 2026

## 1) Scope
This document covers the whole app:
- Product architecture (frontend + Convex backend)
- Route map and access rules
- Data model and indexing
- Messaging engine workflows
- Compliance, DCTS, and HMRC integration
- Billing, operations, and runbook commands

## 2) Stack
- Frontend: Next.js 15 (App Router), React 19, Tailwind v4, shadcn/ui, Radix
- Auth + org roles: Clerk
- Backend + DB + jobs: Convex
- Messaging providers: WhatsApp Cloud API, Resend
- Payments: Stripe (via Convex provider wrapper)
- Document OCR: AWS Textract wrapper

## 3) Route Map
### Public/marketing
- `/`
- `/about`
- `/solutions`
- `/resources`

### Protected app
- `/dashboard`
- `/dashboard/engine`
- `/dashboard/leads`
- `/dashboard/inbox`
- `/dashboard/deals`
- `/dashboard/compliance`
- `/dashboard/billing`
- `/dashboard/settings`
- `/onboarding`

### Admin
- `/admin`
- `/admin/logs`

### HMRC routes
- `/auth/hmrc/connect`
- `/auth/hmrc/callback`
- `/auth/hmrc/disconnect`
- `/api/hmrc/status`

## 4) Access Control
### Middleware policy
File: `middleware.ts`
- `/dashboard(.*)` and `/admin(.*)` are protected.
- Admin role is enforced in `app/admin/layout.tsx` (server-side redirect to `/dashboard` for non-admin).

### Admin layout defense-in-depth
File: `app/admin/layout.tsx`
- Server-side role gate redirects non-admin users to `/dashboard`.

## 5) Core Product Areas
### Command Center
- KPIs from leads + events.
- Hidden Gem score from `scoring.calculateHiddenGemScore`.

### Engine
- Sender persona and target DNA controls.
- Country options from DCTS catalog + fallback constants.
- Industry options from org leads + fallback constants.

### Lanes
- Uses `leads.listLeadsPaginated`.
- Side sheet with strategic summary, trade intelligence, outreach tabs.
- “Deep Reasoning Flow” panel removed.

### Inbox
- Conversation list + thread + manual send flow.
- Status/snooze/assign actions.

### Compliance
- KPI cards from compliance docs.
- Origin Simulator + DCTS cards in upgrade-CTA state.
- Audit trail history table.

### Billing
- Plan usage from `billing.getPlanInfo`.
- Checkout via `billing.createCheckout`.

### Admin
- Queue and system controls.
- HMRC management card (full control actions).

## 6) Convex Data Model
Main tables in `convex/schema.ts`:
- `organizations`, `users`, `workflows`, `campaigns`
- `leads`, `messages`, `replies`, `deals`, `events`, `messageQueue`
- `entitlements`, `paymentAttempts`
- `targets`, `importJobs`, `importRows`
- `dctsData`, `complianceDocs`, `tradeStats`, `knowledgeChunks`

Scale indexes added for leads:
- `byOrgCreatedAt`, `byOrgCountry`, `byOrgIndustry`, `byOrgCountryIndustry`, `byStatusCreatedAt`

## 7) Messaging Engine Flow
Primary files:
- `convex/workflows.ts`
- `convex/messageDispatcher.ts`
- `convex/messages.ts`
- `convex/messageUpdates.ts`
- `convex/ai.ts`
- `convex/crons.ts`

Flow:
1. Workflow discovery adds leads.
2. AI generates sequence messages.
3. Messages enter queue.
4. Dispatcher claims/sends with limits.
5. Webhooks update state.
6. STOP keyword triggers hard halt.

## 8) DCTS Implementation
Primary files:
- `convex/dctsCatalog.ts`
- `convex/dcts.ts`
- `convex/schema.ts`

Implemented:
- Seed-backed DCTS catalog in Convex.
- Eligibility query with tier, margin, warnings.
- Cumulation-aware rules-of-origin simulation.
- Savings calculator and lead status updater.

## 9) HMRC Implementation
Primary files:
- `app/auth/hmrc/connect/route.ts`
- `app/auth/hmrc/callback/route.ts`
- `app/auth/hmrc/disconnect/route.ts`
- `app/api/hmrc/status/route.ts`
- `components/hmrc/HmrcConnectionCard.tsx`

Current behavior:
- `connect` route starts OAuth authorize flow (`/oauth/authorize`) with scopes.
- Callback route exchanges `authorization_code` for token.
- OAuth `state` is set in connect and validated in callback.
- `returnTo` is preserved across OAuth via cookie and restored after callback.
- Token state stored in secure httpOnly cookies.
- Status route returns sanitized connection state.

Best-practice placement:
- Full HMRC actions in Admin only.
- User pages: status-only or no HMRC actions.

## 10) Billing + Entitlements
File: `convex/billing.ts`
- Plan source: `organizations.plan`
- Quota and entitlement checks per plan.
- Stripe webhook sync updates plan/quota.

## 11) Key Env Variables
Core:
- `NEXT_PUBLIC_CONVEX_URL`
- Clerk keys and redirect vars
- Convex `CLERK_WEBHOOK_SECRET`

HMRC:
- `HMRC_CLIENT_ID`
- `HMRC_CLIENT_SECRET`
- `HMRC_REDIRECT_URI`
- `HMRC_ENVIRONMENT`
- optional `HMRC_AUTHORIZE_URL`
- optional `HMRC_TOKEN_URL`
- optional `HMRC_EORI`
- optional `HMRC_SCOPES`

Providers:
- `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_ENTERPRISE_PRICE_ID`
- `NEXT_PUBLIC_APP_URL`
- `OLLAMA_HOST`, `OLLAMA_MODEL`, `TEST_MODE`

## 12) Runbook Commands
- `npm run dev`
- `npx convex dev`
- `npx convex codegen`
- `npx tsc --noEmit --pretty false`
- `npx convex run dcts:seedDctsCountries '{}'`

## 13) Today's Session Updates (March 3, 2026)
- HMRC connect flow refactored to proper OAuth authorize flow (`connect -> callback`), replacing token-only connect behavior.
- Added robust HMRC error handling: connect/callback now redirect with `hmrc=error` details instead of raw server crashes.
- Added OAuth state validation and cleanup cookies (`hmrc_oauth_state`, `hmrc_oauth_return_to`) on callback/disconnect.
- HMRC card connect action now includes `returnTo` to return user/admin to originating page.
- Added missing `/admin/logs` route to eliminate admin sidebar 404.
- Middleware simplified to auth protection; admin role gate remains in admin layout (defense in depth).
