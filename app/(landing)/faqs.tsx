export default function FAQs() {
    return (
        <section id="faq" className="scroll-py-16 py-16 md:scroll-py-32 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-y-12 px-2 lg:[grid-template-columns:1fr_auto]">
                    <div className="text-center lg:text-left">
                        <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
                            Frequently <br className="hidden lg:block" /> Asked <br className="hidden lg:block" />
                            Questions
                        </h2>
                        <p>Answers about DCTS workflows, onboarding, and compliance checks.</p>
                    </div>

                    <div className="divide-y divide-dashed sm:mx-auto sm:max-w-lg lg:mx-0">
                        <div className="pb-6">
                            <h3 className="font-medium">What does the free trial include?</h3>
                            <p className="text-muted-foreground mt-4">You can set Trade DNA, run lead discovery, and test free-tier compliance checks before upgrading.</p>

                            <ol className="list-outside list-decimal space-y-2 pl-4">
                                <li className="text-muted-foreground mt-4">Configure target countries, industries, and buyer persona.</li>
                                <li className="text-muted-foreground mt-4">Connect HMRC for customs-backed discovery.</li>
                                <li className="text-muted-foreground mt-4">Run checks and launch outreach from one workspace.</li>
                            </ol>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">Do you provide legal or customs advice?</h3>
                            <p className="text-muted-foreground mt-4">No. Elite is a trade development platform. Users should verify compliance with applicable regulations.</p>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">Can we upgrade plans later?</h3>
                            <p className="text-muted-foreground my-4">Yes. Upgrade when you need deeper eligibility outputs, origin simulation detail, and higher usage limits.</p>
                            <ul className="list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground">Upgrade unlocks additional compliance and automation depth.</li>
                                <li className="text-muted-foreground">Changes apply immediately to your workspace.</li>
                            </ul>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">Who is this platform built for?</h3>
                            <p className="text-muted-foreground mt-4">Elite is built for UK freight forwarders, importers, and DCTS-eligible exporters looking to grow compliant trade lanes.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
