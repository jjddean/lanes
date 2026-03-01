import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getMyOrganization = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) return null;
        return await ctx.db.get(user.orgId);
    },
});

export const updateOrgTradeDNA = mutation({
    args: {
        mainLanes: v.optional(v.array(v.string())),
        services: v.optional(v.array(v.string())),
        commodities: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");

        const org = await ctx.db.get(user.orgId);
        if (!org) throw new Error("Organization not found");

        const currentDNA = org.tradeDNA ?? { mainLanes: [], services: [], commodities: [] };

        await ctx.db.patch(user.orgId, {
            tradeDNA: {
                mainLanes: args.mainLanes ?? currentDNA.mainLanes,
                services: args.services ?? currentDNA.services,
                commodities: args.commodities ?? currentDNA.commodities,
            },
        });

        return user.orgId;
    },
});

export const updateSenderProfile = mutation({
    args: {
        senderName: v.string(),
        senderRole: v.string(),
        companyBio: v.string(),
        offerSummary: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");

        await ctx.db.patch(user.orgId, {
            senderProfile: {
                senderName: args.senderName,
                senderRole: args.senderRole,
                companyBio: args.companyBio,
                offerSummary: args.offerSummary,
            },
        });

        return user.orgId;
    },
});

export const updateOnboarding = mutation({
    args: {
        step: v.number(),
        website: v.optional(v.string()),
        tradeDNA: v.optional(v.object({
            mainLanes: v.array(v.string()),
            services: v.array(v.string()),
            commodities: v.array(v.string()),
        })),
        connectionStatus: v.optional(v.object({
            whatsapp: v.boolean(),
            email: v.boolean(),
        })),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");

        await ctx.db.patch(user.orgId, {
            onboardingStep: args.step,
            website: args.website,
            tradeDNA: args.tradeDNA,
            connectionStatus: args.connectionStatus,
        });

        return user.orgId;
    },
});
