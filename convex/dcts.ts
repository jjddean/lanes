import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import * as tradeTariff from "./providers/tradeTariff";

/**
 * DCTS Logic Engine
 * Handles eligibility checks, rules of origin simulation, and ROI calculations.
 */

// Mock data for initial implementation
const DCTS_TIERS = {
    LDC: "Least Developed Country Framework",
    ENHANCED: "Enhanced Framework",
    GENERAL: "General Framework",
};

/**
 * Internal helper for lead data to avoid circularity.
 */
async function fetchLeadForDcts(ctx: any, id: any) {
    return await ctx.db.get(id);
}

/**
 * Simple eligibility check based on country and (eventually) HS code.
 */
export const getLeadEligibility = action({
    args: { leadId: v.id("leads") },
    handler: async (ctx, args) => {
        const lead = await fetchLeadForDcts(ctx, args.leadId);
        if (!lead || !lead.country) return null;

        // 1. Framework Check (Mocked for now)
        const countryTierMap: Record<string, string> = {
            Bangladesh: "LDC",
            "Sierra Leone": "LDC",
            Vietnam: "ENHANCED",
            India: "GENERAL",
        };
        const tier = countryTierMap[lead.country] || "NONE";

        // 2. On-Demand Tariff Check (Zero-Bloat Strategy)
        let tariffData = null;
        if (lead.hsCode) {
            tariffData = await tradeTariff.fetchTariffDetails({
                hsCode: lead.hsCode,
                countryCode: lead.country === "UK" ? "GB" : lead.country, // Simplification
            });
        }

        return {
            eligible: tier !== "NONE",
            tier: tier,
            tierName: DCTS_TIERS[tier as keyof typeof DCTS_TIERS] || "Unknown",
            tariff: tariffData,
            summary: tariffData
                ? `Preferential Rate: ${tariffData.dctsRate}% (MFN: ${tariffData.mfnRate}%)`
                : "No HS code assigned to lead yet."
        };
    },
});

export const getLeadForDcts = query({
    args: { id: v.id("leads") },
    handler: async (ctx, args) => await fetchLeadForDcts(ctx, args.id),
});

// Product-Specific Rules (PSR) from public/rules.json
const ROO_RULES = [
    { hs: "8712", r: "CTH or Value-Added threshold of 60%", type: "VA", threshold: 60 },
    { hs: "61", r: "Double transformation required (Manufacture from yarn)", type: "TRANSFORMATION" },
    { hs: "0901", r: "Wholly obtained", type: "WO" },
    { hs: "8517", r: "Value-Added threshold of 50%", type: "VA", threshold: 50 },
];

/**
 * Rules of Origin (RoO) Simulator
 * Checks if a product meets substantial transformation or value-added criteria.
 */
export const simulateRulesOfOrigin = query({
    args: {
        leadId: v.id("leads"),
        sourcing: v.array(v.object({ country: v.string(), value: v.number() })),
        totalValue: v.number()
    },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.leadId);
        if (!lead || !lead.hsCode) {
            return {
                passes: false,
                advisory: "HS Code missing. Cannot determine specific RoO rule.",
                localContent: 0,
                required: 0,
                appliedRule: "NONE"
            };
        }

        // 1. Find the best matching rule (longest prefix)
        const rule = ROO_RULES.find(r => lead.hsCode?.startsWith(r.hs)) ||
            { hs: "DEFAULT", r: "Standard 60% Value-Added threshold", type: "VA", threshold: 60 };

        // 2. Calculate local/cumulation value
        const originatingValue = args.sourcing
            .filter(s => s.country === "Local" || s.country === "UK" || s.country === "EU") // Simple cumulation logic
            .reduce((acc, curr) => acc + curr.value, 0);

        const currentVA = (originatingValue / args.totalValue) * 100;

        // 3. Apply Rule Logic
        let passes = false;
        let advisory = "";

        switch (rule.type) {
            case "VA":
                passes = currentVA >= (rule.threshold || 60);
                advisory = passes
                    ? `Meets ${rule.r}`
                    : `Fails ${rule.r}. Current VA: ${currentVA.toFixed(1)}%`;
                break;
            case "WO":
                // For simulation, we assume if 100% is local, it's WO
                passes = currentVA >= 99.9;
                advisory = passes
                    ? "Product is Wholly Obtained."
                    : "Rule 0901 requires Wholly Obtained status (100% local content).";
                break;
            case "TRANSFORMATION":
                // Mocking transformation check for now
                passes = originatingValue > 0;
                advisory = rule.r + " (Manual audit of yarn source required)";
                break;
            default:
                passes = currentVA >= 60;
                advisory = "Applied default 60% VA rule.";
        }

        return {
            passes,
            localContent: currentVA,
            required: rule.type === "VA" ? rule.threshold : 100,
            appliedRule: rule.r,
            advisory,
        };
    },
});

/**
 * Tariff Savings Calculator
 */
export const calculateSavings = query({
    args: {
        mfnRate: v.number(),
        dctsRate: v.number(),
        shipmentValue: v.number()
    },
    handler: async (ctx, args) => {
        const mfnDuty = (args.shipmentValue * args.mfnRate) / 100;
        const dctsDuty = (args.shipmentValue * args.dctsRate) / 100;
        const savings = mfnDuty - dctsDuty;

        return {
            mfnDuty,
            dctsDuty,
            savings,
            savingsFormatted: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(savings),
        };
    },
});

/**
 * Mutation to update a specific lead's DCTS metadata.
 */
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

        // Log event
        await ctx.db.insert("events", {
            orgId: lead.orgId,
            type: "dcts_eligibility_checked",
            referenceId: args.id,
            createdAt: Date.now(),
        });

        return args.id;
    },
});
