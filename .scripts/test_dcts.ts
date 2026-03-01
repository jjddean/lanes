// @ts-nocheck
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function testDcts() {
    console.log("Testing DCTS Eligibility Logic...");

    // We'll need a real lead ID to test properly, but we can test the calculteSavings directly if exported
    // For now, let's just check the schema and types by running a dummy check

    try {
        const leads = await client.query(api.leads.listLeads, {});
        console.log(`Found ${leads.length} leads.`);

        if (leads.length > 0) {
            const leadId = leads[0]._id;
            const eligibility = await client.query(api.dcts.calculateLeadEligibility, { leadId });
            console.log("Eligibility Result:", eligibility);
        }
    } catch (error) {
        console.error("Test failed:", error);
    }
}

testDcts();
