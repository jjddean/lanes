"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconLinkOff, IconRefresh, IconShieldCheck } from "@tabler/icons-react";

type HmrcStatus = {
  connected: boolean;
  isExpired: boolean;
  scope: string | null;
  tokenType: string | null;
  expiresAt: number | null;
  connectedAt: number | null;
  hasRefreshToken: boolean;
};

type HmrcConnectionCardProps = {
  returnTo?: string;
  className?: string;
  mode?: "full" | "compact";
  manageHref?: string;
};

export function HmrcConnectionCard({
  returnTo = "/dashboard/compliance",
  className = "",
  mode = "full",
  manageHref = "/admin",
}: HmrcConnectionCardProps) {
  const [status, setStatus] = useState<HmrcStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/hmrc/status", { cache: "no-store" });
        const json = await res.json();
        if (mounted) setStatus(json);
      } catch {
        if (mounted) setStatus(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const disconnectHref = `/auth/hmrc/disconnect?returnTo=${encodeURIComponent(returnTo)}`;
  const connectHref = `/auth/hmrc/connect?returnTo=${encodeURIComponent(returnTo)}`;

  if (mode === "compact") {
    return (
      <Card className={`rounded-xl border border-slate-200 shadow-sm bg-white ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">HMRC Connection</CardTitle>
          <IconShieldCheck className="h-4 w-4 text-slate-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">
            {loading ? "..." : status?.connected ? "Connected" : "Offline"}
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
            {status?.connected ? "CUSTOMS READY" : "NOT CONNECTED"}
          </p>
          <div className="mt-3">
            <Button asChild variant="outline" size="sm" className="h-8 text-[10px] uppercase tracking-wider border-slate-200">
              <Link href={manageHref}>Manage in Admin</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`rounded-xl border border-slate-200 shadow-sm bg-white ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <IconShieldCheck className="h-4 w-4 text-slate-700" />
            HMRC Connection
          </CardTitle>
          {loading ? (
            <Badge variant="outline" className="text-[10px] uppercase">Checking</Badge>
          ) : status?.connected ? (
            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] uppercase">Connected</Badge>
          ) : (
            <Badge variant="destructive" className="text-[10px] uppercase">Disconnected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-slate-600">
          {status?.connected
            ? "HMRC token is active for customs API access."
            : "No active HMRC token. Connect to enable live HMRC requests."}
        </p>

        {status?.connected && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p className="uppercase tracking-widest text-slate-400">Scope</p>
              <p className="font-medium text-slate-700 truncate">{status.scope ?? "default"}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p className="uppercase tracking-widest text-slate-400">Expires</p>
              <p className="font-medium text-slate-700">
                {status.expiresAt ? new Date(status.expiresAt).toLocaleTimeString() : "n/a"}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2">
          <Button asChild size="sm" className="h-9 text-xs font-semibold">
            <Link href={connectHref}>
              <IconRefresh className="h-3.5 w-3.5 mr-1.5" />
              {status?.connected ? "Reconnect HMRC" : "Connect HMRC"}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-9 text-xs font-semibold border-slate-200">
            <Link href={disconnectHref}>
              <IconLinkOff className="h-3.5 w-3.5 mr-1.5" />
              Disconnect
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
