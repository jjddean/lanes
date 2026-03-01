import { query } from "./_generated/server";

export const getDebugContext = query({
    args: {},
    handler: async (ctx) => {
        const orgs = await ctx.db.query("organizations").collect();
        const users = await ctx.db.query("users").collect();
        return { orgs, users };
    },
});
