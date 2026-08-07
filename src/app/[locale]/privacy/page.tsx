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
  const translations = await getTranslations({ locale, namespace: "legal.privacy" });

  const canonicalPath = locale === "en" ? "privacy" : `${locale}/privacy`;

  return {
    title: `${translations("title")} | Marcelo B. Diani`,
    description: translations("metaDescription"),
    metadataBase: new URL(BASE_URL),
    authors: [{ name: "Marcelo B. Diani", url: BASE_URL }],
    alternates: {
      canonical: `${BASE_URL}/${canonicalPath}`,
      languages: {
        en: `${BASE_URL}/privacy`,
        pt: `${BASE_URL}/pt/privacy`,
        "x-default": `${BASE_URL}/privacy`,
      },
    },
    openGraph: {
      title: `${translations("title")} | Marcelo B. Diani`,
      description: translations("metaDescription"),
      url: `${BASE_URL}/${canonicalPath}`,
      siteName: "Marcelo B. Diani",
      locale: locale === "pt" ? "pt_BR" : "en_US",
      type: "website",
      images: [{ url: `${BASE_URL}/cvpic.webp`, width: 1200, height: 1295, alt: "Marcelo B. Diani" }],
    },
    twitter: {
      card: "summary",
      title: `${translations("title")} | Marcelo B. Diani`,
      description: translations("metaDescription"),
      site: "@marcelodiani",
      images: [`${BASE_URL}/cvpic.webp`],
    },
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const translations = await getTranslations({ locale, namespace: "legal" });
  const privacy = await getTranslations({ locale, namespace: "legal.privacy" });

  const collectionItems: string[] = [
    privacy("collectionItems.0"),
    privacy("collectionItems.1"),
    privacy("collectionItems.2"),
    privacy("collectionItems.3"),
  ];

  const localePath = locale === "en" ? "" : `${locale}/`;

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: privacy("title"),
    description: privacy("metaDescription"),
    url: `${BASE_URL}/${localePath}privacy`,
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/${localePath}` },
      { "@type": "ListItem", position: 2, name: privacy("title"), item: `${BASE_URL}/${localePath}privacy` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
              {privacy("title")}
            </h1>
            <p className="text-xs text-muted mb-2">{translations("lastUpdated")}</p>
            <address className="not-italic text-xs text-muted mb-8">
              <a rel="author" href="https://marcelodiani.online" className="hover:text-accent transition-colors">
                Marcelo B. Diani
              </a>{" "}
              — marcelodiani.online
            </address>
          </header>

          <div className="space-y-8">
            <p className="text-foreground/80 leading-relaxed">{privacy("intro")}</p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {privacy("collectionTitle")}
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground/70">
                {collectionItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {privacy("useTitle")}
              </h2>
              <p className="text-foreground/70 leading-relaxed">{privacy("useDescription")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {privacy("cookiesTitle")}
              </h2>
              <p className="text-foreground/70 leading-relaxed">{privacy("cookiesDescription")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {privacy("thirdPartyTitle")}
              </h2>
              <p className="text-foreground/70 leading-relaxed">{privacy("thirdPartyDescription")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {privacy("rightsTitle")}
              </h2>
              <p className="text-foreground/70 leading-relaxed">{privacy("rightsDescription")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {privacy("contactTitle")}
              </h2>
              <p className="text-foreground/70 leading-relaxed">{privacy("contactDescription")}</p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
