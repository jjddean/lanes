import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BadgePoundSterling,
  FileCheck2,
  FileText,
  Handshake,
  Network,
  ShieldCheck,
} from "lucide-react";

export default function FeaturesOne() {
  return (
    <section id="features" className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 space-y-16">
        <div className="space-y-6 rounded-3xl border p-8 md:p-10">
          <h2 className="text-3xl font-semibold md:text-4xl">The Opportunity</h2>
          <div className="grid gap-3 text-lg">
            <p>65 developing countries now have preferential access to the UK.</p>
            <p>Pounds billions in tariff savings are waiting to be claimed.</p>
            <p>One platform bridges the gap.</p>
          </div>
          <p className="text-muted-foreground text-lg">
            The UK&apos;s DCTS offers unprecedented trade advantages to 65 nations. Yet most exporters
            don&apos;t know they qualify, and most importers don&apos;t know where to look.
          </p>
          <p className="text-muted-foreground text-lg">
            Elite changes that. We combine real-time HMRC customs data with deep DCTS intelligence
            to surface opportunities others miss and help you act on them.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-semibold md:text-4xl">Key Capabilities</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <BadgePoundSterling className="size-6 text-primary" />
                <CardTitle>DCTS Eligibility Engine</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Instantly know if a product qualifies for duty-free access. See exact tariff savings by HS code, plus any graduation warnings.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <ShieldCheck className="size-6 text-primary" />
                <CardTitle>Rules of Origin Simulator</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Verify value-added thresholds, cumulation rules, and substantial transformation before you ship.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Handshake className="size-6 text-primary" />
                <CardTitle>Partner Matching</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Match UK importers with DCTS exporters using actual trade flows, HS code overlap, and compliance status.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <FileText className="size-6 text-primary" />
                <CardTitle>Compliance Document Generator</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Auto-fill Form A, EUR.1, and origin declarations in one click. Export-ready paperwork in minutes.
              </CardContent>
            </Card>
            <Card className="md:col-span-2 lg:col-span-2">
              <CardHeader>
                <Network className="size-6 text-primary" />
                <CardTitle>HMRC Integration</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Securely connect your HMRC account to pull real customs declarations and preference usage with personalized trade intelligence.
              </CardContent>
            </Card>
          </div>
        </div>

        <div id="how-it-works" className="space-y-6">
          <h2 className="text-3xl font-semibold md:text-4xl">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>1. Discover</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Configure your Trade DNA (target countries, industries, buyer personas). We scan HMRC data and DCTS catalogs to find qualified leads, including untapped markets with zero UK imports.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>2. Verify</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Run the Origin Simulator to ensure products meet DCTS rules. Check eligibility, calculate savings, and avoid customs surprises.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>3. Connect</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Get matched with compatible partners. Review AI-drafted consultative messages that highlight tariff advantages, then send via WhatsApp or email and track replies.
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>For UK Freight Forwarders and Importers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-medium">Stop chasing rates. Start securing partnerships.</p>
              <p className="text-muted-foreground">
                You know the UK market. You know the customs landscape. Now find reliable DCTS exporters who actually need your expertise, verified by real trade data.
              </p>
              <blockquote className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                &quot;We identified a Nigerian cashew exporter through Elite, verified their DCTS eligibility, and closed a 45k pound contract within three weeks.&quot;
                <div className="mt-2 font-medium text-foreground">Senior Trade Manager, UK forwarder</div>
              </blockquote>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>For DCTS Exporters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-medium">Your goods qualify for preference. Does your UK partner know?</p>
              <p className="text-muted-foreground">
                You manufacture quality products. Your country enjoys preferential UK tariffs. We introduce you to serious importers actively seeking your goods and help prove compliance automatically.
              </p>
              <blockquote className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                &quot;We knew Bangladesh garments had duty-free access, but we didn&apos;t know how to find serious UK buyers. Elite matched us with two importers in our first month.&quot;
                <div className="mt-2 font-medium text-foreground">Export Director, Dhaka-based manufacturer</div>
              </blockquote>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-semibold md:text-4xl">The Elite Difference</h2>
          <div className="overflow-hidden rounded-2xl border">
            <div className="grid grid-cols-2 bg-muted/40 text-sm font-semibold">
              <div className="border-r p-4">Traditional Tools</div>
              <div className="p-4">Elite</div>
            </div>
            <div className="grid grid-cols-2 text-sm">
              <div className="border-r border-t p-4 text-muted-foreground">Lead lists you still have to research</div>
              <div className="border-t p-4">Qualified partners with compliance pre-checked</div>
              <div className="border-r border-t p-4 text-muted-foreground">Generic email templates</div>
              <div className="border-t p-4">Data-backed, consultative AI drafts</div>
              <div className="border-r border-t p-4 text-muted-foreground">No visibility into tariff preference</div>
              <div className="border-t p-4">Full DCTS eligibility and origin simulation</div>
              <div className="border-r border-t p-4 text-muted-foreground">You guess. You spam. You hope.</div>
              <div className="border-t p-4">We verify. We match. You close.</div>
            </div>
          </div>
          <p className="text-muted-foreground">
            We do not compete with forwarders. We enable them to become trade development partners.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-semibold md:text-4xl">By the Numbers</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">65</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">DCTS countries with preference tiers</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">80,000+</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">Companies identified from HMRC data</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">185k+</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">Pipeline value captured by beta users</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Real-time</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">Customs declarations via HMRC API</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
