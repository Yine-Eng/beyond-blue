import { AppShell } from "@/components/app-shell/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Toasts and tooltips are app-only, so the public story site doesn't ship them.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <TooltipProvider>
      <AppShell>{children}</AppShell>
      <Toaster />
    </TooltipProvider>
  );
}
