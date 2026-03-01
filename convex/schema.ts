import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { paymentAttemptSchemaValidator } from "./paymentAttemptTypes";

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    website: v.optional(v.string()),
    tradeDNA: v.optional(v.object({
      mainLanes: v.array(v.string()),
      services: v.array(v.string()),
      commodities: v.array(v.string()),
    })),
    senderProfile: v.optional(v.object({
      senderName: v.string(),
      senderRole: v.string(),
      companyBio: v.string(),
      offerSummary: v.string(),
    })),
    clerkOrgId: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    connectionStatus: v.object({
      whatsapp: v.boolean(),
      email: v.boolean(),
    }),
    onboardingStep: v.number(), // 1: Profile/Connections, 2: Trade DNA, 3: Complete
    messageQuota: v.number(),
    dailyLimit: v.optional(v.number()), // Concurrent messaging limit
    minuteLimit: v.optional(v.number()), // Burst limit
    warmupStartedAt: v.optional(v.number()), // For ramp calculation
    isPaused: v.optional(v.boolean()), // Tier 1: Global Kill Switch
    dryRun: v.optional(v.boolean()), // For safe verification
    createdAt: v.number(),
  }).index("byClerkOrgId", ["clerkOrgId"]),

  users: defineTable({
    name: v.string(),
    clerkId: v.string(),
    orgId: v.optional(v.id("organizations")),
    role: v.union(v.literal("admin"), v.literal("member")),
    // legacy support if needed, but clerkId is the source of truth
    externalId: v.optional(v.string()),
  }).index("byClerkId", ["clerkId"]).index("byOrgId", ["orgId"]).index("byExternalId", ["externalId"]),

  workflows: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    targetProfile: v.object({
      tradeLane: v.string(),
      industry: v.string(),
      buyerType: v.string(),
    }),
    dailyLimit: v.number(),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("completed")),
    createdAt: v.number(),
  }).index("byOrgId", ["orgId"]),

  campaigns: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("completed")),
    filtersJson: v.string(),
    dailySendLimit: v.number(),
    createdAt: v.number(),
  }).index("byOrgId", ["orgId"]),

  leads: defineTable({
    orgId: v.id("organizations"),
    workflowId: v.optional(v.id("workflows")),
    companyName: v.string(),
    country: v.string(),
    industry: v.string(),
    hsCode: v.optional(v.string()),
    dctsStatus: v.optional(v.string()), // LDC, General, Enhanced
    savings: v.optional(v.number()),
    laneOrigin: v.optional(v.string()),
    laneDestination: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    email: v.optional(v.string()),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("replied"),
      v.literal("engaged"),
      v.literal("qualified"),
      v.literal("won"),
      v.literal("lost"),
      v.literal("unsubscribed"),
      v.literal("archived")
    ),
    tags: v.array(v.string()),
    snoozedUntil: v.optional(v.number()),
    assignedTo: v.optional(v.id("users")),
    enrichmentJson: v.optional(v.string()),
    createdAt: v.number(),
    externalId: v.optional(v.string()),
  })
    .index("byOrgId", ["orgId"])
    .index("byWorkflowId", ["workflowId"])
    .index("byStatus", ["orgId", "status"])
    .index("byExternalId", ["workflowId", "externalId"]),

  messages: defineTable({
    orgId: v.id("organizations"),
    leadId: v.id("leads"),
    workflowId: v.optional(v.id("workflows")),
    campaignId: v.optional(v.id("campaigns")),
    channel: v.union(v.literal("whatsapp"), v.literal("email"), v.literal("sms")),
    content: v.string(),
    promptVersion: v.optional(v.string()),
    contextHash: v.optional(v.string()),
    providerMessageId: v.optional(v.string()),
    status: v.union(
      v.literal("queued"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("read"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    followUpNumber: v.number(),
    scheduledAt: v.number(),
    sentAt: v.optional(v.number()),
  })
    .index("byLeadId", ["leadId"])
    .index("byWorkflowId", ["workflowId"])
    .index("byStatus", ["orgId", "status"])
    .index("byOrgStatusSent", ["orgId", "status", "sentAt"]), // Tier 2: Optimization

  replies: defineTable({
    orgId: v.id("organizations"),
    leadId: v.id("leads"),
    messageId: v.id("messages"),
    channel: v.union(v.literal("whatsapp"), v.literal("email"), v.literal("sms")),
    content: v.string(),
    intent: v.union(
      v.literal("interested"),
      v.literal("question"),
      v.literal("not_now"),
      v.literal("stop"),
      v.literal("other")
    ),
    confidence: v.optional(v.number()),
    createdAt: v.number(),
  }).index("byOrgId", ["orgId"]),

  deals: defineTable({
    orgId: v.id("organizations"),
    leadId: v.id("leads"),
    stage: v.union(
      v.literal("new"),
      v.literal("qualified"),
      v.literal("quoting"),
      v.literal("won"),
      v.literal("lost")
    ),
    estimatedValue: v.number(),
    notes: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("byOrgId", ["orgId"]),

  events: defineTable({
    orgId: v.id("organizations"),
    type: v.union(
      v.literal("target_selected"),
      v.literal("msg_generated"),
      v.literal("msg_sent"),
      v.literal("reply_received"),
      v.literal("intent_predicted"),
      v.literal("intent_corrected"),
      v.literal("deal_stage_changed"),
      v.literal("dcts_eligibility_checked")
    ),
    referenceId: v.string(), // ID of lead, message, or reply
    featureSnapshot: v.optional(v.string()), // Versioned immutable JSON (feature_snapshot_v1)
    userLabel: v.optional(v.string()), // Only for intent_corrected
    modelMeta: v.optional(v.object({
      model: v.string(),
      model_version: v.string(),
      snapshot_version: v.string(),
      template_version: v.string(),
      workflow_version: v.string(),
      latencyMs: v.number(),
      signalsUsed: v.array(v.string()),
    })),
    createdAt: v.number(),
  })
    .index("byOrgId", ["orgId"])
    .index("byType", ["type"])
    .index("byCreatedAt", ["createdAt"]),

  messageQueue: defineTable({
    orgId: v.id("organizations"),
    messageId: v.id("messages"),
    priority: v.number(),
    attempts: v.number(),
    lastAttempt: v.optional(v.number()),
    error: v.optional(v.string()),
    nextAttemptAt: v.number(),
    lockedAt: v.optional(v.number()), // TTL Recovery
    sendingIdentity: v.optional(v.string()), // WA Phone Number ID / Email Account
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("failed"), v.literal("completed")),
  })
    .index("byStatus", ["status", "nextAttemptAt"])
    .index("byLockedAt", ["status", "lockedAt"])
    .index("byOrgId", ["orgId"]),

  entitlements: defineTable({
    orgId: v.id("organizations"),
    feature: v.string(),
    value: v.any(),
    expiresAt: v.optional(v.number()),
  }).index("byOrgId", ["orgId", "feature"]),

  paymentAttempts: defineTable(paymentAttemptSchemaValidator)
    .index("byUserId", ["userId"])
    .index("byPaymentId", ["payment_id"])
    .index("byPayerUserId", ["payer.user_id"]),

  targets: defineTable({
    externalId: v.string(), // Unique source ID
    companyName: v.string(),
    country: v.string(),
    industry: v.string(),
    domain: v.string(),
    laneTags: v.array(v.string()), // e.g., ["Istanbul", "London"]
    whatsapp: v.optional(v.string()),
    email: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("byExternalId", ["externalId"])
    .index("byCountryIndustry", ["country", "industry"]),

  importJobs: defineTable({
    orgId: v.id("organizations"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    totalRows: v.number(),
    processedRows: v.number(),
    error: v.optional(v.string()),
    createdAt: v.number(),
  }).index("byOrgId", ["orgId"]),

  importRows: defineTable({
    jobId: v.id("importJobs"),
    orgId: v.id("organizations"),
    data: v.string(), // JSON string of row data
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    error: v.optional(v.string()),
  })
    .index("byJobId", ["jobId", "status"])
    .index("byStatus", ["status"]),

  dctsData: defineTable({
    countryCode: v.string(),
    countryName: v.string(),
    tier: v.string(),
    mfnRate: v.number(),
    dctsRate: v.number(),
    rulesOfOrigin: v.string(),
  }).index("by_country", ["countryCode"]),
});
