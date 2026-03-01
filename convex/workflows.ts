import { v } from "convex/values";
import { mutation, query, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./users";

/**
 * Workflow Engine (Elite v1)
 * Handles the 6-step autonomous flow.
 */

const TARGET_POOL_SIZE = 300;

function tradeLaneCandidates(tradeLane: string) {
    const normalized = tradeLane.trim();
    if (!normalized) return [];
    const splitLane = normalized
        .split(/\s+to\s+/i)
        .map((part) => part.trim())
        .filter(Boolean);
    const rawCandidates = [normalized, ...splitLane];
    const withCaseVariants = rawCandidates.flatMap((candidate) => {
        const titleCase = candidate
            .toLowerCase()
            .replace(/\b\w/g, (ch) => ch.toUpperCase());
        return [candidate, candidate.toUpperCase(), titleCase];
    });
    return Array.from(new Set(withCaseVariants.map((value) => value.trim()).filter(Boolean)));
}

export const createWorkflow = mutation({
    args: {
        tradeLane: v.string(),
        industry: v.string(),
        buyerType: v.string(),
        dailyLimit: v.number(),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");

        const workflowId = await ctx.db.insert("workflows", {
            orgId: user.orgId,
            name: `${args.buyerType} Discovery - ${args.tradeLane}`,
            targetProfile: {
                tradeLane: args.tradeLane,
                industry: args.industry,
                buyerType: args.buyerType,
            },
            dailyLimit: args.dailyLimit,
            status: "paused",
            createdAt: Date.now(),
        });

        return workflowId;
    },
});

export const updateWorkflowProfile = mutation({
    args: {
        id: v.id("workflows"),
        tradeLane: v.optional(v.string()),
        industry: v.optional(v.string()),
        buyerType: v.optional(v.string()),
        dailyLimit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");

        const workflow = await ctx.db.get(args.id);
        if (!workflow || workflow.orgId !== user.orgId) throw new Error("Workflow not found");

        const { id, ...updates } = args;
        const newProfile = { ...workflow.targetProfile };
        if (updates.tradeLane) newProfile.tradeLane = updates.tradeLane;
        if (updates.industry) newProfile.industry = updates.industry;
        if (updates.buyerType) newProfile.buyerType = updates.buyerType;

        await ctx.db.patch(id, {
            targetProfile: newProfile,
            dailyLimit: updates.dailyLimit ?? workflow.dailyLimit,
        });

        return id;
    },
});

export const activateWorkflow = mutation({
    args: { id: v.id("workflows") },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");

        const workflow = await ctx.db.get(args.id);
        if (!workflow || workflow.orgId !== user.orgId) throw new Error("Workflow not found");

        await ctx.db.patch(args.id, { status: "active" });

        // Trigger Step 2: Discovery
        await ctx.scheduler.runAfter(0, internal.workflows.discoveryStep, {
            workflowId: args.id,
            orgId: user.orgId,
        });
    },
});

export const discoveryStep = internalAction({
    args: {
        workflowId: v.optional(v.id("workflows")),
        orgId: v.optional(v.id("organizations")),
    },
    handler: async (ctx, args) => {
        // Cron mode: fan out discovery across all active workflows.
        if (!args.workflowId || !args.orgId) {
            const activeWorkflows = await ctx.runQuery(internal.workflows.listActiveWorkflowsInternal, {});
            for (const workflow of activeWorkflows) {
                await ctx.scheduler.runAfter(0, internal.workflows.discoveryStep, {
                    workflowId: workflow._id,
                    orgId: workflow.orgId,
                });
            }
            return;
        }

        const workflow = await ctx.runQuery(internal.workflows.getWorkflowInternal, { id: args.workflowId });
        if (!workflow) return;
        if (workflow.status !== "active") return;

        const existingLeadCount = await ctx.runQuery(internal.workflows.countLeadsForWorkflowInternal, {
            workflowId: args.workflowId,
        });

        const remainingPoolSlots = Math.max(0, TARGET_POOL_SIZE - existingLeadCount);
        if (remainingPoolSlots === 0) return;

        // Step 2: Target Selection (Seeded Registry Discovery)
        console.log(`Discovering targets for workflow ${args.workflowId} in ${workflow.targetProfile.industry}...`);

        const candidates = tradeLaneCandidates(workflow.targetProfile.tradeLane);
        const targets: any[] = [];

        for (const candidate of candidates) {
            const discovered = await ctx.runQuery(internal.targets.searchTargets, {
                country: candidate,
                industry: workflow.targetProfile.industry,
                limit: TARGET_POOL_SIZE,
            });
            targets.push(...discovered);
        }

        if (targets.length === 0) {
            console.warn(`No targets found for ${workflow.targetProfile.industry} in ${workflow.targetProfile.tradeLane}`);
            return;
        }

        const maxToAddThisRun = Math.min(remainingPoolSlots, TARGET_POOL_SIZE);
        const uniqueTargets = Array.from(new Map(targets.map((target) => [target.externalId, target])).values());
        let inserted = 0;

        for (const target of uniqueTargets) {
            if (inserted >= maxToAddThisRun) break;
            const leadId = await ctx.runMutation(internal.workflows.addLeadToWorkflow, {
                workflowId: args.workflowId,
                orgId: args.orgId,
                leadData: {
                    companyName: target.companyName,
                    country: target.country,
                    industry: target.industry,
                    externalId: target.externalId,
                    whatsapp: target.whatsapp,
                    email: target.email,
                    laneOrigin: target.laneTags[0] || "",
                    laneDestination: target.laneTags[1] || "",
                },
            });
            if (leadId) inserted += 1;
        }
    },
});

