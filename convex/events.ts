import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

/**
 * Event Logging & Visibility (Elite v1)
 * Retrieves real-time activity events for the dashboard.
 */

export const listEvents = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) return [];

        const limit = args.limit || 50;

        return await ctx.db
            .query("events")
            .withIndex("byOrgId", (q) => q.eq("orgId", user.orgId!))
            .order("desc")
            .take(limit);
    },
});
