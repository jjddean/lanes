import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Automation Engine
 * Rules:
 * - Automatically schedule follow-ups if no reply.
 * - [Elite v1] Sequence is pre-generated in Step 3.
 * - This engine now focuses on cleanup and edge cases.
 */

export const stopLeadAutomation = internalMutation({
    args: { leadId: v.id("leads") },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.leadId);
        if (!lead) return;

        // Cancel all future queued messages for this lead
        // Note: We filter manually by leadId after using the byStatus index (orgId, status)
        const futureMessages = await ctx.db
            .query("messages")
            .withIndex("byStatus", (q) => q.eq("orgId", lead.orgId).eq("status", "queued"))
            .collect();

        for (const msg of futureMessages) {
            if (msg.leadId === args.leadId && msg.scheduledAt > Date.now()) {
                await ctx.db.patch(msg._id, { status: "cancelled" });
            }
        }
    },
});

async function scheduleNextFollowUp(ctx: any, args: {
    orgId: any,
    leadId: any,
    campaignId: any,
    followUpNumber: number
}) {
    // 1. Create the follow-up message record
    const messageId = await ctx.db.insert("messages", {
        orgId: args.orgId,
        leadId: args.leadId,
        campaignId: args.campaignId,
        channel: "whatsapp", // Default to whatsapp for follow-ups
        content: "Generating personalized message...", // Triggers AI layer
        status: "queued",
        followUpNumber: args.followUpNumber,
        scheduledAt: Date.now(),
    });

    // 2. Queue it
    await ctx.db.insert("messageQueue", {
        orgId: args.orgId,
        messageId,
        priority: 1, // Follow-ups have higher priority
        attempts: 0,
        nextAttemptAt: Date.now(),
        status: "pending",
    });
}
