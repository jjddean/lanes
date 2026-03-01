import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Knowledge Base (RAG) Engine
 * Handles vector search for legislation, tariff rules, and trade policy.
 */

/**
 * Internal helper for fetching chunks.
 */
async function fetchChunkById(ctx: any, id: any) {
    return await ctx.db.get(id);
}

export const searchLegislation = action({
    args: {
        query: v.string(),
        embedding: v.array(v.float64()), // Vector from the caller
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // 1. Perform Vector Search in Convex
        const results = await ctx.vectorSearch("knowledgeChunks", "by_embedding", {
            vector: args.embedding,
            limit: args.limit || 3,
        });

        // 2. Fetch full text for the matches
        const chunks = await Promise.all(
            results.map(async (res: any) => {
                const chunk = await fetchChunkById(ctx, res._id);
                return {
                    text: chunk?.text || "",
                    metadata: chunk?.metadata,
                    score: res._score,
                };
            })
        );

        return chunks;
    },
});

export const getChunkById = internalQuery({
    args: { id: v.id("knowledgeChunks") },
    handler: async (ctx, args) => {
        return await fetchChunkById(ctx, args.id);
    },
});

/**
 * Mutation to seed or upload new knowledge chunks.
 * In a real app, this would be called by a script processing PDFs.
 */
export const insertKnowledgeChunk = internalMutation({
    args: {
        documentId: v.string(),
        text: v.string(),
        embedding: v.array(v.float64()),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("knowledgeChunks", {
            documentId: args.documentId,
            text: args.text,
            embedding: args.embedding,
            metadata: args.metadata,
        });
    },
});
