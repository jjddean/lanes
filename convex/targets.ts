import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";

export const getTargetCount = query({
    args: {},
    handler: async (ctx) => {
        const targets = await ctx.db.query("targets").collect();
        return targets.length;
    },
});

export const seedTargets = internalMutation({
    args: {
        targets: v.array(v.object({
            externalId: v.string(),
            companyName: v.string(),
            country: v.string(),
            industry: v.string(),
            domain: v.string(),
            laneTags: v.array(v.string()),
            whatsapp: v.optional(v.string()),
            email: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        for (const target of args.targets) {
            // Check for existing target by externalId
            const existing = await ctx.db
                .query("targets")
                .withIndex("byExternalId", (q) => q.eq("externalId", target.externalId))
                .first();

            if (!existing) {
                await ctx.db.insert("targets", {
                    ...target,
                    createdAt: Date.now(),
                });
            }
        }
    },
});

export const searchTargets = internalQuery({
    args: {
        country: v.string(),
        industry: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("targets")
            .withIndex("byCountryIndustry", (q) =>
                q.eq("country", args.country).eq("industry", args.industry)
            )
            .take(args.limit || 50);
    },
});
