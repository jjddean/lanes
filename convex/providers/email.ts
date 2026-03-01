"use internal";

/**
 * Wrapper for Resend Email API.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function sendEmail({
    to,
    subject,
    content,
    idempotencyKey,
    testMode = false,
}: {
    to: string;
    subject: string;
    content: string;
    idempotencyKey: string;
    testMode?: boolean;
}) {
    if (testMode || process.env.TEST_MODE === "true") {
        console.log(`[TEST_MODE] Email to ${to}: ${subject}`);
        return { success: true, providerMessageId: `test_email_${Date.now()}` };
    }

    if (!RESEND_API_KEY) {
        throw new Error("Missing Resend API configuration");
    }

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: "Elite App <onboarding@resend.dev>", // TODO: Update with verified domain
            to: [to],
            subject: subject,
            html: content,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Resend API Error:", data);
        throw new Error(`Resend API failed: ${data.message || response.statusText}`);
    }

    return {
        success: true,
        providerMessageId: data.id,
    };
}
