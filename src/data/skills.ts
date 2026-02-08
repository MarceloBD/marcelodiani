export interface Skill {
  name: string;
  category: SkillCategory;
}

export type SkillCategory =
  | "frontend"
  | "backend"
  | "database"
  | "devops"
  | "ai"
  | "other";

export const SKILLS: Skill[] = [
  { name: "React", category: "frontend" },
  { name: "Next.js", category: "frontend" },
  { name: "TypeScript", category: "frontend" },
  { name: "Angular", category: "frontend" },
  { name: "React Native", category: "frontend" },
  { name: "CSS3", category: "frontend" },
  { name: "HTML5", category: "frontend" },
  { name: "Relay", category: "frontend" },
  { name: "Redux", category: "frontend" },
  { name: "Styled Components", category: "frontend" },
  { name: "Storybook", category: "frontend" },

  { name: "Node.js", category: "backend" },
  { name: "GraphQL", category: "backend" },
  { name: ".NET", category: "backend" },
  { name: "C#", category: "backend" },
  { name: "Python", category: "backend" },
  { name: "REST", category: "backend" },
  { name: "Express", category: "backend" },
  { name: "Prisma", category: "backend" },
  { name: "Kafka", category: "backend" },
  { name: "BullMQ", category: "backend" },
  { name: "WebSocket", category: "backend" },

  { name: "MongoDB", category: "database" },
  { name: "PostgreSQL", category: "database" },
  { name: "SQL Server", category: "database" },
  { name: "Redis", category: "database" },
  { name: "DynamoDB", category: "database" },
  { name: "Typesense", category: "database" },

  { name: "AWS", category: "devops" },
  { name: "Docker", category: "devops" },
  { name: "CDK", category: "devops" },
  { name: "Lambda", category: "devops" },
  { name: "CI/CD", category: "devops" },
  { name: "GitHub Actions", category: "devops" },
  { name: "Cloudflare", category: "devops" },
  { name: "Heroku", category: "devops" },
  { name: "Vercel", category: "devops" },
  { name: "DataDog", category: "devops" },
  { name: "Grafana", category: "devops" },
  { name: "Prometheus", category: "devops" },
  { name: "OpenTelemetry", category: "devops" },

  { name: "LLMs", category: "ai" },
  { name: "LangChain", category: "ai" },
  { name: "RAG", category: "ai" },
  { name: "TensorFlow", category: "ai" },
  { name: "Cursor", category: "ai" },

  { name: "Git", category: "other" },
  { name: "Cypress", category: "other" },
  { name: "Puppeteer", category: "other" },
  { name: "SEO", category: "other" },
  { name: "Figma", category: "other" },
  { name: "Unity", category: "other" },
];

export const EXPERIENCE_TECH: Record<string, string[]> = {
  clearer: [
    "JavaScript",
    "TypeScript",
    "Node.js",
    "React",
    "Next.js",
    "MongoDB",
    "PostgreSQL",
    "REST",
    "Redis",
    "React Native",
    "AWS",
    "CDK",
    "DataDog",
    "Heroku",
    "Codacy",
    "Cloudflare",
  ],
  acesso: [
    "TypeScript",
    "Node.js",
    "React",
    "Next.js",
    "MongoDB",
    "GraphQL",
    "AWS",
    "GitHub Actions",
    "Docker",
    "WebSocket",
    "LLMs",
    "RAG",
    "SSR",
    "BullMQ",
    "Redis",
  ],
  vortx: [
    "C#",
    ".NET",
    "JavaScript",
    "Angular",
    "SQL Server",
    "MongoDB",
    "REST",
    "GitHub Actions",
    "Lambda",
    "Puppeteer",
    "Redux",
  ],
  enfase: [
    "JavaScript",
    "Node.js",
    "React",
    "PostgreSQL",
    "GraphQL",
    "Relay",
    "Kafka",
    "Prisma",
    "Styled Components",
  ],
};

export const PROJECT_TECH: Record<string, string[]> = {
  learnCode: ["TypeScript", "React", "Next.js", "Vercel"],
  codingClasses: ["JavaScript", "Node.js", "React", "Cursor", "Supabase"],
  languageTranslator: [
    "Python",
    "FastAPI",
    "TypeScript",
    "React Native",
    "LangGraph",
    "OCR",
    "LLMs",
  ],
  bannerGenerator: ["TypeScript", "Node.js", "LLMs"],
  travelGuide: ["TypeScript", "Next.js", "Node.js", "React", "MongoDB", "AWS"],
  cryptoTax: ["Node.js", "JavaScript", "Tests"],
  platformJump: ["C#", "Unity", "Firebase", "Google Play"],
};

export const PROJECT_LINKS: Partial<Record<string, string>> = {
  learnCode: "https://github.com/MarceloBD/learn-code",
  languageTranslator: "https://github.com/MarceloBD/language_translator",
  cryptoTax: "https://github.com/MarceloBD/crypto-calculator",
};

export const ACHIEVEMENT_LINKS: Partial<Record<string, string>> = {
  cpa: "https://www.anbima.com.br/pt_br/educar/certificacoes/cpa-20.htm",
  olympiad: "http://www.obmep.org.br/",
  robotics: "https://wr.sc.usp.br/",
  pontinha: "https://www.instagram.com/projetopontinha/",
  clothing:
    "https://www.saocarlosagora.com.br/cidade/campanha-usp-do-agasalho-abre-inscricoes-para-universitarios/185779/",
  christmas:
    "https://eesc.usp.br/noticias/comunicados_s.php?guid=operacao-natal-busca-por-padrinhos-e-madrinhas-para-doacao-de-sacolinhas&termid=todos",
};

export const DEGREE_LINK =
  "https://usp.br/";

export const SKILL_CATEGORY_COLORS: Record<SkillCategory, string> = {
  frontend: "#61DAFB",
  backend: "#68A063",
  database: "#F29111",
  devops: "#FF9900",
  ai: "#A855F7",
  other: "#6B7280",
};
