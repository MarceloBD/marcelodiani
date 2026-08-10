import { SKILLS, EXPERIENCE_TECH, PROJECT_TECH } from "./skills";
import type { SkillCategory } from "./skills";

interface ExperienceEntry {
  company: string;
  location: string;
  period: string;
  role: string;
  highlights: string[];
  technologies: string[];
}

interface ProjectEntry {
  name: string;
  year: string;
  description: string;
  technologies: string[];
}

interface CvSummary {
  name: string;
  age: number;
  nationality: string;
  bio: string;
  languages: string[];
  education: {
    degree: string;
    institution: string;
    period: string;
    grade: string;
    ranking: string;
  };
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skillsByCategory: Record<string, string[]>;
  achievements: string[];
}

function groupSkillsByCategory(): Record<string, string[]> {
  const grouped: Partial<Record<SkillCategory, string[]>> = {};

  for (const skill of SKILLS) {
    if (!grouped[skill.category]) {
      grouped[skill.category] = [];
    }
    grouped[skill.category]!.push(skill.name);
  }

  return grouped as Record<string, string[]>;
}

export const CV_SUMMARY: CvSummary = {
  name: "Marcelo B. Diani",
  age: 29,
  nationality: "Brazilian",
  bio: "Senior Full Stack Developer with 7+ years of experience specializing in TypeScript, React, and Node.js. Computer Engineer graduated from the University of São Paulo (USP) and mathematics olympiad gold medalist. Led teams of up to 6 developers managing 14 Shopify apps serving tens of thousands of daily users. Worked in EdTech, FinTech and E-commerce companies. Top 4% Cursor AI user worldwide in 2025. Mission: improve people's lives through technology.",
  languages: [
    "Portuguese (native)",
    "English (advanced)",
    "German (basic)",
    "Spanish (basic)",
    "Italian (basic)",
  ],
  education: {
    degree: "Computer Engineering",
    institution: "University of São Paulo (USP)",
    period: "2015–2019",
    grade: "7.8",
    ranking: "Top 10 of 61 students",
  },
  experience: [
    {
      company: "WithWillow.ai",
      location: "Remote",
      period: "2026",
      role: "Freelancer",
      highlights: [
        "Created a marketplace with 1,000+ MCPs for enterprise companies",
        "Cloned Webflow components to Next.js without UI mismatches",
        "Added Cloudflare workers for multiple frontends on the same domain",
        "Optimized website SEO to boost search engine rankings",
      ],
      technologies: EXPERIENCE_TECH.withWillow,
    },
    {
      company: "Clearer.io",
      location: "Boston, Massachusetts (Remote)",
      period: "2022–2025",
      role: "Senior Full Stack Developer / Team Lead / Scrum Master",
      highlights: [
        "Led two teams (3 and 6 developers) as Team Lead and Scrum Master, owning PR reviews, sprint planning, 1:1s, interviews, and delivery tracking with Jellyfish",
        "Managed 14 Shopify App Store products serving tens of thousands of daily users with multi-million dollar annual revenue",
        "Migrated all applications from Heroku to AWS using reusable IaC library built with CDK",
        "Increased test coverage from zero with unit/e2e tests via Datadog Synthetic Monitoring, added Codacy for static analysis",
        "Implemented observability (logging, distributed tracing) in Datadog, Memcached caching, Lambda + DynamoDB + LLMs for storefront widgets",
      ],
      technologies: EXPERIENCE_TECH.clearer,
    },
    {
      company: "Acesso Comercial",
      location: "São Carlos, São Paulo",
      period: "2021–2022",
      role: "Founder",
      highlights: [
        "Founded e-commerce platform (Shopify alternative) with ERP, CRM, SSR blog, omnichannel chat, onboarding 600+ stores",
        "Architected 5 microservices (auth, core, metrics, payments, messaging) with Blue-Green deployment, Docker, Nginx, Prometheus, OpenTelemetry, Grafana",
        "Built with React, Node.js, GraphQL, Relay, MongoDB. Integrated 10+ third-party APIs. AI features with OpenAI, Gemini, RAG + Typesense",
        "Led team of 2 developers and 1 support specialist, coordinated with designers, media buyers, lawyers, consultants",
        "1,000+ automated tests with Mocha, Sinon, Chai, Cypress. Collaborated with 30+ merchants to co-design features",
      ],
      technologies: EXPERIENCE_TECH.acesso,
    },
    {
      company: "Vórtx DTVM",
      location: "São Paulo, São Paulo",
      period: "2020–2021",
      role: "Full Stack Developer",
      highlights: [
        "Upgraded and launched legacy Angular/.NET platform into production for investment fund operations",
        "Built 3 microservices and 2 Lambda functions with Angular, .NET Core, MongoDB cluster, SQL Server",
        "Migrated 1,800 Excel records to automated online platform, eliminating manual effort",
        "Delivered platform to external users in 6 months, on schedule and within budget",
        "Implemented refresh token auth, backend pagination (under 500ms), generated 200K dynamic PDFs with Puppeteer",
      ],
      technologies: EXPERIENCE_TECH.vortx,
    },
    {
      company: "Ênfase Instituto Jurídico",
      location: "São Carlos, São Paulo",
      period: "2019–2020",
      role: "Full Stack Developer Intern",
      highlights: [
        "Developed 2 platforms from scratch serving 13,000+ law students with React, Node.js, PostgreSQL, GraphQL",
        "Redesigned front-end architecture with Atomic Design, reducing maintenance effort",
        "Built real-time student analytics dashboard connected to Kafka event system",
        "Created configurable database seeder, speeding up developer onboarding and testing",
      ],
      technologies: EXPERIENCE_TECH.enfase,
    },
  ],
  projects: [
    {
      name: "Fast Read",
      year: "2026",
      description: "Cross-platform speed reading web and desktop app using RSVP with ORP highlighting",
      technologies: PROJECT_TECH.fastRead,
    },
    {
      name: "Design Patterns Quest",
      year: "2026",
      description: "Interactive learning platform for mastering all 22 GoF design patterns through RPG-style experience",
      technologies: PROJECT_TECH.designPatternsQuest,
    },
    {
      name: "Browser Pal",
      year: "2026",
      description: "AI-driven browser with manual navigation and autonomous orchestration via MCP API",
      technologies: PROJECT_TECH.browserPal,
    },
    {
      name: "Companies Data Visualizer",
      year: "2026",
      description: "Big data pipeline to ingest and index government data from 70M+ companies for market analytics",
      technologies: PROJECT_TECH.companiesDataVisualizer,
    },
    {
      name: "BoolTools SEO / GDPR / Security / Page Speed",
      year: "2026",
      description: "Open-source SEO/GEO, GDPR, Security, and Page Speed auditing tools",
      technologies: PROJECT_TECH.boolTools,
    },
    {
      name: "WithWillow.ai",
      year: "2026",
      description: "Contributions to the secure MCP gateway connecting AI agents to enterprise systems",
      technologies: PROJECT_TECH.withWillow,
    },
    {
      name: "Welcome to Brazil",
      year: "2026",
      description: "Complete guide for foreigners to visit, live, and thrive in Brazil",
      technologies: PROJECT_TECH.welcomeToBrazil,
    },
    {
      name: "marcelodiani",
      year: "2025",
      description: "My portfolio website (marcelodiani.online)",
      technologies: PROJECT_TECH.marcelodiani,
    },
    {
      name: "vc-chess",
      year: "2025",
      description: "Real-time multiplayer chess game — no account required",
      technologies: PROJECT_TECH.vcChess,
    },
    {
      name: "vc-billings",
      year: "2025",
      description: "Personal monthly payment tracker (Next.js + Drizzle + Neon Postgres)",
      technologies: PROJECT_TECH.vcBillings,
    },
    {
      name: "vc-ecommerce",
      year: "2025",
      description: "E-commerce storefront template",
      technologies: PROJECT_TECH.vcEcommerce,
    },
    {
      name: "vc-plumbing-quote-landing",
      year: "2025",
      description: "Service quote landing page",
      technologies: PROJECT_TECH.vcPlumbingQuote,
    },
    {
      name: "vc-product-landing-page",
      year: "2025",
      description: "Product launch landing page (Next.js + Framer Motion)",
      technologies: PROJECT_TECH.vcProductLanding,
    },
    {
      name: "Language Translator",
      year: "2025",
      description: "React Native + Python app using LangGraph and OCR to translate text from images",
      technologies: PROJECT_TECH.languageTranslator,
    },
    {
      name: "Learn Code",
      year: "2025",
      description: "Online interface to learn languages and frameworks through concepts and puzzles",
      technologies: PROJECT_TECH.learnCode,
    },
    {
      name: "Coding Classes",
      year: "2025",
      description: "Recorded coding classes teaching AI-assisted development techniques",
      technologies: PROJECT_TECH.codingClasses,
    },
    {
      name: "Banner Generator",
      year: "2025",
      description: "Banner generation tool leveraging multiple LLMs for quality output",
      technologies: PROJECT_TECH.bannerGenerator,
    },
    {
      name: "Crypto Tax Calculator",
      year: "2022",
      description: "Cryptocurrency calculator (JavaScript)",
      technologies: PROJECT_TECH.cryptoTax,
    },
    {
      name: "Platform Jump Game",
      year: "2021",
      description: "Unity C# mobile game with obstacles and global ranking on Google Play",
      technologies: PROJECT_TECH.platformJump,
    },
    {
      name: "PicBird",
      year: "2021",
      description: "Mobile game built with Unity and C#",
      technologies: PROJECT_TECH.picBird,
    },
  ],
  skillsByCategory: groupSkillsByCategory(),
  achievements: [
    "CPA-20 Certification (2020) — Score 93%, ranked 1st at the company",
    "OBMEP Mathematics Olympiad Gold Medal (2011) — 4-year program for medalists",
    "Hackathon Elo+Getnet (2018) — Built consumer purchase solution in a weekend",
    "Warthog Robotics USP (2015–2016) — Robot soccer championships",
    "Social projects: Pontinha (English teaching), USP Clothing Drive (60K pieces), Operation Christmas",
  ],
};
