import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { getCurrentUser } from "./users";
import * as whatsapp from "./providers/whatsapp";
import * as email from "./providers/email";

/**
 * Message Dispatcher Engine (Elite v1)
 * Handles sequential dispatch with burst protection.
 */

export const processQueueStep = internalAction({
    args: {},
    handler: async (ctx) => {
        // 1. Claim ONLY ONE pending message with atomic lock (Rule 1: Claim-Atomicity)
        const item = await ctx.runMutation(internal.messageDispatcher.claimQueueItem, {});

        if (!item) return; // No items available or already claimed

        const message = await ctx.runQuery(internal.messageDispatcher.getMessageById, { id: item.messageId });
        if (!message) return;

        const lead = await ctx.runQuery(internal.messageDispatcher.getLeadById, { id: message.leadId });
        if (!lead || lead.status === "unsubscribed") {
            console.warn(`Lead ${message.leadId} is unsubscribed or missing. Cancelling message.`);
            await ctx.runMutation(internal.messageDispatcher.updateQueueItemStatus, {
                id: item._id,
                messageId: message._id,
                status: "failed",
                error: "Lead unsubscribed",
            });
            return;
        }

        let result;
        // Identity-Aware Idempotency: workflowId + leadId + step + identity + attempt (Rule 3)
        const identity = item.sendingIdentity || "default_wa";
        const idempotencyKey = `${message.workflowId || "manual"}_${message.leadId}_${message.followUpNumber}_${identity}_${item.attempts}`;

        try {
            // Handle edge case where content is still placeholder
            if (message.content === "Generating personalized message...") {
                await ctx.runAction(internal.ai.generateAndCacheMessage, {
                    messageId: message._id,
                    leadId: message.leadId,
                });
                // Re-queue for next run
                await ctx.runMutation(internal.messageDispatcher.updateQueueItemStatus, {
                    id: item._id,
                    messageId: message._id,
                    status: "pending",
                });
                return;
            }

            // 3. Check survival limits and Global Kill Switch
            const org = await ctx.runQuery(internal.messageDispatcher.getOrgById, { id: item.orgId });

            if (!org) return;

            if (org.isPaused) {
                console.warn(`Org ${item.orgId} is paused. Skipping dispatch.`);
                await ctx.runMutation(internal.messageDispatcher.updateQueueItemStatus, {
                    id: item._id,
                    messageId: message._id,
                    status: "pending",
                });
                return;
            }

            // Initialize warmup if not started
            if (!org.warmupStartedAt) {
                await ctx.runMutation(internal.messageDispatcher.initializeWarmup, { id: item.orgId });
            }

            // SURVIVAL DESIGN: Conservative ramp starting at 20/day (Rule 4)
            const effectiveDailyLimit = await ctx.runQuery(internal.messageDispatcher.getDynamicDailyLimit, { orgId: item.orgId });
            const messageCount = await ctx.runQuery(internal.messageDispatcher.getDailySentCount, { orgId: item.orgId });

            // SURVIVAL DESIGN: Per-minute burst cap (Rule 7)
            const minuteSentCount = await ctx.runQuery(internal.messageDispatcher.getMinuteSentCount, { orgId: item.orgId });
            const effectiveMinuteLimit = org.minuteLimit || 20; // Increased for testing

            if (messageCount >= effectiveDailyLimit || minuteSentCount >= effectiveMinuteLimit) {
                const limitType = messageCount >= effectiveDailyLimit ? "Daily" : "Minute";
                const limitVal = messageCount >= effectiveDailyLimit ? effectiveDailyLimit : effectiveMinuteLimit;
                console.warn(`Org ${item.orgId} reached survival ${limitType} limit (${limitVal}). Delaying.`);

                // Release lock and delay
                await ctx.runMutation(internal.messageDispatcher.updateQueueItemStatus, {
                    id: item._id,
                    messageId: message._id,
                    status: "pending",
                });
                return;
            }

            // 4. Dispatch based on channel (or Dry Run)
            if (org.dryRun) {
                console.log(`[DRY RUN] ${message.channel} to ${lead.whatsapp || lead.email} with key ${idempotencyKey}`);
                result = { success: true, providerMessageId: `dry_run_${Date.now()}` };
            } else if (message.channel === "whatsapp" && lead.whatsapp) {
                result = await whatsapp.sendMessage({
                    to: lead.whatsapp,
                    content: message.content,
                    idempotencyKey,
                });
            } else if (message.channel === "email" && lead.email) {
                result = await email.sendEmail({
                    to: lead.email,
                    subject: "Introduction from Elite Freight",
                    content: message.content,
                    idempotencyKey,
                });
            }

            if (result && !result.success) {
                throw new Error("WhatsApp/Email provider failed");
            }

            if (result?.success) {
                await ctx.runMutation(internal.messageDispatcher.updateQueueItemStatus, {
                    id: item._id,
                    messageId: message._id,
                    status: "completed",
                    providerMessageId: result.providerMessageId,
                    sentAt: Date.now(),
                });
            } else {
                throw new Error("Unknown provider error or missing contact info");
            }
        } catch (error: any) {
            console.error(`Failed to dispatch message ${message._id}:`, error);
            await ctx.runMutation(internal.messageDispatcher.handleQueueFailure, {
                id: item._id,
                error: error.message || "Unknown error",
            });
        }

        // 5. BURST PROTECTION: Reschedule next processing step with a minimal delay for testing
        await ctx.scheduler.runAfter(1000, internal.messageDispatcher.processQueueStep, {});
    },
});

