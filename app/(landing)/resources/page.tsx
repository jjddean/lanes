"use client";

import { HeroHeader } from "../header";
import Footer from "../footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, BookOpen, Zap, BarChart3 } from "lucide-react";

export default function ResourcesPage() {
  return (
    <>
      <HeroHeader />
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-36">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Resources & Guides
            </h1>
            <p className="text-muted-foreground mx-auto my-6 max-w-2xl text-xl">
              Learn how to optimize your trade strategy, scale your outreach, and maximize ROI with AI-powered automation.
            </p>
          </div>
        </section>

        {/* Quick Start */}
        <section className="py-16 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-3xl font-semibold mb-8">Getting Started</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <Zap className="size-8 text-primary mb-4" />
                  <CardTitle>Quick Start Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Set up your first campaign in 5 minutes. Connect your data, define your trade lane, and launch outreach.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/">Read Guide</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BookOpen className="size-8 text-primary mb-4" />
                  <CardTitle>API Documentation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Integrate Elite with your existing CRM, ERP, or freight management system via REST API.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/">View Docs</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Guides */}
        <section className="bg-muted/50 py-16 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-3xl font-semibold mb-8">Guides & Best Practices</h2>
            <div className="space-y-6">
              {[
                {
                  title: "Trade Lane Discovery: The Complete Playbook",
                  description: "Learn how to use HS code analysis, tariff data, and buyer profiling to identify hidden gem trade corridors.",
                  type: "Guide",
                  readTime: "8 min",
                  icon: FileText,
                },
                {
                  title: "Maximizing Deliverability: Warm-up & Rate Limiting Best Practices",
                  description: "Master IP warm-up, daily quotas, and sender reputation to ensure your messages reach inboxes.",
                  type: "Guide",
                  readTime: "6 min",
                  icon: Zap,
                },
                {
                  title: "AI Intent Detection: From Replies to Revenue",
                  description: "Understand how our intent classifier works and how to use it to prioritize hot leads.",
                  type: "Webinar",
                  readTime: "25 min",
                  icon: BarChart3,
                },
                {
                  title: "GDPR & Compliance in Cross-Border Outreach",
                  description: "Navigate data privacy, consent management, and sanction screening across regions.",
                  type: "Guide",
                  readTime: "10 min",
                  icon: FileText,
                },
                {
                  title: "Case Study: Global Freight Solutions 10x'd Lead Flow in 90 Days",
                  description: "Real-world results: How a mid-market forwarder scaled from 150 to 1,500 qualified leads monthly.",
                  type: "Case Study",
                  readTime: "5 min",
                  icon: BarChart3,
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Card key={idx} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Icon className="size-6 text-primary flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                              <p className="text-muted-foreground text-sm mt-2">{item.description}</p>
                            </div>
                            <Button variant="ghost" size="sm">
                              Read
                            </Button>
                          </div>
                          <div className="flex gap-3 mt-4">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                              {item.type}
                            </span>
                            <span className="text-xs text-muted-foreground">{item.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-3xl font-semibold mb-8">Common Questions</h2>
            <div className="space-y-6 max-w-3xl">
              {[
                {
                  q: "What data do I need to get started?",
                  a: "At minimum: company name, country, industry. We'll help you enrich with HS codes, contact info, and import/export history.",
                },
                {
                  q: "Can I integrate with my existing CRM?",
                  a: "Yes. We support direct integrations with Salesforce, HubSpot, and Pipedrive. For others, use our REST API or CSV import/export.",
                },
                {
                  q: "How long before I see results?",
                  a: "Most customers see first replies within 48-72 hours of launch. Average qualification rate improves by week 2-3.",
                },
                {
                  q: "What about compliance with local regulations?",
                  a: "We enforce GDPR, CCPA, and local privacy laws automatically. Every outreach includes unsubscribe links and opt-out respect.",
                },
                {
                  q: "Can I modify AI-generated messages?",
                  a: "Yes, fully customizable. Review, edit, or create custom templates before sending. AI always respects your brand voice.",
                },
              ].map((item, idx) => (
                <div key={idx} className="border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-3">{item.q}</h3>
                  <p className="text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="bg-primary/5 py-16 md:py-32 rounded-2xl mx-6 mb-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold mb-6">Need Help?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Our support team is here to help you optimize your campaigns and troubleshoot issues.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button asChild size="lg">
                <Link href="/">Contact Support</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/">View Status Page</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
