import { v } from "convex/values";
import { query } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Hidden Gem Scoring Engine
 * Combines PUR gaps, Savings delta, and Ease of Doing Business risk.
 */

export const calculateHiddenGemScore = query({
    args: {
        hsCode: v.string(),
        countryCode: v.string(),
        currentSavings: v.optional(v.number()),
        riskScore: v.optional(v.number()), // 0-100 (0 is best)
    },
    handler: async (ctx, args) => {
        // 1. Fetch PUR for this lane
        const stats = await ctx.db
            .query("tradeStats")
            .withIndex("byHsCountry", (q) => q.eq("hsCode", args.hsCode).eq("countryCode", args.countryCode))
            .first();

        const pur = stats?.pur ?? 100; // Default to 100 (no opportunity) if no data

        // 2. Normalize components (0-100 scale)

        // Component A: PUR Gap (40%)
        // Lower PUR = Higher Opportunity. 20% PUR -> 80 points.
        const purFactor = Math.max(0, 100 - pur);

        // Component B: Savings Margin (40%) 
        // Mocking delta if not provided. High savings = High Opportunity.
        const savingsFactor = args.currentSavings ? Math.min(100, (args.currentSavings / 20) * 100) : 50;

        // Component C: Ease of Doing Business (20%)
        // Lower Risk Score (0) = Higher Ease = Higher Opportunity.
        const easeFactor = Math.max(0, 100 - (args.riskScore ?? 40));

        // Final Weighted Score
        const finalScore = Math.floor(
            (purFactor * 0.4) +
            (savingsFactor * 0.4) +
            (easeFactor * 0.2)
        );

        return {
            score: finalScore,
            breakdown: {
                purGap: Math.floor(purFactor),
                tradeMargin: Math.floor(savingsFactor),
                regionalEase: Math.floor(easeFactor)
            }
        };
    }
});
