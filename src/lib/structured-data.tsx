import { getTranslations } from "next-intl/server";

interface StructuredDataProps {
  locale: string;
}

export async function StructuredData({ locale }: StructuredDataProps) {
  const translations = await getTranslations({ locale, namespace: "structuredData" });

  const jsonLd = {
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
