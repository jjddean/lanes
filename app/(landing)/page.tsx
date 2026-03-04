export const dynamic = 'force-dynamic';

import HeroSection from "./hero-section";
import FeaturesOne from "./features-one";
import FAQs from "./faqs";
import Footer from "./footer";
import CustomClerkPricing from "@/components/custom-clerk-pricing";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesOne />
      <section id="pricing" className="bg-muted/50 py-16 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 mx-auto max-w-2xl space-y-6 text-center">
            <h1 className="text-center text-4xl font-semibold lg:text-5xl">Ready to grow your trade lane?</h1>
            <p>Join freight forwarders and exporters who are turning DCTS preferences into profit.</p>
            <p className="font-medium">Start Free Trial - No credit card required.</p>
          </div>
          <CustomClerkPricing />
        </div>
      </section>
      <section id="resources" className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-semibold md:text-4xl">Resources</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-5">DCTS Explained: A guide to the UK&apos;s scheme</div>
            <div className="rounded-xl border p-5">Rules of Origin Handbook</div>
            <div className="rounded-xl border p-5">Case Study: From Lagos to London</div>
            <div className="rounded-xl border p-5">Blog: Latest DCTS updates</div>
          </div>
        </div>
      </section>
      <FAQs />
      <Footer />
    </div>
  );
}
