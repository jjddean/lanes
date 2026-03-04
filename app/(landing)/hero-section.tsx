"use client";

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { HeroHeader } from "./header"
import { Sparkle } from 'lucide-react'
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main>
                <section className="">
                    <div className="py-20 md:py-36">
                        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
                            <div>
                                <Link
                                    href="/"
                                    className="hover:bg-foreground/5 mx-auto flex w-fit items-center justify-center gap-2 rounded-md py-0.5 pl-1 pr-3 transition-colors duration-150">
                                    <div
                                        aria-hidden
                                        className="border-background bg-linear-to-b dark:inset-shadow-2xs to-foreground from-primary relative flex size-5 items-center justify-center rounded border shadow-md shadow-black/20 ring-1 ring-black/10">
                                        <div className="absolute inset-x-0 inset-y-1.5 border-y border-dotted border-white/25"></div>
                                        <div className="absolute inset-x-1.5 inset-y-0 border-x border-dotted border-white/25"></div>
                                        <Sparkle className="size-3 fill-background stroke-background drop-shadow" />
                                    </div>
                                    <span className="font-medium">UK DCTS Trade Platform</span>
                                </Link>
                                <h1 className="mx-auto mt-8 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">Turn UK trade policy into your pipeline.</h1>
                                <p className="text-muted-foreground mx-auto my-6 max-w-3xl text-balance text-xl">Elite is the first trade development platform built for the UK&apos;s Developing Countries Trading Scheme (DCTS). We help freight forwarders and DCTS-eligible exporters discover high-value trade opportunities, verify compliance, and connect with the right partners automatically.</p>

                                <div className="flex items-center justify-center gap-3">
                                    <SignedIn>
                                        <Button asChild size="lg">
                                            <Link href="/dashboard">
                                                <span className="text-nowrap">Open Dashboard</span>
                                            </Link>
                                        </Button>
                                    </SignedIn>
                                    <SignedOut>
                                        <SignUpButton mode="modal">
                                            <Button size="lg">
                                                <span className="text-nowrap">Start Free Trial</span>
                                            </Button>
                                        </SignUpButton>
                                    </SignedOut>

                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline">
                                        <Link href="#how-it-works">
                                            <span className="text-nowrap">See How It Works</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative z-10 mx-auto max-w-5xl px-6">
                                <div className="mt-12 md:mt-16">
                                    <div className="bg-background rounded-(--radius) relative mx-auto overflow-hidden border border-transparent shadow-lg shadow-black/10 ring-1 ring-black/10">
                                        <Image
                                            src="/hero-section-main-app-dark.png"
                                            alt="app screen"
                                            width={2880}
                                            height={1842}
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
