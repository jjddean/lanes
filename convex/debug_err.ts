import { query } from "./_generated/server";

export const getFailedError = query({
    args: {},
    handler: async (ctx) => {
        const item = await ctx.db.query("messageQueue")
            .filter(q => q.eq(q.field("status"), "failed"))
            .order("desc")
            .first();
        return item?.error || "No failed items found";
    },
});
