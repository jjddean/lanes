"use client"

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconCreditCard, IconBolt, IconCrown } from "@tabler/icons-react";
import { toast } from "sonner";
import { useState } from "react";

export default function BillingPage() {
    const planInfo = useQuery(api.billing.getPlanInfo);
    const createCheckout = useAction(api.billing.createCheckout);
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleUpgrade = async (plan: "pro" | "enterprise") => {
        setIsLoading(plan);
        try {
            const url = await createCheckout({ plan });
            if (url) window.location.href = url;
        } catch (error) {
            console.error(error);
            toast.error("Failed to start checkout. Please try again.");
        } finally {
            setIsLoading(null);
        }
    };

    if (!planInfo) {
        return <div className="p-8 text-center text-muted-foreground">Loading billing info...</div>;
    }

    const usagePercentage = (planInfo.used / planInfo.quota) * 100;

    return (
        <div className="flex flex-col gap-8 p-4 lg:p-6 max-w-5xl mx-auto">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">Billing</h1>
                <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">
                    Autonomous Propulsion & Subscription Governance
                </p>
            </div>

            {/* Usage Summary */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-lg text-slate-900">Propulsion Capacity</CardTitle>
                    <CardDescription className="text-slate-400">Sync window reset in ~{24 - new Date().getHours()} hours</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                            <span className="text-4xl font-black text-slate-900">{planInfo.used} / {planInfo.quota}</span>
                            <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Active Propulsions</span>
                        </div>
                        <Badge variant="outline" className="mb-2 bg-indigo-50 border-indigo-200 text-indigo-600 uppercase tracking-widest text-[10px] font-semibold px-2 py-0.5">
                            {planInfo.plan} Engine
                        </Badge>
                    </div>
                    <Progress value={usagePercentage} className="h-3 bg-slate-900 border border-white/5" />
                    {usagePercentage >= 90 && (
                        <p className="text-xs text-destructive font-medium">
                            Warning: You are almost at your daily limit. Upgrade to increase capacity.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Plan Options */}
            <div className="grid gap-6 md:grid-cols-2 mt-4">
                {/* Pro Plan */}
                <Card className={planInfo.plan === "pro" ? "border-primary shadow-lg" : ""}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-2xl font-bold">Pro</CardTitle>
                            {planInfo.plan === "pro" && <Badge>Active</Badge>}
                        </div>
                        <CardDescription>For growing freight brokers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-4xl font-black">$99<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2"><IconCheck className="size-4 text-green-500" /> 300 Daily Messages</li>
                            <li className="flex items-center gap-2"><IconCheck className="size-4 text-green-500" /> AI Personalization</li>
                            <li className="flex items-center gap-2"><IconCheck className="size-4 text-green-500" /> Smart Follow-ups</li>
                            <li className="flex items-center gap-2"><IconCheck className="size-4 text-green-500" /> WhatsApp + Email</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            variant={planInfo.plan === "pro" ? "outline" : "default"}
                            disabled={planInfo.plan === "pro" || !!isLoading}
                            onClick={() => handleUpgrade("pro")}
                        >
                            {isLoading === "pro" ? "Starting..." : planInfo.plan === "pro" ? "Current Plan" : "Upgrade to Pro"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Enterprise Plan */}
                <Card className={planInfo.plan === "enterprise" ? "border-primary shadow-lg" : "bg-muted/30"}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-2xl font-bold">Enterprise</CardTitle>
                                <IconCrown className="size-5 text-yellow-500" />
                            </div>
                            {planInfo.plan === "enterprise" && <Badge>Active</Badge>}
                        </div>
                        <CardDescription>Scale your outbound at volume</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-4xl font-black">$299<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2"><IconCheck className="size-4 text-green-500" /> 1,000 Daily Messages</li>
                            <li className="flex items-center gap-2"><IconCheck className="size-4 text-green-500" /> Custom AI Models</li>
                            <li className="flex items-center gap-2"><IconCheck className="size-4 text-green-500" /> Dedicated Account Manager</li>
                            <li className="flex items-center gap-2"><IconCheck className="size-4 text-green-500" /> Priority Support</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            variant={planInfo.plan === "enterprise" ? "outline" : "default"}
                            disabled={planInfo.plan === "enterprise" || !!isLoading}
                            onClick={() => handleUpgrade("enterprise")}
                        >
                            {isLoading === "enterprise" ? "Starting..." : planInfo.plan === "enterprise" ? "Current Plan" : "Scale to Enterprise"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
