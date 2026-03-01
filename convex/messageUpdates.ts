import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const updateFromWebhook = internalMutation({
    args: {
        providerMessageId: v.string(),
        status: v.union(v.literal("sent"), v.literal("delivered"), v.literal("read"), v.literal("failed")),
        error: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const message = await ctx.db
            .query("messages")
            .filter((q) => q.eq(q.field("providerMessageId"), args.providerMessageId))
            .unique();

        if (!message) {
            console.warn(`Webhook received for unknown message ID: ${args.providerMessageId}`);
            return;
        }

        await ctx.db.patch(message._id, {
            status: args.status,
            // Only update sentAt if it's the first time it's marked as sent/delivered
            sentAt: (args.status === "sent" || args.status === "delivered") && !message.sentAt ? Date.now() : message.sentAt,
        });

        // Log event (Protocol Rule 5)
        await ctx.db.insert("events", {
            orgId: message.orgId,
            type: args.status as any,
            referenceId: message._id,
            modelMeta: {
                model: "provider-webhook",
                model_version: "v1",
                snapshot_version: "v1",
                template_version: "n/a",
                workflow_version: "v1",
                latencyMs: 0,
                signalsUsed: ["webhook_callback"]
            },
            createdAt: Date.now(),
        });

        // PRODUCTION HARDENING: If read, accelerate next message (Hot Lead behavior)
        if (args.status === "read") {
            await ctx.scheduler.runAfter(0, internal.workflows.scheduleNextStepInSequence, {
                leadId: message.leadId,
                workflowId: message.workflowId!,
                completedFollowUpNumber: message.followUpNumber,
                isHighlyEngaged: true,
            });
        }
    },
});

export const handleIncomingMessage = internalMutation({
    args: { from: v.string(), content: v.string() },
    handler: async (ctx, args) => {
        // Normalize phone number (Meta gives it without + sometimes)
        const phone = args.from.startsWith("+") ? args.from : `+${args.from}`;

        const lead = await ctx.db
            .query("leads")
            .filter((q) => q.eq(q.field("whatsapp"), phone))
            .first();

        if (lead) {
            // Tier 1: STOP Keyword Hard Halt
            const stopKeywords = ["STOP", "UNSUBSCRIBE", "HALT", "CANCEL"];
            const isStop = stopKeywords.some(k => args.content.toUpperCase().includes(k));

            if (isStop) {
                console.warn(`STOP keyword detected from lead ${lead._id}. Triggering hard halt.`);
                await ctx.runMutation(internal.messageUpdates.hardHaltLead, { id: lead._id });
                return;
            }

            // 1. Update lead status
            await ctx.db.patch(lead._id, { status: "replied" });

            // 2. Find the last sent message to link the reply
            const lastSent = await ctx.db
                .query("messages")
                .withIndex("byLeadId", (q) => q.eq("leadId", lead._id))
                .order("desc")
                .first();

            if (lastSent) {
                // 3. Insert reply
                const replyId = await ctx.db.insert("replies", {
                    orgId: lead.orgId,
                    leadId: lead._id,
                    messageId: lastSent._id,
                    channel: "whatsapp",
                    content: args.content,
                    intent: "other",
                    createdAt: Date.now(),
                });

                // 4. Trigger AI classification (Phase 3 Requirement)
                await ctx.scheduler.runAfter(0, internal.ai.classifyIncomingReply, {
                    replyId,
                    content: args.content,
                });
            }
        }
    },
});

export const hardHaltLead = internalMutation({
    args: { id: v.id("leads") },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.id);
        if (!lead) return;

        // 1. Mark lead as unsubscribed
        await ctx.db.patch(args.id, { status: "unsubscribed" });

        // 2. Stop all future messages for this lead in the queue
        const pendingQueueItems = await ctx.db
            .query("messageQueue")
            .withIndex("byStatus", (q) => q.eq("status", "pending"))
            .collect();

        // Filter for this lead's messages
        for (const item of pendingQueueItems) {
            const msg = await ctx.db.get(item.messageId);
            if (msg && msg.leadId === args.id) {
                await ctx.db.patch(item._id, { status: "failed", error: "Lead unsubscribed (STOP keyword)" });
                await ctx.db.patch(msg._id, { status: "cancelled" });
            }
        }

        // 3. Log the halt event
        await ctx.db.insert("events", {
            orgId: lead.orgId,
            type: "intent_corrected", // Reusing for human/hard-coded intent
            referenceId: args.id,
            userLabel: "STOP_HARD_HALT",
            createdAt: Date.now(),
        });
    },
});
