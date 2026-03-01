/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as automation from "../automation.js";
import type * as billing from "../billing.js";
import type * as campaigns from "../campaigns.js";
import type * as crons from "../crons.js";
import type * as debug_err from "../debug_err.js";
import type * as debug_leads from "../debug_leads.js";
import type * as debug_setup from "../debug_setup.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as imports from "../imports.js";
import type * as inbox from "../inbox.js";
import type * as leads from "../leads.js";
import type * as maintenance from "../maintenance.js";
import type * as messageDispatcher from "../messageDispatcher.js";
import type * as messageUpdates from "../messageUpdates.js";
import type * as messages from "../messages.js";
import type * as organizations from "../organizations.js";
import type * as paymentAttemptTypes from "../paymentAttemptTypes.js";
import type * as paymentAttempts from "../paymentAttempts.js";
import type * as providers_email from "../providers/email.js";
import type * as providers_ollama from "../providers/ollama.js";
import type * as providers_stripe from "../providers/stripe.js";
import type * as providers_whatsapp from "../providers/whatsapp.js";
import type * as queue from "../queue.js";
import type * as replies from "../replies.js";
import type * as seed from "../seed.js";
import type * as seedTargetsAction from "../seedTargetsAction.js";
import type * as targets from "../targets.js";
import type * as test_wa from "../test_wa.js";
import type * as users from "../users.js";
import type * as whatsappActions from "../whatsappActions.js";
import type * as workflows from "../workflows.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  automation: typeof automation;
  billing: typeof billing;
  campaigns: typeof campaigns;
  crons: typeof crons;
  debug_err: typeof debug_err;
  debug_leads: typeof debug_leads;
  debug_setup: typeof debug_setup;
  events: typeof events;
  http: typeof http;
  imports: typeof imports;
  inbox: typeof inbox;
  leads: typeof leads;
  maintenance: typeof maintenance;
  messageDispatcher: typeof messageDispatcher;
  messageUpdates: typeof messageUpdates;
  messages: typeof messages;
  organizations: typeof organizations;
  paymentAttemptTypes: typeof paymentAttemptTypes;
  paymentAttempts: typeof paymentAttempts;
  "providers/email": typeof providers_email;
  "providers/ollama": typeof providers_ollama;
  "providers/stripe": typeof providers_stripe;
  "providers/whatsapp": typeof providers_whatsapp;
  queue: typeof queue;
  replies: typeof replies;
  seed: typeof seed;
  seedTargetsAction: typeof seedTargetsAction;
  targets: typeof targets;
  test_wa: typeof test_wa;
  users: typeof users;
  whatsappActions: typeof whatsappActions;
  workflows: typeof workflows;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
