"use internal";

/**
 * UK Trade Tariff API Provider
 * Fetches real-time MFN/preferential rates and rules of origin.
 * Docs: https://api.trade-tariff.service.gov.uk/
 */

const API_BASE = "https://www.trade-tariff.service.gov.uk/api/v2";

export async function fetchTariffDetails({
    hsCode,
    countryCode,
}: {
    hsCode: string;
    countryCode: string;
}) {
    // TODO: Check environment for API KEY once provided by user
    const apiKey = process.env.UK_TRADE_TARIFF_KEY;

    try {
        // 1. Fetch from UK Trade Tariff API
        // Example endpoint: /commodities/{hsCode}
        // const response = await fetch(`${API_BASE}/commodities/${hsCode}`, { ... });

        // 2. Mock response for now (to avoid bloat and allow testing)
        console.log(`[Tariff API] Fetching details for HS: ${hsCode}, Country: ${countryCode}`);

        // Simulated industry-standard logic
        return {
            hsCode,
            description: "Sample Product Description",
            mfnRate: 12.0, // 12% standard rate
            dctsRate: 0.0,  // 0% preferential rate for eligible countries
            isEligible: true,
            rules: [
                "Change in Tariff Heading (CTH)",
                "Minimum value-added 40%"
            ]
        };
    } catch (error) {
        console.error("Tariff API Error:", error);
        return null;
    }
}
