import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Seed Development Impact Data
 * Ingests DCTS-specific development metrics and framing into the RAG system.
 */
export const seedImpactData = internalAction({
    args: {},
    handler: async (ctx) => {
        const impactSnippets = [
            {
                id: "dcts-obj-1",
                text: "The UK Developing Countries Trading Scheme (DCTS) aims to support sustainable growth by reducing tariffs on over 3,000 products, directly contributing to poverty reduction through trade.",
                metadata: { category: "objective", source: "Gov.uk" }
            },
            {
                id: "dcts-impact-vietnam",
                text: "In Vietnam, DCTS Enhanced Framework status supports the transition to high-value manufacturing, specifically in electronics and textiles, fostering skilled employment and wage growth.",
                metadata: { category: "impact", country: "Vietnam" }
            },
            {
                id: "dcts-impact-bangladesh",
                text: "For Bangladesh, LDC Framework benefits under DCTS are critical for the Ready-Made Garment (RMG) sector, which employs over 4 million people, 80% of whom are women.",
                metadata: { category: "impact", country: "Bangladesh" }
            },
            {
                id: "ethical-framing-1",
                text: "When communicating with DCTS partners, emphasize how predictable trade lanes lead to reliable income for local producers and factory workers, reinforcing the social 'S' in ESG.",
                metadata: { category: "framing", type: "ethical" }
            }
        ];

        console.log("Seeding impact data chunks...");

        for (const snippet of impactSnippets) {
            // Mock embedding generation (1536 dims)
            const embedding = new Array(1536).fill(0).map(() => Math.random());

            await ctx.runMutation(internal.knowledge.insertKnowledgeChunk, {
                documentId: "dcts-development-impact-v1",
                text: snippet.text,
                embedding: embedding,
                metadata: snippet.metadata,
            });
        }

        console.log(`Successfully seeded ${impactSnippets.length} impact snippets.`);
    },
});
