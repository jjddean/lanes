"use client";

import { HeroHeader } from "../header";
import Footer from "../footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <HeroHeader />
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-36">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              About Starter.diy
            </h1>
            <p className="text-muted-foreground mx-auto my-6 max-w-2xl text-xl">
              We're building the future of B2B trade automation—enabling freight forwarders, exporters, and logistics companies to compete globally with AI.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="bg-muted/50 py-16 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
                <p className="text-muted-foreground text-lg mb-4">
                  To democratize global trade by automating intelligent lead discovery and outreach for B2B logistics and freight companies.
                </p>
                <p className="text-muted-foreground text-lg">
                  We believe that smaller freight forwarders and export companies should have the same AI-powered tools as enterprise sales teams—enabling them to find, engage, and convert high-value trade opportunities faster.
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-semibold mb-6">Our Vision</h2>
                <p className="text-muted-foreground text-lg mb-4">
                  A world where trade barriers are lowered through smarter, faster connection between buyers and sellers across global corridors.
                </p>
                <p className="text-muted-foreground text-lg">
                  By embedding trade intelligence (HS codes, tariffs, market demand) directly into AI-driven outreach, we enable businesses to scale sustainably while creating economic opportunities across emerging markets.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-16 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-semibold mb-4">What We Do</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                We solve the biggest challenge in B2B trade: finding qualified buyers and shipping partners at scale.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "AI Trade Intelligence",
                  description: "Analyze HS codes, tariff structures, and trade lanes to identify high-margin opportunities.",
                  icon: "📊",
                },
                {
                  title: "Automated Outreach",
                  description: "Send hyper-personalized messages via WhatsApp, Email, and SMS powered by LLMs. ",
                  icon: "🤖",
                },
                {
                  title: "Intent Detection & Qualification",
                  description: "AI classifies incoming replies and auto-triggers smart follow-ups based on buyer intent.",
                  icon: "🎯",
                },
              ].map((item, idx) => (
                <div key={idx} className="border rounded-lg p-6">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why We Built This */}
        <section className="bg-muted/50 py-16 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-4xl font-semibold text-center mb-12">Why We Built This</h2>
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="flex gap-4">
                <CheckCircle2 className="flex-shrink-0 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">The Manual Cold-Call Problem</h3>
                  <p className="text-muted-foreground">
                    Freight sales teams were spending 80% of their time on research and outreach, with only 20% of conversations leading anywhere. It was unsustainable.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="flex-shrink-0 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Trade Intelligence Was Fragmented</h3>
                  <p className="text-muted-foreground">
                    Tariffs, HS codes, buyer profiles, and import/export data existed in silos. Nobody was connecting the dots to identify truly profitable trade corridors.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="flex-shrink-0 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Enterprise Tools Didn't Fit SMB Economics</h3>
                  <p className="text-muted-foreground">
                    Larger companies used expensive CRMs + sales engagement tools. Smaller freight companies couldn't afford them, so they stayed stuck in Excel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-4xl font-semibold text-center mb-12">Our Core Values</h2>
            <div className="grid gap-8 md:grid-cols-2">
              {[
                {
                  title: "Ethical AI First",
                  description: "We prioritize impact (job creation, poverty reduction) and compliance in every AI decision.",
                },
                {
                  title: "Intelligent Automation",
                  description: "Tools that augment human judgment, not replace it. Sales teams always control the final decision.",
                },
                {
                  title: "Global Inclusivity",
                  description: "Build for everyone—from solo exporters in emerging markets to global logistics firms.",
                },
                {
                  title: "Data Privacy & Compliance",
                  description: "We never ship data without explicit consent. GDPR, CCPA, and local regulations guide our architecture.",
                },
              ].map((value, idx) => (
                <div key={idx}>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-32">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-4xl font-semibold mb-6">Ready to Transform Your Trade Operations?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join dozens of freight forwarders and export companies already automating their lead generation.
            </p>
            <div className="flex items-center justify-center gap-4">
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
                    <span>Get Started Free</span>
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
