import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

type Testimonial = {
    name: string
    role: string
    image: string
    quote: string
}

const testimonials: Testimonial[] = [
    {
        name: 'Sarah Chen',
        role: 'VP Sales, Global Freight Solutions',
        image: 'https://randomuser.me/api/portraits/women/1.jpg',
        quote: 'We went from 50 manual cold calls a week to 500 AI-qualified leads. The tariff intelligence alone saved us $40K in misdirected campaigns.',
    },
    {
        name: 'Rajesh Patel',
        role: 'Founder, ExportHub India',
        image: 'https://randomuser.me/api/portraits/men/6.jpg',
        quote: 'The HS code analysis gave us clarity on which trade lanes were actually profitable. Our close rate improved 12% in the first month.',
    },
    {
        name: 'Marco Antonio',
        role: 'Sales Director, Logistics Brasil',
        image: 'https://randomuser.me/api/portraits/men/7.jpg',
        quote: 'AI-powered follow-ups mean our team can focus on closing deals instead of chasing leads. Productivity is up 60% and burnout is down.',
    },
    {
        name: 'Lisa Wong',
        role: 'Operations Manager, Asia Trade Partners',
        image: 'https://randomuser.me/api/portraits/women/4.jpg',
        quote: "The intent detection feature is a game-changer. We're no longer wasting time on uninterested prospects and respecting STOP commands happens instantly.",
    },
    {
        name: 'Ahmed Hassan',
        role: 'Trade Manager, Middle East Exports',
        image: 'https://randomuser.me/api/portraits/men/2.jpg',
        quote: 'Multi-language support and local market knowledge built into the AI makes outreach feel native, not spammy. Response rates are significantly higher.',
    },
    {
        name: 'Elena Rodriguez',
        role: 'Growth Lead, Latin Trade Logistics',
        image: 'https://randomuser.me/api/portraits/women/6.jpg',
        quote: 'The compliance guardrails keep us aligned with regulations while the speed of automation is incredible. This is how B2B sales should work.',
    },
]

const chunkArray = (array: Testimonial[], chunkSize: number): Testimonial[][] => {
    const result: Testimonial[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize))
    }
    return result
}

const testimonialChunks = chunkArray(testimonials, Math.ceil(testimonials.length / 3))

export default function WallOfLoveSection() {
    return (
        <section>
            <div className="py-16 md:py-32">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center">
                        <h2 className="text-foreground text-4xl font-semibold">Loved by the Community</h2>
                        <p className="text-muted-foreground mb-12 mt-4 text-balance text-lg">Harum quae dolore orrupti aut temporibus ariatur.</p>
                    </div>
                    <div className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
                        {testimonialChunks.map((chunk, chunkIndex) => (
                            <div
                                key={chunkIndex}
                                className="space-y-3">
                                {chunk.map(({ name, role, quote, image }, index) => (
                                    <Card key={index}>
                                        <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6">
                                            <Avatar className="size-9">
                                                <AvatarImage
                                                    alt={name}
                                                    src={image}
                                                    loading="lazy"
                                                    width="120"
                                                    height="120"
                                                />
                                                <AvatarFallback>ST</AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <h3 className="font-medium">{name}</h3>

                                                <span className="text-muted-foreground block text-sm tracking-wide">{role}</span>

                                                <blockquote className="mt-3">
                                                    <p className="text-gray-700 dark:text-gray-300">{quote}</p>
                                                </blockquote>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
