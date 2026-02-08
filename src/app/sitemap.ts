import type { MetadataRoute } from "next";

const BASE_URL = "https://marcelodiani.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date("2026-02-07"),
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          en: `${BASE_URL}/`,
          pt: `${BASE_URL}/pt`,
        },
      },
    },
    {
      url: `${BASE_URL}/pt`,
      lastModified: new Date("2026-02-07"),
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          en: `${BASE_URL}/`,
          pt: `${BASE_URL}/pt`,
        },
      },
    },
  ];
}
