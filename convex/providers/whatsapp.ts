"use internal";

import { v } from "convex/values";

/**
 * Wrapper for Meta WhatsApp Cloud API.
 * Rules:
 * - Signature verified (in webhook handler)
 * - Idempotent
 * - Logged minimally
 */

const WHATSAPP_API_VERSION = "v21.0";
export async function sendMessage({
    to,
    content,
    idempotencyKey,
    testMode = false,
}: {
    to: string;
    content: string;
    idempotencyKey: string;
    testMode?: boolean;
}) {
    const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (testMode || process.env.TEST_MODE === "true") {
        console.log(`[TEST_MODE] WhatsApp to ${to}: ${content}`);
        return { success: true, providerMessageId: `test_${Date.now()}` };
    }

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        throw new Error("Missing WhatsApp API configuration");
    }

    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: content },
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("WhatsApp API Error:", data);
        throw new Error(`WhatsApp API failed: ${data.error?.message || response.statusText}`);
    }

    return {
        success: true,
        providerMessageId: data.messages?.[0]?.id,
    };
}

export async function sendTemplateMessage({
    to,
    templateName,
    languageCode = "en_US",
    components = [],
    testMode = false,
}: {
    to: string;
    templateName: string;
    languageCode?: string;
    components?: any[];
    testMode?: boolean;
}) {
    const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (testMode || process.env.TEST_MODE === "true") {
        console.log(`[TEST_MODE] WhatsApp Template ${templateName} to ${to}`);
        return { success: true, providerMessageId: `test_tpl_${Date.now()}` };
    }

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        throw new Error("Missing WhatsApp API configuration");
    }

    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "template",
            template: {
                name: templateName,
                language: { code: languageCode },
                components,
            },
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("WhatsApp API Error:", data);
        throw new Error(`WhatsApp API failed: ${data.error?.message || response.statusText}`);
    }

    return {
        success: true,
        providerMessageId: data.messages?.[0]?.id,
    };
}
