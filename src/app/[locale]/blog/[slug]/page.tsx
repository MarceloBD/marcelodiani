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

  const baseUrl = "https://marcelodiani.com";
  const title = locale === "pt" ? post.title.pt : post.title.en;
  const excerpt = locale === "pt" ? post.excerpt.pt : post.excerpt.en;

  return {
    title: `${title} | Marcelo B. Diani`,
    description: excerpt,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale === "en" ? "" : locale}blog/${slug}`,
      languages: {
        en: `${baseUrl}/blog/${slug}`,
        pt: `${baseUrl}/pt/blog/${slug}`,
      },
    },
    openGraph: {
      title: title,
      description: excerpt,
      url: `${baseUrl}/${locale === "en" ? "" : locale}blog/${slug}`,
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
    },
  };
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

  return (
    <>
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
                fill
                className="object-cover"
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

              const formattedParagraph = paragraph
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-accent">$1</strong>')
                .replace(/`(.*?)`/g, '<code class="px-2 py-1 bg-card rounded text-accent">$1</code>');

              return (
                <p
                  key={index}
                  className="text-lg leading-relaxed my-4 text-foreground"
                  dangerouslySetInnerHTML={{ __html: formattedParagraph }}
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
