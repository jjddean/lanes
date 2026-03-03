import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { DCTS_COUNTRY_COUNTS, DCTS_COUNTRY_SEED, normalizeCountryName } from "./dctsCatalog";

const TIER_NAMES = {
  COMPREHENSIVE: "Comprehensive Preferences",
  ENHANCED: "Enhanced Preferences",
  STANDARD: "Standard Preferences",
  NONE: "No DCTS Preference",
} as const;

async function findCountryProfile(ctx: any, countryName: string) {
  const normalized = normalizeCountryName(countryName);
  const byNormalized = await ctx.db
    .query("dctsData")
    .withIndex("by_country_name", (q: any) => q.eq("countryNameNormalized", normalized))
    .unique();
  if (byNormalized) return byNormalized;

  const byName = await ctx.db
    .query("dctsData")
    .filter((q: any) => q.eq(q.field("countryName"), countryName))
    .first();
  return byName;
}

export const seedDctsCountries = mutation({
  args: {},
  handler: async (ctx) => {
    let inserted = 0;
    let updated = 0;
    let deleted = 0;

    for (const row of DCTS_COUNTRY_SEED) {
      const existing = await ctx.db
        .query("dctsData")
        .withIndex("by_country_name", (q) => q.eq("countryNameNormalized", row.countryNameNormalized))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, row);
        updated += 1;
      } else {
        await ctx.db.insert("dctsData", row);
        inserted += 1;
      }
    }

    const seedNames = new Set(DCTS_COUNTRY_SEED.map((row) => row.countryNameNormalized));
    const existingRows = await ctx.db.query("dctsData").collect();
    for (const row of existingRows) {
      const normalized = row.countryNameNormalized ?? normalizeCountryName(row.countryName);
      if (!seedNames.has(normalized)) {
        await ctx.db.delete(row._id);
        deleted += 1;
      }
    }

    return {
      totalSeedRows: DCTS_COUNTRY_SEED.length,
      inserted,
      updated,
      deleted,
    };
  },
});

export const getCatalogCounts = query({
  args: {},
  handler: async (_ctx) => {
    return DCTS_COUNTRY_COUNTS;
  },
});

export const listCountriesByTier = query({
  args: { tier: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dctsData")
      .withIndex("by_tier", (q) => q.eq("tier", args.tier))
      .collect();
  },
});

export const listCountryOptions = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("dctsData").collect();
    return rows
      .map((row) => ({
        countryName: row.countryName,
        tier: row.tier,
      }))
      .sort((a, b) => a.countryName.localeCompare(b.countryName));
  },
});

export const getCountryProfile = query({
  args: { countryName: v.string() },
  handler: async (ctx, args) => {
    return await findCountryProfile(ctx, args.countryName);
  },
});

export const calculateLeadEligibility = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead || !lead.country) return null;

    const profile = await findCountryProfile(ctx, lead.country);
    if (!profile) {
      const normalizedLeadCountry = normalizeCountryName(lead.country);
      if (normalizedLeadCountry === "vietnam") {
        return {
          eligible: false,
          tier: "NONE",
          tierName: TIER_NAMES.NONE,
          preferenceMargin: 0,
          dctsRate: null,
          mfnRate: null,
          warnings: ["Vietnam is handled under a separate UK FTA route rather than DCTS in this catalog."],
          hasUkFta: true,
          description: "Vietnam is not in the active DCTS beneficiary list for this model; use UK FTA checks.",
        };
      }
      return {
        eligible: false,
        tier: "NONE",
        tierName: TIER_NAMES.NONE,
        preferenceMargin: 0,
        dctsRate: null,
        mfnRate: null,
        warnings: ["Country not found in DCTS catalog. Run seed or verify country mapping."],
        hasUkFta: false,
        description: `${lead.country} is not currently mapped to a DCTS beneficiary profile.`,
      };
    }

    const preferenceMargin = Math.max(profile.mfnRate - profile.dctsRate, 0);
    const warnings: string[] = [];
    if (profile.hasGraduationSuspensions) warnings.push("Graduation suspension windows apply to certain products.");
    if (profile.hasUkFta) warnings.push("Separate UK FTA may provide a better path than DCTS for this route.");
    if (profile.notes) warnings.push(profile.notes);

    return {
      eligible: profile.isDctsBeneficiary !== false,
      tier: profile.tier,
      tierName: TIER_NAMES[profile.tier as keyof typeof TIER_NAMES] ?? profile.tier,
      preferenceMargin,
      dctsRate: profile.dctsRate,
      mfnRate: profile.mfnRate,
      cumulationGroups: profile.cumulationGroups ?? [],
      hasGraduationSuspensions: profile.hasGraduationSuspensions ?? false,
      graduationSuspensions: profile.graduationSuspensions ?? [],
      hasUkFta: profile.hasUkFta ?? false,
      warnings,
      description: `${profile.countryName} is mapped to ${TIER_NAMES[profile.tier as keyof typeof TIER_NAMES] ?? profile.tier}.`,
    };
  },
});

