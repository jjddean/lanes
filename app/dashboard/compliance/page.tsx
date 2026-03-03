"use client"

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    IconFileDescription,
    IconDownload,
    IconPlus,
    IconAlertCircle,
    IconArrowRight,
    IconGlobe,
    IconActivity,
    IconCheck,
    IconFileAi,
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
import { useState } from "react";

export default function CompliancePage() {
    const docs = useQuery(api.compliance.listAllDocs);
    const leads = useQuery(api.leads.listLeads, {});
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6 bg-white min-h-screen">
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
                        <IconAlertCircle className="h-4 w-4 text-amber-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{docs?.filter(d => d.status === "draft").length || 0}</div>
                        <p className="text-[10px] text-amber-700 font-medium uppercase tracking-widest mt-1">
                            ACTION REQUIRED
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Verified Intake</CardTitle>
                        <IconCheck className="h-4 w-4 text-emerald-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{docs?.filter(d => d.status === "generated").length || 0}</div>
                        <p className="text-[10px] text-emerald-700 font-medium uppercase tracking-widest mt-1">
                            AUDIT READY
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 mt-2">
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="rounded-xl border border-slate-200 shadow-lg shadow-slate-200/70 bg-white overflow-hidden">
                        <CardHeader className="border-b border-slate-100 bg-white">
                            <div className="flex items-center space-x-2">
                                <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                                    <IconFileAi className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Origin Simulator</CardTitle>
                                    <CardDescription className="text-sm">Rules of Origin Verification</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <IconGlobe className="h-4 w-4" />
                                    SELECT LANE MAPPING
                                </p>
                                <Select value={selectedLeadId ?? undefined} onValueChange={(val) => setSelectedLeadId(val)}>
                                    <SelectTrigger className="w-full h-12 bg-slate-50/40 border-slate-200 text-sm">
                                        <SelectValue placeholder="Select lane..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leads?.map((lead) => (
                                            <SelectItem key={lead._id} value={lead._id}>
                                                {lead.companyName} ({lead.country})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Evaluate sourcing scenarios against UK DCTS PSR for zero-tariff confirmation.
                            </p>
                            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm font-semibold text-slate-700">
                                    Upgrade to Pro to unlock full Origin Simulator analysis.
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Includes advanced rules-of-origin simulation inputs, save result, and export workflows.
                                </p>
                            </div>
                            <Button asChild className="w-full h-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest">
                                <Link href="/dashboard/billing">Upgrade to Pro</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-slate-200 shadow-lg shadow-slate-200/70 bg-white overflow-hidden">
                        <CardHeader className="border-b border-slate-100 bg-white">
                            <div className="flex items-center space-x-2">
                                <div className="bg-slate-900 p-1.5 rounded-lg text-white">
                                    <IconActivity className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">DCTS Eligibility Engine</CardTitle>
                                    <CardDescription className="text-sm">Tariff Savings Comparator</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <IconGlobe className="h-4 w-4" />
                                    SELECT LANE MAPPING
                                </p>
                                <Select value={selectedLeadId ?? undefined} onValueChange={(val) => setSelectedLeadId(val)}>
                                    <SelectTrigger className="w-full h-12 bg-slate-50/40 border-slate-200 text-sm">
                                        <SelectValue placeholder="Select lane..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leads?.map((lead) => (
                                            <SelectItem key={lead._id} value={lead._id}>
                                                {lead.companyName} ({lead.country})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Compare MFN vs DCTS rates, estimate tariff savings, and validate product-level eligibility.
                            </p>
                            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm font-semibold text-slate-700">
                                    Upgrade to Pro to unlock full DCTS Eligibility analysis.
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Includes preference margin, graduation warnings, cumulation checks, and detailed legal rule references.
                                </p>
                            </div>
                            <Button asChild className="w-full h-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest">
                                <Link href="/dashboard/billing">Upgrade to Pro</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

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
                                            <Link href="/dashboard/leads" className="text-xs font-medium text-cyan-600 hover:text-cyan-700 flex items-center gap-1 group">
                                                View Lane
                                                <IconArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                                            </Link>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant={doc.status === "generated" ? "default" : "secondary"} className="text-[10px] uppercase shadow-none border-none">
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
        </div>
    )
}
