import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "@/i18n/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const BASE_URL = "https://marcelodiani.online";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const translations = await getTranslations({ locale, namespace: "legal.terms" });

  const canonicalPath = locale === "en" ? "terms" : `${locale}/terms`;

  return {
    title: `${translations("title")} | Marcelo B. Diani`,
    description: translations("metaDescription"),
    metadataBase: new URL(BASE_URL),
    authors: [{ name: "Marcelo B. Diani", url: BASE_URL }],
    alternates: {
      canonical: `${BASE_URL}/${canonicalPath}`,
      languages: {
        en: `${BASE_URL}/terms`,
        pt: `${BASE_URL}/pt/terms`,
        "x-default": `${BASE_URL}/terms`,
      },
    },
    openGraph: {
      title: `${translations("title")} | Marcelo B. Diani`,
      description: translations("metaDescription"),
      url: `${BASE_URL}/${canonicalPath}`,
      siteName: "Marcelo B. Diani",
      locale: locale === "pt" ? "pt_BR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${translations("title")} | Marcelo B. Diani`,
      description: translations("metaDescription"),
      site: "@marcelodiani",
    },
    robots: { index: true, follow: true },
  };
}

const SECTION_KEYS = [
  "use",
  "content",
  "disclaimer",
  "liability",
  "changes",
  "contact",
] as const;

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const translations = await getTranslations({ locale, namespace: "legal" });
  const terms = await getTranslations({ locale, namespace: "legal.terms" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: terms("title"),
    description: terms("metaDescription"),
    url: `${BASE_URL}/${locale === "en" ? "" : `${locale}/`}terms`,
    inLanguage: locale === "pt" ? "pt-BR" : "en-US",
    author: {
      "@type": "Person",
      name: "Marcelo B. Diani",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Person",
      name: "Marcelo B. Diani",
      url: BASE_URL,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Marcelo B. Diani",
      url: BASE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <article className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="text-sm text-accent hover:underline mb-8 inline-block"
          >
            {translations("backToHome")}
          </Link>

          <header>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
              {terms("title")}
            </h1>
            <p className="text-xs text-muted mb-2">{translations("lastUpdated")}</p>
            <p className="text-xs text-muted mb-8">
              Marcelo B. Diani — marcelodiani.online
            </p>
          </header>

          <div className="space-y-8">
            <p className="text-foreground/80 leading-relaxed">{terms("intro")}</p>

            {SECTION_KEYS.map((sectionKey) => (
              <section key={sectionKey}>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  {terms(`${sectionKey}Title`)}
                </h2>
                <p className="text-foreground/70 leading-relaxed">
                  {terms(`${sectionKey}Description`)}
                </p>
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
