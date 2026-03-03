import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import * as ollama from "./providers/ollama";

/**
 * High-level AI logic for message generation and intent detection.
 * Rules:
 * - Generate once per lead/campaign (cached).
 * - Enforce limits (Phase 5).
 * - Log events.
 */

export const generateAndCacheMessage = internalAction({
    args: {
        messageId: v.id("messages"),
        leadId: v.id("leads"),
    },
    handler: async (ctx, args) => {
        const lead = await ctx.runQuery(internal.ai.getLeadForAi, { id: args.leadId });
        if (!lead) return;

        // 1. Generate personalized message
        const content = await ollama.generateOutboundMessage({
            leadName: lead.companyName,
            industry: lead.industry,
            lane: `${lead.laneOrigin} to ${lead.laneDestination}`,
        });

        // 2. Cache result in messages table
        await ctx.runMutation(internal.ai.updateMessageContent, {
            id: args.messageId,
            content,
        });
    },
});

export const generateVersionedMessage = internalAction({
    args: {
        leadId: v.id("leads"),
        type: v.string(), // intro, f1, f2
    },
    handler: async (ctx, args): Promise<string> => {
        const lead = await ctx.runQuery(internal.ai.getLeadForAi, { id: args.leadId });
        if (!lead) return "Error: Lead not found";

        // Deterministic Rotation Logic (Tier 2)
        const leadIdNumber = args.leadId.split('|').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const variantIndex = leadIdNumber % 3; // Rotate through 3 main variants

        if (args.type === "intro") {
            const introTemplates = [
                `Hi ${lead.companyName}, I noticed your focus on the ${lead.laneOrigin} to ${lead.laneDestination} lane. Are you looking to optimize your ${lead.industry} logistics?`,
                `Hello ${lead.companyName}, we specialize in ${lead.industry} shipments for the ${lead.laneOrigin} trade route. Would you be open to a quick chat?`,
                `Greetings from Elite, ${lead.companyName}. We've seen high volume in ${lead.industry} along the ${lead.laneDestination} route recently. Interested in a quote?`
            ];
            return introTemplates[variantIndex];
        }

        if (args.type === "f1") {
            const f1Templates = [
                `Hi ${lead.companyName}, just following up on my previous message regarding ${lead.industry} shipments on the ${lead.laneOrigin || ''} route. Would love to connect.`,
                `Checking in, ${lead.companyName}. Did you have a chance to review my note about your ${lead.industry} logistics on the ${lead.laneOrigin} lane?`,
                `Quick follow up, ${lead.companyName}. We've helped several partners in ${lead.industry} recently. Are you still active on the ${lead.laneOrigin} to ${lead.laneDestination} route?`
            ];
            return f1Templates[variantIndex];
        }

        const f2Templates = [
            `Final follow up - ${lead.companyName}, are you still interested in optimizing your ${lead.industry} logistics?`,
            `Last check, ${lead.companyName}. Should I keep you in the loop for ${lead.industry} updates on the ${lead.laneOrigin} lane?`,
            `Closing the loop here, ${lead.companyName}. Let me know if your ${lead.industry} shipping needs change in the future.`
        ];
        return f2Templates[variantIndex];
    },
});

export const classifyIncomingReply = internalAction({
    args: {
        replyId: v.id("replies"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Classify intent
        const result = await ollama.classifyReply({ content: args.content });

        // 2. Update reply with intent/entities
        await ctx.runMutation(internal.ai.updateReplyIntent, {
            id: args.replyId,
            intent: result.intent.toLowerCase(),
        });

        // 3. Log event
        const reply = await ctx.runQuery(internal.ai.getReplyById, { id: args.replyId });
        if (reply) {
            await ctx.runMutation(internal.ai.logAiEvent, {
                orgId: reply.orgId,
                type: "reply_received",
                referenceId: args.replyId,
                modelMeta: {
                    model: "ollama-local",
                    model_version: "llama3-8b-instruct-q4",
                    snapshot_version: "v1",
                    template_version: "v1-standard",
                    workflow_version: "v1",
                    latencyMs: 0,
                    signalsUsed: ["inbound_analysis"]
                }
            });

            // Step 5: Conversation Handling
            // 1. Mark lead as engaged
            await ctx.runMutation(internal.leads.updateLeadStatusInternal, {
                id: reply.leadId,
                status: "engaged",
            });

            // 2. Stop future messages in the sequence
            await ctx.runMutation(internal.automation.stopLeadAutomation, {
                leadId: reply.leadId,
            });
        }
    },
});

export const getLeadForAi = internalQuery({
    args: { id: v.id("leads") },
    handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const getReplyById = internalQuery({
    args: { id: v.id("replies") },
    handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const updateMessageContent = internalMutation({
    args: { id: v.id("messages"), content: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { content: args.content });
    },
});

export const updateReplyIntent = internalMutation({
    args: { id: v.id("replies"), intent: v.string() },
    handler: async (ctx, args) => {
        // Map intent string to schema literal
        const validIntents = ["interested", "question", "not_now", "stop", "other"] as const;
        const intent = validIntents.find((i) => i === args.intent) || "other";
        await ctx.db.patch(args.id, { intent });
    },
});

export const logAiEvent = internalMutation({
    args: {
        orgId: v.id("organizations"),
        type: v.union(
            v.literal("target_selected"),
            v.literal("msg_generated"),
            v.literal("msg_sent"),
            v.literal("reply_received"),
            v.literal("intent_predicted"),
            v.literal("intent_corrected"),
            v.literal("deal_stage_changed")
        ),
        referenceId: v.string(),
        modelMeta: v.optional(v.object({
            model: v.string(),
            model_version: v.string(),
            snapshot_version: v.string(),
            template_version: v.string(),
            workflow_version: v.string(),
            latencyMs: v.number(),
            signalsUsed: v.array(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("events", {
            orgId: args.orgId,
            type: args.type,
            referenceId: args.referenceId,
            modelMeta: args.modelMeta,
            createdAt: Date.now(),
        });
    },
});
