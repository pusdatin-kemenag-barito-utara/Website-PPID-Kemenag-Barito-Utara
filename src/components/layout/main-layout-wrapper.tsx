"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AccessibilityWidget } from "@/components/ui/accessibility-widget";
import { LiveSupportWidget } from "@/components/layout/live-support-widget";
import { MaintenanceListener } from "@/components/providers/maintenance-listener";

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMaintenancePage = pathname === "/maintenance";

  if (isMaintenancePage) {
    return (
      <>
        <MaintenanceListener />
        <main className="flex-1">{children}</main>
      </>
    );
  }

  return (
    <>
      <MaintenanceListener />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <AccessibilityWidget />
      <LiveSupportWidget />
    </>
  );
}
