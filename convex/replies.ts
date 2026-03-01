import { v } from "convex/values";
import { query } from "./_generated/server";

export const listReplies = query({
    args: {},
    handler: async (ctx) => {
        const replies = await ctx.db
            .query("replies")
            .order("desc")
            .collect();

        // Join with lead names
        const enriched = await Promise.all(
            replies.map(async (reply) => {
                const lead = await ctx.db.get(reply.leadId);
                return {
                    ...reply,
                    leadName: lead?.companyName || "Unknown",
                };
            })
        );

        return enriched;
    },
});
