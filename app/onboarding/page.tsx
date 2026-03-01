"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OnboardingPage() {
    const org = useQuery(api.organizations.getMyOrganization);
    const updateOnboarding = useMutation(api.organizations.updateOnboarding);
    const createWorkflow = useMutation(api.workflows.createWorkflow);
    const activateWorkflow = useMutation(api.workflows.activateWorkflow);
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [website, setWebsite] = useState("");
    const [tradeLane, setTradeLane] = useState("");
    const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
    const [isEmailConnected, setIsEmailConnected] = useState(false);

    // Step 2 targets
    const [target, setTarget] = useState("");
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [industry, setIndustry] = useState("");

    if (org === undefined) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    const handleStep1Submit = async () => {
        try {
            await updateOnboarding({
                step: 2,
                website,
                tradeDNA: {
                    mainLanes: [tradeLane],
                    services: ["Freight Forwarding"],
                    commodities: ["General Cargo"],
                },
                connectionStatus: {
                    whatsapp: isWhatsAppConnected,
                    email: isEmailConnected,
                },
            });
            setStep(2);
            toast.success("Profile updated!");
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    const handleStartWorkflow = async () => {
        try {
            const workflowId = await createWorkflow({
                tradeLane: destination,
                industry,
                buyerType: target,
                dailyLimit: 50,
            });
            await activateWorkflow({ id: workflowId });
            toast.success("Trade DNA Activated! Engine is discovering targets...");
            router.push("/dashboard");
        } catch (error) {
            toast.error("Failed to start autonomous engine");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
            {step === 1 && (
                <Card className="w-full max-w-md border-none shadow-lg bg-white">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Welcome to Elite</CardTitle>
                        <CardDescription>Let's get your freight outbound system ready.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="company">Company Website</Label>
                            <Input
                                id="company"
                                placeholder="https://example.com"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lane">Main Trade Lane</Label>
                            <Input
                                id="lane"
                                placeholder="Asia to USA"
                                value={tradeLane}
                                onChange={(e) => setTradeLane(e.target.value)}
                            />
                        </div>

                        <div className="pt-4 space-y-4">
                            <Label className="text-base">Connect Channels</Label>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="space-y-0.5">
                                    <Label>WhatsApp (Meta API)</Label>
                                    <p className="text-sm text-muted-foreground">Automated outbound messages</p>
                                </div>
                                <Switch
                                    checked={isWhatsAppConnected}
                                    onCheckedChange={setIsWhatsAppConnected}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="space-y-0.5">
                                    <Label>Email (Resend)</Label>
                                    <p className="text-sm text-muted-foreground">Official business email</p>
                                </div>
                                <Switch
                                    checked={isEmailConnected}
                                    onCheckedChange={setIsEmailConnected}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full bg-[#18f1ff] hover:bg-[#18f1ff]/80 text-black font-bold"
                            onClick={handleStep1Submit}
                            disabled={!website || !tradeLane || (!isWhatsAppConnected && !isEmailConnected)}
                        >
                            Continue to Target Selection
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {step === 2 && (
                <Card className="w-full max-w-md border-none shadow-lg bg-white">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Choose Target</CardTitle>
                        <CardDescription>Who do you want to reach today?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Who do you want to reach?</Label>
                            <Select onValueChange={setTarget}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select target type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Direct Importer">Direct Importer</SelectItem>
                                    <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                                    <SelectItem value="Retail Chain">Retail Chain</SelectItem>
                                    <SelectItem value="Manufacturer">Manufacturer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Origin Hub</Label>
                                <Input placeholder="e.g. Shanghai" value={origin} onChange={(e) => setOrigin(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Target Country</Label>
                                <Input placeholder="e.g. USA" value={destination} onChange={(e) => setDestination(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Industry Focus</Label>
                            <Select onValueChange={setIndustry}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Consumer Electronics">Consumer Electronics</SelectItem>
                                    <SelectItem value="Industrial Machinery">Industrial Machinery</SelectItem>
                                    <SelectItem value="Textiles">Textiles</SelectItem>
                                    <SelectItem value="Automotive Parts">Automotive Parts</SelectItem>
                                    <SelectItem value="Chemicals">Chemicals</SelectItem>
                                    <SelectItem value="Furniture">Furniture</SelectItem>
                                    <SelectItem value="Medical Devices">Medical Devices</SelectItem>
                                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full bg-[#18f1ff] hover:bg-[#18f1ff]/80 text-black font-bold"
                            onClick={handleStartWorkflow}
                            disabled={!target || !origin || !destination || !industry}
                        >
                            🚀 Activate Trade DNA
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
