"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const org = useQuery(api.organizations.getMyOrganization);
    const { isLoaded, isSignedIn } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoaded && isSignedIn && org !== undefined) {
            // User is signed in and data is loaded
            const needsOnboarding = !org || org.onboardingStep < 3;

            if (needsOnboarding && pathname !== "/onboarding") {
                router.push("/onboarding");
            } else if (!needsOnboarding && pathname === "/onboarding") {
                router.push("/dashboard");
            }
        }
    }, [org, isLoaded, isSignedIn, pathname, router]);

    // Show loading while we determine state
    if (!isLoaded || (isSignedIn && org === undefined)) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    // If we're on a path that requires onboarding but it hasn't been done
    if (isSignedIn && (!org || org.onboardingStep < 3) && pathname !== "/onboarding") {
        return null;
    }

    return <>{children}</>;
}
