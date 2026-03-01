"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, useSession } from "@clerk/nextjs";
import {
    Activity,
    Database,
    Flame,
    Play,
    ShieldAlert,
    ShieldCheck,
    Zap,
    RefreshCcw,
    Settings,
    AlertTriangle,
    Globe,
    Building2,
    UserSearch,
    Save,
    Target
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

/**
 * Constants for Precision DNA selections
 */
const REGIONS = [
    "USA",
    "Vietnam",
    "Turkey",
    "Germany",
    "China",
    "India",
    "UK",
    "Netherlands",
    "Poland",
    "Italy",
    "Brazil",
    "Singapore",
    "UAE",
    "Caribbean",
    "Africa"
];

const INDUSTRIES = [
    "Consumer Electronics",
    "Industrial Machinery",
    "Textiles",
    "Automotive Parts",
    "Chemicals",
    "Furniture",
    "Medical Devices",
    "Food & Beverage"
];

const PERSONAS = [
    "Direct Importer",
    "Wholesaler",
    "Retail Chain",
    "Manufacturer"
];

/**
 * Elite v1 Engine Console
 * A dedicated laboratory for testing and monitoring the survival design.
 */
export default function EngineConsolePage() {
    const org = useQuery(api.users.getMyOrgSettings);
    const workflows = useQuery(api.workflows.listActiveWorkflows);

    const updateSettings = useMutation(api.users.updateSettings);
    const updateSenderProfile = useMutation(api.organizations.updateSenderProfile);
    const updateProfile = useMutation(api.workflows.updateWorkflowProfile);

    // Identity State
    const [senderProfile, setSenderProfile] = useState({
        senderName: "",
        senderRole: "",
        companyBio: "",
        offerSummary: "",
    });

    // Strategy State
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
    const [dna, setDna] = useState({
        tradeLane: "",
        industry: "",
        buyerType: "",
        dailyLimit: 200,
    });

    useEffect(() => {
        if (org?.senderProfile) {
            setSenderProfile({
                senderName: org.senderProfile.senderName || "",
                senderRole: org.senderProfile.senderRole || "",
                companyBio: org.senderProfile.companyBio || "",
                offerSummary: org.senderProfile.offerSummary || "",
            });
        }
    }, [org]);

    const activeWorkflow = workflows?.find(w => w._id === selectedWorkflowId);

    useEffect(() => {
        if (activeWorkflow) {
            setDna({
                tradeLane: activeWorkflow.targetProfile.tradeLane,
                industry: activeWorkflow.targetProfile.industry,
                buyerType: activeWorkflow.targetProfile.buyerType,
                dailyLimit: activeWorkflow.dailyLimit,
            });
        }
    }, [activeWorkflow]);

    useEffect(() => {
        if (workflows && workflows.length > 0 && !selectedWorkflowId) {
            setSelectedWorkflowId(workflows[0]._id);
        }
    }, [workflows, selectedWorkflowId]);

    const handleSaveIdentity = async () => {
        try {
            await updateSenderProfile(senderProfile);
            toast.success("Sender Identity confirmed!");
        } catch (e) {
            toast.error("Failed to update identity");
        }
    };

    const handleSaveDNA = async () => {
        if (!selectedWorkflowId) return;
        try {
            await updateProfile({
                id: selectedWorkflowId as any,
                ...dna
            });
            toast.success("Strategy DNA recalibrated!");
        } catch (e) {
            toast.error("Failed to update strategy");
        }
    };

    if (org === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Activity className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">Engine</h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">
                        Autonomous Lane Activation Terminal
                    </p>
                </div>
            </div>

            <Tabs defaultValue="identity" className="space-y-6">
                <TabsList className="bg-slate-100 p-1 rounded-lg w-fit border border-slate-200 shadow-sm">
                    <TabsTrigger
                        value="identity"
                        className="rounded-md px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                        <UserSearch className="h-3 w-3 mr-2" /> Sender Identity
                    </TabsTrigger>
                    <TabsTrigger
                        value="strategy"
                        className="rounded-md px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                        <Target className="h-3 w-3 mr-2" /> Strategy DNA
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="identity" className="space-y-6">
                    <Card className="border-none shadow-sm shadow-slate-200 bg-white">
                        <CardHeader>
                            <CardTitle>Sender Persona</CardTitle>
                            <CardDescription>This is the identity the AI assumes when reaching out to leads.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Sender Name</Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                            <UserSearch className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            className="w-full pl-10 pr-4 h-11 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g., Jason Wood"
                                            value={senderProfile.senderName}
                                            onChange={(e) => setSenderProfile(s => ({ ...s, senderName: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Sender Role</Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                            <Building2 className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            className="w-full pl-10 pr-4 h-11 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g., Head of Growth"
                                            value={senderProfile.senderRole}
                                            onChange={(e) => setSenderProfile(s => ({ ...s, senderRole: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Company Context & Bio</Label>
                                <textarea
                                    className="w-full p-4 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[120px] resize-none"
                                    placeholder="Briefly describe what your company does. This helps the AI personalize outreach context."
                                    value={senderProfile.companyBio}
                                    onChange={(e) => setSenderProfile(s => ({ ...s, companyBio: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Core Offer Summary</Label>
                                <textarea
                                    className="w-full p-4 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[100px] resize-none"
                                    placeholder="What is the main value you are offering in the first message? (e.g., Free lane audit, direct rates to Vietnam, etc.)"
                                    value={senderProfile.offerSummary}
                                    onChange={(e) => setSenderProfile(s => ({ ...s, offerSummary: e.target.value }))}
                                />
                            </div>

                            <div className="flex justify-end border-t pt-6">
                                <Button onClick={handleSaveIdentity} className="bg-slate-900 px-8 shadow-lg shadow-slate-200">
                                    <Save className="h-4 w-4 mr-2" /> Confirm Identity
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="strategy" className="space-y-6">
                    <Card className="border-none shadow-sm shadow-slate-200 bg-white overflow-hidden">
                        <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                                        <Target className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Targeting Strategy</CardTitle>
                                        <CardDescription>Precision Trade DNA Configuration</CardDescription>
                                    </div>
                                </div>
                                <Select onValueChange={setSelectedWorkflowId} value={selectedWorkflowId || ""}>
                                    <SelectTrigger className="w-[200px] bg-white">
                                        <SelectValue placeholder="Select Strategy..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {workflows?.map(w => (
                                            <SelectItem key={w._id} value={w._id}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {!selectedWorkflowId ? (
                                <div className="py-12 text-center text-muted-foreground italic">Select a sequence above to recalibrate targeting.</div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                <Globe className="h-3 w-3" /> Target Region / Trade Lane
                                            </Label>
                                            <Select value={dna.tradeLane} onValueChange={v => setDna(d => ({ ...d, tradeLane: v }))}>
                                                <SelectTrigger className="w-full bg-slate-50/30 h-11 border-slate-200"><SelectValue placeholder="Select Region..." /></SelectTrigger>
                                                <SelectContent>{REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-muted-foreground italic">Geographic filter for the discovery engine.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                <Building2 className="h-3 w-3" /> Target Industry
                                            </Label>
                                            <Select value={dna.industry} onValueChange={v => setDna(d => ({ ...d, industry: v }))}>
                                                <SelectTrigger className="w-full bg-slate-50/30 h-11 border-slate-200"><SelectValue placeholder="Select Industry..." /></SelectTrigger>
                                                <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-muted-foreground italic">AI uses this to customize payload tone.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                <UserSearch className="h-3 w-3" /> Buyer Persona
                                            </Label>
                                            <Select value={dna.buyerType} onValueChange={v => setDna(d => ({ ...d, buyerType: v }))}>
                                                <SelectTrigger className="w-full bg-slate-50/30 h-11 border-slate-200"><SelectValue placeholder="Select Persona..." /></SelectTrigger>
                                                <SelectContent>{PERSONAS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-muted-foreground italic">Who exactly are we looking for?</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                                <Zap className="h-3 w-3" /> Daily Batch Limit
                                            </Label>
                                            <Select value={dna.dailyLimit.toString()} onValueChange={v => setDna(d => ({ ...d, dailyLimit: parseInt(v) }))}>
                                                <SelectTrigger className="w-full bg-slate-50/30 h-11 border-slate-200"><SelectValue placeholder="Select Limit..." /></SelectTrigger>
                                                <SelectContent>
                                                    {[20, 50, 100, 200, 500, 1000].map(limit => (
                                                        <SelectItem key={limit} value={limit.toString()}>{limit} leads / day</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-muted-foreground italic">Max leads to fuel this sequence per 24h.</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4 border-t border-slate-50">
                                        <Button onClick={handleSaveDNA} className="bg-slate-900 px-8 shadow-lg shadow-slate-200">
                                            <Save className="h-4 w-4 mr-2" /> Recalibrate Strategy DNA
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
