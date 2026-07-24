import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Sistem Sedang Pemeliharaan",
  },
  description: "Sistem sedang dalam perbaikan terpusat.",
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
