import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/hero/HeroSection";
import { AboutSection } from "@/components/about/AboutSection";
import { ExperienceSection } from "@/components/experience/ExperienceSection";
import { SkillsSection } from "@/components/skills/SkillsSection";
import { SecuritySection } from "@/components/security/SecuritySection";
import { CodePlayground } from "@/components/interactive/CodePlayground";
import { ArchitectureSimulator } from "@/components/interactive/architecture/ArchitectureSimulator";
import { ProjectsSection } from "@/components/projects/ProjectsSection";
import { EducationSection } from "@/components/education/EducationSection";
import { QuoteRequest } from "@/components/interactive/QuoteRequest";
import { ContactSection } from "@/components/contact/ContactSection";
import { InteractiveLabSection } from "@/components/interactiveLab/InteractiveLabSection";
import { WorldDataSection } from "@/components/worldData/WorldDataSection";
import { TerminalBubble } from "@/components/interactive/TerminalBubble";
import { LikeBanner } from "@/components/interactive/LikeBanner";
import { WalkingBoy } from "@/components/interactive/walkingBoy";
import { AudioPlayer } from "@/components/layout/AudioPlayer";
import { ChatBubble } from "@/components/chat";
import { WelcomeBack } from "@/components/interactive/WelcomeBack";
import { ExitIntentModal } from "@/components/interactive/ExitIntentModal";
import { StructuredData } from "@/lib/structured-data";
import { LazySection } from "@/components/ui/LazySection";
import { SourceCodeBanner } from "@/components/sourceCode/SourceCodeBanner";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const translations = await getTranslations({ locale, namespace: "metadata" });

  const baseUrl = "https://marcelodiani.com";

  return {
    title: translations("title"),
    description: translations("description"),
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale === "en" ? "" : locale}`,
      languages: {
        en: `${baseUrl}/`,
        pt: `${baseUrl}/pt`,
      },
    },
    openGraph: {
      title: translations("title"),
      description: translations("description"),
      url: baseUrl,
      siteName: "Marcelo B. Diani",
      locale: locale === "pt" ? "pt_BR" : "en_US",
      type: "website",
      images: [
        {
          url: `${baseUrl}/cvpic.jpg`,
          width: 1200,
          height: 630,
          alt: translations("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: translations("title"),
      description: translations("description"),
      images: [`${baseUrl}/cvpic.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const navTranslations = await getTranslations({ locale, namespace: "nav" });

  return (
    <>
      <StructuredData locale={locale} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-background focus:rounded-lg focus:text-sm focus:font-medium"
      >
        {navTranslations("skipToContent")}
      </a>
      <Navbar />
      <main id="main-content">
        {/* Above the fold - render immediately */}
        <HeroSection />
        <AboutSection />

        {/* Below the fold - defer mounting until near viewport */}
        <LazySection height="600px">
          <ExperienceSection />
        </LazySection>
        <LazySection height="800px">
          <SkillsSection />
        </LazySection>
        <LazySection height="800px">
          <InteractiveLabSection />
        </LazySection>
        <LazySection height="500px">
          <SecuritySection />
        </LazySection>
        <LazySection height="600px">
          <CodePlayground />
        </LazySection>
        <LazySection height="700px">
          <ArchitectureSimulator />
        </LazySection>
        <LazySection height="500px">
          <ProjectsSection />
        </LazySection>
        <LazySection height="600px">
          <EducationSection />
        </LazySection>
        <LazySection height="800px">
          <WorldDataSection />
        </LazySection>
        <LazySection height="500px">
          <QuoteRequest />
        </LazySection>
        <LazySection height="400px">
          <ContactSection />
        </LazySection>
        <LazySection height="300px">
          <SourceCodeBanner />
        </LazySection>
      </main>
      <Footer />
      <WalkingBoy />
      <TerminalBubble />
      <AudioPlayer />
      <LikeBanner />
      <ChatBubble />
      <WelcomeBack />
      <ExitIntentModal />
    </>
  );
}
