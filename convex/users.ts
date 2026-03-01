import { internalMutation, mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";

export const debugIdentity = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity;
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || !user.orgId) return [];

    return await ctx.db
      .query("users")
      .withIndex("byOrgId", (q) => q.eq("orgId", user.orgId!))
      .collect();
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  async handler(ctx, { data }) {
    const userAttributes = {
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      clerkId: data.id,
      // role is handled separately or defaulted
    };

    const user = await userByClerkId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert("users", {
        ...userAttributes,
        role: "admin", // Default for first user
      });
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const getMyOrgSettings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || !user.orgId) return null;

    const org = await ctx.db.get(user.orgId);
    return org;
  },
});

export const updateSettings = mutation({
  args: {
    isPaused: v.optional(v.boolean()),
    dryRun: v.optional(v.boolean()),
    dailyLimit: v.optional(v.number()),
    minuteLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    if (!user.orgId) throw new Error("No organization associated");

    await ctx.db.patch(user.orgId, {
      ...args,
    });
  },
});

export const syncOrgMembership = internalMutation({
  args: {
    clerkUserId: v.string(),
    clerkOrgId: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"))
  },
  async handler(ctx, { clerkUserId, clerkOrgId, role }) {
    const user = await userByClerkId(ctx, clerkUserId);
    const org = await orgByClerkId(ctx, clerkOrgId);

    if (user && org) {
      await ctx.db.patch(user._id, {
        orgId: org._id,
        role: role
      });
    }
  },
});

export const createOrgFromClerk = internalMutation({
  args: { data: v.any() },
  async handler(ctx, { data }) {
    const org = await orgByClerkId(ctx, data.id);
    if (!org) {
      await ctx.db.insert("organizations", {
        name: data.name,
        clerkOrgId: data.id,
        plan: "free",
        connectionStatus: { whatsapp: false, email: false },
        onboardingStep: 1,
        messageQuota: 100,
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.patch(org._id, { name: data.name });
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByClerkId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    }
  },
});



export const ensureUserAndOrg = mutation({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    let user = await userByClerkId(ctx, identity.subject);
    if (!user) {
      const userId = await ctx.db.insert("users", {
        name: identity.name || "Unknown User",
        clerkId: identity.subject,
        role: "admin",
      });
      user = await ctx.db.get(userId);
    }

    if (!user!.orgId) {
      // Create a default organization for this user
      const orgId = await ctx.db.insert("organizations", {
        name: `${user!.name}'s Organization`,
        clerkOrgId: `personal_${identity.subject}`,
        plan: "free",
        connectionStatus: { whatsapp: false, email: false },
        onboardingStep: 1,
        messageQuota: 100,
        createdAt: Date.now(),
      });
      await ctx.db.patch(user!._id, { orgId, role: "admin" });
      user = await ctx.db.get(user!._id);
    }

    const org = await ctx.db.get(user!.orgId!);
    return { user, org };
  },
});

export async function getOrCreateUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  let user = await userByClerkId(ctx, identity.subject);
  if (!user) {
    const userId = await ctx.db.insert("users", {
      name: identity.name || "Unknown User",
      clerkId: identity.subject,
      role: "admin",
    });
    user = await ctx.db.get(userId);
  }
  return user;
}

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByClerkId(ctx, identity.subject);
}

async function userByClerkId(ctx: QueryCtx, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
    .unique();
}

async function orgByClerkId(ctx: QueryCtx, clerkOrgId: string) {
  return await ctx.db
    .query("organizations")
    .withIndex("byClerkOrgId", (q) => q.eq("clerkOrgId", clerkOrgId))
    .unique();
}