export const simulateRulesOfOrigin = query({
  args: {
    leadId: v.id("leads"),
    sourcing: v.array(v.object({ country: v.string(), value: v.number() })),
    totalValue: v.number(),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead || !lead.country) {
      return {
        passes: false,
        localContent: 0,
        required: 60,
        advisory: "Lead country is missing; unable to run origin simulation.",
      };
    }

    const leadProfile = await findCountryProfile(ctx, lead.country);
    const leadGroups = new Set<string>(leadProfile?.cumulationGroups ?? []);
    const allCountries = await ctx.db.query("dctsData").collect();

    const cumulationEligibleCountries = new Set<string>();
    for (const country of allCountries) {
      const groups = country.cumulationGroups ?? [];
      if (groups.some((group: string) => leadGroups.has(group))) {
        cumulationEligibleCountries.add(normalizeCountryName(country.countryName));
      }
    }

    cumulationEligibleCountries.add(normalizeCountryName(lead.country));
    cumulationEligibleCountries.add("uk");
    cumulationEligibleCountries.add("local");

    const beneficiaryValue = args.sourcing.reduce((acc, entry) => {
      const normalized = normalizeCountryName(entry.country);
      return cumulationEligibleCountries.has(normalized) ? acc + entry.value : acc;
    }, 0);

    const percentage = args.totalValue > 0 ? (beneficiaryValue / args.totalValue) * 100 : 0;
    const required = 60;
    const passes = percentage >= required;

    const cumulationCount = args.sourcing.filter((entry) => {
      const normalized = normalizeCountryName(entry.country);
      return normalized !== "uk" && normalized !== "local" && cumulationEligibleCountries.has(normalized);
    }).length;

    const advisory = passes
      ? `Compliant. Value-added is ${percentage.toFixed(1)}% against ${required}% threshold.`
      : `Non-compliant. Value-added is ${percentage.toFixed(1)}%; needs at least ${required}%.`;

    return {
      passes,
      localContent: percentage,
      required,
      ruleApplied: "Value-added baseline",
      cumulationAnalysis: {
        groupsUsed: Array.from(leadGroups),
        matchedInputs: cumulationCount,
      },
      advisory,
    };
  },
});

export const calculateSavings = query({
  args: {
    mfnRate: v.number(),
    dctsRate: v.number(),
    shipmentValue: v.number(),
  },
  handler: async (_ctx, args) => {
    const mfnDuty = (args.shipmentValue * args.mfnRate) / 100;
    const dctsDuty = (args.shipmentValue * args.dctsRate) / 100;
    const savings = mfnDuty - dctsDuty;

    return {
      mfnDuty,
      dctsDuty,
      savings,
      savingsFormatted: new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(savings),
    };
  },
});

export const updateLeadDctsStatus = mutation({
  args: {
    id: v.id("leads"),
    tier: v.optional(v.string()),
    hsCode: v.optional(v.string()),
    savings: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.id);
    if (!lead) throw new Error("Lead not found");

    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      hsCode: updates.hsCode,
      dctsStatus: updates.tier,
      savings: updates.savings,
    });

    await ctx.db.insert("events", {
      orgId: lead.orgId,
      type: "dcts_eligibility_checked",
      referenceId: args.id,
      createdAt: Date.now(),
    });

    return args.id;
  },
});
