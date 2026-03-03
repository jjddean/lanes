import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const createImportJob = mutation({
    args: { totalRows: v.number() },
    handler: async (ctx, args) => {
        const user = await (ctx as any).db.query("users").first(); // Simplified for now
        const orgId = user?.orgId;
        if (!orgId) throw new Error("No organization found");

        const jobId = await ctx.db.insert("importJobs", {
            orgId,
            status: "pending",
            totalRows: args.totalRows,
            processedRows: 0,
            createdAt: Date.now(),
        });
        return jobId;
    },
});

export const addRowsToJob = mutation({
    args: {
        jobId: v.id("importJobs"),
        rows: v.array(v.string()), // JSON serialized row data
    },
    handler: async (ctx, args) => {
        const job = await ctx.db.get(args.jobId);
        if (!job) throw new Error("Job not found");

        for (const rowData of args.rows) {
            await ctx.db.insert("importRows", {
                jobId: args.jobId,
                orgId: job.orgId,
                data: rowData,
                status: "pending",
            });
        }
    },
});

export const startProcessingJob = mutation({
    args: { jobId: v.id("importJobs") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.jobId, { status: "processing" });
        await ctx.scheduler.runAfter(0, internal.imports.processImportChunk, { jobId: args.jobId });
    },
});

export const processImportChunk = internalAction({
    args: { jobId: v.id("importJobs") },
    handler: async (ctx, args) => {
        const rows = await ctx.runQuery(internal.imports.getPendingRows, { jobId: args.jobId, limit: 100 });

        if (rows.length === 0) {
            await ctx.runMutation(internal.imports.completeJob, { jobId: args.jobId });
            return;
        }

        const targetsToInsert = rows.map(row => {
            const data = JSON.parse(row.data);
            return {
                externalId: data.externalId || `import_${row._id}`,
                companyName: data.companyName,
                country: data.country,
                industry: data.industry,
                domain: data.domain || "",
                laneTags: data.laneTags || [],
                whatsapp: data.whatsapp,
                email: data.email,
            };
        });

        await ctx.runMutation(internal.targets.seedTargets, { targets: targetsToInsert });

        const rowIds = rows.map(r => r._id);
        await ctx.runMutation(internal.imports.markRowsProcessed, { jobId: args.jobId, rowIds });

        // Continue processing
        await ctx.scheduler.runAfter(0, internal.imports.processImportChunk, { jobId: args.jobId });
    },
});

export const getPendingRows = internalQuery({
    args: { jobId: v.id("importJobs"), limit: v.number() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("importRows")
            .withIndex("byJobId", (q) => q.eq("jobId", args.jobId).eq("status", "pending"))
            .take(args.limit);
    },
});

export const markRowsProcessed = internalMutation({
    args: { jobId: v.id("importJobs"), rowIds: v.array(v.id("importRows")) },
    handler: async (ctx, args) => {
        for (const id of args.rowIds) {
            await ctx.db.patch(id, { status: "completed" });
        }
        const job = await ctx.db.get(args.jobId);
        if (job) {
            await ctx.db.patch(args.jobId, {
                processedRows: job.processedRows + args.rowIds.length
            });
        }
    },
});

export const completeJob = internalMutation({
    args: { jobId: v.id("importJobs") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.jobId, { status: "completed" });
    },
});
