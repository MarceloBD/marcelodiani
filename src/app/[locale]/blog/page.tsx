import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { blogPosts } from "@/lib/blog-posts";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const translations = await getTranslations({ locale, namespace: "blog" });

  const baseUrl = "https://marcelodiani.online";

  const pageTitle = translations("pageTitle");
  const description = translations("subtitle");

  return {
    title: pageTitle,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale === "en" ? "" : `${locale}/`}blog`,
      languages: {
        en: `${baseUrl}/blog`,
        pt: `${baseUrl}/pt/blog`,
        "x-default": `${baseUrl}/blog`,
      },
    },
    openGraph: {
      title: pageTitle,
      description,
      url: `${baseUrl}/${locale === "en" ? "" : `${locale}/`}blog`,
      siteName: "Marcelo B. Diani",
      locale: locale === "pt" ? "pt_BR" : "en_US",
      type: "website",
      images: [
        {
          url: `${baseUrl}/cvpic.jpg`,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [`${baseUrl}/cvpic.jpg`],
      creator: "@marcelodiani",
      site: "@marcelodiani",
    },
  };
}

function buildBlogListSchema(locale: string) {
  const baseUrl = "https://marcelodiani.online";
  const localePath = locale === "en" ? "" : `${locale}/`;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: locale === "pt" ? "Blog de Engenharia de Software" : "Software Engineering Blog",
    description: locale === "pt"
      ? "Artigos sobre engenharia de software, arquitetura de sistemas e desenvolvimento web moderno."
      : "Articles on software engineering, system architecture, and modern web development.",
    url: `${baseUrl}/${localePath}blog`,
    inLanguage: locale === "pt" ? "pt-BR" : "en-US",
    author: {
      "@type": "Person",
      name: "Marcelo B. Diani",
      url: baseUrl,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: blogPosts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${baseUrl}/${localePath}blog/${post.slug}`,
        name: locale === "pt" ? post.title.pt : post.title.en,
      })),
    },
  };

  const breadcrumbSchema = {
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
    ],
  };

  return { collectionSchema, breadcrumbSchema };
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const translations = await getTranslations({ locale, namespace: "blog" });

  const { collectionSchema, breadcrumbSchema } = buildBlogListSchema(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {translations("title")}
            </h1>
            <p className="text-lg text-muted">{translations("subtitle")}</p>
          </header>

          {blogPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted">{translations("noPosts")}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {blogPosts.map((post) => {
                const title = locale === "pt" ? post.title.pt : post.title.en;
                const excerpt = locale === "pt" ? post.excerpt.pt : post.excerpt.en;

                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="block group"
                  >
                    <article className="glass-card p-6 rounded-xl border border-card-border transition-all duration-300 hover:border-accent hover:shadow-lg">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3 relative aspect-video rounded-lg overflow-hidden">
                          <Image
                            src={post.coverImage}
                            alt={title}
                            width={640}
                            height={360}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="md:w-2/3 flex flex-col justify-between">
                          <div>
                            <h2 className="text-2xl font-bold mb-2 text-foreground group-hover:text-accent transition-colors">
                              {title}
                            </h2>
                            <p className="text-muted mb-4">{excerpt}</p>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted">
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
                            <span>
                              {translations("readingTime", {
                                minutes: post.readingTime,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
