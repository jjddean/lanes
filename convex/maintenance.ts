import { v } from "convex/values";
import { internalMutation, internalQuery, mutation } from "./_generated/server";

/**
 * Maintenance & Cost Optimization Engine
 */

export const pruneOldEvents = internalMutation({
    args: { daysRetention: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const retentionMs = (args.daysRetention || 30) * 24 * 60 * 60 * 1000;
        const threshold = Date.now() - retentionMs;

        const oldEvents = await ctx.db
            .query("events")
            .filter((q) => q.lt(q.field("createdAt"), threshold))
            .take(100); // Batch delete to avoid timeout

        for (const event of oldEvents) {
            await ctx.db.delete(event._id);
        }

        return oldEvents.length;
    },
});

export const exportTrainingData = internalQuery({
    args: { type: v.string() },
    handler: async (ctx, args) => {
        const events = await ctx.db
            .query("events")
            .withIndex("byOrgId") // Filtered per org usually, but for local training we might want global if permitted
            .filter((q) => q.eq(q.field("type"), args.type))
            .collect();

        return events.map(e => ({
            input: e.featureSnapshot ? JSON.parse(e.featureSnapshot) : null,
            output: e.userLabel || null,
            meta: e.modelMeta
        }));
    },
});
