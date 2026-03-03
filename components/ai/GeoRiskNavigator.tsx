'use client';

import React from 'react';
import { useConvex, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
    ShieldCheck,
    Globe,
    Ship,
    CheckCircle2,
    TrendingUp,
    Clock,
    Lock,
    FlaskConical
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

export interface GeoRiskData {
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    advisory: string;
    factors: {
        zone: {
            score: number;
            weight: number;
            details: string[];
        };
        sanctions: {
            score: number;
            weight: number;
            details: string[];
            available?: boolean;
        };
        weather: {
            score: number;
            weight: number;
            details: string[];
        };
    };
    premium?: boolean;
    lastUpdated?: number;
}

interface GeoRiskNavigatorProps {
    data: GeoRiskData;
    route?: string;
    leadId?: Id<"leads">;
}

export const GeoRiskNavigator: React.FC<GeoRiskNavigatorProps> = ({ data, route = "Unknown Route", leadId }) => {
    const convex = useConvex();
    const planInfo = useQuery(api.billing.getPlanInfo);
    const isFreePlan = (planInfo?.plan ?? "free") === "free";
    const [isRunningDcts, setIsRunningDcts] = useState(false);
    const [isRunningOrigin, setIsRunningOrigin] = useState(false);
    const [dctsResult, setDctsResult] = useState<{
        tier: string;
        preferenceMargin: string;
        savingsFormatted: string;
    } | null>(null);
    const [originResult, setOriginResult] = useState<{
        passes: boolean;
        localContent: number;
        required: number;
        advisory: string;
    } | null>(null);

    const runDctsPreview = async () => {
        if (!leadId) return;
        try {
            setIsRunningDcts(true);
            const eligibility = await convex.query(api.dcts.calculateLeadEligibility, { leadId });
            const tier = eligibility?.tier ?? "NONE";
            const tierName = eligibility?.tierName ?? "No DCTS Preference";
            const mfnRate = 12;
            const dctsRateByTier: Record<string, number> = {
                COMPREHENSIVE: 0,
                STANDARD: 8,
                LDC: 0,
                ENHANCED: 2,
                GENERAL: 8,
                NONE: 12,
            };
            const dctsRate = dctsRateByTier[tier] ?? 12;
            const shipmentValue = 25000;
            const savings = await convex.query(api.dcts.calculateSavings, {
                mfnRate,
                dctsRate,
                shipmentValue,
            });

            setDctsResult({
                tier: tierName,
                preferenceMargin: `${Math.max(mfnRate - dctsRate, 0)}%`,
                savingsFormatted: savings.savingsFormatted,
            });
        } finally {
            setIsRunningDcts(false);
        }
    };

    const runOriginPreview = async () => {
        if (!leadId) return;
        try {
            setIsRunningOrigin(true);
            const result = await convex.query(api.dcts.simulateRulesOfOrigin, {
                leadId,
                sourcing: [
                    { country: "Local", value: 450 },
                    { country: "China", value: 300 },
                    { country: "UK", value: 150 },
                ],
                totalValue: 900,
            });
            setOriginResult(result);
        } finally {
            setIsRunningOrigin(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 font-sans text-slate-900 bg-white">
            {/* Header: Dense Metadata */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                        <Ship className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                    <div>
                        <h2 className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Active Route Analysis</h2>
                        <h3 className="text-base font-normal tracking-tight leading-none mt-0.5">{route}</h3>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-widest text-slate-400">
                            <Clock className="h-2.5 w-2.5" />
                            <span>Last Sync</span>
                        </div>
                        <span className="text-sm font-medium uppercase tracking-tighter">Real-time</span>
                    </div>

                    <div className="h-8 w-px bg-slate-200" />

                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                        <div className={`h-2 w-2 rounded-full ${data.level === 'LOW' ? 'bg-slate-400' :
                                data.level === 'MEDIUM' ? 'bg-slate-600' : 'bg-slate-900'
                            }`} />
                        <span className="text-sm font-semibold tracking-tighter">{data.level} RISK</span>
                        <span className="text-sm font-light text-slate-400">|</span>
                        <span className="text-sm font-bold">{data.score}/100</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-[10px] uppercase tracking-widest text-slate-500">Intelligence Advisory</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">
                        {data.advisory}
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {Object.entries(data.factors).map(([key, factor]) => (
                        <div key={key} className="border border-slate-200 rounded p-3 bg-white flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">{key}</span>
                                <span className="text-[11px] font-bold text-slate-900">{factor.score}</span>
                            </div>
                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${factor.score}%` }}
                                    className="h-full bg-slate-600"
                                />
                            </div>
                            <div className="flex flex-col gap-1 mt-1">
                                {factor.details.length > 0 ? (
                                    factor.details.slice(0, 2).map((detail, idx) => (
                                        <div key={idx} className="flex items-start gap-1.5">
                                            <div className="h-1 w-1 rounded-full bg-slate-300 mt-1" />
                                            <span className="text-[10px] text-slate-500 leading-tight">{detail}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center gap-1.5 opacity-50">
                                        <CheckCircle2 className="h-2.5 w-2.5 text-slate-400" />
                                        <span className="text-[10px] text-slate-400">No anomalies detected</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-6 border-t border-slate-100 pt-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                        Compliance Tools
                    </h4>

                    <div className="border border-slate-200 rounded bg-white overflow-hidden shadow-sm">
                        <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                            <span className="text-[11px] uppercase tracking-widest text-slate-900 font-medium">DCTS Eligibility Engine</span>
                            <Lock className="h-3 w-3 text-slate-400" />
                        </div>
                        <div className="p-3 space-y-2.5">
                            <div className="flex items-start gap-3">
                                <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-slate-900">Quick check on this company</p>
                                    <p className="text-[13px] leading-snug text-slate-600">
                                        Shows a basic MFN vs DCTS indication for this lane with an estimated preference signal.
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5">
                                    <p className="uppercase tracking-widest text-slate-400">Tier</p>
                                    <p className="font-semibold text-slate-700">Standard</p>
                                </div>
                                <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5">
                                    <p className="uppercase tracking-widest text-slate-400">Margin</p>
                                    <p className="font-semibold text-slate-700">Estimated</p>
                                </div>
                                <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5">
                                    <p className="uppercase tracking-widest text-slate-400">Savings</p>
                                    <p className="font-semibold text-slate-700">Indicative</p>
                                </div>
                            </div>
                            <p className="text-xs leading-snug text-slate-500">
                                Upgrade to Pro to unlock full eligibility analysis. Includes preference margin, tariff savings, applicable rules, graduation warnings, and cumulation eligibility.
                            </p>
                            {dctsResult && (
                                <div className="rounded border border-slate-200 bg-slate-50 p-2.5 text-[11px]">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <p className="uppercase tracking-widest text-slate-400">Tier</p>
                                            <p className="font-semibold text-slate-700">{dctsResult.tier}</p>
                                        </div>
                                        <div>
                                            <p className="uppercase tracking-widest text-slate-400">Margin</p>
                                            <p className="font-semibold text-slate-700">{dctsResult.preferenceMargin}</p>
                                        </div>
                                        <div>
                                            <p className="uppercase tracking-widest text-slate-400">Savings</p>
                                            <p className="font-semibold text-slate-700">{dctsResult.savingsFormatted}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={runDctsPreview}
                                    disabled={!leadId || isRunningDcts}
                                    className="h-10 rounded bg-slate-900 text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <TrendingUp className="h-3 w-3" />
                                    {isRunningDcts ? "Running..." : "Run Free Check"}
                                </button>
                                <Link
                                    href={isFreePlan ? "/dashboard/billing" : "/dashboard/compliance"}
                                    className="h-10 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-widest flex items-center justify-center hover:bg-slate-100 transition-colors"
                                >
                                    {isFreePlan ? "Upgrade to Pro" : "Open Full Tool"}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded bg-white overflow-hidden shadow-sm">
                        <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                            <span className="text-[11px] uppercase tracking-widest text-slate-900 font-medium">Origin Simulator</span>
                            <Globe className="h-3 w-3 text-slate-400" />
                        </div>
                        <div className="p-3 space-y-2.5">
                            <div className="flex items-start gap-3">
                                <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                                    <FlaskConical className="h-4 w-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-slate-900">Quick check on this company</p>
                                    <p className="text-[13px] leading-snug text-slate-600">
                                        Shows a starter rules-of-origin signal from lane context with limited simulation detail.
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5">
                                    <p className="uppercase tracking-widest text-slate-400">Status</p>
                                    <p className="font-semibold text-slate-700">Starter</p>
                                </div>
                                <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5">
                                    <p className="uppercase tracking-widest text-slate-400">VA</p>
                                    <p className="font-semibold text-slate-700">Basic</p>
                                </div>
                                <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5">
                                    <p className="uppercase tracking-widest text-slate-400">Rule</p>
                                    <p className="font-semibold text-slate-700">Basic</p>
                                </div>
                            </div>
                            <p className="text-xs leading-snug text-slate-500">
                                Upgrade to Pro to unlock full origin simulation. Includes compliance status, value-added percentage, required threshold, detailed reasoning, rule applied, cumulation analysis, and report export.
                            </p>
                            {originResult && (
                                <div className={`rounded border p-2.5 text-[11px] ${originResult.passes ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
                                    <div className="flex items-center justify-between">
                                        <p className={`font-semibold ${originResult.passes ? "text-emerald-700" : "text-rose-700"}`}>
                                            {originResult.passes ? "Compliant" : "Non-compliant"}
                                        </p>
                                        <p className="font-semibold text-slate-700">
                                            {originResult.localContent.toFixed(1)}% VA
                                        </p>
                                    </div>
                                    <p className="mt-1 text-slate-600 leading-snug">{originResult.advisory}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={runOriginPreview}
                                    disabled={!leadId || isRunningOrigin}
                                    className="h-10 rounded bg-slate-900 text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 className="h-3 w-3" />
                                    {isRunningOrigin ? "Running..." : "Run Free Check"}
                                </button>
                                <Link
                                    href={isFreePlan ? "/dashboard/billing" : "/dashboard/compliance"}
                                    className="h-10 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-widest flex items-center justify-center hover:bg-slate-100 transition-colors"
                                >
                                    {isFreePlan ? "Upgrade to Pro" : "Open Full Tool"}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
