# DCTS + Scaling Implementation Notes
Last updated: March 3, 2026

## Scope
Summary of implementation work across DCTS data modeling, lead scaling, and dashboard integration.

## DCTS Catalog
Files:
- `convex/dctsCatalog.ts`
- `convex/dcts.ts`
- `convex/schema.ts`

Added:
- Seed dataset with tier, iso code, cumulation, suspensions, FTA flags.
- Seed mutation: `dcts:seedDctsCountries` (upsert + prune).
- Query helpers:
  - `dcts:listCountriesByTier`
  - `dcts:listCountryOptions`
  - `dcts:getCountryProfile`
  - `dcts:getCatalogCounts`

## Schema Extensions
`dctsData` fields added:
- `isoCode`
- `countryNameNormalized`
- `cumulationGroups`
- `hasGraduationSuspensions`
- `graduationSuspensions`
- `hasUkFta`
- `isDctsBeneficiary`
- `notes`

Indexes:
- `by_country_name`
- `by_tier`

## Lead Scaling
Files:
- `convex/schema.ts`
- `convex/leads.ts`
- `app/dashboard/leads/page.tsx`

Added:
- lead fields: `companyType`, `lastSeen`
- indexes:
  - `byOrgCreatedAt`
  - `byOrgCountry`
  - `byOrgIndustry`
  - `byOrgCountryIndustry`
  - `byStatusCreatedAt`
- paginated query: `leads:listLeadsPaginated`
- lanes page switched to paginated loading

## Engine Filter Wiring
File:
- `app/dashboard/engine/page.tsx`

Changes:
- Country options from `dcts:listCountryOptions` (+ fallback constants).
- Industry options from `leads:listIndustryOptions` (+ fallback constants).

## Commands Used
- `npx convex codegen`
- `npx tsc --noEmit --pretty false`
- `npx convex dev --once`
- `npx convex dev --once --run dcts:seedDctsCountries`

