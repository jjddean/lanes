"use client";

import { HeroHeader } from "../header";
import Footer from "../footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ArrowRight, Target, BarChart3, Users, MessageSquare, TrendingUp, Lock } from "lucide-react";

export default function SolutionsPage() {
  return (
    <>
      <HeroHeader />
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-36">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Solutions Built for Trade Companies
            </h1>
            <p className="text-muted-foreground mx-auto my-6 max-w-2xl text-xl">
              Whether you're scaling trade lanes, expanding to new markets, or maximizing margins—we have a solution.
            </p>
          </div>
        </section>

        {/* Primary Solutions */}
        <section className="py-16 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Solution 1: Trade Lane Discovery */}
              <div className="border rounded-2xl overflow-hidden bg-muted/30">
                <div className="p-6 bg-primary/10 border-b">
                  <Target className="size-12 text-primary mb-4" />
                  <h3 className="text-2xl font-semibold">Trade Lane Discovery</h3>
                  <p className="text-muted-foreground mt-2 text-sm">For companies that want to identify new markets and shipping corridors.</p>
                </div>
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-primary mt-0.5">✓</div>
                      <div>
                        <p className="font-medium">AI-Powered Market Analysis</p>
                        <p className="text-sm text-muted-foreground">Analyze tariff landscapes and identify high-margin corridors automatically.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-primary mt-0.5">✓</div>
                      <div>
                        <p className="font-medium">HS Code Intelligence</p>
                        <p className="text-sm text-muted-foreground">Understand commodity-specific duties, preferential rates, and trade agreements.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-primary mt-0.5">✓</div>
                      <div>
                        <p className="font-medium">Buyer Identification</p>
                        <p className="text-sm text-muted-foreground">Target companies actively importing/exporting in your lanes of interest.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-primary mt-0.5">✓</div>
                      <div>
                        <p className="font-medium">Competitive Positioning</p>
                        <p className="text-sm text-muted-foreground">Understand which partners are already operating in your target lanes.</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">Best for: Freight forwarders expanding into new regions or commodities.</p>
                </div>
              </div>

              {/* Solution 2: Automated Outreach */}
              <div className="border rounded-2xl overflow-hidden bg-muted/30">
                <div className="p-6 bg-primary/10 border-b">
                  <MessageSquare className="size-12 text-primary mb-4" />
                  <h3 className="text-2xl font-semibold">Automated Outreach</h3>
                  <p className="text-muted-foreground mt-2 text-sm">For teams that need to engage hundreds of leads at scale without losing personalization.</p>
                </div>
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-primary mt-0.5">✓</div>
                      <div>
                        <p className="font-medium">AI-Generated Messages</p>
                        <p className="text-sm text-muted-foreground">LLM-crafted outreach that references specific trade lanes, tariffs, and buyer needs.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-primary mt-0.5">✓</div>
                      <div>
                        <p className="font-medium">Multi-Channel Dispatch</p>
                        <p className="text-sm text-muted-foreground">Send via WhatsApp, Email, SMS with automatic channel selection based on availability.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-primary mt-0.5">✓</div>
                      <div>
                        <p className="font-medium">Warm-up & Rate Limiting</p>
                        <p className="text-sm text-muted-foreground">Automatic IP/account warm-up and daily quotas to protect sender reputation.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-primary mt-0.5">✓</div>
                      <div>
                        <p className="font-medium">Message Tracking & Analytics</p>
                        <p className="text-sm text-muted-foreground">Real-time delivery, read, and engagement metrics per campaign.</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">Best for: Sales teams managing 100s-1000s of outbound messages.</p>
                </div>
              </div>

              {/* Solution 3: Intent-Based Lead Qualification */}
              <div className="border rounded-2xl overflow-hidden bg-muted/30">
                <div className="p-6 bg-primary/10 border-b">
                  <TrendingUp className="size-12 text-primary mb-4" />
                  <h3 className="text-2xl font-semibold">Intent-Based Qualification</h3>
                  <p className="text-muted-foreground mt-2 text-sm">For teams that want AI to pre-qualify leads before handoff to sales.</p>
                </div>
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-primary mt-0.5">✓</div>
                      <div>
                        <p className="font-medium">AI Intent Detection</p>
                        <p className="text-sm text-muted-foreground">Classify replies as Interested, Question, Objection, or Stop with high confidence.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-primary mt-0.5">✓</div>
                      <div>
                        <p className="font-medium">Automatic STOP Compliance</p>
                        <p className="text-sm text-muted-foreground">Instantly unsubscribe and halt all messaging when opt-outs are detected.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-primary mt-0.5">✓</div>
                      <div>
                        <p className="font-medium">Smart Follow-up Sequencing</p>
                        <p className="text-sm text-muted-foreground">Auto-trigger contextual follow-ups based on buyer signals (not just time).</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-primary mt-0.5">✓</div>
                      <div>
                        <p className="font-medium">Pipeline Advancement</p>
                        <p className="text-sm text-muted-foreground">Leads automatically move through stages (new → contacted → qualified) based on AI analysis.</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">Best for: Teams using deal tracking and sales pipelines.</p>
                </div>
              </div>

              {/* Solution 4: Multi-Market Campaigns */}
              <div className="border rounded-2xl overflow-hidden bg-muted/30">
                <div className="p-6 bg-primary/10 border-b">
                  <BarChart3 className="size-12 text-primary mb-4" />
                  <h3 className="text-2xl font-semibold">Multi-Market Campaigns</h3>
                  <p className="text-muted-foreground mt-2 text-sm">For enterprises managing campaigns across multiple trade lanes and geographies.</p>
                </div>
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-primary mt-0.5">✓</div>
                      <div>
                        <p className="font-medium">Lane-Specific Strategies</p>
                        <p className="text-sm text-muted-foreground">Define distinct workflows for different corridors (e.g., Asia-US vs. EU-Africa).</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-primary mt-0.5">✓</div>
                      <div>
                        <p className="font-medium">Daily Quotas & Throttling</p>
                        <p className="text-sm text-muted-foreground">Control send volumes per market to maximize reputation and deliverability.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-primary mt-0.5">✓</div>
                      <div>
                        <p className="font-medium">Performance Benchmarking</p>
                        <p className="text-sm text-muted-foreground">Compare open rates, response rates, and close rates across markets.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-primary mt-0.5">✓</div>
                      <div>
                        <p className="font-medium">Team Collaboration</p>
                        <p className="text-sm text-muted-foreground">Assign leads by market, region, or commodity—keep your team aligned.</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">Best for: Multi-location freight companies or brokers.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="bg-muted/50 py-16 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-4xl font-semibold text-center mb-12">Who Benefits Most</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  role: "Freight Forwarders",
                  use: "Automated lead gen across multiple trade lanes to fill capacity utilization.",
                },
                {
                  role: "Export Compliance Teams",
                  use: "Outreach that respects DCTS rules, tariff thresholds, and license restrictions.",
                },
                {
                  role: "Customs Brokers",
                  use: "Identify importers/exporters and pitch compliance+clearance services.",
                },
                {
                  role: "Trade Finance Companies",
                  use: "Target high-volume shippers for working capital and L/C solutions.",
                },
                {
                  role: "Freight Tech Platforms",
                  use: "White-label lane discovery and outreach as a partner offering.",
                },
                {
                  role: "Supply Chain Consultants",
                  use: "Identify sourcing opportunities and optimization prospects for clients.",
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-background border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-2">{item.role}</h3>
                  <p className="text-muted-foreground text-sm">{item.use}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security & Compliance */}
        <section className="py-16 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-4xl font-semibold text-center mb-12">Enterprise Security & Compliance</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <Lock className="size-8 text-primary mb-4" />
                  <CardTitle>Data Privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground text-sm">GDPR and CCPA compliant. No personal data is shared without explicit consent.</p>
                  <p className="text-muted-foreground text-sm">Data is encrypted in transit and at rest. Backups are automated and geographically distributed.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Lock className="size-8 text-primary mb-4" />
                  <CardTitle>Compliance Guardrails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground text-sm">Built-in DCTS impact scoring ensures ethical outreach that prioritizes poverty reduction and job creation.</p>
                  <p className="text-muted-foreground text-sm">No messaging to sanctioned entities. Automatic screening against restricted party lists.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-32 bg-primary/5 rounded-2xl mx-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-semibold mb-6">Ready to Transform Your Trade Operations?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Start with a free trial and see how Starter.diy can automate your lead generation in minutes.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <SignedIn>
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    <span>Go to Dashboard</span>
                  </Link>
                </Button>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="lg">
                    <span>Start Free Trial</span>
                  </Button>
                </SignInButton>
              </SignedOut>
              <Button asChild size="lg" variant="outline">
                <Link href="/">
                  <span>Back Home</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
