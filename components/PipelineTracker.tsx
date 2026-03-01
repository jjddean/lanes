"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function PipelineTracker() {
    const leads = useQuery(api.leads.listLeads, {});

    if (!leads) return <div>Loading pipeline...</div>;

    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === "new").length,
        contacted: leads.filter(l => l.status === "contacted").length,
        engaged: leads.filter(l => l.status === "engaged" || l.status === "replied").length,
        qualified: leads.filter(l => l.status === "qualified").length,
    };

    const stages = [
        { label: "Discovery", count: stats.new, value: stats.total > 0 ? (stats.new / stats.total) * 100 : 0, color: "bg-blue-500" },
        { label: "Outreach", count: stats.contacted, value: stats.total > 0 ? (stats.contacted / stats.total) * 100 : 0, color: "bg-purple-500" },
        { label: "Engaged", count: stats.engaged, value: stats.total > 0 ? (stats.engaged / stats.total) * 100 : 0, color: "bg-orange-500" },
        { label: "Qualified", count: stats.qualified, value: stats.total > 0 ? (stats.qualified / stats.total) * 100 : 0, color: "bg-green-500" },
    ];

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle className="text-lg">Autonomous Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {stages.map((stage) => (
                    <div key={stage.label} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">{stage.label}</span>
                            <span className="text-muted-foreground">{stage.count} leads</span>
                        </div>
                        <Progress value={stage.value} className="h-2" />
                    </div>
                ))}

                <div className="pt-4 border-t">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Engine Status</p>
                            <p className="text-sm font-semibold text-green-500 flex items-center gap-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Active & Scaling
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Efficiency</p>
                            <p className="text-xl font-bold">92%</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
