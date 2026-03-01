export default function FAQs() {
    return (
        <section className="scroll-py-16 py-16 md:scroll-py-32 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-y-12 px-2 lg:[grid-template-columns:1fr_auto]">
                    <div className="text-center lg:text-left">
                        <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
                            Frequently <br className="hidden lg:block" /> Asked <br className="hidden lg:block" />
                            Questions
                        </h2>
                        <p>Get answers about how Starter.diy transforms your trade operations.</p>
                    </div>

                    <div className="divide-y divide-dashed sm:mx-auto sm:max-w-lg lg:mx-0">
                        <div className="pb-6">
                            <h3 className="font-medium">How does the AI identify profitable trade opportunities?</h3>
                            <p className="text-muted-foreground mt-4">Our platform analyzes HS codes, trade lanes, tariff structures, and buyer profiles to identify high-opportunity markets. It scores potential deals based on tariff savings, market demand, and buyer capacity.</p>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">Which messaging channels are supported?</h3>
                            <p className="text-muted-foreground mt-4">WhatsApp, Email, and SMS. All messages are personalized with AI and respect local regulations. We handle warm-up protocols automatically to protect deliverability.</p>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">How are leads qualified?</h3>
                            <p className="text-muted-foreground my-4">The system analyzes incoming replies with AI intent detection (interested, question, objection, stop). Leads are automatically advanced through your pipeline based on engagement signals.</p>
                            <ul className="list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground">Respects STOP commands immediately</li>
                                <li className="text-muted-foreground">Auto-flags high-intent replies for your team</li>
                            </ul>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">Can I target specific trade lanes?</h3>
                            <p className="text-muted-foreground mt-4">Yes. You can filter by origin country, destination, HS codes, industry, and buyer type. Campaigns can be geoaligned with your supply chain priorities.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
