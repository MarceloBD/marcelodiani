import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { blogPosts } from "@/lib/blog-posts";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {};
  }

  const baseUrl = "https://marcelodiani.online";
  const title = locale === "pt" ? post.title.pt : post.title.en;
  const excerpt = locale === "pt" ? post.excerpt.pt : post.excerpt.en;

  return {
    title: title,
    description: excerpt,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale === "en" ? "" : `${locale}/`}blog/${slug}`,
      languages: {
        en: `${baseUrl}/blog/${slug}`,
        pt: `${baseUrl}/pt/blog/${slug}`,
        "x-default": `${baseUrl}/blog/${slug}`,
      },
    },
    openGraph: {
      title: title,
      description: excerpt,
      url: `${baseUrl}/${locale === "en" ? "" : `${locale}/`}blog/${slug}`,
      siteName: "Marcelo B. Diani",
      locale: locale === "pt" ? "pt_BR" : "en_US",
      type: "article",
      publishedTime: post.publishedAt,
      images: [
        {
          url: `${baseUrl}${post.coverImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: excerpt,
      images: [`${baseUrl}${post.coverImage}`],
      creator: "@marcelodiani",
      site: "@marcelodiani",
    },
  };
}

function buildArticleSchema(post: (typeof blogPosts)[number], locale: string) {
  const baseUrl = "https://marcelodiani.online";
  const title = locale === "pt" ? post.title.pt : post.title.en;
  const excerpt = locale === "pt" ? post.excerpt.pt : post.excerpt.en;
  const localePath = locale === "en" ? "" : `${locale}/`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt,
    image: `${baseUrl}${post.coverImage}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    url: `${baseUrl}/${localePath}blog/${post.slug}`,
    inLanguage: locale === "pt" ? "pt-BR" : "en-US",
    author: {
      "@type": "Person",
      name: "Marcelo B. Diani",
      url: baseUrl,
      jobTitle: "Senior Full Stack Developer & Team Lead",
      sameAs: [
        "https://github.com/marcelobd",
        "https://www.linkedin.com/in/marcelo-diani",
      ],
    },
    publisher: {
      "@type": "Person",
      name: "Marcelo B. Diani",
      url: baseUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/${localePath}blog/${post.slug}`,
    },
  };
}

function buildBreadcrumbSchema(post: (typeof blogPosts)[number], locale: string) {
  const baseUrl = "https://marcelodiani.online";
  const title = locale === "pt" ? post.title.pt : post.title.en;
  const localePath = locale === "en" ? "" : `${locale}/`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/${localePath}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${baseUrl}/${localePath}blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${baseUrl}/${localePath}blog/${post.slug}`,
      },
    ],
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatParagraph(text: string): string {
  const codeBlocks: string[] = [];
  const withPlaceholders = text.replace(/`(.*?)`/g, (_, content) => {
    codeBlocks.push(content);
    return `%%CODE_${codeBlocks.length - 1}%%`;
  });

  const boldBlocks: string[] = [];
  const withBoldPlaceholders = withPlaceholders.replace(/\*\*(.*?)\*\*/g, (_, content) => {
    boldBlocks.push(content);
    return `%%BOLD_${boldBlocks.length - 1}%%`;
  });

  let escaped = escapeHtml(withBoldPlaceholders);

  boldBlocks.forEach((content, index) => {
    escaped = escaped.replace(
      `%%BOLD_${index}%%`,
      `<strong class="text-accent">${escapeHtml(content)}</strong>`
    );
  });

  codeBlocks.forEach((content, index) => {
    escaped = escaped.replace(
      `%%CODE_${index}%%`,
      `<code class="px-2 py-1 bg-card rounded text-accent">${escapeHtml(content)}</code>`
    );
  });

  escaped = escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">$1</a>'
  );

  return escaped;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const translations = await getTranslations({ locale, namespace: "blog" });

  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const title = locale === "pt" ? post.title.pt : post.title.en;
  const content = locale === "pt" ? post.content.pt : post.content.en;
  const paragraphs = content.split("\n\n");

  const articleSchema = buildArticleSchema(post, locale);
  const breadcrumbSchema = buildBreadcrumbSchema(post, locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <article className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center text-accent hover:underline mb-6"
          >
            {translations("backToBlog")}
          </Link>

          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-6">
              <address className="not-italic inline">
                <a
                  rel="author"
                  href="https://marcelodiani.online"
                  className="text-accent hover:underline"
                >
                  Marcelo B. Diani
                </a>
              </address>
              <span>•</span>
              <time dateTime={post.publishedAt}>
                {translations("publishedOn")}{" "}
                {new Date(post.publishedAt).toLocaleDateString(
                  locale === "pt" ? "pt-BR" : "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </time>
              <span>•</span>
              <span>
                {translations("readingTime", { minutes: post.readingTime })}
              </span>
            </div>

            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8">
              <Image
                src={post.coverImage}
                alt={title}
                width={1200}
                height={630}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </header>

          <div className="prose prose-invert max-w-none">
            {paragraphs.map((paragraph, index) => {
              if (paragraph.startsWith("## ")) {
                return (
                  <h2
                    key={index}
                    className="text-2xl md:text-3xl font-bold mt-12 mb-4 text-foreground"
                  >
                    {paragraph.replace("## ", "")}
                  </h2>
                );
              }

              if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                return (
                  <p key={index} className="text-lg font-bold my-6 text-accent">
                    {paragraph.replace(/\*\*/g, "")}
                  </p>
                );
              }

              if (paragraph.includes("\n- ")) {
                const [intro, ...rest] = paragraph.split("\n- ");
                const items = rest.map((item) => item.replace(/^- /, ""));
                return (
                  <div key={index} className="my-4">
                    {intro && (
                      <p
                        className="text-lg leading-relaxed mb-2 text-foreground"
                        dangerouslySetInnerHTML={{ __html: formatParagraph(intro) }}
                      />
                    )}
                    <ul className="list-disc pl-6 space-y-1">
                      {items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="text-lg leading-relaxed text-foreground"
                          dangerouslySetInnerHTML={{ __html: formatParagraph(item) }}
                        />
                      ))}
                    </ul>
                  </div>
                );
              }

              return (
                <p
                  key={index}
                  className="text-lg leading-relaxed my-4 text-foreground"
                  dangerouslySetInnerHTML={{ __html: formatParagraph(paragraph) }}
                />
              );
            })}
          </div>

          <div className="mt-12 pt-8 border-t border-card-border">
            <Link
              href="/blog"
              className="inline-flex items-center text-accent hover:underline"
            >
              {translations("backToBlog")}
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