export const claimQueueItem = internalMutation({
    args: {},
    handler: async (ctx) => {
        const item = await ctx.db
            .query("messageQueue")
            .withIndex("byStatus", (q) => q.eq("status", "pending").lt("nextAttemptAt", Date.now()))
            .first();

        if (!item) return null;

        await ctx.db.patch(item._id, {
            status: "processing",
            lockedAt: Date.now(),
            lastAttempt: Date.now(),
        });

        return item;
    },
});

export const getQueueStats = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) return { pending: 0, processing: 0, completed: 0, failed: 0 };

        const items = await ctx.db
            .query("messageQueue")
            .withIndex("byOrgId", (q) => q.eq("orgId", user.orgId!))
            .collect();
        return {
            pending: items.filter((i) => i.status === "pending").length,
            processing: items.filter((i) => i.status === "processing").length,
            completed: items.filter((i) => i.status === "completed").length,
            failed: items.filter((i) => i.status === "failed").length,
        };
    },
});

export const getRecentQueueItems = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) return [];

        const items = await ctx.db
            .query("messageQueue")
            .withIndex("byOrgId", (q) => q.eq("orgId", user.orgId!))
            .order("desc")
            .take(10);

        const results = [];
        for (const item of items) {
            const message = await ctx.db.get(item.messageId);
            if (!message) continue;

            const lead = await ctx.db.get(message.leadId);
            results.push({
                ...item,
                destination: lead?.whatsapp || lead?.email || "Unknown",
                followUpNumber: message.followUpNumber,
            });
        }
        return results;
    },
});

