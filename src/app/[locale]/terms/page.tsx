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

  return {
    title: translations("title"),
    description: translations("metaDescription"),
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale === "en" ? "" : `${locale}/`}terms`,
      languages: {
        en: `${BASE_URL}/terms`,
        pt: `${BASE_URL}/pt/terms`,
      },
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="text-sm text-accent hover:underline mb-8 inline-block"
          >
            {translations("backToHome")}
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            {terms("title")}
          </h1>
          <p className="text-xs text-muted mb-8">{translations("lastUpdated")}</p>

          <div className="prose prose-invert max-w-none space-y-8">
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
        </div>
      </main>
      <Footer />
    </>
  );
}
