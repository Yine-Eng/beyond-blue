import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { requirePlan } from "@/lib/auth/session";
import Loading from "./loading";

/** Signed in and onboarded, or redirected to sign-in / onboarding. Streams behind Suspense. */
async function PlanGate({ children }: { children: ReactNode }) {
  await requirePlan();
  return children;
}

// Toasts and tooltips are app-only, so the public story site doesn't ship them.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <TooltipProvider>
      <AppShell>
        <Suspense fallback={<Loading />}>
          <PlanGate>{children}</PlanGate>
        </Suspense>
      </AppShell>
      <Toaster />
    </TooltipProvider>
  );
}
