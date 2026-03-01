"use internal";
import Stripe from "stripe";

function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("Missing STRIPE_SECRET_KEY in environment variables");
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-01-27-acacia" as any,
    });
}

export async function createCheckoutSession({
    orgId,
    clerkOrgId,
    plan,
}: {
    orgId: string;
    clerkOrgId: string;
    plan: "pro" | "enterprise";
}) {
    const priceId = plan === "pro" ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_ENTERPRISE_PRICE_ID;

    const session = await getStripe().checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: "subscription",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        metadata: {
            orgId,
            clerkOrgId,
            plan,
        },
    });

    return session.url;
}

export async function verifyWebhook(body: string, signature: string) {
    return getStripe().webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
    );
}
