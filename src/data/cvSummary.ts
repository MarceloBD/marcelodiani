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
  bio: "Graduated in Computer Engineering at the University of São Paulo (USP), in São Carlos, Brazil (2019). Mathematics Olympiad medalist. 7+ years working mostly with JavaScript/TypeScript with strong experience in web development. E-commerce specialist. AI enthusiast. Mission: improve people's lives through technology.",
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
      company: "Clearer.io",
      location: "Boston, Massachusetts (Remote)",
      period: "2022–2025",
      role: "Team Lead / Senior Full Stack Developer / Scrum Master",
      highlights: [
        "Led two teams (7 developers) with PR reviews, 1:1s, Scrum ceremonies, sprint planning",
        "Managed 14+ Shopify apps with tens of thousands of monthly users and millions in revenue",
        "Migrated apps from Heroku to AWS using CDK (IaC) to reduce costs",
        "Added unit/e2e tests with Datadog, static analysis with Codacy",
        "Implemented observability (logging, tracing), caching with Memcached, Lambda + LLMs for widget generation",
      ],
      technologies: EXPERIENCE_TECH.clearer,
    },
    {
      company: "Acesso Comercial",
      location: "São Carlos, São Paulo",
      period: "2021–2022",
      role: "Founder",
      highlights: [
        "Founded startup helping small stores sell online (Shopify-like) with ERP, CRM, blog, omnichannel chat",
        "Built 3 microservices with Blue-Green deployment, Docker, Nginx, monitoring (Prometheus, Grafana, OpenTelemetry)",
        "Created AI features with OpenAI, Gemini, Typesense for RAG",
        "Led 2 developers, coordinated with designers, lawyers, consultants",
        "1,000+ tests, 600 stores created",
      ],
      technologies: EXPERIENCE_TECH.acesso,
    },
    {
      company: "Vórtx DTVM",
      location: "São Paulo, São Paulo",
      period: "2020–2021",
      role: "Full Stack Developer",
      highlights: [
        "Financial company — maintained client data for fund investments",
        "Used Angular, Node, .NET Core with MongoDB cluster",
        "Migrated 1,800 records from Excel to automated online platform, eliminating paper workflow",
        "Delivered project to external users in 6 months, saving 1 FTE",
        "Implemented refresh token, pagination (500ms), generated 200K dynamic PDFs",
      ],
      technologies: EXPERIENCE_TECH.vortx,
    },
    {
      company: "Ênfase Instituto Jurídico",
      location: "São Carlos, São Paulo",
      period: "2019–2020",
      role: "Full Stack Developer Intern",
      highlights: [
        "Distance education company — React, Node, PostgreSQL across 3 products",
        "Built postgraduate platform and law job positions platform (13K active students)",
        "Architected frontend with Atomic Design for easier maintenance",
        "Built event system with Kafka for user statistics",
      ],
      technologies: EXPERIENCE_TECH.enfase,
    },
  ],
  projects: [
    {
      name: "Learn Code",
      year: "2025",
      description: "Online interface to learn languages and frameworks by concepts and puzzles",
      technologies: PROJECT_TECH.learnCode,
    },
    {
      name: "Coding Classes",
      year: "2025",
      description: "Online course teaching how to use AI with advanced techniques",
      technologies: PROJECT_TECH.codingClasses,
    },
    {
      name: "Language Translator",
      year: "2025",
      description: "React Native + Python app using LangGraph and OCR to translate text from images",
      technologies: PROJECT_TECH.languageTranslator,
    },
    {
      name: "Banner Generator",
      year: "2025",
      description: "Banner generation tool leveraging multiple LLMs",
      technologies: PROJECT_TECH.bannerGenerator,
    },
    {
      name: "Travel Guide",
      year: "2024",
      description: "Next.js platform for city guides and points of interest",
      technologies: PROJECT_TECH.travelGuide,
    },
    {
      name: "Crypto Tax Calculator",
      year: "2022",
      description: "Open-source app to calculate Brazilian crypto taxes with extensive tests",
      technologies: PROJECT_TECH.cryptoTax,
    },
    {
      name: "Platform Jump Game",
      year: "2021",
      description: "Unity C# mobile game with obstacles and global ranking on Google Play",
      technologies: PROJECT_TECH.platformJump,
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
