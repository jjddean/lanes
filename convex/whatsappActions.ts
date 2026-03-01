"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { createHmac, timingSafeEqual } from "crypto";

export const handleWebhook = internalAction({
    args: {
        rawBody: v.string(),
        signature: v.union(v.string(), v.null()),
    },
    handler: async (ctx, args) => {
        const { rawBody, signature } = args;

        if (!verifyWhatsAppSignature(rawBody, signature)) {
            return { status: 403, body: "Forbidden" };
        }

        let payload: any;
        try {
            payload = JSON.parse(rawBody);
        } catch {
            return { status: 400, body: "Invalid payload" };
        }

        const entry = payload.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const statuses = value?.statuses;

        if (statuses) {
            for (const statusObj of statuses) {
                const providerMessageId = statusObj.id;
                const status = statusObj.status; // delivered, read, failed

                if (["delivered", "read", "failed"].includes(status)) {
                    await ctx.runMutation(internal.messageUpdates.updateFromWebhook, {
                        providerMessageId,
                        status: status as any,
                    });
                }
            }
        }

        // Handle incoming messages (replies)
        const messages = value?.messages;
        if (messages) {
            for (const msg of messages) {
                const from = msg.from;
                const text = msg.text?.body;

                if (text) {
                    await ctx.runMutation(internal.messageUpdates.handleIncomingMessage, {
                        from,
                        content: text,
                    });
                }
            }
        }

        return { status: 200, body: null };
    },
});

function verifyWhatsAppSignature(rawBody: string, signatureHeader: string | null) {
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (!appSecret || !signatureHeader || !signatureHeader.startsWith("sha256=")) {
        return false;
    }

    const received = signatureHeader.slice("sha256=".length);
    const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");

    try {
        return timingSafeEqual(Buffer.from(received, "hex"), Buffer.from(expected, "hex"));
    } catch {
        return false;
    }
}
