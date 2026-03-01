import { internalQuery, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllLeads = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("leads").collect();
    },
});

export const getAllOrgs = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("organizations").collect();
    },
});

export const createLeadNoAuth = mutation({
    args: {
        companyName: v.string(),
        country: v.string(),
        industry: v.string(),
        laneOrigin: v.optional(v.string()),
        laneDestination: v.optional(v.string()),
        whatsapp: v.optional(v.string()),
        email: v.optional(v.string()),
        tags: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const org = await ctx.db.query("organizations").first();
        if (!org) throw new Error("No organization found");

        const leadId = await ctx.db.insert("leads", {
            ...args,
            orgId: org._id,
            status: "new",
            createdAt: Date.now(),
        });

        return leadId;
    },
});
