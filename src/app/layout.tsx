import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MainLayoutWrapper } from "@/components/layout/main-layout-wrapper";

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});



const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ppid-baritoutara.kemenag.go.id";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PPID Kemenag Kabupaten Barito Utara - Portal Pelayanan Informasi Publik",
    template: "%s | PPID Kemenag Barito Utara",
  },
  description: "Portal resmi Pejabat Pengelola Informasi dan Dokumentasi (PPID) Kantor Kementerian Agama Kabupaten Barito Utara. Menyediakan permohonan informasi publik online, daftar dokumen berkala, regulasi, dan laporan kinerja.",
  keywords: [
    "PPID",
    "PPID Kemenag",
    "Kemenag Barito Utara",
    "Kementerian Agama Barito Utara",
    "Layanan Informasi Publik",
    "Permohonan Informasi Online",
    "Muara Teweh",
    "Kalteng",
    "Regulasi PPID",
    "Informasi Berkala"
  ],
  authors: [{ name: "PPID Kemenag Kabupaten Barito Utara" }],
  creator: "PPID Kemenag Kabupaten Barito Utara",
  publisher: "Kementerian Agama Republik Indonesia",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    title: "PPID Kemenag Kabupaten Barito Utara - Portal Informasi Publik",
    description: "Portal resmi pelayanan informasi publik terpadu Kemenag Barito Utara. Wujudkan keterbukaan informasi untuk pelayanan umat.",
    siteName: "PPID Kemenag Barito Utara",
    images: [
      {
        url: "/logo-kemenag.svg",
        width: 800,
        height: 600,
        alt: "Logo PPID Kemenag Barito Utara",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PPID Kemenag Barito Utara",
    description: "Portal resmi pelayanan informasi publik terpadu Kementerian Agama Kabupaten Barito Utara.",
    images: ["/logo-kemenag.svg"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google-site-verification-code",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} font-sans antialiased min-h-screen bg-background text-foreground flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <MainLayoutWrapper>{children}</MainLayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
