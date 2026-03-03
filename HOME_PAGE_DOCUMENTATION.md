# LanesAI Home Page Documentation
Last updated: March 3, 2026

## Purpose and Difference
This doc is only for the public home page (`/`), not dashboard/admin product flows.

Difference:
- Home page: marketing, brand, conversion
- App pages: authenticated workflows and operations

## Route and Rendering
- Route: `app/(landing)/page.tsx`
- Current: `export const dynamic = 'force-dynamic'`
- Section order:
  1. Hero
  2. Features
  3. Pricing
  4. Testimonials
  5. Call to Action
  6. FAQs
  7. Footer

## Component Map
### Header + Hero
- `app/(landing)/header.tsx`
- `app/(landing)/hero-section.tsx`
- Auth-aware CTAs:
  - Signed out: login/get-started
  - Signed in: dashboard

### Features
- `app/(landing)/features-one.tsx`
- Uses:
  - `app/(landing)/table.tsx`
  - `app/(landing)/cpu-architecture.tsx`
  - `app/(landing)/animated-list-custom.tsx`

### Pricing
- Wrapper in `app/(landing)/page.tsx`
- Component: `components/custom-clerk-pricing.tsx`

### Testimonials
- `app/(landing)/testimonials.tsx`

### CTA
- `app/(landing)/call-to-action.tsx`

### FAQs
- `app/(landing)/faqs.tsx`

### Footer
- `app/(landing)/footer.tsx`

## Current Content State
- Home still includes starter-template copy/branding in places.
- Some nav/footer links are placeholders (`#`, `#link`).
- Some CTAs use placeholder targets.

## Quick Edit Guide
- Hero headline/subheadline: `hero-section.tsx`
- Nav links: `header.tsx`
- Pricing styles: `components/custom-clerk-pricing.tsx`
- Testimonials: `testimonials.tsx`
- FAQ text: `faqs.tsx`
- Footer links/social URLs: `footer.tsx`

