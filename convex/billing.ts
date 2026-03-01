import { action, internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import * as stripe from "./providers/stripe";
import { v } from "convex/values";

/**
 * Billing & Entitlement Logic
 */

export const checkEntitlement = query({
    args: { orgId: v.id("organizations"), feature: v.string() },
    handler: async (ctx, args) => {
        const org = await ctx.db.get(args.orgId);
        if (!org) return false;

        // Free plan limits
        if (org.plan === "free") {
            if (args.feature === "ai_personalization") return false;
            if (args.feature === "high_volume_leads") return false;
        }

        // Pro plan limits
        if (org.plan === "pro") {
            if (args.feature === "enterprise_custom_models") return false;
        }

        // Check custom entitlements table
        const entitlement = await ctx.db
            .query("entitlements")
            .withIndex("byOrgId", (q) => q.eq("orgId", args.orgId).eq("feature", args.feature))
            .unique();

        if (entitlement) {
            if (entitlement.expiresAt && entitlement.expiresAt < Date.now()) return false;
            return entitlement.value;
        }

        return true; // Default to true if not explicitly restricted
    },
});

export const getPlanInfo = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user || !user.orgId) return null;

        const org = await ctx.db.get(user.orgId);
        if (!org) return null;

        // Get actual usage for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const usedCount = await ctx.db
            .query("messages")
            .withIndex("byStatus", (q) => q.eq("orgId", org._id).eq("status", "sent"))
            .filter((q) => q.gte(q.field("sentAt"), startOfDay.getTime()))
            .collect();

        return {
            plan: org.plan,
            quota: org.messageQuota || 100,
            used: usedCount.length,
        };
    },
});

export const syncStripeStatus = internalMutation({
    args: {
        clerkOrgId: v.string(),
        plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
        subscriptionId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const org = await ctx.db
            .query("organizations")
            .withIndex("byClerkOrgId", (q) => q.eq("clerkOrgId", args.clerkOrgId))
            .unique();

        if (org) {
            const messageQuota = args.plan === "pro" ? 300 : args.plan === "enterprise" ? 1000 : 100;
            await ctx.db.patch(org._id, {
                plan: args.plan,
                messageQuota
            });

            // Update specific entitlements
            if (args.plan === "pro") {
                await ctx.db.insert("entitlements", {
                    orgId: org._id,
                    feature: "daily_quota",
                    value: 300,
                });
            } else if (args.plan === "enterprise") {
                await ctx.db.insert("entitlements", {
                    orgId: org._id,
                    feature: "daily_quota",
                    value: 1000,
                });
            }
        }
    },
});

export const getUserOrgInfo = internalQuery({
    args: {},
    handler: async (ctx): Promise<{ orgId: string; clerkOrgId: string } | null> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user || !user.orgId) return null;

        const org = await ctx.db.get(user.orgId);
        if (!org || !org.clerkOrgId) return null;

        return {
            orgId: org._id,
            clerkOrgId: org.clerkOrgId,
        };
    },
});

export const createCheckout = action({
    args: { plan: v.union(v.literal("pro"), v.literal("enterprise")) },
    handler: async (ctx, args) => {
        const userInfo = await ctx.runQuery(internal.billing.getUserOrgInfo) as { orgId: string, clerkOrgId: string } | null;
        if (!userInfo) throw new Error("Organization not found or missing Clerk ID");

        return await stripe.createCheckoutSession({
            orgId: userInfo.orgId,
            clerkOrgId: userInfo.clerkOrgId,
            plan: args.plan,
        });
    },
});

export const handleStripeWebhook = internalAction({
    args: { signature: v.string(), body: v.string() },
    handler: async (ctx, args) => {
        try {
            const event = await stripe.verifyWebhook(args.body, args.signature);

            switch (event.type) {
                case "checkout.session.completed": {
                    const session = event.data.object as any;
                    const clerkOrgId = session.metadata.clerkOrgId;
                    const plan = session.metadata.plan;

                    await ctx.runMutation(internal.billing.syncStripeStatus, {
                        clerkOrgId,
                        plan,
                    });
                    break;
                }
                case "customer.subscription.deleted": {
                    // subscription cancellation
                    break;
                }
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }
        } catch (err: any) {
            console.error(`Webhook verification failed: ${err.message}`);
            throw new Error(`Webhook Error: ${err.message}`);
        }
    },
});
