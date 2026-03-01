"use internal";

/**
 * Wrapper for Ollama API.
 * Uses local or self-hosted LLMs.
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

export async function generateCompletion({
    prompt,
    system,
    json = false,
    testMode = false,
}: {
    prompt: string;
    system?: string;
    json?: boolean;
    testMode?: boolean;
}) {
    if (testMode || process.env.TEST_MODE === "true") {
        console.log(`[TEST_MODE] Ollama Prompt: ${prompt}`);
        return json ? "{ \"test\": \"mode\" }" : "Test completion result";
    }

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt,
            system,
            stream: false,
            format: json ? "json" : undefined,
            options: {
                temperature: 0.7,
            },
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error("Ollama API Error:", error);
        throw new Error(`Ollama API failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
}

export async function generateOutboundMessage({
    leadName,
    industry,
    lane,
    customContext,
    testMode = false,
}: {
    leadName: string;
    industry: string;
    lane: string;
    customContext?: string;
    testMode?: boolean;
}) {
    const system = "You are a professional freight outbound sales assistant. Write short, personalized, and high-converting messages. Use the provided context if available to add authority.";
    let prompt = `Write a short WhatsApp intro for ${leadName} in the ${industry} industry. They focus on the ${lane} trade lane. Be concise and professional.`;

    if (customContext) {
        prompt += `\n\nUse this relevant trade context to personalize the message: ${customContext}`;
    }

    return await generateCompletion({ prompt, system, testMode });
}

export async function classifyReply({
    content,
    testMode = false,
}: {
    content: string;
    testMode?: boolean;
}) {
    const system = "Classify the intent of the following message into one of: INTERESTED, QUESTION, NOT_NOW, STOP. Return ONLY a JSON object with 'intent' and 'reason'.";
    const prompt = `Message: "${content}"`;

    const result = await generateCompletion({ prompt, system, json: true, testMode });
    try {
        return JSON.parse(result);
    } catch (e) {
        return { intent: "OTHER", reason: "Failed to parse AI response" };
    }
}
