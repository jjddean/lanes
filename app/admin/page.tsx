"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    Activity,
    Database,
    Flame,
    Zap,
    RefreshCcw,
    Settings,
    ShieldAlert,
    ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { HmrcConnectionCard } from "@/components/hmrc/HmrcConnectionCard";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { useState } from "react";

export default function AdminPage() {
    const org = useQuery(api.users.getMyOrgSettings);
    const targetCount = useQuery(api.targets.getTargetCount);
    const queueStats = useQuery(api.messageDispatcher.getQueueStats);
    const queueItems = useQuery(api.messageDispatcher.getRecentQueueItems);

    const updateSettings = useMutation(api.users.updateSettings);
    const performSeed = useAction(api.seedTargetsAction.performInitialSeed);
    const triggerDiscovery = useMutation(api.workflows.triggerDiscovery);
    const seedWorkflow = useMutation(api.workflows.seedSampleWorkflow);

    const [isSeeding, setIsSeeding] = useState(false);
    const [isDiscovering, setIsDiscovering] = useState(false);

    const handleTriggerDiscovery = async () => {
        setIsDiscovering(true);
        try {
            await triggerDiscovery({});
            toast.success("Discovery triggered!");
        } catch (e: any) {
            toast.error("Failed to trigger discovery");
        } finally {
            setIsDiscovering(false);
        }
    };

    const handleSeedRegistry = async () => {
        setIsSeeding(true);
        try {
            toast.promise(performSeed({ count: 1000 }), {
                loading: "Registering 1,000 leads into the Seeded Discovery tank...",
                success: "Registry seeded successfully!",
                error: "Failed to seed registry"
            });
        } finally {
            setIsSeeding(false);
        }
    };

    const handleSeedWorkflow = async () => {
        try {
            await seedWorkflow({});
            toast.success("Sample Workflow created!");
        } catch (e) {
            toast.error("Failed to seed workflow");
        }
    };

    const handleToggleDryRun = async (val: boolean) => {
        try {
            await updateSettings({ dryRun: val });
            toast.success(`Dry Run mode ${val ? "enabled" : "disabled"}`);
        } catch (e) {
            toast.error("Failed to update settings");
        }
    };

    const handleToggleKillSwitch = async (val: boolean) => {
        try {
            await updateSettings({ isPaused: val });
            toast(val ? "Global Kill Switch Activated" : "Engine Resumed", {
                description: val ? "All message dispatching has ceased." : "Normal operations resumed.",
                icon: val ? <ShieldAlert className="text-destructive" /> : <ShieldCheck className="text-green-500" />,
            });
        } catch (e) {
            toast.error("Failed to update settings");
        }
    };

    if (org === undefined) return <div className="p-8 italic text-slate-400 animate-pulse">Establishing Admin Connection...</div>;

    if (org === null) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-md border-none shadow-xl shadow-slate-200">
                    <CardHeader className="text-center">
                        <Database className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                        <CardTitle>System Not Provisioned</CardTitle>
                        <CardDescription>Initialize your environment in the Engine Console first.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">Admin console</h2>
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">System Diagnostics & Autonomous Safety Controls</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none bg-slate-900/40 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Lane Registry</CardTitle>
                        <Database className="h-4 w-4 text-cyan-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{targetCount?.toLocaleString() ?? "0"}</div>
                        <p className="text-xs text-muted-foreground mt-1">Primed leads discovered</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm shadow-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
                        <Activity className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{queueStats?.pending ?? 0} Pending</div>
                        <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-green-600 bg-green-50">{queueStats?.completed ?? 0} Sent</Badge>
                            <Badge variant="outline" className="text-red-600 bg-red-50">{queueStats?.failed ?? 0} Fail</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-slate-900/40 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Propulsion Cap</CardTitle>
                        <Zap className="h-4 w-4 text-cyan-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-cyan-500">{org.dailyLimit || 20}/day</div>
                        <p className="text-xs text-muted-foreground mt-1">Identity-level safety cap</p>
                    </CardContent>
                </Card>
                <HmrcConnectionCard returnTo="/admin" className="border-none shadow-sm shadow-slate-200 bg-white" />
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                <Card className="md:col-span-4 border-none shadow-sm shadow-slate-200 bg-white">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-slate-900" />
                            <CardTitle>Survival Controls</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                            <div className="space-y-1">
                                <div className="font-semibold flex items-center gap-2">
                                    Dry Run Verification
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">Pre-flight</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">Process discovery flows without actual messaging.</p>
                            </div>
                            <Switch checked={org.dryRun ?? false} onCheckedChange={handleToggleDryRun} />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/10">
                            <div className="space-y-1">
                                <div className="font-semibold text-red-700">Global Kill Switch</div>
                                <p className="text-sm text-red-600/80">Immediately halt all message dispatching across sequences.</p>
                            </div>
                            <Switch checked={org.isPaused ?? false} onCheckedChange={handleToggleKillSwitch} className="data-[state=checked]:bg-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 border-none shadow-sm shadow-slate-200 bg-white">
                    <CardHeader>
                        <CardTitle>System Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button className="w-full justify-start h-12 bg-slate-900" onClick={handleSeedRegistry} disabled={isSeeding}>
                            <Database className="mr-2 h-5 w-5" /> Seed Target Registry
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12 border-slate-200" onClick={handleSeedWorkflow}>
                            <Flame className="mr-2 h-5 w-5 text-orange-500" /> Create Sample Workflow
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12 border-slate-200" onClick={handleTriggerDiscovery} disabled={isDiscovering}>
                            <RefreshCcw className="mr-2 h-5 w-5" /> Trigger Discovery Flow
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm shadow-slate-200 bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Message Queue Monitor</CardTitle>
                    <Badge variant="outline" className="bg-slate-50">Auto-refreshing</Badge>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Status</TableHead>
                                <TableHead className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Destination</TableHead>
                                <TableHead className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Step</TableHead>
                                <TableHead className="text-right text-[11px] font-medium text-slate-500 uppercase tracking-wider">Attempt At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(!queueItems || queueItems.length === 0) ? (
                                <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">No active queue items.</TableCell></TableRow>
                            ) : (
                                queueItems.map((item) => (
                                    <TableRow key={item._id}>
                                        <TableCell>
                                            <Badge className={`${item.status === 'pending' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-600'}`} variant="outline">
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs font-semibold">{item.destination}</TableCell>
                                        <TableCell className="text-xs">Step {item.followUpNumber + 1}</TableCell>
                                        <TableCell className="text-right text-xs text-slate-400">
                                            {item.nextAttemptAt ? new Date(item.nextAttemptAt).toLocaleTimeString() : "N/A"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
