import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ppid-baritoutara.kemenag.go.id";

  const routes = [
    "",
    "/profil",
    "/profil/pejabat",
    "/profil/visi-misi",
    "/profil/tugas-fungsi",
    "/profil/struktur",
    "/data-informasi",
    "/data-informasi/infografis",
    "/informasi-publik/berkala",
    "/informasi-publik/serta-merta",
    "/informasi-publik/setiap-saat",
    "/informasi-publik/dikecualikan",
    "/layanan-informasi",
    "/layanan-informasi/keberatan",
    "/layanan-informasi/sengketa",
    "/layanan-informasi/pengaduan",
    "/layanan-informasi/alasan-keberatan",
    "/layanan-informasi/sop",
    "/standar-layanan",
    "/standar-layanan/maklumat",
    "/standar-layanan/jadwal",
    "/standar-layanan/biaya",
    "/standar-layanan/kebijakan",
    "/standar-layanan/strategi",
    "/regulasi",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
