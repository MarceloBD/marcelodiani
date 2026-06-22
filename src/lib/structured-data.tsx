import { getTranslations } from "next-intl/server";

const BASE_URL = "https://marcelodiani.online";

const SOCIAL_PROFILES = [
  "https://github.com/marcelobd",
  "https://linkedin.com/in/marcelo-diani",
  "https://wa.me/5517991068118",
];

interface StructuredDataProps {
  locale: string;
}

export async function StructuredData({ locale }: StructuredDataProps) {
  const translations = await getTranslations({ locale, namespace: "structuredData" });

  const currentDate = new Date().toISOString().split("T")[0];
  const localePath = locale === "pt" ? "/pt" : "";

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Marcelo B. Diani",
    jobTitle: translations("jobTitle"),
    url: BASE_URL,
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
    sameAs: SOCIAL_PROFILES,
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

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Marcelo B. Diani",
    description: "Full Stack Developer & Team Lead specializing in React, Node.js, TypeScript, and cloud technologies.",
    url: BASE_URL,
    logo: `${BASE_URL}/cvpic.jpg`,
    email: "marcelodianib@gmail.com",
    telephone: "+5517991068118",
    address: {
      "@type": "PostalAddress",
      addressLocality: "São Paulo",
      addressCountry: "BR",
    },
    founder: {
      "@type": "Person",
      name: "Marcelo B. Diani",
    },
    sameAs: SOCIAL_PROFILES,
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Marcelo B. Diani",
    description: translations.has("websiteDescription") 
      ? translations("websiteDescription")
      : "Portfolio of Marcelo B. Diani - Full Stack Developer specializing in React, Node.js, and cloud technologies",
    url: BASE_URL,
    inLanguage: [locale === "pt" ? "pt-BR" : "en-US"],
    author: {
      "@type": "Person",
      name: "Marcelo B. Diani",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/blog?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: "Marcelo B. Diani - Professional Profile",
    url: `${BASE_URL}${localePath}`,
    dateModified: currentDate,
    mainEntity: {
      "@type": "Person",
      name: "Marcelo B. Diani",
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
        item: `${BASE_URL}${localePath}`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: locale === "pt"
          ? "Quais são as principais tecnologias que Marcelo Diani utiliza?"
          : "What are Marcelo Diani's main technologies?",
        acceptedAnswer: {
          "@type": "Answer",
          text: locale === "pt"
            ? "Marcelo é especializado em React, Node.js, TypeScript, Next.js, AWS, MongoDB, PostgreSQL, Docker e tecnologias de IA/ML incluindo LLMs e RAG."
            : "Marcelo specializes in React, Node.js, TypeScript, Next.js, AWS, MongoDB, PostgreSQL, Docker, and AI/ML technologies including LLMs and RAG.",
        },
      },
      {
        "@type": "Question",
        name: locale === "pt"
          ? "Como contratar Marcelo Diani como desenvolvedor freelancer?"
          : "How to hire Marcelo Diani as a freelance developer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: locale === "pt"
            ? "Você pode entrar em contato com Marcelo através do WhatsApp, email ou LinkedIn. Ele oferece serviços de desenvolvimento full stack, consultoria técnica e liderança de equipes."
            : "You can contact Marcelo via WhatsApp, email, or LinkedIn. He offers full stack development, technical consulting, and team leadership services.",
        },
      },
      {
        "@type": "Question",
        name: locale === "pt"
          ? "Qual é a formação acadêmica de Marcelo Diani?"
          : "What is Marcelo Diani's educational background?",
        acceptedAnswer: {
          "@type": "Answer",
          text: locale === "pt"
            ? "Marcelo é formado em Engenharia de Computação pela Universidade de São Paulo (USP), campus São Carlos, turma de 2019. Medalhista de ouro na OBMEP."
            : "Marcelo holds a Computer Engineering degree from the University of São Paulo (USP), São Carlos campus, class of 2019. Gold medalist at the OBMEP math olympiad.",
        },
      },
    ],
  };

  const schemas = [personSchema, organizationSchema, websiteSchema, profilePageSchema, breadcrumbSchema, faqSchema];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