export const getMessageById = internalQuery({
    args: { id: v.id("messages") },
    handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const getLeadById = internalQuery({
    args: { id: v.id("leads") },
    handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const getOrgById = internalQuery({
    args: { id: v.id("organizations") },
    handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const getOrgInternal = internalQuery({
    args: { id: v.id("organizations") },
    handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const getDailySentCount = internalQuery({
    args: { orgId: v.id("organizations") },
    handler: async (ctx, args) => {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const sent = await ctx.db
            .query("messages")
            .withIndex("byOrgStatusSent", (q) => q.eq("orgId", args.orgId).eq("status", "sent").gt("sentAt", startOfDay.getTime()))
            .collect();

        return sent.length;
    },
});

export const getMinuteSentCount = internalQuery({
    args: { orgId: v.id("organizations") },
    handler: async (ctx, args) => {
        const oneMinuteAgo = Date.now() - 60000;
        const sent = await ctx.db
            .query("messages")
            .withIndex("byOrgStatusSent", (q) => q.eq("orgId", args.orgId).eq("status", "sent").gt("sentAt", oneMinuteAgo))
            .collect();
        return sent.length;
    },
});

export const getDynamicDailyLimit = internalQuery({
    args: { orgId: v.id("organizations") },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.orgId);
        if (!org) return 20;

        if (org.dailyLimit && org.dailyLimit > 20) return org.dailyLimit;
        if (!org.warmupStartedAt) return 20;

        const dayMs = 24 * 60 * 60 * 1000;
        const daysSinceWarmup = Math.floor((Date.now() - org.warmupStartedAt) / dayMs) + 1;

        if (daysSinceWarmup <= 1) return 20;
        if (daysSinceWarmup <= 2) return 50;
        if (daysSinceWarmup <= 3) return 100;
        if (daysSinceWarmup <= 4) return 200;
        if (daysSinceWarmup <= 5) return 300;
        return 500;
    },
});

export const initializeWarmup = internalMutation({
    args: { id: v.id("organizations") },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.id);
        if (org && !org.warmupStartedAt) {
            await ctx.db.patch(args.id, { warmupStartedAt: Date.now() });
        }
    },
});

export const recoverExpiredLocks = internalMutation({
    args: {},
    handler: async (ctx) => {
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        const expired = await ctx.db
            .query("messageQueue")
            .withIndex("byLockedAt", (q) => q.eq("status", "processing").lt("lockedAt", fiveMinutesAgo))
            .collect();

        for (const item of expired) {
            console.warn(`Recovering expired lock for queue item ${item._id}`);
            await ctx.db.patch(item._id, { status: "pending", lockedAt: undefined });
        }
    },
});

export const updateQueueItemStatus = internalMutation({
    args: {
        id: v.id("messageQueue"),
        messageId: v.id("messages"),
        status: v.union(v.literal("pending"), v.literal("processing"), v.literal("failed"), v.literal("completed")),
        providerMessageId: v.optional(v.string()),
        sentAt: v.optional(v.number()),
        error: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (!message) return;

        await ctx.db.patch(args.id, {
            status: args.status,
            lastAttempt: Date.now(),
            error: args.error,
            lockedAt: undefined
        });

        // Only update message lifecycle state on terminal queue outcomes.
        if (args.status === "completed") {
            await ctx.db.patch(args.messageId, {
                status: "sent",
                providerMessageId: args.providerMessageId,
                sentAt: args.sentAt ?? Date.now(),
            });
        } else if (args.status === "failed") {
            await ctx.db.patch(args.messageId, {
                status: "failed",
            });
        }

        if (args.status === "completed") {
            await ctx.db.insert("events", {
                orgId: message.orgId,
                type: "msg_sent",
                referenceId: args.messageId,
                modelMeta: {
                    model: "ollama-local",
                    model_version: "llama3-8b-instruct-q4",
                    snapshot_version: "v1",
                    template_version: "v1-standard",
                    workflow_version: "v1",
                    latencyMs: 0,
                    signalsUsed: ["workflow_execution"]
                },
                createdAt: Date.now(),
            });

            await ctx.scheduler.runAfter(0, internal.workflows.scheduleNextStepInSequence, {
                leadId: message.leadId,
                workflowId: message.workflowId!,
                completedFollowUpNumber: message.followUpNumber,
            });
        }
    },
});

export const handleQueueFailure = internalMutation({
    args: {
        id: v.id("messageQueue"),
        error: v.string(),
    },
    handler: async (ctx, args) => {
        const item = await ctx.db.get(args.id);
        if (!item) return;

        const maxAttempts = 3;
        const nextAttempts = item.attempts + 1;

        if (nextAttempts >= maxAttempts) {
            await ctx.db.patch(args.id, {
                status: "failed",
                error: `Max attempts reached: ${args.error}`,
                lastAttempt: Date.now(),
            });
        } else {
            const delay = Math.pow(2, nextAttempts) * 1000 * 60;
            await ctx.db.patch(args.id, {
                attempts: nextAttempts,
                error: args.error,
                nextAttemptAt: Date.now() + delay,
                status: "pending",
                lockedAt: undefined,
            });
        }
    },
});

