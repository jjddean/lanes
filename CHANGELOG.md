# Changelog

## [2026-02-26] Phase 2 – Messaging Core
### Added
- **WhatsApp Provider**: Meta WhatsApp Cloud API wrapper in `convex/providers/whatsapp.ts`.
- **Email Provider**: Resend API wrapper in `convex/providers/email.ts`.
- **Campaign Logic**: `startCampaign` mutation for JIT lead activation and campaign setup in `convex/campaigns.ts`.
- **Message Queue**: Background dispatcher with priority and retry logic in `convex/messageDispatcher.ts`.
- **Webhooks**: WhatsApp status tracking (delivered/read/failed) in `convex/http.ts`.

### Changed
- **Onboarding UI**: Triggered the real campaign initialization flow.
- **Convex Schema**: Added `messageQueue` and `entitlements` mandatory tables.
