import { getTranslations } from "next-intl/server";

interface SeoContentProps {
  locale: string;
}

export async function SeoContent({ locale }: SeoContentProps) {
  const [hero, about, experience, faq, contact, skills] = await Promise.all([
    getTranslations({ locale, namespace: "hero" }),
    getTranslations({ locale, namespace: "about" }),
    getTranslations({ locale, namespace: "experience" }),
    getTranslations({ locale, namespace: "faq" }),
    getTranslations({ locale, namespace: "contact" }),
    getTranslations({ locale, namespace: "skills" }),
  ]);

  const isEnglish = locale === "en";

  return (
    <article
      className="sr-only"
      aria-hidden="false"
      itemScope
      itemType="https://schema.org/Person"
    >
      <h2>
        {isEnglish
          ? "Who Is Marcelo B. Diani? Senior Full Stack Developer & Team Lead"
          : "Quem é Marcelo B. Diani? Desenvolvedor Full Stack Sênior & Líder Técnico"}
      </h2>
      <p itemProp="description">
        {hero("role")}. {about("bio")}
      </p>

      <h2>
        {isEnglish
          ? "What Skills and Technologies Does Marcelo Diani Use?"
          : "Quais Habilidades e Tecnologias Marcelo Diani Utiliza?"}
      </h2>
      <p>
        {isEnglish
          ? "Marcelo Diani is proficient in a wide range of modern technologies spanning frontend, backend, databases, DevOps, cloud infrastructure, and AI/ML."
          : "Marcelo Diani é proficiente em uma ampla gama de tecnologias modernas abrangendo frontend, backend, bancos de dados, DevOps, infraestrutura cloud e IA/ML."}
      </p>
      <table>
        <caption>
          {isEnglish ? "Technical Skills Overview" : "Visão Geral de Habilidades Técnicas"}
        </caption>
        <thead>
          <tr>
            <th>{skills("categories.frontend")}</th>
            <th>{skills("categories.backend")}</th>
            <th>{skills("categories.database")}</th>
            <th>{skills("categories.devops")}</th>
            <th>{skills("categories.ai")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>React, Next.js, TypeScript, Angular, Tailwind CSS, Three.js</td>
            <td>Node.js, Express, GraphQL, REST, Python, .NET</td>
            <td>PostgreSQL, MongoDB, DynamoDB, Redis</td>
            <td>AWS, Docker, GitHub Actions, Terraform, CDK</td>
            <td>LLMs, LangChain, RAG, OpenAI, Gemini</td>
          </tr>
        </tbody>
      </table>

      <h2>
        {isEnglish
          ? "What Is Marcelo Diani's Professional Experience?"
          : "Qual é a Experiência Profissional de Marcelo Diani?"}
      </h2>
      <ol>
        <li>
          <strong>{experience("positions.withWillow.company")}</strong> — {experience("positions.withWillow.role")} ({experience("positions.withWillow.period")}).{" "}
          {isEnglish
            ? "Created a marketplace with 1,000+ MCPs for enterprise companies. Cloned Webflow components to Next.js. Added Cloudflare workers for multi-frontend domain."
            : "Criou um marketplace com 1.000+ MCPs para empresas corporativas. Clonou componentes do Webflow para Next.js. Adicionou workers no Cloudflare para domínio multi-frontend."}
        </li>
        <li>
          <strong>{experience("positions.clearer.company")}</strong> — {experience("positions.clearer.role")} ({experience("positions.clearer.period")}).{" "}
          {isEnglish
            ? "Led two teams (3 and 6 developers). Managed 14 Shopify apps with multi-million dollar annual revenue. Migrated from Heroku to AWS using CDK. Implemented observability with Datadog."
            : "Liderou duas equipes (3 e 6 desenvolvedores). Gerenciou 14 apps Shopify com receita anual multimilionária. Migrou do Heroku para AWS usando CDK. Implementou observabilidade com Datadog."}
        </li>
        <li>
          <strong>{experience("positions.acesso.company")}</strong> — {experience("positions.acesso.role")} ({experience("positions.acesso.period")}).{" "}
          {isEnglish
            ? "Founded an e-commerce platform (Shopify alternative) with ERP, CRM, and AI features. Onboarded 600+ stores. 1,000+ tests. 5 microservices."
            : "Fundou uma plataforma de e-commerce (alternativa ao Shopify) com ERP, CRM e funcionalidades de IA. Integrou 600+ lojas. 1.000+ testes. 5 microsserviços."}
        </li>
        <li>
          <strong>{experience("positions.vortx.company")}</strong> — {experience("positions.vortx.role")} ({experience("positions.vortx.period")}).{" "}
          {isEnglish
            ? "Financial company. Upgraded legacy Angular/.NET platform. Migrated 1,800 Excel records to automated platform. Generated 200,000 dynamic PDFs with Puppeteer."
            : "Empresa financeira. Atualizou plataforma legada Angular/.NET. Migrou 1.800 registros do Excel para plataforma automatizada. Gerou 200.000 PDFs dinâmicos com Puppeteer."}
        </li>
        <li>
          <strong>{experience("positions.enfase.company")}</strong> — {experience("positions.enfase.role")} ({experience("positions.enfase.period")}).{" "}
          {isEnglish
            ? "EdTech company. Developed 2 platforms from scratch for 13,000+ law students. Built real-time analytics with Kafka."
            : "Empresa de EdTech. Desenvolveu 2 plataformas do zero para 13.000+ estudantes de direito. Construiu analytics em tempo real com Kafka."}
        </li>
      </ol>

      <h2>
        {isEnglish
          ? "How Can You Hire Marcelo Diani as a Freelance Developer?"
          : "Como Contratar Marcelo Diani como Desenvolvedor Freelancer?"}
      </h2>
      <p>
        {contact("subtitle")}.{" "}
        {isEnglish
          ? "Contact Marcelo via WhatsApp, email (marcelodianib@gmail.com), LinkedIn, or GitHub. He offers full stack development, technical consulting, team leadership, and e-commerce optimization services. Available for remote work worldwide across all time zones."
          : "Entre em contato com Marcelo via WhatsApp, email (marcelodianib@gmail.com), LinkedIn ou GitHub. Ele oferece serviços de desenvolvimento full stack, consultoria técnica, liderança de equipes e otimização de e-commerce. Disponível para trabalho remoto mundial em todos os fusos horários."}
      </p>

      <h2>{faq("title")}</h2>
      <dl>
        <dt>{faq("items.whatTechnologies.question")}</dt>
        <dd>{faq("items.whatTechnologies.answer")}</dd>
        <dt>{faq("items.howToHire.question")}</dt>
        <dd>{faq("items.howToHire.answer")}</dd>
        <dt>{faq("items.whatEducation.question")}</dt>
        <dd>{faq("items.whatEducation.answer")}</dd>
        <dt>{faq("items.whatProjects.question")}</dt>
        <dd>{faq("items.whatProjects.answer")}</dd>
        <dt>{faq("items.whereLocated.question")}</dt>
        <dd>{faq("items.whereLocated.answer")}</dd>
        <dt>{faq("items.whatExperience.question")}</dt>
        <dd>{faq("items.whatExperience.answer")}</dd>
      </dl>
    </article>
  );
}
