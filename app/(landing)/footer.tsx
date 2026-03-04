import Link from "next/link";
import { ChatMaxingIconColoured } from "@/components/logo";

export default function FooterSection() {
  return (
    <footer className="border-t py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex items-center gap-2">
          <ChatMaxingIconColoured />
          <span className="text-xl font-semibold">Elite</span>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Product</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/#features" className="hover:text-primary">Features</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-primary">How It Works</Link></li>
              <li><Link href="/#pricing" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="/#faq" className="hover:text-primary">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/#resources" className="hover:text-primary">DCTS Guide</Link></li>
              <li><Link href="/#resources" className="hover:text-primary">RoO Handbook</Link></li>
              <li><Link href="/#resources" className="hover:text-primary">Case Studies</Link></li>
              <li><Link href="/#resources" className="hover:text-primary">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-primary">About</Link></li>
              <li><Link href="/about" className="hover:text-primary">Contact</Link></li>
              <li><Link href="/about" className="hover:text-primary">Privacy</Link></li>
              <li><Link href="/about" className="hover:text-primary">Terms</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Connect</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-primary">LinkedIn</Link></li>
              <li><Link href="#" className="hover:text-primary">Twitter</Link></li>
              <li><Link href="mailto:info@elite.freightcode.co.uk" className="hover:text-primary">Email</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-6 text-sm text-muted-foreground">
          <p>© 2026 Elite. All rights reserved.</p>
          <p className="mt-2">
            Elite is a trade development platform. We do not provide legal or customs advice.
            Users should verify compliance with applicable regulations.
          </p>
        </div>
      </div>
    </footer>
  );
}
