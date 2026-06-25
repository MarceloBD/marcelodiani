"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { SectionTitle } from "../ui/SectionTitle";
import { blogPosts } from "@/lib/blog-posts";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export function BlogSection() {
  const translations = useTranslations("blog");
  const locale = useLocale();

  const latestPosts = blogPosts.slice(0, 3);

  return (
    <section id="blog" className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <SectionTitle
          title={translations("title")}
          subtitle={translations("homeSubtitle")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {latestPosts.map((post, index) => {
            const title = locale === "pt" ? post.title.pt : post.title.en;
            const excerpt = locale === "pt" ? post.excerpt.pt : post.excerpt.en;

            return (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block group h-full"
                >
                  <div className="glass-card rounded-xl border border-card-border overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-lg h-full flex flex-col">
                    <div className="relative w-full aspect-video overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-accent transition-colors line-clamp-2">
                        {title}
                      </h3>
                      <p className="text-muted text-sm mb-4 line-clamp-3 flex-1">
                        {excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted">
                        <time dateTime={post.publishedAt}>
                          {new Date(post.publishedAt).toLocaleDateString(
                            locale === "pt" ? "pt-BR" : "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </time>
                        <span>
                          {translations("readingTime", {
                            minutes: post.readingTime,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background rounded-lg font-medium transition-all duration-300 hover:bg-accent/90 hover:shadow-lg hover:scale-105"
          >
            {translations("viewAllPosts")}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
