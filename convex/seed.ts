import { mutation } from "./_generated/server";

export const seedSampleLead = mutation({
    args: {},
    handler: async (ctx) => {
        const org = await ctx.db.query("organizations").first();
        if (!org) throw new Error("No organization found");

        const leadId = await ctx.db.insert("leads", {
            orgId: org._id,
            companyName: "Hanoi Fashion Hub",
            country: "Vietnam",
            industry: "Textiles",
            laneOrigin: "Hanoi",
            laneDestination: "London",
            whatsapp: "+8412345678",
            email: "contact@hanoifashion.vn",
            status: "new",
            tags: ["textile", "vietnam", "scaling"],
            createdAt: Date.now(),
        });

        return leadId;
    },
});
