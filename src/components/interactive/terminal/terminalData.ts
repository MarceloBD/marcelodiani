export interface TerminalLine {
  text: string;
  type: "input" | "output" | "error" | "system";
}

export const FILE_SYSTEM: Record<string, string> = {
  "about.txt": [
    "Marcelo B. Diani",
    "Senior Full Stack Developer | Team Lead | Founder | E-commerce & AI Specialist",
    "",
    "Senior Full Stack Developer with 7+ years specializing in TypeScript, React, and Node.js.",
    "Computer Engineer from USP. Mathematics Olympiad gold medalist.",
    "Led teams of up to 6 developers managing 14 Shopify apps.",
    "Worked in EdTech, FinTech and E-commerce. Top 4% Cursor AI user in 2025.",
    "",
    "Mission: improve people's lives through technology.",
    "",
    "Stats:",
    "  7+ years of experience  |  +3 years of leadership",
    "  1000+ tests written     |  25+ apps managed",
    "",
    "Languages: Portuguese (native), English (advanced), German (basic),",
    "           Spanish (basic), Italian (basic)",
  ].join("\n"),

  "skills.txt": [
    "Frontend:  React, Next.js, TypeScript, Angular, React Native, Astro, Tauri,",
    "           Electron, CSS3, HTML5, Relay, Redux, Styled Components, Storybook",
    "Backend:   Node.js, GraphQL, .NET, C#, Python, Golang, REST, Express,",
    "           Prisma, Kafka, BullMQ, WebSocket",
    "Database:  MongoDB, PostgreSQL, SQL Server, Redis, DynamoDB, Supabase,",
    "           MySQL, Typesense, ClickHouse",
    "DevOps:    AWS, Docker, CDK, Lambda, CI/CD, GitHub Actions, Cloudflare,",
    "           Heroku, Vercel, DataDog, Grafana, Prometheus, OpenTelemetry, Terraform",
    "AI:        LLMs, LangChain, LangGraph, RAG, OpenAI, Gemini, TensorFlow,",
    "           Cursor, MCP",
    "Other:     Git, Shopify, Stripe, Cypress, Puppeteer, SEO, Figma, Unity",
  ].join("\n"),

  "experience.txt": [
    "2026       WithWillow.ai (Remote)",
    "           Freelancer",
    "           Created marketplace with 1,000+ MCPs for enterprise companies.",
    "           Cloned Webflow to Next.js. Cloudflare workers for multi-frontend domain.",
    "",
    "2022–2025  Clearer.io (Boston, Remote)",
    "           Senior Full Stack Developer / Team Lead / Scrum Master",
    "           Led 2 teams (3 and 6 devs). Managed 14 Shopify apps with multi-million revenue.",
    "           Migrated apps from Heroku to AWS with CDK. Added observability with DataDog.",
    "",
    "2021–2022  Acesso Comercial (São Carlos)",
    "           Founder",
    "           Built e-commerce platform (Shopify alt) with ERP, CRM, SSR blog, omnichannel chat.",
    "           5 microservices, Docker, Blue-Green deploy. 600+ stores. 1000+ tests.",
    "",
    "2020–2021  Vórtx DTVM (São Paulo)",
    "           Full Stack Developer",
    "           Financial company. Angular, .NET, MongoDB, SQL Server. 3 microservices, 2 Lambdas.",
    "           Migrated 1800 Excel records. Generated 200,000 dynamic PDFs with Puppeteer.",
    "",
    "2019–2020  Ênfase Instituto Jurídico (São Carlos)",
    "           Full Stack Developer Intern",
    "           EdTech company. React, Node, PostgreSQL, GraphQL, Kafka.",
    "           Built 2 platforms from scratch for 13,000+ law students.",
  ].join("\n"),

  "projects.txt": [
    "2026  Fast Read             Cross-platform speed reading app with RSVP and ORP highlighting",
    "                            Tech: Next.js, TypeScript, Tauri",
    "",
    "2026  Design Patterns Quest Interactive RPG for mastering all 22 GoF design patterns",
    "                            Tech: Next.js, TypeScript",
    "",
    "2026  Browser Pal           AI-driven browser with MCP orchestration and dev tools",
    "                            Tech: Electron, TypeScript, MCP",
    "",
    "2026  Companies Visualizer  Big data pipeline for 70M+ companies from government data",
    "                            Tech: Golang, PostgreSQL, Astro",
    "",
    "2026  BoolTools             SEO/GDPR/Security/PageSpeed open-source auditing tools",
    "                            Tech: Golang, Astro, MCP",
    "",
    "2026  Welcome to Brazil     Guide for foreigners to visit, live, and thrive in Brazil",
    "                            Tech: TypeScript, Next.js, React, Supabase",
    "",
    "2025  Language Translator   React Native + Python app using LangGraph and OCR",
    "                            Tech: Python, FastAPI, TypeScript, React Native, LLMs",
    "",
    "2025  Learn Code            Online interface to learn languages and frameworks by concepts",
    "                            Tech: TypeScript, React, Next.js, Vercel",
    "",
    "2025  Coding Classes        Recorded classes teaching AI-assisted development",
    "                            Tech: JavaScript, Node.js, React, Cursor, Supabase",
    "",
    "2025  Banner Generator      Banner generation tool with editable text and multiple LLMs",
    "                            Tech: TypeScript, Node.js, LLMs",
    "",
    "2022  Crypto Tax Calculator Open-source Brazilian crypto tax calculator with unit tests",
    "                            Tech: Node.js, JavaScript",
    "",
    "2021  Platform Jump Game    Unity C# mobile game with obstacles and global ranking",
    "                            Tech: C#, Unity, Firebase, Google Play",
  ].join("\n"),

  "contact.txt": [
    "Email:    marcelodianib@gmail.com",
    "WhatsApp: +55 17 99106-8118",
    "GitHub:   github.com/MarceloBD",
    "LinkedIn: www.linkedin.com/in/marcelo-diani",
  ].join("\n"),

  "education.txt": [
    "Computer Engineering — University of São Paulo (USP), 2015–2019",
    "Final grade: 7.8 — Top 10 of 61 students. Completed with no failed courses.",
    "",
    "Achievements:",
    "  2020       CPA-20 Certification    Score 93% — Ranked 1st among all candidates",
    "  2009–2012  OBMEP Math Olympiad     Gold medal. 4-year program at UNESP for medalists",
    "  2018       Hackathon Elo+Getnet    Built a consumer purchase solution in a weekend",
    "  2015–2016  Warthog Robotics (USP)  Control Dept. for robot soccer championships",
    "  2019       Pontinha Project        Taught English at a public school for 6 months",
    "  2019       USP Clothing Drive      Collected ~60,000 pieces for institutions",
    "  2018–2019  Operation Christmas     Gathered food and gifts for children in need",
  ].join("\n"),
};

