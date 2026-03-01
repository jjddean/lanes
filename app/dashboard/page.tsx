"use client"

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconUsers, IconMessage, IconArrowUpRight, IconTrendingUp, IconBriefcase } from "@tabler/icons-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { PipelineTracker } from "@/components/PipelineTracker";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const leads = useQuery(api.leads.listLeads, {});
  const events = useQuery(api.events.listEvents, { limit: 10 });

  const getEventIcon = (type: string) => {
    switch (type) {
      case "target_selected": return <IconUsers className="size-3 text-blue-500" />;
      case "msg_generated": return <IconMessage className="size-3 text-purple-500" />;
      case "msg_sent": return <IconArrowUpRight className="size-3 text-green-500" />;
      case "reply_received": return <IconMessage className="size-3 text-orange-500" />;
      case "intent_predicted": return <IconTrendingUp className="size-3 text-pink-500" />;
      case "deal_stage_changed": return <IconBriefcase className="size-3 text-cyan-500" />;
      default: return <IconMessage className="size-3 text-slate-500" />;
    }
  };

  const getEventText = (event: any) => {
    switch (event.type) {
      case "target_selected": return "Lane discovery found target";
      case "msg_generated": return "AI synthesized lane intro";
      case "msg_sent": return "Message propelled to queue";
      case "reply_received": return "Inter-lane response detected";
      case "intent_predicted": return "AI classified intent";
      case "deal_stage_changed": return "Strategic win captured";
      default: return "Engine activity detected";
    }
  };

  const stats = [
    {
      title: "Active Lanes",
      value: leads?.length || 0,
      icon: IconUsers,
      trend: "+12.5%",
      color: "text-cyan-500"
    },
    {
      title: "Active Messages",
      value: leads?.filter(l => l.status === "contacted").length || 0,
      icon: IconMessage,
      trend: "+8.2%",
      color: "text-purple-500"
    },
    {
      title: "Reply Rate",
      value: leads?.length ? `${Math.round((leads.filter(l => l.status === "replied").length / leads.length) * 100)}%` : "0%",
      icon: IconTrendingUp,
      trend: "+4.1%",
      color: "text-green-500"
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">Command Center</h1>
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">
          Real-time lane orchestration and autonomous growth analytics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <span className="text-green-500 font-medium flex items-center">
                  {stat.trend} <IconArrowUpRight className="size-3" />
                </span>
                vs last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Lane Velocity</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <PipelineTracker />

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>AI Activity Stream</CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono animate-pulse">LIVE</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {events?.map((event) => (
                <div key={event._id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-1.5 font-mono text-[10px]">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{getEventText(event)}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(event.createdAt)} ago
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] uppercase">{event.type.replace("_", " ")}</Badge>
                </div>
              ))}
              {(!events || events.length === 0) && (
                <div className="py-8 text-center text-sm text-muted-foreground italic">
                  Waiting for engine activity...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const mockData = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 500 },
  { name: 'Thu', value: 280 },
  { name: 'Fri', value: 590 },
  { name: 'Sat', value: 320 },
  { name: 'Sun', value: 440 },
];
