import { v } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";

/**
 * PUR Engine
 * High-Density Trade Intelligence Logic
 */

/**
 * Seed mock trade statistics for testing.
 */
export const seedTradeStats = mutation({
    args: {},
    handler: async (ctx) => {
        const stats = [
            {
                hsCode: "87120030", // Bicycles
                countryCode: "VN", // Vietnam
                totalImportValue: 1200000,
                prefImportValue: 450000,
                period: "2026-Q1",
                pur: 37.5, // (450k / 1.2M) * 100 - LOW PUR!
            },
            {
                hsCode: "61091000", // T-shirts
                countryCode: "BD", // Bangladesh
                totalImportValue: 5000000,
                prefImportValue: 4800000,
                period: "2026-Q1",
                pur: 96.0, // High PUR - Efficient
            },
            {
                hsCode: "85171300", // Smartphones
                countryCode: "IN", // India
                totalImportValue: 8000000,
                prefImportValue: 2000000,
                period: "2026-Q1",
                pur: 25.0, // VERY LOW PUR!
            }
        ];

        for (const stat of stats) {
            const existing = await ctx.db
                .query("tradeStats")
                .withIndex("byHsCountry", (q) => q.eq("hsCode", stat.hsCode).eq("countryCode", stat.countryCode))
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, stat);
            } else {
                await ctx.db.insert("tradeStats", stat);
            }
        }
    }
});

/**
 * Internal helper for fetching stats.
 */
async function fetchTradeStats(ctx: any, hsCode: string, countryCode: string) {
    return await ctx.db
        .query("tradeStats")
        .withIndex("byHsCountry", (q: any) => q.eq("hsCode", hsCode).eq("countryCode", countryCode))
        .first();
}

/**
 * Internal helper for logging alerts.
 */
async function insertPurAlert(ctx: any, args: any) {
    await ctx.db.insert("events", {
        orgId: args.orgId,
        type: "pref_utilization_alert",
        referenceId: args.leadId,
        featureSnapshot: JSON.stringify({
            hsCode: args.hsCode,
            pur: args.pur,
            savings: args.potentialSavings
        }),
        createdAt: Date.now()
    });
}

/**
 * Action to run PUR analysis across all active leads for an organization.
 * Identifies "Hidden Gem" opportunities where duty is being overpaid.
 */
export const runPurAnalysis = action({
    args: { orgId: v.id("organizations") },
    handler: async (ctx: any, args: any): Promise<{ analyzed: number, alerts: number }> => {
        // 1. Get all leads with HS codes for this org
        const leads = await ctx.runQuery(api.leads.listLeadsByOrg, { orgId: args.orgId });
        const eligibleLeads = leads.filter((l: any) => l.hsCode && l.country);

        let alertsTriggered = 0;

        for (const lead of eligibleLeads) {
            const countryMap: Record<string, string> = {
                "Vietnam": "VN",
                "Bangladesh": "BD",
                "India": "IN"
            };
            const countryCode = countryMap[lead.country!] || lead.country!;

            const stats = await ctx.runQuery(api.pur.getTradeStats, {
                hsCode: lead.hsCode!,
                countryCode
            });

            if (stats && stats.pur < 50) {
                await ctx.runMutation(internal.pur.logPurAlert, {
                    orgId: args.orgId,
                    leadId: lead._id,
                    hsCode: lead.hsCode!,
                    pur: stats.pur,
                    potentialSavings: lead.savings || 5000
                });
                alertsTriggered++;
            }
        }

        return { analyzed: eligibleLeads.length, alerts: alertsTriggered };
    }
});

/**
 * Internal mutation to log the alert.
 */
export const logPurAlert = internalMutation({
    args: {
        orgId: v.id("organizations"),
        leadId: v.id("leads"),
        hsCode: v.string(),
        pur: v.number(),
        potentialSavings: v.number(),
    },
    handler: async (ctx, args) => {
        await insertPurAlert(ctx, args);
    }
});

/**
 * Query stats (used by action).
 */
export const getTradeStats = query({
    args: { hsCode: v.string(), countryCode: v.string() },
    handler: async (ctx, args) => {
        return await fetchTradeStats(ctx, args.hsCode, args.countryCode);
    }
});
