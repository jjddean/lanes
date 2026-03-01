import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./users";

/**
 * Manual Message Engine
 * Handles user-initiated messages from the Inbox.
 */

export const sendManualMessage = mutation({
    args: {
        recipient: v.string(), // Can be email or phone
        channel: v.union(v.literal("email"), v.literal("whatsapp"), v.literal("sms")),
        content: v.string(),
        leadId: v.optional(v.id("leads")),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user || !user.orgId) throw new Error("Unauthorized");

        let leadId = args.leadId;

        // 1. Resolve Lead (Find or Create)
        if (!leadId) {
            const isEmail = args.recipient.includes("@");
            const existingLead = await ctx.db
                .query("leads")
                .withIndex("byOrgId", (q) => q.eq("orgId", user.orgId!))
                .filter((q) => q.eq(q.field(isEmail ? "email" : "whatsapp"), args.recipient))
                .first();

            if (existingLead) {
                leadId = existingLead._id;
            } else {
                leadId = await ctx.db.insert("leads", {
                    orgId: user.orgId,
                    companyName: isEmail
                        ? (args.recipient.split("@")[0].charAt(0).toUpperCase() + args.recipient.split("@")[0].slice(1))
                        : `New Contact ${args.recipient}`,
                    email: isEmail ? args.recipient : undefined,
                    whatsapp: isEmail ? undefined : args.recipient,
                    status: "new",
                    country: "Manual Entry",
                    industry: "Other",
                    tags: ["manual-inbox"],
                    createdAt: Date.now(),
                });
            }
        }

        // 2. Create Message record
        const messageId = await ctx.db.insert("messages", {
            orgId: user.orgId,
            leadId: leadId,
            channel: args.channel,
            content: args.content,
            status: "queued",
            followUpNumber: 0,
            scheduledAt: Date.now(),
        });

        // 3. Queue for immediate dispatch
        await ctx.db.insert("messageQueue", {
            orgId: user.orgId,
            messageId,
            priority: 1,
            attempts: 0,
            nextAttemptAt: Date.now(),
            status: "pending",
        });

        // 4. Trigger dispatcher immediately (Bypass 30s cron delay for testing)
        // We run this as an action to handle the provider call
        await ctx.scheduler.runAfter(0, internal.messageDispatcher.processQueueStep, {});

        return messageId;
    },
});
