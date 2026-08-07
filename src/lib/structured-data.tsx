import { getTranslations } from "next-intl/server";

const BASE_URL = "https://marcelodiani.online";
const PERSON_ID = `${BASE_URL}/#person`;
const ORGANIZATION_ID = `${BASE_URL}/#organization`;

const SOCIAL_PROFILES = [
  "https://github.com/marcelobd",
  "https://www.linkedin.com/in/marcelo-diani",
  "https://wa.me/5517991068118",
];

interface StructuredDataProps {
  locale: string;
}

function buildFaqQuestions(locale: string) {
  const faqItems = [
    {
      en: { question: "What are Marcelo Diani's main technologies?", answer: "Marcelo specializes in React, Node.js, TypeScript, Next.js, AWS, MongoDB, PostgreSQL, Docker, and AI/ML technologies including LLMs and RAG." },
      pt: { question: "Quais são as principais tecnologias que Marcelo Diani utiliza?", answer: "Marcelo é especializado em React, Node.js, TypeScript, Next.js, AWS, MongoDB, PostgreSQL, Docker e tecnologias de IA/ML incluindo LLMs e RAG." },
    },
    {
      en: { question: "How to hire Marcelo Diani as a freelance developer?", answer: "You can contact Marcelo via WhatsApp, email, or LinkedIn. He offers full stack development, technical consulting, and team leadership services." },
      pt: { question: "Como contratar Marcelo Diani como desenvolvedor freelancer?", answer: "Você pode entrar em contato com Marcelo através do WhatsApp, email ou LinkedIn. Ele oferece serviços de desenvolvimento full stack, consultoria técnica e liderança de equipes." },
    },
    {
      en: { question: "What is Marcelo Diani's educational background?", answer: "Marcelo holds a Computer Engineering degree from the University of São Paulo (USP), São Carlos campus, class of 2019. Gold medalist at the OBMEP math olympiad." },
      pt: { question: "Qual é a formação acadêmica de Marcelo Diani?", answer: "Marcelo é formado em Engenharia de Computação pela Universidade de São Paulo (USP), campus São Carlos, turma de 2019. Medalhista de ouro na OBMEP." },
    },
    {
      en: { question: "What kind of projects does Marcelo Diani build?", answer: "Marcelo builds web applications, e-commerce platforms, SaaS products, mobile apps, and AI-powered solutions. Notable projects include leading 14+ Shopify apps generating millions in annual revenue, founding an e-commerce startup with 600+ stores, and building open-source tools like BoolTools SEO Crawler." },
      pt: { question: "Que tipo de projetos Marcelo Diani desenvolve?", answer: "Marcelo desenvolve aplicações web, plataformas de e-commerce, produtos SaaS, apps mobile e soluções com IA. Projetos notáveis incluem liderar 14+ apps Shopify gerando milhões em receita anual, fundar uma startup de e-commerce com 600+ lojas e criar ferramentas open-source como BoolTools SEO Crawler." },
    },
    {
      en: { question: "Where is Marcelo Diani located and does he work remotely?", answer: "Marcelo is based in São Paulo, Brazil, and available for remote work across all time zones. He has extensive experience working with international teams, including 3 years leading remote teams for a Boston-based company." },
      pt: { question: "Onde Marcelo Diani está localizado e ele trabalha remotamente?", answer: "Marcelo está baseado em São Paulo, Brasil, e disponível para trabalho remoto em todos os fusos horários. Ele tem ampla experiência trabalhando com equipes internacionais, incluindo 3 anos liderando equipes remotas para uma empresa em Boston." },
    },
    {
      en: { question: "How many years of experience does Marcelo Diani have?", answer: "Marcelo has 7+ years of professional experience in software development, with 3+ years in leadership roles. He has managed teams of up to 7 developers, written over 1,000 tests, and managed 25+ production applications across e-commerce, fintech, and education." },
      pt: { question: "Quantos anos de experiência Marcelo Diani tem?", answer: "Marcelo tem 7+ anos de experiência profissional em desenvolvimento de software, com 3+ anos em cargos de liderança. Já gerenciou equipes de até 7 desenvolvedores, escreveu mais de 1.000 testes e gerenciou 25+ aplicações em produção em diversas indústrias." },
    },
  ];

  return faqItems.map((item) => ({
    "@type": "Question" as const,
    name: locale === "pt" ? item.pt.question : item.en.question,
    acceptedAnswer: {
      "@type": "Answer" as const,
      text: locale === "pt" ? item.pt.answer : item.en.answer,
    },
  }));
}

export async function StructuredData({ locale }: StructuredDataProps) {
  const translations = await getTranslations({ locale, namespace: "structuredData" });

  const currentDate = new Date().toISOString().split("T")[0];
  const localePath = locale === "pt" ? "/pt" : "";

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": PERSON_ID,
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
          "JavaScript", "TypeScript", "React", "Node.js", "Next.js",
          "AWS", "MongoDB", "PostgreSQL", "Python", "GraphQL", "Docker", "AI/ML",
        ],
        sameAs: SOCIAL_PROFILES,
        worksFor: { "@id": ORGANIZATION_ID },
        knowsLanguage: [
          { "@type": "Language", name: "Portuguese" },
          { "@type": "Language", name: "English" },
          { "@type": "Language", name: "German" },
          { "@type": "Language", name: "Spanish" },
          { "@type": "Language", name: "Italian" },
        ],
      },
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: translations("worksFor"),
        description: "Full Stack Developer & Team Lead specializing in React, Node.js, TypeScript, and cloud technologies.",
        url: BASE_URL,
        logo: `${BASE_URL}/cvpic.webp`,
        email: "marcelodianib@gmail.com",
        telephone: "+5517991068118",
        address: {
          "@type": "PostalAddress",
          addressLocality: "São Paulo",
          addressCountry: "BR",
        },
        founder: { "@id": PERSON_ID },
        sameAs: SOCIAL_PROFILES,
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        name: "Marcelo B. Diani",
        description: translations.has("websiteDescription")
          ? translations("websiteDescription")
          : "Portfolio of Marcelo B. Diani - Full Stack Developer specializing in React, Node.js, and cloud technologies",
        url: BASE_URL,
        inLanguage: [locale === "pt" ? "pt-BR" : "en-US"],
        author: { "@id": PERSON_ID },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE_URL}/blog?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "ProfilePage",
        "@id": `${BASE_URL}${localePath}/#profilepage`,
        name: "Marcelo B. Diani - Professional Profile",
        url: `${BASE_URL}${localePath}`,
        dateModified: currentDate,
        mainEntity: { "@id": PERSON_ID },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${BASE_URL}${localePath}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${BASE_URL}${localePath}/#faq`,
        mainEntity: buildFaqQuestions(locale),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
