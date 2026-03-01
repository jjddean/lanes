import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const listConversations = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) return [];

        // 1. Fetch all replies and messages for this org
        const replies = await ctx.db
            .query("replies")
            .withIndex("byOrgId", (q) => q.eq("orgId", user.orgId!))
            .order("desc")
            .collect();

        const messages = await ctx.db
            .query("messages")
            .withIndex("byStatus", (q) => q.eq("orgId", user.orgId!))
            .order("desc")
            .collect();

        // 2. Group by lead and find latest activity
        const leadInteractions = new Map<string, any>();

        const processInteraction = (item: any, type: "sent" | "received") => {
            const leadId = item.leadId;
            const existing = leadInteractions.get(leadId);
            const timestamp = type === "received" ? item.createdAt : item.scheduledAt;

            if (!existing || timestamp > existing.createdAt) {
                leadInteractions.set(leadId, {
                    _id: item._id,
                    leadId: leadId,
                    content: item.content,
                    channel: item.channel,
                    createdAt: timestamp,
                    type: type,
                    status: type === "received" ? "read" : item.status, // We'll treat replies as read for now or add unread logic later
                });
            }
        };

        replies.forEach(r => processInteraction(r, "received"));
        messages.forEach(m => processInteraction(m, "sent"));

        // 3. Enrich with lead names
        const enriched = await Promise.all(
            Array.from(leadInteractions.values()).map(async (interaction) => {
                const lead = await ctx.db.get(interaction.leadId) as any;
                return {
                    ...interaction,
                    leadName: lead?.companyName || "Unknown contact",
                    email: lead?.email,
                    whatsapp: lead?.whatsapp,
                    industry: lead?.industry,
                    country: lead?.country,
                    status: lead?.status, // Use lead status for resolve/archive logic
                    snoozedUntil: lead?.snoozedUntil,
                    assignedTo: lead?.assignedTo,
                    tags: lead?.tags || [],
                };
            })
        );

        // Sort by most recent activity
        return enriched.sort((a, b) => b.createdAt - a.createdAt);
    },
});

export const getConversationThread = query({
    args: { leadId: v.id("leads") },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) return [];

        // Fetch all messages and replies for this lead
        const replies = await ctx.db
            .query("replies")
            .filter((q) => q.eq(q.field("leadId"), args.leadId))
            .collect();

        const messages = await ctx.db
            .query("messages")
            .withIndex("byLeadId", (q) => q.eq("leadId", args.leadId))
            .collect();

        // Merge and sort chronologically
        const thread = [
            ...replies.map(r => ({ ...r, type: "received" as const, timestamp: r.createdAt })),
            ...messages.map(m => ({ ...m, type: "sent" as const, timestamp: m.scheduledAt }))
        ];

        return thread.sort((a, b) => a.timestamp - b.timestamp);
    },
});
