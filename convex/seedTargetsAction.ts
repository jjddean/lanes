import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Seed Targets Action (Elite v1)
 * Used to load the initial 5k leads into the targets registry.
 */

export const performInitialSeed = action({
    args: { count: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const count = args.count || 5000;
        console.log(`Starting bulk seed of ${count} targets...`);

        const countries = [
            "USA", "Vietnam", "Turkey", "Germany", "China",
            "India", "UK", "Netherlands", "Poland", "Italy",
            "Brazil", "Singapore", "UAE", "Caribbean", "Africa"
        ];
        const industries = ["Consumer Electronics", "Industrial Machinery", "Textiles", "Automotive Parts", "Chemicals", "Furniture", "Medical Devices", "Food & Beverage"];
        const buyerTypes = ["Direct Importer", "Wholesaler", "Retail Chain", "Manufacturer"];

        const batchSize = 100;
        for (let i = 0; i < count; i += batchSize) {
            const targets = [];
            for (let j = 0; j < batchSize && (i + j) < count; j++) {
                const country = countries[Math.floor(Math.random() * countries.length)];
                const industry = industries[Math.floor(Math.random() * industries.length)];
                const buyerType = buyerTypes[Math.floor(Math.random() * buyerTypes.length)];
                const companyId = i + j;

                targets.push({
                    externalId: `seed_target_${companyId}`,
                    companyName: `${buyerType} ${companyId} - ${industry}`,
                    country: country,
                    industry: industry,
                    domain: `company${companyId}.com`,
                    laneTags: [country, "London"], // Mocking a common destination
                    whatsapp: "+1234567890", // Placeholder phone for seed
                    email: `contact@company${companyId}.com`,
                });
            }

            console.log(`Ingesting batch starting at ${i}...`);
            await ctx.runMutation(internal.targets.seedTargets, { targets });
        }

        console.log(`Successfully seeded ${count} targets.`);
    },
});
