import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Worker to periodically process the message queue.
 * In a real environment, this might be triggered by a cron job or a persistent worker.
 * Convex can schedule periodic functions.
 */

export const enqueueMessage = internalMutation({
    async handler(ctx, { orgId, messageId }: { orgId: any, messageId: any }) {
        await ctx.db.insert("messageQueue", {
            orgId,
            messageId,
            priority: 0,
            attempts: 0,
            nextAttemptAt: Date.now(),
            status: "pending",
        });
    },
});