export const listActiveWorkflows = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) return [];
        return await ctx.db
            .query("workflows")
            .withIndex("byOrgId", (q) => q.eq("orgId", user.orgId!))
            .collect();
    },
});

export const getWorkflowInternal = internalQuery({
    args: { id: v.id("workflows") },
    handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const listActiveWorkflowsInternal = internalQuery({
    args: {},
    handler: async (ctx) => {
        const allWorkflows = await ctx.db.query("workflows").collect();
        return allWorkflows.filter((workflow) => workflow.status === "active");
    },
});

export const countLeadsForWorkflowInternal = internalQuery({
    args: { workflowId: v.id("workflows") },
    handler: async (ctx, args) => {
        const leads = await ctx.db
            .query("leads")
            .withIndex("byWorkflowId", (q) => q.eq("workflowId", args.workflowId))
            .collect();
        return leads.length;
    },
});

export const addLeadToWorkflow = internalMutation({
    args: {
        workflowId: v.id("workflows"),
        orgId: v.id("organizations"),
        leadData: v.object({
            companyName: v.string(),
            country: v.string(),
            industry: v.string(),
            externalId: v.string(),
            whatsapp: v.optional(v.string()),
            email: v.optional(v.string()),
            laneOrigin: v.optional(v.string()),
            laneDestination: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        // Tier 2: Normalization & Collision Guard
        const normalizedExternalId = args.leadData.externalId.trim().toLowerCase();
        const normalizedCompanyName = args.leadData.companyName.trim();

        const existingLead = await ctx.db
            .query("leads")
            .withIndex("byExternalId", (q) =>
                q.eq("workflowId", args.workflowId).eq("externalId", normalizedExternalId)
            )
            .first();

        if (existingLead) {
            console.log(`Lead ${args.leadData.externalId} already exists in workflow ${args.workflowId}. Skipping.`);
            return null;
        }

        // SURVIVAL DESIGN: Blacklist check (Rule 2)
        // Check if any lead in this org with same WA/Email is unsubscribed
        const blacklisted = await ctx.db
            .query("leads")
            .withIndex("byOrgId", (q) => q.eq("orgId", args.orgId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("status"), "unsubscribed"),
                    q.or(
                        args.leadData.whatsapp ? q.eq(q.field("whatsapp"), args.leadData.whatsapp) : false,
                        args.leadData.email ? q.eq(q.field("email"), args.leadData.email) : false
                    )
                )
            )
            .first();

        if (blacklisted) {
            console.warn(`Lead ${args.leadData.externalId} is globally unsubscribed in this org. Blocking re-entry.`);
            return null;
        }

        const leadId = await ctx.db.insert("leads", {
            orgId: args.orgId,
            workflowId: args.workflowId,
            companyName: normalizedCompanyName,
            country: args.leadData.country,
            industry: args.leadData.industry,
            externalId: normalizedExternalId,
            whatsapp: args.leadData.whatsapp,
            email: args.leadData.email,
            laneOrigin: args.leadData.laneOrigin,
            laneDestination: args.leadData.laneDestination,
            status: "new",
            tags: ["autonomous", "discovery"],
            createdAt: Date.now(),
        });

        // Log Step 2 Completion
        await ctx.db.insert("events", {
            orgId: args.orgId,
            type: "target_selected",
            referenceId: leadId,
            featureSnapshot: JSON.stringify({
                version: "v1", // Snapshot format version
                workflowId: args.workflowId,
                context: "autonomous_discovery"
            }),
            modelMeta: {
                model: "rule-engine",
                model_version: "v1",
                snapshot_version: "v1",
                template_version: "n/a",
                workflow_version: "v1",
                latencyMs: 0,
                signalsUsed: ["discovery_hash"]
            },
            createdAt: Date.now(),
        });

        // Trigger Step 3: Message Generation
        await ctx.scheduler.runAfter(0, internal.workflows.generateSequenceStep, {
            workflowId: args.workflowId,
            orgId: args.orgId,
            leadId,
        });
        return leadId;
    },
});

export const generateSequenceStep = internalAction({
    args: {
        workflowId: v.id("workflows"),
        orgId: v.id("organizations"),
        leadId: v.id("leads"),
    },
    handler: async (ctx, args) => {
        const lead = await ctx.runQuery(internal.workflows.getLeadInternal, { id: args.leadId });
        if (!lead) return;

        console.log(`Generating message sequence for lead ${args.leadId}...`);

        // Step 3: Sequence Generation
        // In v1, we generate three messages: Intro, F1, F2
        const sequences = [
            { type: "intro", waitDays: 0 },
            { type: "f1", waitDays: 2 },
            { type: "f2", waitDays: 5 },
        ];

        for (let i = 0; i < sequences.length; i++) {
            const seq = sequences[i];
            const content = await ctx.runAction(internal.ai.generateVersionedMessage, {
                leadId: args.leadId,
                type: seq.type,
            });

            await ctx.runMutation(internal.workflows.queueSequenceMessage, {
                workflowId: args.workflowId,
                orgId: args.orgId,
                leadId: args.leadId,
                content,
                followUpNumber: i,
                scheduledAt: Date.now() + (seq.waitDays * 24 * 60 * 60 * 1000),
            });
        }
    },
});

export const getLeadInternal = internalQuery({
    args: { id: v.id("leads") },
    handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const queueSequenceMessage = internalMutation({
    args: {
        workflowId: v.id("workflows"),
        orgId: v.id("organizations"),
        leadId: v.id("leads"),
        content: v.string(),
        followUpNumber: v.number(),
        scheduledAt: v.number(),
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("messages", {
            orgId: args.orgId,
            workflowId: args.workflowId,
            leadId: args.leadId,
            channel: "whatsapp", // Default
            content: args.content,
            status: "queued",
            followUpNumber: args.followUpNumber,
            scheduledAt: args.scheduledAt,
        });

        // Log Step 3 Event
        await ctx.db.insert("events", {
            orgId: args.orgId,
            type: "msg_generated",
            referenceId: messageId,
            modelMeta: {
                model: "ollama-local",
                model_version: "llama3-8b-instruct-q4",
                snapshot_version: "v1",
                template_version: "v1-standard",
                workflow_version: "v1",
                latencyMs: 0,
                signalsUsed: ["workflow_context"]
            },
            createdAt: Date.now(),
        });

        // Step 4: Outreach Execution
        // Queue every step immediately with a future nextAttemptAt.
        // Dispatcher claims only when nextAttemptAt is due.
        await ctx.db.insert("messageQueue", {
            orgId: args.orgId,
            messageId,
            priority: args.followUpNumber,
            attempts: 0,
            nextAttemptAt: args.scheduledAt,
            status: "pending",
        });
    },
});
export const scheduleNextStepInSequence = internalMutation({
    args: {
        workflowId: v.id("workflows"),
        leadId: v.id("leads"),
        completedFollowUpNumber: v.number(),
        isHighlyEngaged: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        // Find the next message in the sequence
        const nextMessage = await ctx.db
            .query("messages")
            .withIndex("byLeadId", (q) => q.eq("leadId", args.leadId))
            .filter((q) => q.eq(q.field("followUpNumber"), args.completedFollowUpNumber + 1))
            .first();

        if (!nextMessage || nextMessage.status !== "queued") return;

        // Deterministic Behavior-based backoff
        // If Intro READ -> schedule F1 for +1 day
        // If Intro SENT (not read) -> schedule F1 for +3 days
        const delayDays = args.isHighlyEngaged ? 1 : 3;
        const newScheduledAt = Date.now() + (delayDays * 24 * 60 * 60 * 1000);

        await ctx.db.patch(nextMessage._id, {
            scheduledAt: newScheduledAt,
        });

        // Keep queue schedule in sync when lead engagement accelerates follow-ups.
        const queuedItem = await ctx.db
            .query("messageQueue")
            .withIndex("byOrgId", (q) => q.eq("orgId", nextMessage.orgId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("messageId"), nextMessage._id),
                    q.eq(q.field("status"), "pending"),
                )
            )
            .first();

        if (queuedItem) {
            await ctx.db.patch(queuedItem._id, {
                nextAttemptAt: newScheduledAt,
            });
        } else {
            await ctx.db.insert("messageQueue", {
                orgId: nextMessage.orgId,
                messageId: nextMessage._id,
                priority: nextMessage.followUpNumber,
                attempts: 0,
                nextAttemptAt: newScheduledAt,
                status: "pending",
            });
        }
    },
});
/**
 * Engine Laboratory Triggers (Elite v1 Debug)
 * These allow manual steering of the engine for diagnostic purposes.
 */

export const seedSampleWorkflow = mutation({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");

        const workflowId = await ctx.db.insert("workflows", {
            orgId: user.orgId,
            name: "Lab Discovery - Vietnam Industrial",
            targetProfile: {
                tradeLane: "Vietnam",
                industry: "Industrial Machinery",
                buyerType: "Manufacturer",
            },
            dailyLimit: 200,
            status: "active",
            createdAt: Date.now(),
        });

        return workflowId;
    },
});

export const triggerDiscovery = mutation({
    args: { workflowId: v.optional(v.id("workflows")) },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");

        let workflowId = args.workflowId;
        if (!workflowId) {
            const workflow = await ctx.db
                .query("workflows")
                .withIndex("byOrgId", (q) => q.eq("orgId", user.orgId!))
                .first();
            workflowId = workflow?._id;
        }

        if (!workflowId) throw new Error("No workflows found to trigger discovery");

        await ctx.scheduler.runAfter(0, internal.workflows.discoveryStep, {
            workflowId,
            orgId: user.orgId,
        });
    },
});
