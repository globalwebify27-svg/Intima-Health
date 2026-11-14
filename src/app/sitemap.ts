import type { MetadataRoute } from "next";
import { TREATMENT_SLUGS, SEXUAL_PROBLEM_SLUGS } from "@/constants/defaultTreatments";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://kelkarmanasclinic.com").replace(/\/+$/, "");
  const now = new Date();

  const staticRoutes: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/doctors", priority: 0.9, changeFrequency: "weekly" },
    { path: "/booking", priority: 0.9, changeFrequency: "weekly" },
    { path: "/treatments", priority: 0.9, changeFrequency: "weekly" },
    { path: "/sexual-problems", priority: 0.9, changeFrequency: "weekly" },
    { path: "/hospitals", priority: 0.8, changeFrequency: "monthly" },
    { path: "/pharmacy", priority: 0.8, changeFrequency: "weekly" },
    { path: "/therapy", priority: 0.8, changeFrequency: "weekly" },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
    { path: "/privacy-policy", priority: 0.5, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.5, changeFrequency: "monthly" },
    { path: "/refund-policy", priority: 0.5, changeFrequency: "monthly" },
    { path: "/hipaa", priority: 0.5, changeFrequency: "monthly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const treatmentEntries: MetadataRoute.Sitemap = TREATMENT_SLUGS.map((slug) => ({
    url: `${baseUrl}/treatments/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const sexualProblemEntries: MetadataRoute.Sitemap = SEXUAL_PROBLEM_SLUGS.map((slug) => ({
    url: `${baseUrl}/sexual-problems/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...treatmentEntries, ...sexualProblemEntries];
}

