import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

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
 * Simple eligibility check based on country and (eventually) HS code.
 */
export const calculateLeadEligibility = query({
    args: { leadId: v.id("leads") },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.leadId);
        if (!lead || !lead.country) return null;

        // Mock logic: Mapping countries to DCTS Tiers
        const countryTierMap: Record<string, string> = {
            Bangladesh: "LDC",
            "Sierra Leone": "LDC",
            Ethiopia: "LDC",
            Vietnam: "ENHANCED",
            India: "GENERAL",
            Indonesia: "GENERAL",
        };

        const tier = countryTierMap[lead.country] || "NONE";

        return {
            eligible: tier !== "NONE",
            tier: tier,
            tierName: DCTS_TIERS[tier as keyof typeof DCTS_TIERS] || "Unknown",
            description: tier !== "NONE"
                ? `${lead.country} qualifies for the UK DCTS ${tier} tier.`
                : `${lead.country} does not currently benefit from preferential DCTS rates.`,
        };
    },
});

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
        // Basic Value-Added Rule: 60% of value must originate from beneficiary or cumulation partners
        const beneficiaryValue = args.sourcing
            .filter(s => s.country === "Local" || s.country === "UK")
            .reduce((acc, curr) => acc + curr.value, 0);

        const percentage = (beneficiaryValue / args.totalValue) * 100;
        const passes = percentage >= 60;

        return {
            passes,
            localContent: percentage,
            required: 60,
            advisory: passes
                ? "Product meets the 60% value-added threshold for DCTS origin."
                : "Product fails the local content rule. Consider sourcing more materials from UK or local partners.",
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
