"use client"

import { IconFileDescription, IconTrendingUp, IconBriefcase, IconCircleCheck, IconCalendar, IconDownload, IconFilter, IconMessage } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const mockWins = [
    {
        id: "win-1",
        company: "Wholesaler 715",
        industry: "Industrial Machinery",
        value: "$12,500",
        date: "Mar 01, 2026",
        status: "active",
        lane: "Vietnam -> UK"
    },
    {
        id: "win-2",
        company: "Flexport Asia",
        industry: "Consumer Electronics",
        value: "$45,000",
        date: "Feb 28, 2026",
        status: "pending",
        lane: "Shenzhen -> London"
    },
    {
        id: "win-3",
        company: "Global Tex Ltd",
        industry: "Textiles",
        value: "$8,200",
        date: "Feb 25, 2026",
        status: "active",
        lane: "Mumbai -> Felixstowe"
    },
    {
        id: "win-4",
        company: "Maersk Partners",
        industry: "Logistics SaaS",
        value: "$120,000",
        date: "Feb 10, 2026",
        status: "active",
        lane: "Enterprise License"
    }
];


export default function DealsPage() {

    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6 bg-white min-h-full">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">Wins</h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">
                        Track captured trade opportunities and activated contracts.
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
                        <IconTrendingUp className="size-4" />
                        Performance
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
                        <IconBriefcase className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$185,700</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <span className="text-green-500 font-medium flex items-center">
                                +15.5% <IconTrendingUp className="size-3" />
                            </span>
                            vs last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Closed Wins</CardTitle>
                        <IconCircleCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">14</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <span className="text-green-500 font-medium flex items-center">
                                +2 <IconTrendingUp className="size-3" />
                            </span>
                            this week
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Cycle Time</CardTitle>
                        <IconCalendar className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.2 Days</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <span className="text-green-500 font-medium flex items-center">
                                -0.5 Days <IconTrendingUp className="size-3 rotate-180" />
                            </span>
                            vs last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-lg border border-slate-100 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-b-slate-100">
                            <TableHead className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] h-12">Company</TableHead>
                            <TableHead className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] h-12">Industry</TableHead>
                            <TableHead className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] h-12">Trade Lane</TableHead>
                            <TableHead className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] h-12">Value</TableHead>
                            <TableHead className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] h-12">Closed Date</TableHead>
                            <TableHead className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] h-12 pr-6 text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockWins.map((win) => (
                            <TableRow key={win.id} className="hover:bg-slate-50/30 border-b-slate-50 transition-colors">
                                <TableCell className="font-semibold text-slate-900 py-4 tracking-tight">{win.company}</TableCell>
                                <TableCell className="text-slate-500 font-normal py-4 text-xs">{win.industry}</TableCell>
                                <TableCell className="text-slate-500 font-normal py-4 text-xs italic">{win.lane}</TableCell>
                                <TableCell className="font-semibold text-slate-900 py-4 text-xs">{win.value}</TableCell>
                                <TableCell className="text-slate-500 font-normal py-4 text-xs">{win.date}</TableCell>
                                <TableCell className="py-4 pr-6 text-right">
                                    <Badge
                                        variant={win.status === "active" ? "default" : "secondary"}
                                        className="rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                                    >
                                        {win.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
