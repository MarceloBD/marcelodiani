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

  return {
    title: translations("title"),
    description: translations("metaDescription"),
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale === "en" ? "" : `${locale}/`}privacy`,
      languages: {
        en: `${BASE_URL}/privacy`,
        pt: `${BASE_URL}/pt/privacy`,
      },
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
            {privacy("title")}
          </h1>
          <p className="text-xs text-muted mb-8">{translations("lastUpdated")}</p>

          <div className="prose prose-invert max-w-none space-y-8">
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
        </div>
      </main>
      <Footer />
    </>
  );
}
