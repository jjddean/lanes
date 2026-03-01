import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

/**
 * Compliance Documentation Engine
 * Handles generation of EUR.1 and GSP Form A data structures.
 */

export const generateDocDraft = mutation({
    args: {
        leadId: v.id("leads"),
        type: v.union(v.literal("EUR.1"), v.literal("GSP_FORM_A"), v.literal("ORIGIN_DECLARATION")),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");

        const lead = await ctx.db.get(args.leadId);
        if (!lead || lead.orgId !== user.orgId) throw new Error("Lead not found");

        const org = await ctx.db.get(user.orgId);
        if (!org) throw new Error("Organization not found");

        const today = new Date();
        const period = `${today.getFullYear()}-Q${Math.floor(today.getMonth() / 3) + 1}`;

        // Mapping logic for Box 1-12
        const formData = {
            box1_exporter: org.name + "\n" + (org.website || ""),
            box2_destination: lead.country,
            box3_consignee: lead.companyName,
            box4_origin: args.type === "EUR.1" ? "United Kingdom" : lead.country,
            box5_country_destination: lead.country,
            box8_description: `HS CODE: ${lead.hsCode || "N/A"}\nINDUSTRY: ${lead.industry}`,
            box12_declaration_date: today.toISOString().split('T')[0],
            box12_declaration_place: "London, UK",
        };

        const docId = await ctx.db.insert("complianceDocs", {
            orgId: user.orgId,
            leadId: args.leadId,
            type: args.type,
            status: "draft",
            formData: JSON.stringify(formData),
            period: period,
            createdAt: Date.now(),
        });

        // Trigger an event for the activity stream
        await ctx.db.insert("events", {
            orgId: user.orgId,
            type: "deal_stage_changed", // Reusing for now or could add "doc_generated"
            referenceId: docId,
            createdAt: Date.now()
        });

        return docId;
    }
});

export const getDocsForLead = query({
    args: { leadId: v.id("leads") },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) return [];

        return await ctx.db
            .query("complianceDocs")
            .withIndex("byLeadId", (q) => q.eq("leadId", args.leadId))
            .collect();
    }
});

export const listAllDocs = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) return [];

        return await ctx.db
            .query("complianceDocs")
            .withIndex("byOrgId", (q) => q.eq("orgId", user.orgId!))
            .collect();
    }
});

export const updateDocDraft = mutation({
    args: {
        docId: v.id("complianceDocs"),
        formData: v.string(),
        status: v.optional(v.union(v.literal("draft"), v.literal("generated"), v.literal("archived"))),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");

        const doc = await ctx.db.get(args.docId);
        if (!doc || doc.orgId !== user.orgId) throw new Error("Document not found");

        await ctx.db.patch(args.docId, {
            formData: args.formData,
            status: args.status ?? doc.status,
        });

        return args.docId;
    }
});
