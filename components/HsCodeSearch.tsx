"use client";

import { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type HsEntry = { c: string; d: string };

interface HsCodeSearchProps {
    onSelect?: (code: string) => void;
    className?: string;
}

/**
 * HsCodeSearch Component
 * Implements the premium Slate/Cyan design specification for lightweight lookup.
 */
export default function HsCodeSearch({ onSelect, className }: HsCodeSearchProps) {
    const [codes, setCodes] = useState<HsEntry[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // 1. Fetch JSON on mount (Zero-Bundle Strategy)
    useEffect(() => {
        fetch('/hs-codes.json')
            .then(r => r.json())
            .then(data => {
                setCodes(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load HS codes:", err);
                setIsLoading(false);
            });
    }, []);

    // 2. Client-side filtering
    const filteredCodes = useMemo(() => {
        if (!search) return [];
        const lowerSearch = search.toLowerCase();
        return codes.filter(
            item => item.c.includes(lowerSearch) || item.d.toLowerCase().includes(lowerSearch)
        ).slice(0, 50); // Limit results for performance
    }, [codes, search]);

    return (
        <div className={cn("space-y-3 w-full max-w-md", className)}>
            <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                </div>
                <Input
                    type="text"
                    placeholder="Search HS Code or product..."
                    className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 rounded-lg shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {isLoading && (
                    <div className="absolute right-3 top-3.5">
                        <div className="h-4 w-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {search && !isLoading && (
                <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Verified Matches
                        </span>
                        <Badge variant="outline" className="text-[9px] border-cyan-200 bg-cyan-50 text-cyan-700">
                            {filteredCodes.length} Results
                        </Badge>
                    </div>

                    <ScrollArea className="h-64">
                        <div className="p-1">
                            {filteredCodes.length > 0 ? (
                                filteredCodes.map((item) => (
                                    <button
                                        key={item.c}
                                        onClick={() => onSelect?.(item.c)}
                                        className="w-full flex items-start gap-3 p-3 text-left hover:bg-cyan-50/50 rounded-md transition-all border-b border-slate-50 last:border-0 group"
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div className="bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                                                {item.c}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-900 font-medium group-hover:text-cyan-700 transition-colors">
                                                {item.d}
                                            </p>
                                            <div className="mt-1 flex items-center gap-1.5">
                                                <CheckCircle2 className="h-3 w-3 text-cyan-500" />
                                                <span className="text-[10px] text-cyan-600 font-medium italic">Verified Tariff Item</span>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center space-y-2">
                                    <Info className="h-8 w-8 text-slate-300 mx-auto" />
                                    <p className="text-sm text-slate-500 italic">No matches found for "{search}"</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </Card>
            )}
        </div>
    );
}

// Minimal Card wrapper since it's not and exported as a UI component in list_dir
function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}>{children}</div>
}
