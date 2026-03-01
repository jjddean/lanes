"use client"

import { IconSettings } from "@tabler/icons-react";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">Settings</h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">
                        Configure autonomous identity and system-wide engine protocols.
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-muted-foreground">
                <div className="size-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6 border border-slate-200">
                    <IconSettings className="size-10 text-slate-400" />
                </div>
                <p className="max-w-md text-center">
                    Engine protocols are locked. Please contact your system administrator to reconfigure core DNA sequences.
                </p>
            </div>
        </div>
    );
}
