import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";

const BASE_URL = "https://marcelodiani.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const blogEntries: MetadataRoute.Sitemap = [];

  blogEntries.push({
    url: `${BASE_URL}/blog`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: {
      languages: {
        en: `${BASE_URL}/blog`,
        pt: `${BASE_URL}/pt/blog`,
      },
    },
  });

  blogEntries.push({
    url: `${BASE_URL}/pt/blog`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: {
      languages: {
        en: `${BASE_URL}/blog`,
        pt: `${BASE_URL}/pt/blog`,
      },
    },
  });

  blogPosts.forEach((post) => {
    blogEntries.push({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          en: `${BASE_URL}/blog/${post.slug}`,
          pt: `${BASE_URL}/pt/blog/${post.slug}`,
        },
      },
    });

    blogEntries.push({
      url: `${BASE_URL}/pt/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          en: `${BASE_URL}/blog/${post.slug}`,
          pt: `${BASE_URL}/pt/blog/${post.slug}`,
        },
      },
    });
  });

  const now = new Date();

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
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
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          en: `${BASE_URL}/`,
          pt: `${BASE_URL}/pt`,
        },
      },
    },
    ...blogEntries,
  ];
}
