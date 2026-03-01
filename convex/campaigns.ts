import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getCurrentUser } from "./users";
import { internal } from "./_generated/api";

// Master leads would ideally be imported or provided via a separate file.
// For now, we'll implement the logic to pull from a provided JSON structure
// and enforce the 300 per country / 10 countries scale.

export const startCampaign = mutation({
    args: {
        target: v.string(), // Importer, Exporter, etc.
        laneOrigin: v.string(),
        laneDestination: v.string(),
        industry: v.string(),
        leads: v.array(v.object({
            companyName: v.string(),
            country: v.string(),
            industry: v.string(),
            laneOrigin: v.optional(v.string()),
            laneDestination: v.optional(v.string()),
            whatsapp: v.optional(v.string()),
            email: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");

        // 1. Create the campaign
        const campaignId = await ctx.db.insert("campaigns", {
            orgId: user.orgId,
            name: `${args.target} - ${args.industry} (${args.laneOrigin} to ${args.laneDestination})`,
            status: "active",
            filtersJson: JSON.stringify({
                target: args.target,
                origin: args.laneOrigin,
                destination: args.laneDestination,
                industry: args.industry,
            }),
            dailySendLimit: 50, // Default limit
            createdAt: Date.now(),
        });

        // 2. Activate leads (Just-in-Time)
        // Note: In a production scenario, we'd filter the 300 leads here 
        // from the master 3,000 based on the country/industry.
        for (const leadData of args.leads) {
            const leadId = await ctx.db.insert("leads", {
                orgId: user.orgId,
                companyName: leadData.companyName,
                country: leadData.country,
                industry: leadData.industry,
                laneOrigin: leadData.laneOrigin,
                laneDestination: leadData.laneDestination,
                whatsapp: leadData.whatsapp,
                email: leadData.email,
                status: "new",
                tags: [args.target, args.industry],
                createdAt: Date.now(),
            });

            // 3. Queue initial message for AI generation (Phase 3)
            // For Phase 2, we'll just queue a placeholder status
            const messageId = await ctx.db.insert("messages", {
                orgId: user.orgId,
                leadId,
                campaignId,
                channel: leadData.whatsapp ? "whatsapp" : "email",
                content: "Generating personalized message...", // Placeholder for Phase 3
                status: "queued",
                followUpNumber: 0,
                scheduledAt: Date.now(),
            });

            await ctx.db.insert("messageQueue", {
                orgId: user.orgId,
                messageId,
                priority: 0,
                attempts: 0,
                nextAttemptAt: Date.now(),
                status: "pending",
            });
        }

        // 4. Update onboarding progress
        await ctx.db.patch(user.orgId, {
            onboardingStep: 3,
        });

        return campaignId;
    },
});

export const listCampaigns = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) return [];
        return await ctx.db
            .query("campaigns")
            .withIndex("byOrgId", (q) => q.eq("orgId", user.orgId!))
            .collect();
    },
});
