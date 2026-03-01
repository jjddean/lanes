"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    IconSend,
    IconMessage,
    IconBrandWhatsapp,
    IconMail,
    IconPlus,
    IconSearch,
    IconDotsVertical,
    IconSparkles,
    IconUser,
    IconStar,
    IconX,
    IconArrowBackUp,
    IconArrowForwardUp,
    IconArrowLeft,
    IconArrowUpRight,
    IconArrowDownLeft
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
    IconArchive,
    IconClock,
    IconUserPlus,
    IconExternalLink,
    IconActivity
} from "@tabler/icons-react";

type ChannelType = "all" | "whatsapp" | "email" | "sms";

const MOCK_MESSAGES = [
    {
        _id: "mock-1",
        leadName: "McKinsey & Company",
        email: "logistics@mckinsey.com",
        content: "We're interested in the logistics automation proposal you sent over. Can we schedule a call for Tuesday?",
        channel: "email",
        intent: "interested",
        createdAt: Date.now() - 1000 * 60 * 60, // 1h ago
        status: "read"
    },
    {
        _id: "mock-2",
        leadName: "Flexport Asia",
        content: "How does your pricing compare to traditional Freight Forwarding software?",
        channel: "whatsapp",
        intent: "question",
        createdAt: Date.now() - 1000 * 60 * 30, // 30m ago
        status: "unread"
    },
];

import { toast } from "sonner";

