"use client"

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GeoRiskNavigator } from "@/components/ai/GeoRiskNavigator";
import { IconAward, IconPlus, IconDownload, IconUsers, IconTrash, IconMail, IconBrandWhatsapp, IconBuilding, IconMapPin, IconTag, IconEdit, IconCheck, IconX, IconRocket, IconAlertTriangle, IconRefresh, IconCircle, IconUsersGroup } from "@tabler/icons-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LeadsPage() {
    const leads = useQuery(api.leads.listLeads, {});
    const workflows = useQuery(api.workflows.listActiveWorkflows);
    const updateLead = useMutation(api.leads.updateLead);
    const deleteLead = useMutation(api.leads.deleteLead);

    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (selectedLead) {
            setEditData({
                companyName: selectedLead.companyName,
                country: selectedLead.country,
                industry: selectedLead.industry,
                whatsapp: selectedLead.whatsapp || "",
                email: selectedLead.email || "",
            });

            // Simulate "Deep Reasoning" for new leads
            if (selectedLead.status === 'new') {
                setIsAnalyzing(true);
                const timer = setTimeout(() => setIsAnalyzing(false), 3000);
                return () => clearTimeout(timer);
            } else {
                setIsAnalyzing(false);
            }
        }
    }, [selectedLead]);

    const calculateNeedScore = (lead: any) => {
        if (!workflows || workflows.length === 0) return 65;
        // Find matching workflow or use first one as spec
        const workflow = workflows.find(w => w._id === lead.workflowId) || workflows[0];
        let score = 50;

        // Industry Match (30 points)
        if (lead.industry?.toLowerCase() === workflow.targetProfile.industry?.toLowerCase()) score += 30;

        // Country Match (20 points)
        if (lead.country?.toLowerCase() === workflow.targetProfile.tradeLane?.toLowerCase()) score += 20;

        return Math.min(score, 100);
    };

    const handleSave = async () => {
        try {
            await updateLead({
                id: selectedLead._id,
                ...editData,
            });
            toast.success("Lead updated successfully");
            setIsEditing(false);
            // Selected lead will update automatically due to Convex subscription
        } catch (error) {
            toast.error("Failed to update lead");
        }
    };

    const handleDelete = async (id: Id<"leads">) => {
        if (confirm("Are you sure you want to delete this lead?")) {
            try {
                await deleteLead({ id });
                toast.success("Lead deleted");
                if (selectedLead?._id === id) setSelectedLead(null);
            } catch (error) {
                toast.error("Failed to delete lead");
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "new": return "secondary";
            case "contacted": return "default";
            case "replied": return "success" as any;
            case "won": return "success" as any;
            case "lost": return "destructive";
            default: return "outline";
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4 lg:p-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">Lanes</h2>
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">
                        Orchestrate active trade lanes and autonomous connections.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-4 rounded-lg bg-white hover:bg-slate-50 text-slate-900 font-bold border border-slate-200 transition-all flex items-center gap-2 text-xs shadow-sm"
                    >
                        <IconDownload className="size-4" />
                        Export
                    </Button>
                    <Button
                        size="sm"
                        className="h-10 px-4 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold border border-slate-300 transition-all flex items-center gap-2 text-xs shadow-sm"
                    >
                        <IconPlus className="size-4" />
                        New Lead
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b-slate-100">
                            <TableHead className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] h-12">Company</TableHead>
                            <TableHead className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] h-12">Country</TableHead>
                            <TableHead className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] h-12">Industry</TableHead>
                            <TableHead className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] h-12">DCTS Tier</TableHead>
                            <TableHead className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] h-12">Status</TableHead>
                            <TableHead className="text-right font-semibold text-slate-400 uppercase tracking-widest text-[10px] h-12 pr-8">IQ Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads?.map((lead) => (
                            <TableRow
                                key={lead._id}
                                className="cursor-pointer hover:bg-slate-50/50 border-b-slate-50 transition-colors group"
                                onClick={() => setSelectedLead(lead)}
                            >
                                <TableCell className="font-semibold text-slate-900 py-4 tracking-tight">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span>{lead.companyName}</span>
                                            {lead.industry?.toLowerCase().includes("tech") && <IconRocket className="size-3 text-cyan-500" title="Scaling Milestone" />}
                                            {lead.country === "Vietnam" && <IconUsersGroup className="size-3 text-indigo-500" title="Strategic Partner" />}
                                            {lead.status === "new" && <IconAlertTriangle className="size-3 text-amber-500" title="Optimization Opportunity" />}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-normal tracking-tight truncate max-w-[150px]">{lead.whatsapp || lead.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-500 font-normal py-4 text-xs">
                                    <div className="flex items-center gap-2">
                                        <IconMapPin className="size-3 text-slate-300" />
                                        {lead.country}
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-500 font-normal py-4 text-xs">{lead.industry}</TableCell>
                                <TableCell className="py-4">
                                    <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-50 border-slate-200 text-slate-600">
                                        {lead.dctsStatus || "CHECKING"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-4">
                                    <Badge variant={getStatusColor(lead.status)} className="rounded-lg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                                        {lead.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right py-4 pr-8">
                                    <div className="flex items-center justify-end gap-3">
                                        <div className="h-1.5 w-16 bg-slate-100 rounded-sm overflow-hidden">
                                            <div
                                                className="h-full bg-slate-900 transition-all duration-500"
                                                style={{ width: `${calculateNeedScore(lead)}%` }}
                                            />
                                        </div>
                                        <span className="font-semibold text-slate-900 text-xs w-6">{calculateNeedScore(lead)}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {(!leads || leads.length === 0) && (
                    <div className="p-12 text-center text-muted-foreground">
                        <IconUsers className="mx-auto size-12 mb-4 opacity-10" />
                        <p>No leads found yet. Start your workflow and auto-discovery will populate this list.</p>
                    </div>
                )}
            </div>

            <Sheet open={!!selectedLead} onOpenChange={(open) => {
                if (!open) {
                    setSelectedLead(null);
                    setIsEditing(false);
                }
            }}>
                <SheetContent className="overflow-y-auto sm:max-w-xl p-0 flex flex-col h-full border-l border-slate-100 shadow-2xl">
                    {selectedLead && (
                        <div className="flex flex-col h-full bg-slate-50/30">
                            {/* Header Section */}
                            <div className="p-8 bg-white border-b border-slate-100 space-y-6">
                                <SheetHeader className="text-left space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-slate-900 rounded-lg shadow-inner border border-slate-800">
                                                <IconBuilding className="h-8 w-8 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <SheetTitle className="text-2xl font-bold tracking-tight leading-none text-slate-900">
                                                    {selectedLead.companyName}
                                                </SheetTitle>
                                                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-semibold uppercase tracking-tight text-[10px]">
                                                    {calculateNeedScore(selectedLead) > 80 ? "Strategic Fit" : "Standard Fit"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!isEditing && !isAnalyzing && (
                                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-9 px-3 rounded-lg hover:bg-slate-100">
                                                    <IconEdit className="mr-2 size-4" />
                                                    Edit
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Intelligence/Reasoning Layer */}
                                    {isAnalyzing ? (
                                        <div className="rounded-xl bg-slate-950 p-6 text-white border border-slate-800 shadow-2xl overflow-hidden relative group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <IconRefresh className="size-12 animate-spin-slow text-slate-400" />
                                            </div>
                                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
                                                Deep Reasoning Flow
                                            </h3>
                                            <ul className="space-y-4">
                                                <li className="flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-left-2 duration-300">
                                                    <IconCheck className="size-4 text-slate-400" /> Sourcing Company Profile...
                                                </li>
                                                <li className="flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-left-2 delay-700 duration-300">
                                                    <IconRefresh className="size-4 text-slate-400 animate-spin" /> Analyzing Lane Frequency...
                                                </li>
                                                <li className="flex items-center gap-3 text-sm font-medium text-white/30">
                                                    <IconCircle className="size-4" /> Finalizing Strategy Draft...
                                                </li>
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 group hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                                    <IconRocket className="size-3" /> Strategic Case
                                                </h4>
                                                <span className="text-[10px] font-bold text-slate-400">IQ CONFIRMED</span>
                                            </div>
                                            <p className="text-sm font-medium leading-relaxed text-slate-700">
                                                {selectedLead.industry?.toLowerCase().includes("tech")
                                                    ? `Identified Scaling Milestone: ${selectedLead.companyName} is expanding tech manufacturing operations in ${selectedLead.country}, creating a high-frequency lane opportunity for UK distribution.`
                                                    : `Autonomous discovery flagged ${selectedLead.companyName} as a ${selectedLead.industry} leader. Strategy focuses on optimizing their ${selectedLead.country} -> UK trade lane for maximum efficiency.`}
                                            </p>
                                        </div>
                                    )}

                                    {/* Premium Metrics Grid */}
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <IconRocket className="h-10 w-10 text-slate-400" />
                                            </div>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Partner Need Score</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-bold text-slate-900">
                                                    {calculateNeedScore(selectedLead)}
                                                </span>
                                                <span className="text-sm text-slate-400 font-semibold">/ 100</span>
                                            </div>
                                        </div>
                                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <IconMapPin className="h-10 w-10 text-slate-500" />
                                            </div>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">UK Volume</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-bold text-slate-800">
                                                    12
                                                </span>
                                                <span className="text-sm text-slate-400 font-semibold uppercase">Lanes</span>
                                            </div>
                                        </div>
                                    </div>
                                </SheetHeader>
                            </div>

                            <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                                {!isEditing ? (
                                    <>
                                        {/* GeoRisk Navigator Integration */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                                                Trade Intelligence
                                            </h4>
                                            <GeoRiskNavigator
                                                data={{
                                                    score: selectedLead.country === "Vietnam" ? 12 : 45,
                                                    level: selectedLead.country === "Vietnam" ? 'LOW' : 'MEDIUM',
                                                    advisory: selectedLead.country === "Vietnam"
                                                        ? "Stable DCTS Enhanced Framework partner. Low risk."
                                                        : "Standard DCTS partner. Monitor local trade policy updates.",
                                                    factors: {
                                                        zone: { score: 10, weight: 0.4, details: ["Stable maritime corridor"] },
                                                        sanctions: { score: 0, weight: 0.4, details: [], available: true },
                                                        weather: { score: 5, weight: 0.2, details: [] }
                                                    }
                                                }}
                                                route={`${selectedLead.country} → UK`}
                                            />
                                        </div>

                                        {/* Actionable Intelligence Card */}
                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                                                Actionable Intelligence
                                            </h4>
                                            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-200/50">
                                                <div className="divide-y divide-slate-50">
                                                    <div className="p-4 flex items-center justify-between text-sm hover:bg-slate-50/50 transition-colors">
                                                        <div className="flex items-center gap-3 text-slate-500 font-medium">
                                                            <div className="p-2 bg-slate-50 rounded-lg"><IconMapPin className="h-4 w-4 text-slate-600" /></div>
                                                            Origin HQ
                                                        </div>
                                                        <span className="font-semibold text-slate-800 tracking-tight">{selectedLead.country}</span>
                                                    </div>
                                                    <div className="p-4 flex items-center justify-between text-sm hover:bg-slate-50/50 transition-colors">
                                                        <div className="flex items-center gap-3 text-slate-500 font-medium">
                                                            <div className="p-2 bg-slate-50 rounded-lg"><IconMail className="h-4 w-4 text-amber-500" /></div>
                                                            Verified Email
                                                        </div>
                                                        <span className="font-semibold text-slate-800 tracking-tight">
                                                            {selectedLead.email || "Discovery Required"}
                                                        </span>
                                                    </div>
                                                    <div className="p-4 flex items-center justify-between text-sm hover:bg-slate-50/50 transition-colors">
                                                        <div className="flex items-center gap-3 text-slate-500 font-medium">
                                                            <div className="p-2 bg-slate-50 rounded-lg"><IconBrandWhatsapp className="h-4 w-4 text-emerald-500" /></div>
                                                            Direct WhatsApp
                                                        </div>
                                                        <span className="font-semibold text-slate-800 tracking-tight">{selectedLead.whatsapp || "Lookup Pending"}</span>
                                                    </div>
                                                    <div className="p-4 flex items-center justify-between text-sm hover:bg-slate-50/50 transition-colors">
                                                        <div className="flex items-center gap-3 text-slate-500 font-medium">
                                                            <div className="p-2 bg-slate-50 rounded-lg"><IconTag className="h-4 w-4 text-indigo-500" /></div>
                                                            Industry
                                                        </div>
                                                        <span className="font-semibold text-slate-800 tracking-tight italic">{selectedLead.industry}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Outreach Engine */}
                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                                                    AI Outreach Engine
                                                </h4>
                                                <Badge variant="outline" className="text-[9px] font-bold text-slate-600 border-slate-200 bg-slate-50 px-2 py-0">
                                                    ELITE-GEN POWERED
                                                </Badge>
                                            </div>

                                            <Tabs defaultValue="email" className="space-y-4">
                                                <TabsList className="grid grid-cols-3 h-10 w-full bg-slate-100/50 p-1 rounded-xl">
                                                    <TabsTrigger value="email" className="text-[10px] font-bold uppercase tracking-tight rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Email</TabsTrigger>
                                                    <TabsTrigger value="linkedin" className="text-[10px] font-bold uppercase tracking-tight rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">LinkedIn</TabsTrigger>
                                                    <TabsTrigger value="whatsapp" className="text-[10px] font-bold uppercase tracking-tight rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">WhatsApp</TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="email" className="mt-0">
                                                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-3xl p-6 space-y-4">
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] text-slate-400 font-bold italic uppercase">Subject: Partnering on {selectedLead.country} → UK lane</p>
                                                            <p className="text-xs leading-relaxed text-slate-600">
                                                                "Hi {selectedLead.companyName} Team, noticed your high volume on the {selectedLead.country} lane. We are top-tier UK agents with capacity for your shipments..."
                                                            </p>
                                                        </div>
                                                        <Button className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-xs font-bold h-10 rounded-xl" onClick={() => window.location.href = `mailto:${selectedLead.email}`}>
                                                            <IconMail className="h-4 w-4 mr-2" />
                                                            Copy Email Template
                                                        </Button>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="linkedin" className="mt-0">
                                                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-3xl p-6 space-y-4">
                                                        <p className="text-xs leading-relaxed text-slate-600 italic">
                                                            "Hi, saw your impressive shipment volume to the UK this month. I'd love to connect and discuss how we can streamline your UK logistics."
                                                        </p>
                                                        <Button variant="outline" className="w-full text-xs font-bold h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
                                                            <IconRocket className="h-4 w-4 mr-2" />
                                                            Generate Connection Note
                                                        </Button>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="whatsapp" className="mt-0">
                                                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-3xl p-8 text-center space-y-3">
                                                        <div className="p-3 bg-slate-50 rounded-full w-fit mx-auto">
                                                            <IconBrandWhatsapp className="h-6 w-6 text-emerald-500/50" />
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lookup Pending</p>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </div>

                                        {/* Trade Insights */}
                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                                                Recent Activity
                                            </h4>
                                            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                                                <Table>
                                                    <TableHeader className="bg-slate-50/50 font-bold uppercase tracking-wider text-[9px]">
                                                        <TableRow className="border-b-slate-100">
                                                            <TableHead className="font-bold py-2">Category</TableHead>
                                                            <TableHead className="font-bold py-2">Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        <TableRow className="border-b-slate-50 hover:bg-slate-50/50 transition-colors">
                                                            <TableCell className="py-3 text-xs font-semibold text-slate-700 font-medium">Lane Discovery</TableCell>
                                                            <TableCell className="py-3 text-xs font-bold text-slate-600 capitalize">{selectedLead.status}</TableCell>
                                                        </TableRow>
                                                        <TableRow className="border-b-none hover:bg-slate-50/50 transition-colors">
                                                            <TableCell className="py-3 text-xs font-semibold text-slate-700 font-medium">Profile Built</TableCell>
                                                            <TableCell className="py-3 text-xs text-slate-400 font-medium">{formatDistanceToNow(selectedLead._creationTime)} ago</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="mt-auto flex gap-3 pt-6 border-t border-slate-100">
                                            <Button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-2xl shadow-lg shadow-slate-900/10" onClick={() => setSelectedLead(null)}>
                                                Close Profile
                                            </Button>
                                            <Button
                                                className="px-4 h-12 rounded-2xl border-slate-200 text-slate-400 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20 transition-all"
                                                variant="outline"
                                                onClick={() => handleDelete(selectedLead._id)}
                                            >
                                                <IconTrash className="size-5" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="companyName" className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Company Name</Label>
                                                <Input
                                                    id="companyName"
                                                    className="bg-slate-50 border-none h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-slate-200 px-4"
                                                    value={editData.companyName}
                                                    onChange={(e) => setEditData({ ...editData, companyName: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="country" className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Country/Region</Label>
                                                <Input
                                                    id="country"
                                                    className="bg-slate-50 border-none h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-cyan-500/20 px-4"
                                                    value={editData.country}
                                                    onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="industry" className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Industry</Label>
                                                <Input
                                                    id="industry"
                                                    className="bg-slate-50 border-none h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-cyan-500/20 px-4"
                                                    value={editData.industry}
                                                    onChange={(e) => setEditData({ ...editData, industry: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="whatsapp" className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">WhatsApp</Label>
                                                <Input
                                                    id="whatsapp"
                                                    className="bg-slate-50 border-none h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-cyan-500/20 px-4"
                                                    value={editData.whatsapp}
                                                    onChange={(e) => setEditData({ ...editData, whatsapp: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Email</Label>
                                                <Input
                                                    id="email"
                                                    className="bg-slate-50 border-none h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-cyan-500/20 px-4"
                                                    value={editData.email}
                                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 pt-4 border-t border-slate-50">
                                            <Button className="flex-1 bg-slate-100 text-slate-900 hover:bg-slate-200 font-bold h-11 rounded-xl" variant="ghost" onClick={() => setIsEditing(false)}>
                                                <IconX className="mr-2 size-4" /> Cancel
                                            </Button>
                                            <Button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 rounded-xl" onClick={handleSave}>
                                                <IconCheck className="mr-2 size-4" /> Save Changes
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
