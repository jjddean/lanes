import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getCurrentUser } from "./users";
import { extractDataFromDocument } from "./providers/textract";

/**
 * Compliance Documentation Engine
 * Handles generation of EUR.1 and GSP Form A data structures.
 */

export const generateDocDraft = mutation({
    args: {
        leadId: v.id("leads"),
        type: v.union(
            v.literal("EUR.1"),
            v.literal("GSP_FORM_A"),
            v.literal("FORM_A"),
            v.literal("ORIGIN_DECLARATION"),
            v.literal("SUPPLIER_DECLARATION"),
            v.literal("PRODUCTION_RECORD"),
            v.literal("CUMULATION_EVIDENCE")
        ),
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
        // Specific template mapping
        let templateData: Record<string, any> = {};
        if (args.type === "SUPPLIER_DECLARATION") {
            templateData = {
                declaration_text: `I, the undersigned, declare that the goods described below (${lead.hsCode}) originate in ${org.tradeDNA?.mainLanes[0] || "United Kingdom"} and satisfy the rules of origin governing preferential trade with ${lead.country}.`,
                period_validity: "12 Months",
            };
        } else if (args.type === "PRODUCTION_RECORD") {
            templateData = {
                raw_materials: "Detailed in Appendix A",
                manufacturing_process: "Standard Assembly",
                value_added: "Calculated per batch",
            };
        } else if (args.type === "CUMULATION_EVIDENCE") {
            templateData = {
                cumulation_type: "Bilateral",
                partner_country: lead.country,
                evidence_reference: "UK-DCTS-2024-CUM",
            };
        }

        const formData = {
            box1_exporter: org.name + "\n" + (org.website || ""),
            box2_destination: lead.country,
            box3_consignee: lead.companyName,
            box4_origin: args.type === "EUR.1" ? "United Kingdom" : lead.country,
            box5_country_destination: lead.country,
            box8_description: `HS CODE: ${lead.hsCode || "N/A"}\nINDUSTRY: ${lead.industry}`,
            box12_declaration_date: today.toISOString().split('T')[0],
            box12_declaration_place: "London, UK",
            // New fields for extended forms
            origin_criterion: lead.dctsStatus === "LDC" ? "P" : "W",
            supplier_name: org.name,
            evidence_type: args.type === "CUMULATION_EVIDENCE" ? "Bilateral Cumulation" : "Product Specific Rule",
            ...templateData,
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

// Helper to parse Textract KEY_VALUE pairs
function parseTextractForms(data: any) {
    const keyMap: Record<string, any> = {};
    const valueMap: Record<string, any> = {};
    const blockMap: Record<string, any> = {};

    data.Blocks?.forEach((block: any) => {
        blockMap[block.Id] = block;
        if (block.BlockType === "KEY_VALUE_SET") {
            if (block.EntityTypes?.includes("KEY")) {
                keyMap[block.Id] = block;
            } else {
                valueMap[block.Id] = block;
            }
        }
    });

    const results: Record<string, string> = {};

    Object.values(keyMap).forEach((keyBlock: any) => {
        const valueBlock = findValueBlock(keyBlock, valueMap);
        const key = getText(keyBlock, blockMap);
        const value = getText(valueBlock, blockMap);
        if (key && value) {
            results[key.toLowerCase().replace(/[^a-z0-9]/g, '_')] = value;
        }
    });

    return results;
}

function findValueBlock(keyBlock: any, valueMap: any) {
    let valueBlock: any = null;
    keyBlock.Relationships?.forEach((rel: any) => {
        if (rel.Type === "VALUE") {
            rel.Ids.forEach((id: string) => {
                valueBlock = valueMap[id];
            });
        }
    });
    return valueBlock;
}

function getText(result: any, blockMap: any) {
    let text = "";
    if (result?.Relationships) {
        result.Relationships.forEach((rel: any) => {
            if (rel.Type === "CHILD") {
                rel.Ids.forEach((id: string) => {
                    const word = blockMap[id];
                    if (word && word.BlockType === "WORD") text += word.Text + " ";
                    if (word && word.BlockType === "SELECTION_ELEMENT" && word.SelectionStatus === "SELECTED") text += "X ";
                });
            }
        });
    }
    return text.trim();
}

export const processTextractResults = mutation({
    args: {
        leadId: v.id("leads"),
        parsed: v.any(),
    },
    handler: async (ctx, args) => {
        const mapping = {
            hsCode: args.parsed.hs_code || args.parsed.commodity_code || args.parsed.tariff_number,
            origin: args.parsed.origin || args.parsed.country_of_origin || args.parsed.made_in,
            value: args.parsed.invoice_total || args.parsed.amount || args.parsed.total_value,
        };

        if (mapping.hsCode || mapping.origin) {
            await ctx.db.patch(args.leadId, {
                hsCode: mapping.hsCode ?? undefined,
                enrichmentJson: JSON.stringify({
                    status: "completed",
                    extracted: mapping,
                    source: "AWS_TEXTRACT"
                })
            });
        }
        return mapping;
    }
});

export const analyzeDocument = action({
    args: {
        storageId: v.id("_storage"),
        leadId: v.id("leads"),
    },
    handler: async (ctx: any, args: { storageId: any, leadId: any }) => {
        const blob = await ctx.storage.get(args.storageId);
        if (!blob) throw new Error("File not found");

        const textractData = await extractDataFromDocument(blob);
        const parsed = parseTextractForms(textractData);

        await ctx.runMutation(api.compliance.processTextractResults, {
            leadId: args.leadId,
            parsed
        });

        return { success: true };
    }
});

export const getUploadUrl = mutation(async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || !user.orgId) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
});
