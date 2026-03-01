"use client";

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import PixelCard from '@/components/react-bits/pixel-card'
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function CallToAction() {
    return (
        <section className="py-16 px-6">
            <div className=" mx-auto max-w-5xl rounded-3xl px-6 py-12 md:py-20 lg:py-32">
                <PixelCard variant="blue" className="w-full max-w-5xl h-auto aspect-[16/9]">
                    <div className="absolute text-center">
                        <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Ready to Scale Your Trade Network?</h2>
                        <p className="mt-4">Automate your entire lead generation and sales engagement pipeline with AI-powered intelligence.</p>

                        <div className="mt-12 flex flex-wrap justify-center gap-4">
                            <SignedIn>
                                <Button
                                    asChild
                                    size="lg">
                                    <Link href="/dashboard">
                                        <span>Go to Dashboard</span>
                                    </Link>
                                </Button>
                            </SignedIn>

                            <SignedOut>
                                <SignInButton mode="modal">
                                    <Button
                                        size="lg">
                                        <span>Get Started</span>
                                    </Button>
                                </SignInButton>
                            </SignedOut>

                            <Button
                                asChild
                                size="lg"
                                variant="outline">
                                <Link href="/">
                                    <span>Book Demo</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </PixelCard>
            </div>

        </section>
    )
}