export const FORTUNE_QUOTES = [
  "Being grateful makes the other person's day brighter.",
  "A sincere smile can change someone's entire day.",
  "Good conversations make time fly.",
  "Helping someone without expecting anything back is one of the best feelings.",
  "Listening to someone with real attention is a form of love.",
  "Learning something new keeps the mind young.",
  "A walk in nature recharges the soul.",
  "Small acts of kindness create ripples bigger than we imagine.",
  "Laughter is contagious and heals.",
  "Music has the power to change any mood.",
  "The best memories are made in the simplest moments.",
  "Every person you meet knows something you don't.",
  "Being kind to yourself is the first step to being kind to others.",
];

export const NEOFETCH_OUTPUT = [
  "       __  __ ____      \x1bm\x1b marcelo@portfolio",
  "      |  \\/  |  _ \\     \x1b─\x1b ─────────────────",
      "      | |\\/| | | | |    \x1bOS:\x1b MarceloDiani OS v1.0.0",
   "      | |  | | |_| |    \x1bRole:\x1b Senior Full Stack Developer | Team Lead",
  "      |_|  |_|____/     \x1bXP:\x1b 7+ years",
  "                         \x1bStores:\x1b 600+ created",
  "                         \x1bTests:\x1b 1000+ written",
  "                         \x1bStack:\x1b React, Node.js, TypeScript, AWS",
  "                         \x1bShell:\x1b portfolio-bash",
  "                         \x1bEditor:\x1b Cursor",
]
  .map((line) => line.replace(/\x1b([^x1b]*)\x1b/g, "$1"))
  .join("\n");

export const WATER_ASCII = [
  "    .─────.",
  "    | ~ ~ |",
  "    | ~ ~ |",
  "    |     |",
  "    `─────'",
  "",
  "  Stay hydrated! Here's a glass of water for you.",
].join("\n");

export const HELP_TEXT = `Available commands:
  help          Show this help message
  ls            List available files
  cat <file>    Read a file (e.g. cat about.txt)
  whoami        Who is this?
  neofetch      Display system info
  uptime        Show how long I've been coding
  fortune       Get a random positive message
  water         Stay hydrated
  clear         Clear the terminal
  pwd           Print working directory
  date          Show current date
  echo <text>   Echo text back`;

export const AVAILABLE_COMMANDS = [
  "help", "ls", "cat", "whoami", "neofetch", "uptime",
  "fortune", "water", "clear", "pwd", "date", "echo",
  "sudo", "exit", "rm",
];

export const WELCOME_MESSAGE: TerminalLine[] = [
  { text: "Welcome to MarceloDiani OS v1.0.0", type: "system" },
  { text: 'Type "help" to see available commands.\n', type: "system" },
];
