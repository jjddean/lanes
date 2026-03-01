"use client"

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    IconFileDescription,
    IconDownload,
    IconPlus,
    IconAlertCircle,
    IconGlobe,
    IconArrowRight,
    IconRocket,
    IconActivity,
    IconCheck,
    IconFileAi
} from "@tabler/icons-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export default function CompliancePage() {
    const docs = useQuery(api.compliance.listAllDocs);
    const leads = useQuery(api.leads.listLeads, {});
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [simulationTrigger, setSimulationTrigger] = useState(0);

    // Mock sourcing data for the simulator
    const defaultSourcing = useMemo(() => [
        { country: "Local", value: 450 },
        { country: "China", value: 300 },
        { country: "UK", value: 150 },
    ], []);
    const totalValue = 900;

    const simulationResult = useQuery(api.dcts.simulateRulesOfOrigin,
        selectedLeadId && simulationTrigger > 0
            ? { leadId: selectedLeadId as any, sourcing: defaultSourcing, totalValue }
            : "skip"
    );

    const isSimulating = simulationTrigger > 0 && simulationResult === undefined;

    const handleSimulate = () => {
        if (!selectedLeadId) return;
        setSimulationTrigger(prev => prev + 1);
    };

    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6 bg-white min-h-screen">
            {/* Header Area Mirroring Dashboard */}
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">Compliance</h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">
                        REGULATORY AUDIT TRAILS AND TRADE DOCUMENTATION MANAGEMENT
                    </p>
                </div>
                <Button
                    size="sm"
                    className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all flex items-center gap-2 text-[10px] uppercase tracking-widest shadow-sm"
                >
                    <IconPlus className="size-3.5" />
                    Generate Batch
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* KPI Cards Mirroring Dashboard */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Documents</CardTitle>
                        <IconFileDescription className="h-4 w-4 text-slate-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{docs?.length || 0}</div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                            TOTAL REPOSITORY
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
                        <IconAlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{docs?.filter(d => d.status === 'draft').length || 0}</div>
                        <p className="text-[10px] text-amber-600 font-medium uppercase tracking-widest mt-1">
                            ACTION REQUIRED
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Verified Intake</CardTitle>
                        <IconCheck className="h-4 w-4 text-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.3)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{docs?.filter(d => d.status === 'generated').length || 0}</div>
                        <p className="text-[10px] text-cyan-500 font-medium uppercase tracking-widest mt-1">
                            AUDIT READY
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-12 mt-2">
                {/* Main Content: Table */}
                <div className="md:col-span-8">
                    <Card className="rounded-lg shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Audit Trail History</CardTitle>
                            <Badge variant="outline" className="text-[10px] font-mono bg-slate-50 text-slate-600 border-slate-200 uppercase">Archive</Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b-slate-100">
                                        <TableHead className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest h-10 px-6">TYPE</TableHead>
                                        <TableHead className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest h-10">LANE MAPPING</TableHead>
                                        <TableHead className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest h-10">STATUS</TableHead>
                                        <TableHead className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-widest h-10 pr-8">ACTIONS</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {docs?.map((doc) => (
                                        <TableRow key={doc._id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-900">{doc.type}</span>
                                                    <span className="text-[10px] text-muted-foreground">Generated {formatDistanceToNow(doc.createdAt)} ago</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Link href={`/dashboard/leads`} className="text-xs font-medium text-cyan-600 hover:text-cyan-700 flex items-center gap-1 group">
                                                    View Lane
                                                    <IconArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                                                </Link>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant={doc.status === 'generated' ? 'default' : 'secondary'} className="text-[10px] uppercase shadow-none border-none">
                                                    {doc.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right py-4 pr-8">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-900">
                                                    <IconDownload className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!docs || docs.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-sm text-muted-foreground italic">
                                                No documents recorded in engine history
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Intelligence Tools Mirroring Dashboard Layout */}
                <div className="md:col-span-4 flex flex-col gap-4">
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <IconFileAi className="size-4 text-cyan-500" />
                                Origin Simulator
                            </CardTitle>
                            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Evaluate sourcing scenarios against UK DCTS PSR for zero-tariff confirmation.
                            </p>

                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-widest">Select Lane Mapping</label>
                                <Select onValueChange={(val) => setSelectedLeadId(val)}>
                                    <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Select lane..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leads?.map(lead => (
                                            <SelectItem key={lead._id} value={lead._id} className="text-xs">
                                                {lead.companyName} ({lead.country})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                className="w-full h-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
                                onClick={handleSimulate}
                                disabled={isSimulating}
                            >
                                {isSimulating ? (
                                    <>
                                        <div className="size-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Run Rule Analysis
                                        <IconRocket className="size-3.5" />
                                    </>
                                )}
                            </Button>

                            {simulationResult && (
                                <div className={cn(
                                    "p-4 rounded-lg border transition-all animate-in fade-in slide-in-from-top-2",
                                    simulationResult.passes ? "bg-cyan-50 border-cyan-100" : "bg-rose-50 border-rose-100"
                                )}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                                            simulationResult.passes ? "text-cyan-600" : "text-rose-600"
                                        )}>
                                            {simulationResult.passes ? (
                                                <><IconCheck className="size-3" /> Pass</>
                                            ) : (
                                                <><IconAlertCircle className="size-3" /> Fail</>
                                            )}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-900">{simulationResult.localContent?.toFixed(1) || "0.0"}% VA</span>
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-600 leading-tight">
                                        {simulationResult.advisory}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-50 border-dashed">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-2">
                                <IconActivity className="size-3.5 text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Heuristic Engine</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed italic">
                                Analyzing global MFN vs DCTS rates. Source optimization recommended for Vietnam and Thailand sourcing hubs.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