function InboxPageContent() {
    const listConversations = useQuery(api.inbox.listConversations, {});
    const [selectedChannel, setSelectedChannel] = useState<ChannelType>("all");
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [isAiAssisting, setIsAiAssisting] = useState(false);
    const [composeRecipient, setComposeRecipient] = useState("");
    const [composeContent, setComposeContent] = useState("");
    const [composeChannel, setComposeChannel] = useState<"email" | "whatsapp" | "sms">("email");
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const sendMessage = useMutation(api.messages.sendManualMessage);
    const updateLeadStatus = useMutation(api.leads.updateLeadStatus);
    const snoozeLead = useMutation(api.leads.snoozeLead);
    const assignLead = useMutation(api.leads.assignLead);

    const workflows = useQuery(api.workflows.listActiveWorkflows);
    const agents = useQuery(api.users.listUsers);

    const thread = useQuery(api.inbox.getConversationThread, selectedLeadId ? { leadId: selectedLeadId as any } : "skip");

    const calculateNeedScore = (lead: any) => {
        if (!lead || !workflows || workflows.length === 0) return 0;
        const activeWorkflow = workflows[0];
        const target = activeWorkflow.targetProfile;

        let score = 50;
        if (lead.industry === target.industry) score += 30;
        if (lead.country === target.tradeLane || lead.laneOrigin === target.tradeLane) score += 20;

        return Math.min(100, score);
    };

    const generateAiDraft = (lead: any) => {
        if (!lead) return "";
        const score = calculateNeedScore(lead);
        if (score >= 80) {
            return `Hi ${lead.leadName}, based on your scaling activity on the ${lead.laneOrigin || lead.country} route, I've identified a margin opportunity through volume consolidation. Specifically, we can optimize your FCL transition. Would a comparison against your current setup be useful?`;
        }
        return `Hi ${lead.leadName}, I noticed your focus on the ${lead.laneOrigin || lead.country} trade. We are specialists in UK customs and last-mile for ${lead.industry}. I believe our infrastructure would perfectly complement your regional operations. Are you open to a partnership discussion?`;
    };

    const handleSendManual = async (recipient: string, content: string, channel: "email" | "whatsapp" | "sms", leadId?: string) => {
        if (!recipient || !content) {
            toast.error("Please fill in all fields");
            return;
        }
        setIsSending(true);
        try {
            await sendMessage({
                recipient: recipient,
                channel: channel as any,
                content: content,
                leadId: leadId as any
            });
            toast.success("Message enqueued successfully!");
            setIsComposeOpen(false);
            setComposeRecipient("");
            setComposeContent("");
            setReplyText("");
            setIsReplying(false);
            setIsAiAssisting(false);
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to enqueue message");
        } finally {
            setIsSending(false);
        }
    };

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (searchParams.get("compose") === "true") {
            setIsComposeOpen(true);
            const params = new URLSearchParams(searchParams.toString());
            params.delete("compose");
            router.replace(`/dashboard/inbox${params.toString() ? `?${params.toString()}` : ""}`);
        }
    }, [searchParams, router]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "auto" });
        }
    }, [thread, selectedLeadId, isReplying]);

    const allConversations = useMemo(() => {
        return listConversations || [];
    }, [listConversations]);

    const filteredConversations = allConversations.filter(r => {
        const matchesChannel = selectedChannel === "all" || r.channel === selectedChannel;
        const matchesSearch = r.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesChannel && matchesSearch;
    });

    const selectedConversation = allConversations.find((r) => r.leadId === selectedLeadId);

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case "whatsapp": return <IconBrandWhatsapp className="size-4 text-green-500" />;
            case "sms": return <IconMessage className="size-4 text-orange-500" />;
            default: return <IconMail className="size-4 text-slate-500" />;
        }
    };


    return (
        <TooltipProvider>
            <div className="flex h-full min-h-0 overflow-hidden bg-white">
                {/* 1. Conversations List */}
                {!selectedLeadId && (
                    <div className="w-full border-r flex flex-col bg-white animate-in fade-in duration-300">
                        <div className="p-6 border-b border-slate-100 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">Inbox</h2>
                                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">
                                        Autonomous Lane Communications Terminal
                                    </p>
                                </div>
                                <Button
                                    className="h-10 px-4 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold border border-slate-300 transition-all flex items-center gap-2 text-xs shadow-sm"
                                    onClick={() => setIsComposeOpen(true)}
                                >
                                    <IconPlus className="size-4 text-slate-600" />
                                    New Message
                                </Button>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="relative">
                                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                                    <Input
                                        placeholder="Search messages..."
                                        className="pl-9 bg-white border-border text-xs h-10 rounded-lg focus-visible:ring-slate-200 text-slate-900 placeholder:text-slate-500"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                                    {["all", "whatsapp", "email", "sms"].map((ch) => (
                                        <button
                                            key={ch}
                                            className={cn("px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all border",
                                                selectedChannel === ch
                                                    ? "bg-slate-900 border-slate-900 text-white"
                                                    : "border-transparent text-slate-500 hover:text-slate-900")}
                                            onClick={() => setSelectedChannel(ch as any)}
                                        >
                                            {ch}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <div className="flex flex-col">
                                {filteredConversations.map((conv) => (
                                    <div
                                        key={conv.leadId}
                                        className={cn(
                                            "px-6 py-5 border-b border-slate-50 cursor-pointer transition-all relative",
                                            selectedLeadId === conv.leadId ? "bg-slate-50/50" : "hover:bg-slate-50/30"
                                        )}
                                        onClick={() => {
                                            setSelectedLeadId(conv.leadId);
                                            setIsReplying(false);
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={cn("font-semibold text-sm tracking-tight", selectedLeadId === conv.leadId ? "text-slate-900" : "text-slate-800")}>
                                                {conv.leadName}
                                            </span>
                                            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-tight">
                                                {formatDistanceToNow(conv.createdAt).replace('about ', '')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 line-clamp-1 mb-2 font-medium flex items-center gap-2">
                                            {conv.type === "sent" ? (
                                                <IconArrowUpRight className="size-3 text-slate-400 shrink-0" />
                                            ) : (
                                                <IconArrowDownLeft className="size-3 text-blue-500 shrink-0" />
                                            )}
                                            {conv.content}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2 items-center">
                                                <div className={cn("size-2 rounded-full", conv.type === "sent" ? "bg-slate-300" : "bg-blue-500 animate-pulse")} />
                                                <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                                                    {conv.channel}
                                                </span>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] uppercase tracking-tighter px-1.5 h-4 bg-slate-50 border-slate-200">
                                                {conv.status || "sent"}
                                            </Badge>
                                        </div>
                                        {selectedLeadId === conv.leadId && (
                                            <div className={cn("absolute left-0 top-0 bottom-0 w-1",
                                                conv.channel === "whatsapp" ? "bg-green-600" :
                                                    conv.channel === "sms" ? "bg-orange-500" :
                                                        "bg-slate-900"
                                            )} />
                                        )}
                                    </div>
                                ))}
                                {filteredConversations.length === 0 && (
                                    <div className="text-center p-12 text-slate-400">
                                        <IconMessage className="mx-auto size-12 mb-3 opacity-10" />
                                        <p className="text-sm font-medium">No conversations found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Deep Chat View */}
                {selectedLeadId && (
                    <div className="flex-1 flex flex-col bg-white relative animate-in slide-in-from-right-2 duration-300">
                        {selectedConversation ? (
                            <>
                                <div className="h-20 px-8 border-b border-border flex justify-between items-center bg-white z-10 sticky top-0">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-10 rounded-lg hover:bg-muted text-muted-foreground transition-all"
                                            onClick={() => setSelectedLeadId(null)}
                                        >
                                            <IconArrowLeft className="size-5" />
                                        </Button>
                                        <div className="size-10 rounded-lg bg-muted text-slate-900 flex items-center justify-center font-bold text-sm border border-border">
                                            {selectedConversation.leadName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <h3 className="font-semibold text-slate-900 text-base leading-none">{selectedConversation.leadName}</h3>
                                                {selectedConversation.status === "archived" ? (
                                                    <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 text-[9px] uppercase font-bold h-4 px-1.5">Resolved</Badge>
                                                ) : selectedConversation.type === "sent" && selectedConversation.status === "delivered" ? (
                                                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] uppercase font-bold h-4 px-1.5">Snoozed</Badge>
                                                ) : (
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] uppercase font-bold h-4 px-1.5">Open</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                                                {getChannelIcon(selectedConversation.channel)}
                                                <span>{selectedConversation.channel} • Seattle, WA</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {!isReplying && (
                                            <>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-3 text-slate-500 hover:text-slate-900 font-semibold text-xs transition-all flex items-center gap-1.5"
                                                            onClick={() => setIsReplying(true)}
                                                        >
                                                            <IconArrowBackUp className="size-4" /> Reply
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Reply</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-3 text-slate-500 hover:text-indigo-600 font-semibold text-xs transition-all flex items-center gap-1.5"
                                                            onClick={() => { setIsReplying(true); setIsAiAssisting(true); }}
                                                        >
                                                            <IconSparkles className="size-4" /> AI Assistant
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>AI Draft</TooltipContent>
                                                </Tooltip>
                                            </>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-slate-400 hover:text-slate-900"
                                            onClick={() => setIsComposeOpen(true)}
                                        >
                                            <IconPlus className="size-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="size-8 text-slate-400 hover:text-slate-900"><IconStar className="size-4" /></Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8 text-slate-400 hover:text-slate-900">
                                                    <IconDotsVertical className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 shadow-xl p-1.5">
                                                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 py-2">Thread Management</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    className="rounded-lg gap-3 py-2.5 px-3 focus:bg-slate-50 cursor-pointer group"
                                                    onClick={async () => {
                                                        try {
                                                            await updateLeadStatus({ id: selectedLeadId as any, status: "archived" });
                                                            toast.success("Thread archived & resolved");
                                                        } catch (e) {
                                                            toast.error("Failed to archive thread");
                                                        }
                                                    }}
                                                >
                                                    <div className="p-1.5 bg-emerald-50 rounded-md group-hover:bg-emerald-100 transition-colors">
                                                        <IconArchive className="size-3.5 text-emerald-600" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-semibold text-slate-700">Resolve & Archive</span>
                                                        <span className="text-[9px] text-slate-400 font-medium leading-none">Mark as completed</span>
                                                    </div>
                                                </DropdownMenuItem>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger className="rounded-lg gap-3 py-2.5 px-3 focus:bg-slate-50 cursor-pointer group">
                                                        <div className="p-1.5 bg-amber-50 rounded-md group-hover:bg-amber-100 transition-colors">
                                                            <IconClock className="size-3.5 text-amber-600" />
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-xs font-semibold text-slate-700">Snooze Follow-up</span>
                                                            <span className="text-[9px] text-slate-400 font-medium leading-none">Remind me later</span>
                                                        </div>
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent className="rounded-xl p-1.5 border-slate-200 shadow-xl min-w-[120px]">
                                                        <DropdownMenuItem
                                                            className="rounded-lg text-xs font-medium py-2 px-3 focus:bg-slate-50 cursor-pointer"
                                                            onClick={() => snoozeLead({ id: selectedLeadId as any, hours: 24 }).then(() => toast.success("Snoozed for 24h"))}
                                                        >
                                                            For 24 Hours
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="rounded-lg text-xs font-medium py-2 px-3 focus:bg-slate-50 cursor-pointer"
                                                            onClick={() => snoozeLead({ id: selectedLeadId as any, hours: 48 }).then(() => toast.success("Snoozed for 48h"))}
                                                        >
                                                            For 48 Hours
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="rounded-lg text-xs font-medium py-2 px-3 focus:bg-slate-50 cursor-pointer"
                                                            onClick={() => snoozeLead({ id: selectedLeadId as any, hours: 24 * 7 }).then(() => toast.success("Snoozed for 1 week"))}
                                                        >
                                                            Next Week
                                                        </DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>

                                                <DropdownMenuSeparator className="my-1.5 bg-slate-100" />

                                                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 py-2">Collaboration</DropdownMenuLabel>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger className="rounded-lg gap-3 py-2.5 px-3 focus:bg-slate-50 cursor-pointer group">
                                                        <div className="p-1.5 bg-slate-50 rounded-md group-hover:bg-slate-100 transition-colors">
                                                            <IconUserPlus className="size-3.5 text-slate-600" />
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-xs font-semibold text-slate-700">Assign to Agent</span>
                                                            <span className="text-[9px] text-slate-400 font-medium leading-none">Designate team member</span>
                                                        </div>
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent className="rounded-xl p-1.5 border-slate-200 shadow-xl min-w-[180px]">
                                                        {agents?.map(agent => (
                                                            <DropdownMenuItem
                                                                key={agent._id}
                                                                className="rounded-lg text-xs font-medium py-2 px-3 focus:bg-slate-50 cursor-pointer flex items-center justify-between"
                                                                onClick={() => assignLead({ id: selectedLeadId as any, userId: agent._id }).then(() => toast.success(`Assigned to ${agent.name}`))}
                                                            >
                                                                {agent.name}
                                                                {agent.role === "admin" && <Badge variant="outline" className="text-[8px] py-0 h-3 leading-none opacity-50">Admin</Badge>}
                                                            </DropdownMenuItem>
                                                        ))}
                                                        {(!agents || agents.length === 0) && (
                                                            <div className="px-3 py-2 text-[10px] text-slate-400 italic">No agents found</div>
                                                        )}
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>

                                                <DropdownMenuSeparator className="my-1.5 bg-slate-100" />

                                                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 py-2">Engine Bridge</DropdownMenuLabel>
                                                <DropdownMenuItem className="rounded-lg gap-3 py-2.5 px-3 focus:bg-slate-50 cursor-pointer group">
                                                    <div className="p-1.5 bg-blue-50 rounded-md group-hover:bg-blue-100 transition-colors">
                                                        <IconActivity className="size-3.5 text-blue-600" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-semibold text-slate-700">Move to Lane</span>
                                                        <span className="text-[9px] text-slate-400 font-medium leading-none">Direct lane activation</span>
                                                    </div>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-lg gap-3 py-2.5 px-3 focus:bg-slate-50 cursor-pointer group">
                                                    <div className="p-1.5 bg-slate-50 rounded-md group-hover:bg-slate-100 transition-colors">
                                                        <IconExternalLink className="size-3.5 text-slate-600" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-semibold text-slate-700">View Lead DNA</span>
                                                        <span className="text-[9px] text-slate-400 font-medium leading-none">Full strategic profile</span>
                                                    </div>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <div className="pt-8 px-8 pb-6 flex flex-col gap-6 w-full h-full">
                                        {!thread ? (
                                            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div></div>
                                        ) : (
                                            thread.map((msg: any) => (
                                                <div key={msg._id} className="flex flex-col max-w-[85%] mr-auto items-start">
                                                    <div className="flex items-center gap-2 mb-1 px-1">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                                            {msg.type === "sent" ? "YOU" : selectedConversation.leadName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className={cn("p-4 rounded-2xl shadow-md text-sm leading-relaxed",
                                                        msg.type === "sent"
                                                            ? "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                                                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-none")}>
                                                        {msg.content}
                                                        {msg.type === "sent" && (
                                                            <div className="mt-1 flex justify-end">
                                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{msg.status}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}

                                        {isReplying && (
                                            <div className="animate-in slide-in-from-bottom-2 duration-300 mt-4">
                                                <div className="flex flex-col border border-border rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-slate-100 transition-all overflow-hidden">
                                                    {isAiAssisting && (
                                                        <div className="p-4 bg-muted border-b border-border flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-300">
                                                            <div className="flex items-center gap-3">
                                                                <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                                                    <IconSparkles className="size-4" />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-bold text-slate-900">AI Assistant</span>
                                                                    <span className="text-xs text-slate-500">Industry-specific draft engine</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 text-xs font-bold bg-white"
                                                                    onClick={() => {
                                                                        const prompt = generateAiDraft(selectedConversation);
                                                                        setReplyText(prompt);
                                                                        setIsAiAssisting(false);
                                                                        toast.success("AI draft applied.");
                                                                    }}
                                                                >
                                                                    Propose Strategy
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={() => setIsAiAssisting(false)}><IconX className="size-3" /></Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <textarea
                                                        autoFocus
                                                        placeholder={`Reply via ${selectedConversation?.channel || 'Direct'}...`}
                                                        className="w-full bg-transparent p-6 text-sm focus:outline-none min-h-[140px] resize-none leading-relaxed text-slate-900 placeholder:text-slate-500 font-medium"
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                    />
                                                    <div className="flex justify-between items-center p-4 bg-muted/30 border-t border-border">
                                                        <div className="flex gap-1">
                                                            <Button variant="ghost" size="icon" className="size-9" onClick={() => { setIsReplying(false); setIsAiAssisting(false); }}><IconX className="size-4" /></Button>
                                                            <Button variant="ghost" size="icon" className={cn("size-9", isAiAssisting ? "text-indigo-600 bg-indigo-50" : "text-muted-foreground")} onClick={() => setIsAiAssisting(!isAiAssisting)}><IconSparkles className="size-4" /></Button>
                                                        </div>
                                                        <Button
                                                            disabled={isSending}
                                                            className="bg-slate-200 text-slate-900 font-bold px-8 h-12 rounded-lg border border-slate-300 hover:bg-slate-300 transition-all active:scale-95 shadow-sm"
                                                            onClick={() => handleSendManual(
                                                                selectedConversation?.email || selectedConversation?.whatsapp || "",
                                                                replyText,
                                                                (selectedConversation?.channel as any) || "email",
                                                                selectedConversation?.leadId
                                                            )}
                                                        >
                                                            {isSending ? "Sending..." : <><IconSend className="size-4 mr-2" /> Send Message</>}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={scrollRef} />
                                    </div>
                                </div>

                                {!isReplying && (
                                    <div className="py-2.5 px-8 flex justify-start gap-2 border-t bg-white shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-4 rounded-lg border-slate-200 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
                                            onClick={() => setIsReplying(true)}
                                        >
                                            <IconArrowBackUp className="size-4" /> Reply
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-4 rounded-lg border-slate-200 bg-white text-slate-400 font-semibold text-xs flex items-center gap-2 transition-all opacity-50 cursor-not-allowed"
                                        >
                                            <IconArrowForwardUp className="size-4" /> Forward
                                        </Button>
                                    </div>
                                )}

                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/10 text-center">
                                <IconMessage className="size-10 text-secondary opacity-20 mb-4" />
                                <h3 className="text-xl font-bold text-secondary mb-2">Select a Thread</h3>
                            </div>
                        )}
                    </div>
                )}


                {isComposeOpen && (
                    <Sheet open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                        <SheetContent side="right" className="sm:max-w-[540px] p-0 flex flex-col bg-white border-l border-slate-200 shadow-2xl animate-in slide-in-from-right duration-500">
                            <SheetHeader className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <SheetTitle className="text-xl font-bold text-slate-900">New Message</SheetTitle>
                                    <SheetDescription className="text-xs text-slate-500">Send a manual message via Email or WhatsApp.</SheetDescription>
                                </div>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Channel</label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={composeChannel === "email" ? "default" : "outline"}
                                            className={cn("flex-1 h-12 rounded-lg text-xs font-bold transition-all", composeChannel === "email" ? "bg-slate-900 text-white" : "border-slate-200 text-slate-600")}
                                            onClick={() => setComposeChannel("email")}
                                        >
                                            <IconMail className="size-4 mr-2" /> Email
                                        </Button>
                                        <Button
                                            variant={composeChannel === "whatsapp" ? "default" : "outline"}
                                            className={cn("flex-1 h-12 rounded-xl text-xs font-bold transition-all", composeChannel === "whatsapp" ? "bg-green-500 hover:bg-green-600 text-white border-transparent" : "border-slate-200 text-slate-600")}
                                            onClick={() => setComposeChannel("whatsapp")}
                                        >
                                            <IconBrandWhatsapp className="size-4 mr-2" /> WhatsApp
                                        </Button>
                                        <Button
                                            variant={composeChannel === "sms" ? "default" : "outline"}
                                            className={cn("flex-1 h-12 rounded-xl text-xs font-bold transition-all", composeChannel === "sms" ? "bg-orange-500 hover:bg-orange-600 text-white border-transparent" : "border-slate-200 text-slate-600")}
                                            onClick={() => setComposeChannel("sms")}
                                        >
                                            <IconMessage className="size-4 mr-2" /> SMS
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">To</label>
                                    <div className="relative">
                                        <Input
                                            placeholder={composeChannel === "email" ? "Lead Email (Required)" : "Phone Number (e.g. +123...)"}
                                            value={composeRecipient}
                                            onChange={(e) => setComposeRecipient(e.target.value)}
                                            className="bg-white border-slate-200 h-12 text-sm focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all rounded-xl pl-4 text-slate-900 placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Message</label>
                                    <textarea
                                        placeholder="Type your message here..."
                                        value={composeContent}
                                        onChange={(e) => setComposeContent(e.target.value)}
                                        className="w-full min-h-[200px] bg-white rounded-xl border border-slate-200 p-5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all resize-none leading-relaxed text-slate-900 placeholder:text-slate-500 shadow-sm font-medium"
                                    />
                                </div>

                                <div className="p-6 rounded-2xl bg-muted/30 border border-slate-100 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <IconSparkles className="size-4" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-900">AI Optimization Active</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                        Your message will be automatically optimized for engagement based on the recipient's profile and historical interactions.
                                    </p>
                                </div>
                            </div>

                            <SheetFooter className="p-6 border-t border-slate-100 bg-white flex flex-row gap-2 sm:justify-end">
                                <Button
                                    variant="outline"
                                    className="h-10 px-6 rounded-lg border-slate-200 font-bold text-slate-900 bg-white hover:bg-slate-50 transition-all flex-1 sm:flex-none text-xs shadow-sm"
                                    onClick={() => setIsComposeOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={isSending}
                                    className="h-10 px-8 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold border border-slate-300 transition-all flex items-center gap-2 flex-1 sm:flex-none text-xs shadow-sm disabled:opacity-50"
                                    onClick={() => handleSendManual(composeRecipient, composeContent, composeChannel)}
                                >
                                    {isSending ? "Sending..." : <><IconSend className="size-3.5 text-slate-600" /> Send Message</>}
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                )}

            </div>
        </TooltipProvider >
    );
}

export default function InboxPage() {
    return (
        <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-slate-500">Loading inbox...</div>}>
            <InboxPageContent />
        </Suspense>
    );
}
