import { getTranslations } from "next-intl/server";

interface StructuredDataProps {
  locale: string;
}

export async function StructuredData({ locale }: StructuredDataProps) {
  const translations = await getTranslations({ locale, namespace: "structuredData" });

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Marcelo B. Diani",
    jobTitle: translations("jobTitle"),
    url: "https://marcelodiani.com",
    email: "marcelodianib@gmail.com",
    telephone: "+5517991068118",
    nationality: "Brazilian",
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "University of São Paulo (USP)",
      department: "Computer Engineering",
    },
    knowsAbout: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Next.js",
      "AWS",
      "MongoDB",
      "PostgreSQL",
      "Python",
      "GraphQL",
      "Docker",
      "AI/ML",
    ],
    sameAs: [
      "https://github.com/marcelobd",
      "https://linkedin.com/in/marcelo-diani",
    ],
    worksFor: {
      "@type": "Organization",
      name: translations("worksFor"),
    },
    knowsLanguage: [
      { "@type": "Language", name: "Portuguese" },
      { "@type": "Language", name: "English" },
      { "@type": "Language", name: "German" },
      { "@type": "Language", name: "Spanish" },
      { "@type": "Language", name: "Italian" },
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Marcelo B. Diani",
    description: translations.has("websiteDescription") 
      ? translations("websiteDescription")
      : "Portfolio of Marcelo B. Diani - Full Stack Developer specializing in React, Node.js, and cloud technologies",
    url: "https://marcelodiani.com",
    inLanguage: [locale === "pt" ? "pt-BR" : "en-US"],
    author: {
      "@type": "Person",
      name: "Marcelo B. Diani",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://marcelodiani.com/blog?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: "Marcelo B. Diani - Professional Profile",
    url: `https://marcelodiani.com${locale === "pt" ? "/pt" : ""}`,
    mainEntity: {
      "@type": "Person",
      name: "Marcelo B. Diani",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
      />
    </>
  );
}
