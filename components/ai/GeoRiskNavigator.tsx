'use client';

import React from 'react';
import {
    ShieldCheck,
    Globe,
    Ship,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    Clock,
    Lock,
    Search
} from 'lucide-react';
import { motion } from 'framer-motion';

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
}

export const GeoRiskNavigator: React.FC<GeoRiskNavigatorProps> = ({ data, route = "Unknown Route" }) => {
    const isPremium = data.premium;

    return (
        <div className="flex flex-col gap-4 font-sans text-slate-900 bg-white">
            {/* Header: Dense Metadata */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                        <Ship className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                    <div>
                        <h2 className="text-[9px] uppercase tracking-widest text-slate-400 font-medium">Active Route Analysis</h2>
                        <h3 className="text-sm font-normal tracking-tight leading-none mt-0.5">{route}</h3>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5 text-[9px] uppercase tracking-widest text-slate-400">
                            <Clock className="h-2.5 w-2.5" />
                            <span>Last Sync</span>
                        </div>
                        <span className="text-xs font-medium uppercase tracking-tighter">Real-time</span>
                    </div>

                    <div className="h-8 w-px bg-slate-200" />

                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                        <div className={`h-2 w-2 rounded-full ${data.level === 'LOW' ? 'bg-slate-400' :
                            data.level === 'MEDIUM' ? 'bg-amber-500' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                            }`} />
                        <span className={`text-xs font-semibold tracking-tighter ${data.level === 'HIGH' ? 'text-rose-600' :
                                data.level === 'MEDIUM' ? 'text-amber-600' : ''
                            }`}>{data.level} RISK</span>
                        <span className="text-xs font-light text-slate-400">|</span>
                        <span className="text-xs font-bold">{data.score}/100</span>
                    </div>
                </div>
            </div>

            {/* Main Content: Two Column Layout */}
            <div className="grid grid-cols-12 gap-6">

                {/* Left: Factors & Details */}
                <div className="col-span-8 flex flex-col gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                            <span className="text-[9px] uppercase tracking-widest text-slate-500">Intelligence Advisory</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-600">
                            {data.advisory}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {Object.entries(data.factors).map(([key, factor]) => (
                            <div key={key} className="border border-slate-200 rounded p-3 bg-white flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-400 font-medium">{key}</span>
                                    <span className="text-[10px] font-bold text-slate-900">{factor.score}</span>
                                </div>
                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${factor.score}%` }}
                                        className={`h-full ${factor.score >= 70 ? 'bg-rose-500' :
                                                factor.score >= 40 ? 'bg-amber-500' :
                                                    'bg-slate-600'
                                            }`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1 mt-1">
                                    {factor.details.length > 0 ? (
                                        factor.details.slice(0, 2).map((detail, idx) => (
                                            <div key={idx} className="flex items-start gap-1.5">
                                                <div className="h-1 w-1 rounded-full bg-slate-300 mt-1" />
                                                <span className="text-[9px] text-slate-500 leading-tight">{detail}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center gap-1.5 opacity-50">
                                            <CheckCircle2 className="h-2.5 w-2.5 text-slate-400" />
                                            <span className="text-[9px] text-slate-400">No anomalies detected</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Actions & Tools */}
                <div className="col-span-4 flex flex-col gap-3">
                    <div className="border border-slate-200 rounded bg-white overflow-hidden shadow-sm">
                        <div className={`bg-slate-900 px-3 py-2 flex items-center justify-between ${isPremium ? 'border-b border-white/10' : ''}`}>
                            <span className="text-[9px] uppercase tracking-widest text-white font-medium">Elite Premium</span>
                            <Lock className="h-2.5 w-2.5 text-slate-400" />
                        </div>
                        <div className="p-3 flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                                <h4 className="text-[10px] font-semibold text-slate-900">DCTS Eligibility Engine</h4>
                                <p className="text-[9px] text-slate-500 leading-snug">
                                    Unlock real-time tariff savings analysis for this specific trade lane.
                                </p>
                            </div>
                            <button className="w-full bg-slate-100 border border-slate-200 py-1.5 rounded text-[10px] font-medium text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5">
                                <TrendingUp className="h-2.5 w-2.5" />
                                Run Comparison
                            </button>
                        </div>
                    </div>

                    <div className="border border-slate-200 border-dashed rounded p-3 flex flex-col gap-2">
                        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-medium">Compliance Tools</span>
                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 group cursor-pointer hover:border-slate-300 transition-all">
                            <div className="flex items-center gap-2">
                                <Globe className="h-3 w-3 text-slate-400 group-hover:text-slate-900" />
                                <span className="text-[10px] text-slate-600 group-hover:text-slate-900">Origin Simulator</span>
                            </div>
                            <CheckCircle2 className="h-3 w-3 text-slate-300" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
