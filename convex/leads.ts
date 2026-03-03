import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { paginationOptsValidator } from "convex/server";

export const listLeads = query({
    args: {
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) return [];

        let q = ctx.db.query("leads").withIndex("byOrgId", (q) => q.eq("orgId", user.orgId!));

        if (args.status) {
            q = ctx.db.query("leads").withIndex("byStatus", (q) =>
                q.eq("orgId", user.orgId!).eq("status", args.status as any)
            );
        }

        return await q.collect();
    },
});

export const listLeadsPaginated = query({
    args: {
        status: v.optional(v.string()),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) {
            return {
                page: [],
                isDone: true,
                continueCursor: "",
                splitCursor: null,
                pageStatus: null,
            };
        }

        if (args.status) {
            return await ctx.db
                .query("leads")
                .withIndex("byStatusCreatedAt", (q) =>
                    q.eq("orgId", user.orgId!).eq("status", args.status as any)
                )
                .order("desc")
                .paginate(args.paginationOpts);
        }

        return await ctx.db
            .query("leads")
            .withIndex("byOrgCreatedAt", (q) => q.eq("orgId", user.orgId!))
            .order("desc")
            .paginate(args.paginationOpts);
    },
});

export const listLeadsByOrg = query({
    args: {
        orgId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) return [];
        if (user.orgId !== args.orgId) return [];

        return await ctx.db
            .query("leads")
            .withIndex("byOrgId", (q) => q.eq("orgId", args.orgId))
            .collect();
    },
});

export const listIndustryOptions = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) return [];

        const leads = await ctx.db
            .query("leads")
            .withIndex("byOrgId", (q) => q.eq("orgId", user.orgId!))
            .collect();

        return Array.from(new Set(leads.map((lead) => lead.industry).filter(Boolean))).sort((a, b) =>
            a.localeCompare(b)
        );
    },
});

export const createLead = mutation({
    args: {
        workflowId: v.optional(v.id("workflows")),
        companyName: v.string(),
        country: v.string(),
        industry: v.string(),
        laneOrigin: v.optional(v.string()),
        laneDestination: v.optional(v.string()),
        whatsapp: v.optional(v.string()),
        email: v.optional(v.string()),
        hsCode: v.optional(v.string()),
        tags: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("User must belong to an organization");

        const leadId = await ctx.db.insert("leads", {
            ...args,
            orgId: user.orgId,
            status: "new",
            createdAt: Date.now(),
        });

        // Strategy: Feature Snapshot on creation for future training
        await ctx.db.insert("events", {
            orgId: user.orgId,
            type: "target_selected",
            referenceId: leadId,
            featureSnapshot: JSON.stringify({
                version: "v1",
                context: "on_create",
                features: {
                    industry: args.industry,
                    country: args.country,
                    lanes: { origin: args.laneOrigin, destination: args.laneDestination }
                }
            }),
            modelMeta: {
                model: "on-demand-create",
                model_version: "v1",
                snapshot_version: "v1",
                template_version: "n/a",
                workflow_version: "v1",
                latencyMs: 0,
                signalsUsed: ["user_creation"]
            },
            createdAt: Date.now(),
        });

        return leadId;
    },
});

export const updateLeadStatus = mutation({
    args: {
        id: v.id("leads"),
        status: v.union(
            v.literal("new"),
            v.literal("contacted"),
            v.literal("replied"),
            v.literal("engaged"),
            v.literal("qualified"),
            v.literal("won"),
            v.literal("lost"),
            v.literal("unsubscribed"),
            v.literal("archived")
        ),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");
        const lead = await ctx.db.get(args.id);
        if (!lead || lead.orgId !== user.orgId) throw new Error("Unauthorized");

        await ctx.db.patch(args.id, { status: args.status });

        await ctx.db.insert("events", {
            orgId: user.orgId,
            type: "intent_corrected",
            referenceId: args.id,
            userLabel: args.status,
            modelMeta: {
                model: "human-override",
                model_version: "v1",
                snapshot_version: "v1",
                template_version: "n/a",
                workflow_version: "v1",
                latencyMs: 0,
                signalsUsed: ["manual_status_change"]
            },
            createdAt: Date.now(),
        });

        return args.id;
    },
});

export const snoozeLead = mutation({
    args: {
        id: v.id("leads"),
        hours: v.number(),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");
        const lead = await ctx.db.get(args.id);
        if (!lead || lead.orgId !== user.orgId) throw new Error("Unauthorized");

        const snoozedUntil = Date.now() + args.hours * 60 * 60 * 1000;
        await ctx.db.patch(args.id, { snoozedUntil });
        return args.id;
    },
});

export const assignLead = mutation({
    args: {
        id: v.id("leads"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");
        const lead = await ctx.db.get(args.id);
        if (!lead || lead.orgId !== user.orgId) throw new Error("Unauthorized");

        await ctx.db.patch(args.id, { assignedTo: args.userId });
        return args.id;
    },
});

export const updateLeadStatusInternal = internalMutation({
    args: {
        id: v.id("leads"),
        status: v.union(
            v.literal("new"),
            v.literal("contacted"),
            v.literal("replied"),
            v.literal("engaged"),
            v.literal("qualified"),
            v.literal("won"),
            v.literal("lost"),
            v.literal("unsubscribed")
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: args.status });
    },
});

export const updateLead = mutation({
    args: {
        id: v.id("leads"),
        companyName: v.optional(v.string()),
        country: v.optional(v.string()),
        industry: v.optional(v.string()),
        whatsapp: v.optional(v.string()),
        email: v.optional(v.string()),
        laneOrigin: v.optional(v.string()),
        laneDestination: v.optional(v.string()),
        hsCode: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");
        const lead = await ctx.db.get(args.id);
        if (!lead || lead.orgId !== user.orgId) throw new Error("Lead not found");

        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);

        return id;
    },
});

export const deleteLead = mutation({
    args: { id: v.id("leads") },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");
        const lead = await ctx.db.get(args.id);
        if (!lead || lead.orgId !== user.orgId) throw new Error("Unauthorized");

        await ctx.db.delete(args.id);
    },
});
