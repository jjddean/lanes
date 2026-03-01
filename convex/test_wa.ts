import { internalAction } from "./_generated/server";
import { sendMessage } from "./providers/whatsapp";

export const testWhatsApp = internalAction({
    args: {},
    handler: async (ctx) => {
        const testRecipient = process.env.TEST_WHATSAPP_RECIPIENT || "+15551649268";
        console.log(`Attempting to send test WhatsApp message to ${testRecipient}`);

        try {
            const result = await sendMessage({
                to: testRecipient,
                content: "Elite App WhatsApp Integration Test: Connection Successful! 🚀",
                idempotencyKey: `test_${Date.now()}`,
            });
            return { success: true, result };
        } catch (error: any) {
            console.error("WhatsApp Test Failed:", error);
            return { success: false, error: error.message };
        }
    },
});
