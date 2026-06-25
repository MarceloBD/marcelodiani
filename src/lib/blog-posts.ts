export interface BlogPost {
  slug: string;
  title: {
    en: string;
    pt: string;
  };
  publishedAt: string;
  readingTime: number;
  coverImage: string;
  excerpt: {
    en: string;
    pt: string;
  };
  content: {
    en: string;
    pt: string;
  };
}

export const blogPosts: BlogPost[] = [
  {
    slug: "top-4-percent-cursor-user-how-ai-changed-my-workflow",
    title: {
      en: "I'm in the Top 4% of Cursor Users — Here's How AI Rewired My Entire Dev Workflow",
      pt: "Estou no Top 4% dos Usuários do Cursor — Como a IA Reconfigurou Todo Meu Fluxo de Trabalho",
    },
    publishedAt: "2026-06-25",
    readingTime: 9,
    coverImage: "/blog/cursor-top-4-percent.png",
    excerpt: {
      en: "Cursor sent me a year-end recap: top 4% most active users in 2025 by token usage. Everyone uses AI now. The real question is whether you are getting everything you can out of it. Here are the specific workflow optimizations that pushed my usage into the top 4%.",
      pt: "O Cursor me enviou um resumo de fim de ano: top 4% dos usuários mais ativos em 2025 por consumo de tokens. Todo mundo usa IA agora. A verdadeira pergunta é se você está extraindo tudo que pode dela. Aqui estão as otimizações específicas de fluxo de trabalho que empurraram meu uso para o top 4%.",
    },
    content: {
      en: `A few weeks ago, Cursor sent me a year-end recap for 2025. One stat stood out: I was in the top 4% most active users globally, measured by token usage.

My first reaction was "that is a lot of tokens burned." My second reaction was more interesting: I could not imagine working any other way.

We all use AI in our workflows now. That is not news. The real question is: are you getting everything you can out of it, or are you just scratching the surface? Because there is a massive gap between "I use Copilot for autocomplete" and "AI is embedded in every stage of how I plan, build, debug, and ship software."

This post is about the specific ways I optimized my workflow with AI throughout 2025 that pushed my usage into the top 4%. Not theory. Not hype. The actual patterns that made me measurably more productive.

## Planning: two approaches, both valid

When it comes to planning with AI, there are basically two ways to go about it.

The first is the simple prompt: "generate a WebSocket handler." Quick, direct, and sometimes that is all you need. If you are lucky and the problem is straightforward, you can get a solid architecture on the first try.

The second is the detailed description: "I need a real-time notification system that handles multi-tenant isolation, supports WebSocket fallback to SSE, and integrates with our existing event bus." This approach tends to give you a better result with a single prompt because the AI has enough context to surface edge cases, propose trade-offs, and produce a structured plan without you needing to go back and forth.

The trade-off is clear. With a simple prompt, you sometimes need multiple interactions to refine the result. With a detailed one, you front-load the context and often get what you need in one shot. Both work. It depends on what you are building and how much context the problem requires.

Either way, the planning phase that used to involve hours of Googling, reading docs, and sketching on a whiteboard now happens inside a conversation.

## Writing code: let the AI learn from your codebase

Everyone uses AI autocomplete. That is table stakes. What made the real difference for me was letting the AI learn from what already exists in my project.

My approach is simple: when I need something new, I reference an existing file or folder and ask the AI to replicate its patterns. If I need a new service, I point to an existing one and say "follow this structure." If I need a new component, I reference a similar one. The AI picks up the naming conventions, the dependency injection setup, the error handling, everything. I do not need to explain my architecture from scratch every time because the codebase itself is the documentation.

Modern tools also help a lot here. Skills, project indexing, and codebase-aware features mean the harness does most of the context gathering for you. You do not need to manually configure every rule. The tool reads your project and understands the patterns on its own.

A few examples of what this looks like in practice:
- Writing a new repository implementation: I reference an existing repository and the AI mirrors its pattern, including the correct interfaces, error handling, and logging
- Building API endpoints: I point to an existing endpoint and it follows the same validation, authentication middleware, and response formatting
- Creating React components: it picks up my design system, state management patterns, and test structure from similar components

## Debugging: the highest-ROI use case

This is where AI earned its keep for me.

We all know the debugging loop: look at a stack trace, form a hypothesis, add some logs, reproduce the issue, realize your hypothesis was wrong, form a new one, repeat. Some bugs take twenty minutes. Some take two days.

With AI in the loop, I feed it the error, the surrounding code, the recent changes, and the infrastructure configuration. The AI does not just guess, it reasons through the code path, identifies where state could be inconsistent, points out race conditions I missed, and suggests targeted fixes.

Tools like Cursor's debug mode take this even further. It does not just analyze the error you paste, it actually creates the logs, runs the code, reads the output, and iterates on the fix for you. The entire cycle of "add a log, run, read the output, adjust" that used to be manual is now handled by the AI. You describe the bug, and it investigates.

**AI does not replace your debugging skills. It gives you a second brain that never gets tired of reading stack traces.**

## Legacy code: turning days into hours

Every developer has been here: you join a new team or pick up a ticket, and the feature you need to modify lives inside a 2,000-line file with no documentation, cryptic variable names, and business logic that was written three years ago by someone who already left the company.

Most developers already ask AI to "explain this code." The optimization I found was asking structured, layered questions instead of a single broad one.

First pass: "Explain what this module does and what the main data flow is." Second pass: "What are the edge cases and failure modes?" Third pass: "What happens if this field is null?" and "Where does this configuration get loaded?"

Each layer builds on the previous one. The AI traces through the code and gives specific answers with line references. By the third pass, I have a mental model that would have taken days of manual reading.

This completely changed how I onboard onto unfamiliar codebases. What used to take a week of careful reading now takes an afternoon.

## Testing: from maintenance burden to automated workflow

I wrote an entire article about how I spent a full month fixing tests. The core issue was not writing tests, it was maintaining them. Every refactor meant updating dozens of tests coupled to implementation details.

The workflow I built around AI testing is what changed the game. When I refactor a function signature, I immediately ask the AI to update every test that references it. When I add a new validation rule, it generates the corresponding test cases. When a test fails because of an intentional behavior change, the AI understands the difference between a regression and an evolution.

The key was making testing part of the AI conversation, not a separate step. I stopped treating test updates as a chore I do after coding and started including them in the same AI session where I write the feature. The AI already has the full context of what changed and why, so the tests it generates are accurate on the first pass.

I now write more tests than I did before, with less time spent keeping them alive.

## AI-first development: the new mental model

Remember when "mobile-first" changed how we built software? We stopped designing for desktop and then adapting to mobile. Instead, we started with mobile constraints and scaled up. It shifted the entire mental model.

Something similar is happening now. I call it AI-first development.

The idea is simple: when I need to build something, I try with AI first. I describe what I need, let the AI generate the initial implementation, and then iterate through prompts to refine it. Adjust the architecture, fix edge cases, improve the naming, all through conversation. Only if the AI-driven approach is not converging on a good solution do I step in and write or fix it manually.

This does not mean blindly accepting whatever the AI produces. It means treating AI as the starting point instead of a blank file. You still review everything. You still make the architectural decisions. But the default path changed from "write it yourself and ask AI for help when stuck" to "let AI take the first pass and guide it from there."

This mental shift is what pushed my usage so high. When AI is your first attempt at everything, not your last resort, you naturally engage with it at every stage.

## When AI is not the silver bullet

I want to be honest about where this breaks down, because it does.

AI struggles with complex business problems that carry a lot of context and have many side effects. The kind of feature where changing one function affects five other modules, where the business rules have exceptions on top of exceptions, and where the only person who truly understands the logic is someone who has been working on the product for two years.

In those cases, AI can still help with isolated parts, but it cannot hold the full picture. It does not know that changing the discount calculation will break the invoicing flow, which will trigger incorrect notifications, which will confuse the customer support team. Those chains of side effects require human judgment and domain knowledge that no AI has today.

If you try to force AI through a problem like that, you end up spending more time fixing its output than you would have spent writing it yourself. Recognizing when to stop prompting and start coding manually is a skill in itself.

**AI is a tool, not a replacement for thinking. The best developers know when to use it and when to put it down.**

## The harness matters more than the model

One thing I learned in 2025 that most developers overlook: the quality of the final result depends heavily on the harness around the AI, not just the model itself.

What I mean by harness is everything that happens before and after the model generates a response. Does the tool use RAG to pull relevant context from your codebase? Does it integrate with MCPs (Model Context Protocol servers) to bring in external knowledge? Does it run additional verifications on the output before presenting it to you?

This is why not all AI coding tools produce the same results even when using the same underlying model. A tool like Google's Stitch, for example, has deeper knowledge about frontend patterns and component libraries because its harness is built specifically for that domain. Cursor uses project rules, codebase indexing, and MCP integrations to bring more specific context into every conversation.

The harness is what turns a generic language model into a tool that actually understands your project. Without it, you get generic answers. With a good harness, you get answers that are already aligned with your architecture, your dependencies, and your conventions.

When choosing your AI tools, pay as much attention to the harness as you do to the model. A smaller model with great context retrieval will often outperform a larger model with no context at all.

## The real shift: it is not about typing faster

If you take one thing from this post, let it be this: the value of AI is not that it makes you type faster. It is that it removes the friction from the parts of development that slow down your thinking.

Context switching between docs, code, and browser is reduced because the AI brings context to you. The gap between "I know what I need to build" and "I have a working implementation" shrinks dramatically. The cognitive load of holding an entire codebase in your head is offloaded to a tool that actually can hold it all.

That is what the top 4% means. Not that I outsourced my work. That I used AI in every phase of my workflow: planning, coding, debugging, testing, reviewing, and understanding legacy systems. It was embedded in how I work, not something I opened once in a while.

## What I changed to get more out of AI

The biggest shift in my workflow was moving from reactive to proactive AI usage.

Early on, I used AI reactively: I had a problem, I asked the AI, I got an answer. That works, but it leaves a lot on the table.

The shift happened when I started treating the AI as a collaborator in every phase. I describe architectural constraints upfront. I ask it to challenge my approach before I commit. I use it to explore three alternatives before picking one. I feed it my project rules and conventions so every response is already aligned with my codebase.

The developers who get the most value from AI are not the ones who ask the most questions. They are the ones who provide the most context and ask the sharpest questions.

## The bottom line

AI changed the way we work. That is not a prediction, it already happened. And it benefits everyone: it lets us spend less time on repetitive tasks and more time on the things that actually matter, the architecture decisions, the business logic, the user experience.

Landing in the top 4% of Cursor users was not a goal. It was a side effect of using AI in every phase of my work throughout 2025. Planning, coding, debugging, testing, reviewing. It became part of how I think about building software, and I am a better developer because of it.`,
      pt: `Algumas semanas atrás, o Cursor me enviou um resumo de fim de ano de 2025. Uma estatística se destacou: eu estava no top 4% dos usuários mais ativos globalmente, medido por consumo de tokens.

Minha primeira reação foi "isso são muitos tokens queimados." Minha segunda reação foi mais interessante: eu não conseguia imaginar trabalhar de outra forma.

Todos nós usamos IA no nosso fluxo de trabalho agora. Isso não é novidade. A pergunta real é: você está extraindo tudo que pode dela, ou está apenas arranhando a superfície? Porque existe uma diferença enorme entre "eu uso Copilot para autocomplete" e "IA está incorporada em cada etapa de como eu planejo, construo, debugo e entrego software."

Este post é sobre as formas específicas como eu otimizei meu fluxo de trabalho com IA ao longo de 2025 que empurraram meu uso para o top 4%. Não teoria. Não hype. Os padrões reais que me tornaram mensuravelmente mais produtivo.

## Planejamento: duas abordagens, ambas válidas

Quando se trata de planejar com IA, existem basicamente duas formas de fazer.

A primeira é o prompt simples: "gere um handler de WebSocket." Rápido, direto, e às vezes é tudo que você precisa. Se tiver sorte e o problema for direto, você consegue uma arquitetura sólida na primeira tentativa.

A segunda é a descrição detalhada: "Preciso de um sistema de notificações em tempo real que lide com isolamento multi-tenant, suporte fallback de WebSocket para SSE, e se integre com nosso event bus existente." Essa abordagem tende a dar um resultado melhor com um único prompt porque a IA tem contexto suficiente para revelar edge cases, propor trade-offs e produzir um plano estruturado sem você precisar ficar indo e voltando.

O trade-off é claro. Com um prompt simples, às vezes você precisa de múltiplas interações para refinar o resultado. Com um detalhado, você antecipa o contexto e frequentemente consegue o que precisa de primeira. Ambos funcionam. Depende do que você está construindo e de quanto contexto o problema requer.

De qualquer forma, a fase de planejamento que costumava envolver horas pesquisando no Google, lendo documentação e desenhando no quadro branco agora acontece dentro de uma conversa.

## Escrevendo código: deixe a IA aprender com sua codebase

Todo mundo usa autocomplete com IA. Isso é o básico. O que fez a diferença real para mim foi deixar a IA aprender com o que já existe no meu projeto.

Minha abordagem é simples: quando preciso de algo novo, eu referencio um arquivo ou pasta existente e peço para a IA replicar seus padrões. Se preciso de um novo serviço, aponto para um existente e digo "siga essa estrutura." Se preciso de um novo componente, referencio um similar. A IA pega as convenções de nomenclatura, o setup de injeção de dependência, o tratamento de erros, tudo. Não preciso explicar minha arquitetura do zero toda vez porque a codebase em si é a documentação.

Ferramentas modernas também ajudam muito aqui. Skills, indexação de projeto e funcionalidades que conhecem a codebase fazem a maior parte da coleta de contexto por você. Você não precisa configurar manualmente cada regra. A ferramenta lê seu projeto e entende os padrões por conta própria.

Alguns exemplos do que isso significa na prática:
- Escrevendo uma nova implementação de repositório: eu referencio um repositório existente e a IA espelha seu padrão, incluindo interfaces corretas, tratamento de erros e logging
- Construindo endpoints de API: aponto para um endpoint existente e ela segue a mesma validação, middleware de autenticação e formatação de resposta
- Criando componentes React: ela reconhece meu design system, padrões de gerenciamento de estado e estrutura de testes a partir de componentes similares

## Debugging: o caso de uso com maior ROI

É aqui que a IA provou seu valor para mim.

Todos conhecemos o loop de debugging: olhar um stack trace, formar uma hipótese, adicionar alguns logs, reproduzir o problema, perceber que a hipótese estava errada, formar uma nova, repetir. Alguns bugs levam vinte minutos. Alguns levam dois dias.

Com IA no loop, eu alimento ela com o erro, o código ao redor, as mudanças recentes e a configuração de infraestrutura. A IA não apenas chuta, ela raciocina pelo caminho do código, identifica onde o estado pode estar inconsistente, aponta race conditions que eu perdi e sugere correções direcionadas.

Ferramentas como o modo debug do Cursor levam isso ainda mais longe. Ele não apenas analisa o erro que você cola, ele realmente cria os logs, roda o código, lê a saída e itera na correção por você. Todo o ciclo de "adicionar um log, rodar, ler a saída, ajustar" que era manual agora é feito pela IA. Você descreve o bug, e ela investiga.

**IA não substitui suas habilidades de debugging. Ela te dá um segundo cérebro que nunca se cansa de ler stack traces.**

## Código legado: transformando dias em horas

Todo desenvolvedor já esteve aqui: você entra em um novo time ou pega um ticket, e a feature que precisa modificar vive dentro de um arquivo de 2.000 linhas sem documentação, nomes de variáveis crípticos e lógica de negócio que foi escrita três anos atrás por alguém que já saiu da empresa.

A maioria dos desenvolvedores já pede à IA para "explicar este código." A otimização que encontrei foi fazer perguntas estruturadas e em camadas ao invés de uma única pergunta ampla.

Primeira passagem: "Explique o que este módulo faz e qual é o fluxo principal de dados." Segunda passagem: "Quais são os edge cases e modos de falha?" Terceira passagem: "O que acontece se este campo for null?" e "Onde essa configuração é carregada?"

Cada camada se constrói sobre a anterior. A IA rastreia o código e dá respostas específicas com referências de linha. Na terceira passagem, tenho um modelo mental que teria levado dias de leitura manual.

Isso mudou completamente como eu faço onboarding em codebases desconhecidas. O que costumava levar uma semana de leitura cuidadosa agora leva uma tarde.

## Testes: de fardo de manutenção a fluxo automatizado

Escrevi um artigo inteiro sobre como passei um mês inteiro corrigindo testes. O problema central não era escrever testes, era mantê-los. Cada refatoração significava atualizar dezenas de testes acoplados a detalhes de implementação.

O fluxo de trabalho que construí em torno de testes com IA é o que mudou o jogo. Quando refatoro uma assinatura de função, imediatamente peço à IA para atualizar cada teste que a referencia. Quando adiciono uma nova regra de validação, ela gera os casos de teste correspondentes. Quando um teste falha por causa de uma mudança intencional de comportamento, a IA entende a diferença entre uma regressão e uma evolução.

A chave foi tornar testes parte da conversa com IA, não um passo separado. Parei de tratar atualizações de teste como uma tarefa que faço depois de codificar e comecei a incluí-las na mesma sessão de IA onde escrevo a feature. A IA já tem o contexto completo do que mudou e por quê, então os testes que ela gera são precisos na primeira tentativa.

Agora escrevo mais testes do que antes, com menos tempo gasto mantendo-os vivos.

## Desenvolvimento AI-first: o novo modelo mental

Lembra quando o "mobile-first" mudou como construíamos software? Paramos de projetar para desktop e depois adaptar para mobile. Em vez disso, começamos pelas restrições mobile e escalamos para cima. Isso mudou todo o modelo mental.

Algo similar está acontecendo agora. Eu chamo de desenvolvimento AI-first.

A ideia é simples: quando preciso construir algo, eu tento com IA primeiro. Descrevo o que preciso, deixo a IA gerar a implementação inicial, e então itero através de prompts para refinar. Ajustar a arquitetura, corrigir edge cases, melhorar a nomenclatura, tudo através de conversa. Só se a abordagem via IA não estiver convergindo para uma boa solução é que eu entro e escrevo ou corrijo manualmente.

Isso não significa aceitar cegamente o que a IA produz. Significa tratar a IA como ponto de partida ao invés de um arquivo vazio. Você ainda revisa tudo. Ainda toma as decisões arquiteturais. Mas o caminho padrão mudou de "escreva você mesmo e peça ajuda da IA quando travar" para "deixe a IA fazer a primeira tentativa e guie a partir daí."

Essa mudança mental é o que empurrou meu uso tão alto. Quando IA é sua primeira tentativa em tudo, não seu último recurso, você naturalmente interage com ela em cada estágio.

## Quando IA não é bala de prata

Quero ser honesto sobre onde isso falha, porque falha.

IA tem dificuldade com problemas de negócio complexos que carregam muito contexto e têm muitos efeitos colaterais. O tipo de feature onde mudar uma função afeta cinco outros módulos, onde as regras de negócio têm exceções em cima de exceções, e onde a única pessoa que realmente entende a lógica é alguém que trabalha no produto há dois anos.

Nesses casos, IA ainda pode ajudar com partes isoladas, mas não consegue manter o quadro completo. Ela não sabe que mudar o cálculo de desconto vai quebrar o fluxo de faturamento, que vai disparar notificações incorretas, que vai confundir a equipe de suporte ao cliente. Essas cadeias de efeitos colaterais exigem julgamento humano e conhecimento de domínio que nenhuma IA tem hoje.

Se você tentar forçar a IA através de um problema assim, acaba gastando mais tempo corrigindo a saída dela do que teria gasto escrevendo você mesmo. Reconhecer quando parar de promptar e começar a codificar manualmente é uma habilidade por si só.

**IA é uma ferramenta, não um substituto para pensar. Os melhores desenvolvedores sabem quando usá-la e quando largá-la.**

## O harness importa mais que o modelo

Uma coisa que aprendi em 2025 que a maioria dos desenvolvedores ignora: a qualidade do resultado final depende muito do harness ao redor da IA, não apenas do modelo em si.

O que quero dizer com harness é tudo que acontece antes e depois do modelo gerar uma resposta. A ferramenta usa RAG para puxar contexto relevante da sua codebase? Ela integra com MCPs (Model Context Protocol servers) para trazer conhecimento externo? Ela executa verificações adicionais na saída antes de apresentá-la a você?

É por isso que nem todas as ferramentas de código com IA produzem os mesmos resultados mesmo usando o mesmo modelo base. Uma ferramenta como o Stitch do Google, por exemplo, tem conhecimento mais profundo sobre padrões de frontend e bibliotecas de componentes porque seu harness é construído especificamente para esse domínio. O Cursor usa regras de projeto, indexação de codebase e integrações com MCP para trazer contexto mais específico para cada conversa.

O harness é o que transforma um modelo de linguagem genérico em uma ferramenta que realmente entende seu projeto. Sem ele, você recebe respostas genéricas. Com um bom harness, você recebe respostas que já estão alinhadas com sua arquitetura, suas dependências e suas convenções.

Ao escolher suas ferramentas de IA, preste tanta atenção ao harness quanto ao modelo. Um modelo menor com ótima recuperação de contexto frequentemente vai superar um modelo maior sem nenhum contexto.

## A mudança real: não é sobre digitar mais rápido

Se você tirar uma coisa deste post, que seja esta: o valor da IA não é que ela te faz digitar mais rápido. É que ela remove a fricção das partes do desenvolvimento que desaceleram seu pensamento.

Troca de contexto entre docs, código e navegador é reduzida porque a IA traz contexto até você. A lacuna entre "eu sei o que preciso construir" e "tenho uma implementação funcionando" encolhe dramaticamente. A carga cognitiva de manter uma codebase inteira na cabeça é descarregada para uma ferramenta que realmente consegue manter tudo.

É isso que o top 4% significa. Não que eu terceirizei meu trabalho. Que eu usei IA em cada fase do meu fluxo: planejamento, codificação, debugging, testes, revisão e compreensão de sistemas legados. Estava incorporada em como eu trabalho, não algo que eu abria de vez em quando.

## O que mudei para extrair mais da IA

A maior mudança no meu fluxo de trabalho foi passar de uso reativo para uso proativo da IA.

No início, eu usava IA reativamente: tinha um problema, perguntava à IA, recebia uma resposta. Isso funciona, mas deixa muito na mesa.

A mudança aconteceu quando comecei a tratar a IA como colaboradora em cada fase. Descrevo restrições arquiteturais antecipadamente. Peço para ela desafiar minha abordagem antes de me comprometer. Uso-a para explorar três alternativas antes de escolher uma. Alimento-a com minhas regras de projeto e convenções para que cada resposta já esteja alinhada com minha codebase.

Os desenvolvedores que extraem mais valor da IA não são os que fazem mais perguntas. São os que fornecem mais contexto e fazem as perguntas mais afiadas.

## Conclusão

IA mudou a forma como trabalhamos. Isso não é uma previsão, já aconteceu. E beneficia a todos: nos permite gastar menos tempo em tarefas repetitivas e mais tempo nas coisas que realmente importam, as decisões de arquitetura, a lógica de negócio, a experiência do usuário.

Ficar no top 4% dos usuários do Cursor não foi um objetivo. Foi um efeito colateral de usar IA em cada fase do meu trabalho ao longo de 2025. Planejamento, codificação, debugging, testes, revisão. Se tornou parte de como eu penso sobre construir software, e sou um desenvolvedor melhor por causa disso.`,
    },
  },
  {
    slug: "seo-geo-and-why-i-created-booltools",
    title: {
      en: "SEO & GEO in 2026 — Why It Matters More Than Ever and Why I Created BoolTools",
      pt: "SEO & GEO em 2026 — Por Que Importa Mais Do Que Nunca e Por Que Criei o BoolTools",
    },
    publishedAt: "2026-06-22",
    readingTime: 7,
    coverImage: "/blog/booltools-seo-geo.png",
    excerpt: {
      en: "Most developers deal with SEO daily without realizing it. Every meta tag, every alt attribute, every sitemap config is SEO work. Here is why it matters, what breaks silently, and why I built BoolTools to catch regressions automatically.",
      pt: "A maioria dos desenvolvedores lida com SEO diariamente sem perceber. Cada meta tag, cada atributo alt, cada configuração de sitemap é trabalho de SEO. Aqui está por que importa, o que quebra silenciosamente, e por que criei o BoolTools para capturar regressões automaticamente.",
    },
    content: {
      en: `Most developers have a complicated relationship with SEO. We know it matters, but it often feels like someone else's problem. We write the code, configure the server, deploy the application, and then a marketing team worries about search rankings. At least, that is how it used to work.

In 2026, that separation no longer holds. If you are shipping a Next.js blog, a SaaS dashboard with public-facing pages, an open-source documentation site, or anything that depends on organic traffic, SEO is your responsibility as much as it is anyone else's. And now there is a new layer to worry about: GEO.

## SEO and GEO from a developer's perspective

As developers, we already deal with SEO more than we realize. Every time you set up \`generateMetadata\` in a Next.js page, render \`<title>\` and \`<meta>\` tags, configure a \`sitemap.xml\`, or add \`alt\` attributes to \`<Image>\` components, you are doing SEO work. The difference is that most of us do it without a systematic approach.

**SEO (Search Engine Optimization)** is the set of technical and content practices that determine how well search engines like Google can crawl, index, and rank your pages. From a dev standpoint, it boils down to: is my rendered HTML correct, fast, accessible, and semantically meaningful?

**GEO (Generative Engine Optimization)** is the newer discipline. It focuses on making your content accessible and citable by AI-powered engines like ChatGPT, Perplexity, Google AI Overviews, and similar tools. These systems crawl the web, extract information, and present it as direct answers. If your content is not structured for them, you are invisible to a rapidly growing discovery channel.

## Why developers should care

Let me put this in concrete terms.

You build a SaaS product. Your pricing page, feature comparison, API documentation, and changelog are all public pages. These pages are what potential users find through Google or through an AI assistant when they ask "best tool for X." If those pages have missing meta descriptions, broken structured data, no \`hreflang\` tags for internationalization, or block AI crawlers in \`robots.txt\`, you are losing signups. Not because the product is bad, but because the technical implementation is incomplete.

For **developer blogs and technical content**, good SEO means your tutorials, case studies, and deep dives actually reach the audience they were written for. Without proper heading hierarchy, canonical URLs, and Open Graph tags, your content competes at a disadvantage.

For **open-source projects**, your documentation site is often the first point of contact. If search engines cannot properly index it, or AI models cannot cite it, new contributors and users will find competitor projects first.

The point is: **SEO and GEO are not marketing concerns. They are implementation details that live in your codebase.**

## The technical checklist for SEO

Here is what actually matters from a code perspective:

**Server and infrastructure.** HTTPS is mandatory. Your server should return proper status codes (200, 301, 404, not soft 404s). Response headers should include \`Content-Security-Policy\`, \`X-Content-Type-Options\`, \`X-Frame-Options\`, and \`Strict-Transport-Security\`. Your \`robots.txt\` should be correctly configured, and your \`sitemap.xml\` should be generated dynamically and stay up to date with every new route.

**HTML and rendering.** Every page needs exactly one \`<h1>\`. The heading hierarchy (h1 through h6) should be sequential without skipping levels. Title tags need to be unique per page, between 30 and 60 characters. Meta descriptions should be unique and between 120 and 160 characters. All images need descriptive \`alt\` attributes. Links should have meaningful anchor text instead of "click here."

**Performance and Core Web Vitals.** Google uses LCP (Largest Contentful Paint), INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift) as ranking signals. In practice, this means: optimize image loading with \`next/image\` or equivalent lazy-loading strategies, minimize JavaScript bundle size, avoid layout shifts caused by dynamically injected content, and keep server response times under 200ms. Every unoptimized third-party script you add to \`<head>\` is a potential ranking penalty.

**Structured data.** JSON-LD scripts using Schema.org vocabulary help search engines understand what your page represents. For a blog post, you want \`Article\` schema with \`headline\`, \`datePublished\`, \`author\`, and \`image\`. For a product page, \`Product\` schema with \`offers\` and \`review\`. For documentation, \`TechArticle\` or \`HowTo\`. These are not decorative, they directly influence whether you get rich snippets in search results.

**Internationalization.** If your app supports multiple locales, every page variant needs correct \`hreflang\` tags and \`alternate\` links. Missing or misconfigured \`hreflang\` leads to duplicate content penalties and poor ranking in localized markets.

## The technical checklist for GEO

GEO is newer, but the technical requirements are already well-defined:

**AI crawler access.** Your \`robots.txt\` needs to explicitly allow AI crawlers like \`GPTBot\`, \`ClaudeBot\`, \`PerplexityBot\`, and \`Google-Extended\`. Many default configurations block these user agents. If your content is behind a restrictive \`robots.txt\`, AI engines simply will not index it.

**llms.txt.** This is an emerging standard, a file at your domain root that describes your site structure, purpose, and key pages in a format designed for language models. Think of it as a \`robots.txt\` for AI comprehension. It tells LLMs what your site is about, where the important content lives, and how to navigate it.

**Semantic HTML and content structure.** AI models parse your rendered HTML to extract information. Clean semantic markup, proper use of \`<article>\`, \`<section>\`, \`<nav>\`, \`<header>\`, and \`<footer>\`, with clear heading hierarchies and self-contained paragraphs, makes your content significantly more likely to be extracted and cited.

**Structured data for AI.** The same JSON-LD structured data that helps Google also helps AI models understand your content programmatically. Well-defined schemas give AI engines metadata they can use to accurately represent your content in generated answers.

## The real problem: SEO regressions in the development workflow

Here is the part that hits developers the hardest.

You set up your project correctly. Meta tags are in place. Structured data is valid. Sitemap is generated. Performance is solid. Everything passes. You move on to building features.

Then, two months later, someone adds a new page component and forgets \`generateMetadata\`. Another developer refactors the layout and accidentally removes the \`<h1>\`. A dependency update changes how images render and breaks \`alt\` propagation. A new analytics script gets added to \`<head>\` and tanks LCP by 800ms. Your dynamically generated \`sitemap.xml\` starts returning stale routes because a filter condition changed.

None of these trigger build errors. None of them break tests. They silently degrade your search visibility, and you only find out weeks later when traffic starts declining.

**SEO and GEO compliance is not a one-time setup. It is a continuous validation problem.** And it is exactly the kind of problem developers are bad at catching manually because the feedback loop is weeks long and the symptoms are indirect.

Running Lighthouse in Chrome DevTools catches some of these issues, but only for one page at a time, and only the basic ones. Checking 200+ rules across every public route in your application, after every deployment, manually? That does not scale.

## Why I created BoolTools

This problem is what led me to create **BoolTools**.

BoolTools is a new initiative where I am building developer-focused tools that solve real, practical problems in the development workflow. Not marketing tools repackaged for developers. Actual tools built with a developer's mental model in mind.

The first tool under BoolTools is an **open-source SEO and GEO crawler** that runs **200+ checks** across your entire site. Technical SEO, on-page optimization, performance signals, security headers, structured data validation, link analysis, and full GEO readiness assessment including AI crawler access, \`llms.txt\` validation, and content citability scoring. The project is fully open-source and available on GitHub at https://github.com/booltools/booltools-seo-crawler

It gives you a clear, actionable report prioritized by severity and impact. Not vague suggestions, but specific findings like: "Page /pricing is missing a meta description," "Structured data on /blog/post-1 has an invalid datePublished format," or "robots.txt is blocking GPTBot."

The goal is to make SEO and GEO validation as routine as running your test suite. A tool you can point at your deployed application and get an immediate, comprehensive answer: **is my site following best practices, or did something regress?**

## What comes next

BoolTools is just getting started. The SEO and GEO crawler is the first tool, but I plan to build more utilities that address real gaps in the developer workflow.

If you are building anything with public-facing pages, whether it is a SaaS, a blog, a documentation site, or an open-source project, SEO and GEO are not optional. They are technical requirements that deserve the same attention as your test coverage, your CI pipeline, and your deployment strategy.

And if you want a reliable, automated way to catch regressions before they cost you traffic, BoolTools is built exactly for that.`,
      pt: `A maioria dos desenvolvedores tem uma relação complicada com SEO. Sabemos que importa, mas frequentemente parece ser problema de outra pessoa. Escrevemos o código, configuramos o servidor, fazemos o deploy da aplicação, e então um time de marketing se preocupa com rankings de busca. Pelo menos, era assim que costumava funcionar.

Em 2026, essa separação não funciona mais. Se você está publicando um blog em Next.js, um dashboard SaaS com páginas públicas, um site de documentação open-source, ou qualquer coisa que dependa de tráfego orgânico, SEO é sua responsabilidade tanto quanto de qualquer outra pessoa. E agora há uma nova camada para se preocupar: GEO.

## SEO e GEO pela perspectiva do desenvolvedor

Como desenvolvedores, já lidamos com SEO mais do que percebemos. Toda vez que você configura \`generateMetadata\` em uma página Next.js, renderiza tags \`<title>\` e \`<meta>\`, configura um \`sitemap.xml\`, ou adiciona atributos \`alt\` em componentes \`<Image>\`, você está fazendo trabalho de SEO. A diferença é que a maioria de nós faz isso sem uma abordagem sistemática.

**SEO (Search Engine Optimization)** é o conjunto de práticas técnicas e de conteúdo que determinam quão bem mecanismos de busca como o Google conseguem rastrear, indexar e classificar suas páginas. Do ponto de vista do dev, se resume a: meu HTML renderizado está correto, rápido, acessível e semanticamente significativo?

**GEO (Generative Engine Optimization)** é a disciplina mais recente. Foca em tornar seu conteúdo acessível e citável por engines com IA como ChatGPT, Perplexity, Google AI Overviews e ferramentas similares. Esses sistemas rastreiam a web, extraem informações e as apresentam como respostas diretas. Se seu conteúdo não está estruturado para eles, você é invisível para um canal de descoberta em rápido crescimento.

## Por que desenvolvedores devem se importar

Vou colocar em termos concretos.

Você constrói um produto SaaS. Sua página de preços, comparação de funcionalidades, documentação da API e changelog são todas páginas públicas. Essas páginas são o que usuários potenciais encontram pelo Google ou por um assistente de IA quando perguntam "melhor ferramenta para X." Se essas páginas têm meta descriptions faltando, dados estruturados quebrados, sem tags \`hreflang\` para internacionalização, ou bloqueiam crawlers de IA no \`robots.txt\`, você está perdendo cadastros. Não porque o produto é ruim, mas porque a implementação técnica está incompleta.

Para **blogs de desenvolvimento e conteúdo técnico**, bom SEO significa que seus tutoriais, cases e deep dives realmente alcançam o público para o qual foram escritos. Sem hierarquia adequada de headings, URLs canônicas e tags Open Graph, seu conteúdo compete em desvantagem.

Para **projetos open-source**, seu site de documentação é frequentemente o primeiro ponto de contato. Se mecanismos de busca não conseguem indexá-lo adequadamente, ou modelos de IA não conseguem citá-lo, novos contribuidores e usuários encontrarão projetos concorrentes primeiro.

O ponto é: **SEO e GEO não são preocupações de marketing. São detalhes de implementação que vivem no seu codebase.**

## O checklist técnico para SEO

Aqui está o que realmente importa da perspectiva de código:

**Servidor e infraestrutura.** HTTPS é obrigatório. Seu servidor deve retornar status codes adequados (200, 301, 404, não soft 404s). Headers de resposta devem incluir \`Content-Security-Policy\`, \`X-Content-Type-Options\`, \`X-Frame-Options\` e \`Strict-Transport-Security\`. Seu \`robots.txt\` deve estar corretamente configurado, e seu \`sitemap.xml\` deve ser gerado dinamicamente e manter-se atualizado com cada nova rota.

**HTML e renderização.** Cada página precisa de exatamente um \`<h1>\`. A hierarquia de headings (h1 até h6) deve ser sequencial sem pular níveis. Title tags precisam ser únicas por página, entre 30 e 60 caracteres. Meta descriptions devem ser únicas e entre 120 e 160 caracteres. Todas as imagens precisam de atributos \`alt\` descritivos. Links devem ter texto âncora significativo ao invés de "clique aqui."

**Performance e Core Web Vitals.** O Google usa LCP (Largest Contentful Paint), INP (Interaction to Next Paint) e CLS (Cumulative Layout Shift) como sinais de ranking. Na prática, isso significa: otimize carregamento de imagens com \`next/image\` ou estratégias equivalentes de lazy-loading, minimize o tamanho do bundle JavaScript, evite layout shifts causados por conteúdo injetado dinamicamente, e mantenha tempos de resposta do servidor abaixo de 200ms. Cada script de terceiros não otimizado que você adiciona no \`<head>\` é uma penalidade potencial de ranking.

**Dados estruturados.** Scripts JSON-LD usando vocabulário Schema.org ajudam mecanismos de busca a entender o que sua página representa. Para um post de blog, você precisa do schema \`Article\` com \`headline\`, \`datePublished\`, \`author\` e \`image\`. Para uma página de produto, schema \`Product\` com \`offers\` e \`review\`. Para documentação, \`TechArticle\` ou \`HowTo\`. Estes não são decorativos, influenciam diretamente se você consegue rich snippets nos resultados de busca.

**Internacionalização.** Se seu app suporta múltiplos locales, cada variante de página precisa de tags \`hreflang\` e links \`alternate\` corretos. \`hreflang\` ausente ou mal configurado leva a penalidades de conteúdo duplicado e rankings ruins em mercados localizados.

## O checklist técnico para GEO

GEO é mais novo, mas os requisitos técnicos já estão bem definidos:

**Acesso de crawlers de IA.** Seu \`robots.txt\` precisa permitir explicitamente crawlers de IA como \`GPTBot\`, \`ClaudeBot\`, \`PerplexityBot\` e \`Google-Extended\`. Muitas configurações padrão bloqueiam esses user agents. Se seu conteúdo está atrás de um \`robots.txt\` restritivo, engines de IA simplesmente não vão indexá-lo.

**llms.txt.** Este é um padrão emergente, um arquivo na raiz do seu domínio que descreve a estrutura, propósito e páginas principais do seu site em um formato projetado para modelos de linguagem. Pense nele como um \`robots.txt\` para compreensão por IA. Ele diz aos LLMs sobre o que é seu site, onde o conteúdo importante está, e como navegá-lo.

**HTML semântico e estrutura de conteúdo.** Modelos de IA fazem parse do seu HTML renderizado para extrair informações. Markup semântico limpo, uso adequado de \`<article>\`, \`<section>\`, \`<nav>\`, \`<header>\` e \`<footer>\`, com hierarquias de heading claras e parágrafos autocontidos, torna seu conteúdo significativamente mais provável de ser extraído e citado.

**Dados estruturados para IA.** Os mesmos dados estruturados em JSON-LD que ajudam o Google também ajudam modelos de IA a entender seu conteúdo programaticamente. Schemas bem definidos dão aos engines de IA metadata que podem usar para representar seu conteúdo com precisão em respostas geradas.

## O verdadeiro problema: regressões de SEO no fluxo de desenvolvimento

Aqui está a parte que mais atinge os desenvolvedores.

Você configura seu projeto corretamente. Meta tags estão no lugar. Dados estruturados estão válidos. Sitemap está gerado. Performance está sólida. Tudo passa. Você segue em frente para construir funcionalidades.

Então, dois meses depois, alguém adiciona um novo componente de página e esquece o \`generateMetadata\`. Outro desenvolvedor refatora o layout e acidentalmente remove o \`<h1>\`. Uma atualização de dependência muda como imagens renderizam e quebra a propagação do \`alt\`. Um novo script de analytics é adicionado ao \`<head>\` e derruba o LCP em 800ms. Seu \`sitemap.xml\` gerado dinamicamente começa a retornar rotas desatualizadas porque uma condição de filtro mudou.

Nenhum desses aciona erros de build. Nenhum deles quebra testes. Eles degradam silenciosamente sua visibilidade de busca, e você só descobre semanas depois quando o tráfego começa a cair.

**Conformidade com SEO e GEO não é uma configuração única. É um problema de validação contínua.** E é exatamente o tipo de problema que desenvolvedores são ruins em capturar manualmente porque o ciclo de feedback é de semanas e os sintomas são indiretos.

Rodar Lighthouse no Chrome DevTools captura alguns desses problemas, mas apenas para uma página por vez, e apenas os básicos. Verificar mais de 200 regras em cada rota pública da sua aplicação, após cada deployment, manualmente? Isso não escala.

## Por que criei o BoolTools

Esse problema foi o que me levou a criar o **BoolTools**.

BoolTools é uma nova iniciativa onde estou construindo ferramentas focadas em desenvolvedores que resolvem problemas reais e práticos no fluxo de trabalho de desenvolvimento. Não são ferramentas de marketing reembaladas para devs. São ferramentas construídas com o modelo mental do desenvolvedor em mente.

A primeira ferramenta do BoolTools é um **crawler de SEO e GEO open-source** que executa **mais de 200 verificações** em todo o seu site. SEO técnico, otimização on-page, sinais de performance, headers de segurança, validação de dados estruturados, análise de links, e avaliação completa de prontidão para GEO incluindo acesso de crawlers de IA, validação de \`llms.txt\` e score de citabilidade de conteúdo. O projeto é totalmente open-source e está disponível no GitHub em https://github.com/booltools/booltools-seo-crawler .

Ele fornece um relatório claro e acionável priorizado por severidade e impacto. Não sugestões vagas, mas achados específicos como: "A página /pricing está sem meta description," "Dados estruturados em /blog/post-1 têm um formato inválido de datePublished," ou "robots.txt está bloqueando o GPTBot."

O objetivo é tornar a validação de SEO e GEO tão rotineira quanto rodar sua suíte de testes. Uma ferramenta que você pode apontar para sua aplicação em produção e obter uma resposta imediata e abrangente: **meu site está seguindo as melhores práticas, ou algo regrediu?**

## O que vem a seguir

BoolTools está apenas começando. O crawler de SEO e GEO é a primeira ferramenta, mas planejo construir mais utilitários que abordem lacunas reais no fluxo de trabalho do desenvolvedor.

Se você está construindo qualquer coisa com páginas públicas, seja um SaaS, um blog, um site de documentação ou um projeto open-source, SEO e GEO não são opcionais. São requisitos técnicos que merecem a mesma atenção que sua cobertura de testes, seu pipeline de CI e sua estratégia de deployment.

E se você quer uma forma confiável e automatizada de capturar regressões antes que custem tráfego, o BoolTools foi construído exatamente para isso.`,
    },
  },
  {
    slug: "observability-invisible-failures",
    title: {
      en: "You Cannot Solve What You Cannot See — How Observability Saved a Production System",
      pt: "Você Não Pode Resolver o Que Não Pode Ver — Como Observabilidade Salvou um Sistema em Produção",
    },
    publishedAt: "2026-05-29",
    readingTime: 5,
    coverImage: "/blog/observability-dashboard.png",
    excerpt: {
      en: "In production environments, the most critical failures are often the ones that leave no trace. This is the story of how distributed tracing revealed a silent killer.",
      pt: "Em ambientes de produção, as falhas mais críticas são frequentemente aquelas que não deixam rastros. Esta é a história de como rastreamento distribuído revelou um problema silencioso.",
    },
    content: {
      en: `In production environments, the most critical failures are often the ones that leave no trace.

Some time ago, I faced an issue where servers would shut down unexpectedly, without errors, without logs, and without any clear signal of what was happening. Traditional debugging approaches led nowhere.

My initial assumption was infrastructure related. I suspected high request volume, so I scaled the system horizontally by adding more nodes. However, the problem persisted. Even with increased capacity, nodes continued to fail.

At that point, it became clear that the issue wasn't about scale, it was about visibility.

## The power of distributed tracing

I implemented distributed tracing using Datadog and allowed the system to run until the failure occurred again. Once it did, I analyzed the traces and built a dashboard to better understand the system's behavior over time.

That decision changed everything.

The data revealed an abnormal spike: a specific function was being executed repeatedly, far beyond expected patterns. Upon deeper inspection, I identified the root cause: a recursive function that, under certain conditions, was entering an infinite loop.

This loop wasn't generating explicit errors, but it was silently exhausting system resources until the server crashed.

## The fix and the lesson

After correcting the recursion logic, the issue was fully resolved. The system stabilized, and no further unexpected shutdowns occurred.

This experience reinforced a key principle:

**You cannot solve what you cannot see.**

Observability is not just a tool, it is a fundamental capability for building reliable systems. Without it, teams rely on assumptions. With it, they operate on evidence.

## Why observability matters

In modern distributed systems, failures are rarely obvious. They don't always trigger alarms or show up in basic logs. Sometimes, the system appears to be working until it suddenly isn't.

That's where observability becomes critical. It allows you to:
- Trace requests across multiple services
- Identify performance bottlenecks before they become critical
- Understand system behavior under load
- Debug issues that traditional logging cannot capture

The ability to see what your system is doing in real time is not optional. It's essential.`,
      pt: `Em ambientes de produção, as falhas mais críticas são frequentemente aquelas que não deixam rastros.

Há algum tempo, enfrentei um problema onde servidores eram desligados inesperadamente, sem erros, sem logs e sem qualquer sinal claro do que estava acontecendo. Abordagens tradicionais de depuração não levavam a lugar algum.

Minha suposição inicial era relacionada à infraestrutura. Suspeitei de alto volume de requisições, então escalei o sistema horizontalmente adicionando mais nós. No entanto, o problema persistiu. Mesmo com capacidade aumentada, os nós continuavam a falhar.

Naquele momento, ficou claro que o problema não era sobre escala, era sobre visibilidade.

## O poder do rastreamento distribuído

Implementei rastreamento distribuído usando Datadog e permiti que o sistema rodasse até a falha ocorrer novamente. Quando isso aconteceu, analisei os rastros e construí um dashboard para entender melhor o comportamento do sistema ao longo do tempo.

Essa decisão mudou tudo.

Os dados revelaram um pico anormal: uma função específica estava sendo executada repetidamente, muito além dos padrões esperados. Com uma inspeção mais profunda, identifiquei a causa raiz: uma função recursiva que, sob certas condições, estava entrando em um loop infinito.

Esse loop não estava gerando erros explícitos, mas estava silenciosamente esgotando os recursos do sistema até o servidor travar.

## A correção e a lição

Após corrigir a lógica da recursão, o problema foi completamente resolvido. O sistema estabilizou, e não ocorreram mais desligamentos inesperados.

Essa experiência reforçou um princípio fundamental:

**Você não pode resolver o que não pode ver.**

Observabilidade não é apenas uma ferramenta, é uma capacidade fundamental para construir sistemas confiáveis. Sem ela, as equipes dependem de suposições. Com ela, operam com base em evidências.

## Por que observabilidade importa

Em sistemas distribuídos modernos, falhas raramente são óbvias. Elas nem sempre acionam alarmes ou aparecem em logs básicos. Às vezes, o sistema parece estar funcionando até que de repente não está mais.

É aí que a observabilidade se torna crítica. Ela permite que você:
- Rastreie requisições através de múltiplos serviços
- Identifique gargalos de performance antes que se tornem críticos
- Entenda o comportamento do sistema sob carga
- Depure problemas que logs tradicionais não conseguem capturar

A capacidade de ver o que seu sistema está fazendo em tempo real não é opcional. É essencial.`,
    },
  },
  {
    slug: "i-spent-a-month-fixing-tests",
    title: {
      en: "I Spent a Full Month Fixing Tests — Here's What I Learned",
      pt: "Passei um Mês Inteiro Corrigindo Testes — Aqui Está o Que Aprendi",
    },
    publishedAt: "2026-03-13",
    readingTime: 4,
    coverImage: "/blog/testing-maintenance.png",
    excerpt: {
      en: "I once spent a full month fixing tests. Not building features. Not improving the product. Just fixing tests. Here's what happened.",
      pt: "Uma vez passei um mês inteiro corrigindo testes. Sem construir funcionalidades. Sem melhorar o produto. Apenas corrigindo testes. Aqui está o que aconteceu.",
    },
    content: {
      en: `I once spent a full month… fixing tests.

Not building features.  
Not improving the product.  
Just fixing tests.

Here's what happened.

## A few years ago, I went all-in on testing

Same codebase.  
1,000+ tests.  
Unit. Integration. End-to-end. Everything.

At first, it felt amazing.

I could confidently:
- Validate complex math-heavy logic  
- Test database queries without fear  
- Protect critical flows like the entire e-commerce checkout  

It felt like nothing could break.

## But then reality kicked in

Every small change started breaking tests.

Not real bugs. Just… tests.

Added a new internal function call?  
→ Update mocks  

Refactored something harmless?  
→ Fix 5 tests  

Changed implementation but not behavior?  
→ Still broken  

And suddenly, every feature had an extra cost: **+1 full day just for tests**

Now multiply that by:
- Every task  
- Even small ones  
- Over an entire year  

That's when I realized:

**I wasn't just writing tests. I was maintaining a second codebase.**

## My controversial takeaway

Tests are powerful. They can save you.

But testing everything comes with a hidden price: **maintenance.**

If I could go back, I'd do it differently:

**I'd test what truly matters.**

The core flows.  
The things that, if broken, would kill the product.

Not everything.

## The AI game changer

Now, here's the interesting part.

This was 3 years ago, before AI really entered the game.

Recently, I've been using AI to generate and fix tests.

And it changes everything.

AI can:
- Create tests faster  
- Update broken tests automatically  
- Run fix loops with minimal human-in-the-loop involvement  

What used to take days… now takes minutes.

So maybe today, having 1,000+ tests isn't the problem anymore.

## But one thing still matters

Always balance  
👉 number of tests  
vs  
👉 maintenance cost  

Because in the end, **tests should protect your velocity, not kill it.**`,
      pt: `Uma vez passei um mês inteiro… corrigindo testes.

Sem construir funcionalidades.  
Sem melhorar o produto.  
Apenas corrigindo testes.

Aqui está o que aconteceu.

## Há alguns anos, apostei totalmente em testes

Mesmo código base.  
Mais de 1.000 testes.  
Unitários. Integração. End-to-end. Tudo.

No início, foi incrível.

Eu podia confiantemente:
- Validar lógica complexa com muita matemática  
- Testar queries do banco sem medo  
- Proteger fluxos críticos como todo o checkout do e-commerce  

Parecia que nada poderia quebrar.

## Mas então a realidade bateu

Cada pequena mudança começou a quebrar testes.

Não bugs reais. Apenas… testes.

Adicionou uma nova chamada de função interna?  
→ Atualizar mocks  

Refatorou algo inofensivo?  
→ Corrigir 5 testes  

Mudou a implementação mas não o comportamento?  
→ Ainda quebrado  

E de repente, cada funcionalidade tinha um custo extra: **+1 dia inteiro apenas para testes**

Agora multiplique isso por:
- Cada tarefa  
- Até as pequenas  
- Durante um ano inteiro  

Foi quando percebi:

**Eu não estava apenas escrevendo testes. Estava mantendo uma segunda base de código.**

## Minha conclusão controversa

Testes são poderosos. Eles podem te salvar.

Mas testar tudo tem um preço oculto: **manutenção.**

Se eu pudesse voltar atrás, faria diferente:

**Eu testaria o que realmente importa.**

Os fluxos principais.  
As coisas que, se quebrassem, matariam o produto.

Não tudo.

## A mudança de jogo da IA

Agora, aqui está a parte interessante.

Isso foi há 3 anos, antes da IA realmente entrar no jogo.

Recentemente, tenho usado IA para gerar e corrigir testes.

E isso muda tudo.

A IA pode:
- Criar testes mais rápido  
- Atualizar testes quebrados automaticamente  
- Executar loops de correção com mínima intervenção humana  

O que costumava levar dias… agora leva minutos.

Então talvez hoje, ter mais de 1.000 testes não seja mais o problema.

## Mas uma coisa ainda importa

Sempre equilibre  
👉 número de testes  
vs  
👉 custo de manutenção  

Porque no final, **testes devem proteger sua velocidade, não matá-la.**`,
    },
  },
  {
    slug: "i-removed-nextjs-from-my-project",
    title: {
      en: "I Removed Next.js From My Project and It Was the Right Decision",
      pt: "Eu Removi o Next.js do Meu Projeto e Foi a Decisão Certa",
    },
    publishedAt: "2025-03-13",
    readingTime: 5,
    coverImage: "/blog/nextjs-removal-pr.png",
    excerpt: {
      en: "This week I made a decision that took me much longer than it should have: I removed Next.js from one of my production projects.",
      pt: "Esta semana tomei uma decisão que demorou muito mais do que deveria: removi o Next.js de um dos meus projetos em produção.",
    },
    content: {
      en: `This week I made a decision that took me much longer than it should have: I removed Next.js from one of my production projects.

For a long time, I tried to make it work.

Next.js is an excellent framework and one of the most powerful tools in the modern React ecosystem. But after months of adapting my architecture around it, I realized something important:

**Great tools are not always the right tools for every project.**

## The main challenge: WebSockets

My application relies heavily on real-time communication using Apollo Client, Apollo Server, and GraphQL Subscriptions.

The problem is that the default Next.js server does not support WebSockets by default. Because of that, I had to build a custom server to handle them.

Creating this setup required a significant amount of work. I searched extensively for examples combining Next.js with Apollo and GraphQL subscriptions in a similar architecture, but I couldn't find any that matched my configuration. In the end, I had to design and implement the solution myself.

While the custom server worked, it came with an important downside: **you lose many of the benefits of the standard Next.js server**, including some optimizations and tooling that make the framework so attractive in the first place.

## Development performance became a problem

As the application grew, development performance started to slow down significantly.

I upgraded the project to use Turbopack, hoping to improve compilation speed. The improvement was noticeable, but it still wasn't enough. Navigating between pages in development remained slow, especially because the application had grown to include many pages.

Over time, this started to impact developer productivity.

## SEO wasn't a strong reason to keep it

Another important factor was the nature of the product.

Most of the application is behind authentication and used by paying customers, meaning there are very few public pages. Because of that, the SEO advantages often associated with frameworks like Next.js were not a strong justification for maintaining the added complexity.

## A decision I should have made earlier

Looking back, I probably should have made this decision sooner.

Sometimes we spend too much time trying to force a tool to fit our architecture instead of stepping back and asking a simpler question:

**Is this tool still solving my problems or creating new ones?**

## Final thoughts

This is not a criticism of Next.js. It remains an outstanding framework and a great choice for many types of applications, particularly content heavy platforms and SEO driven products.

But engineering decisions should always be context driven.

**Framework popularity should never replace architectural fit.**

Sometimes the most impactful optimization you can make is simply choosing the right level of complexity for your system.

And in my case, removing Next.js turned out to be exactly that.`,
      pt: `Esta semana tomei uma decisão que demorou muito mais do que deveria: removi o Next.js de um dos meus projetos em produção.

Por muito tempo, tentei fazê-lo funcionar.

Next.js é um framework excelente e uma das ferramentas mais poderosas no ecossistema React moderno. Mas depois de meses adaptando minha arquitetura em torno dele, percebi algo importante:

**Boas ferramentas nem sempre são as ferramentas certas para cada projeto.**

## O principal desafio: WebSockets

Minha aplicação depende fortemente de comunicação em tempo real usando Apollo Client, Apollo Server e GraphQL Subscriptions.

O problema é que o servidor padrão do Next.js não suporta WebSockets por padrão. Por causa disso, tive que construir um servidor customizado para lidar com eles.

Criar essa configuração exigiu uma quantidade significativa de trabalho. Procurei extensivamente por exemplos combinando Next.js com Apollo e GraphQL subscriptions em uma arquitetura similar, mas não encontrei nenhum que correspondesse à minha configuração. No final, tive que projetar e implementar a solução eu mesmo.

Embora o servidor customizado funcionasse, veio com uma desvantagem importante: **você perde muitos dos benefícios do servidor padrão do Next.js**, incluindo algumas otimizações e ferramentas que tornam o framework tão atraente.

## Performance de desenvolvimento virou um problema

Conforme a aplicação crescia, a performance de desenvolvimento começou a diminuir significativamente.

Atualizei o projeto para usar Turbopack, esperando melhorar a velocidade de compilação. A melhoria foi notável, mas ainda não foi suficiente. Navegar entre páginas em desenvolvimento permaneceu lento, especialmente porque a aplicação havia crescido para incluir muitas páginas.

Com o tempo, isso começou a impactar a produtividade do desenvolvedor.

## SEO não era uma razão forte para mantê-lo

Outro fator importante foi a natureza do produto.

A maior parte da aplicação está atrás de autenticação e é usada por clientes pagantes, o que significa que há muito poucas páginas públicas. Por causa disso, as vantagens de SEO frequentemente associadas a frameworks como Next.js não eram uma justificativa forte para manter a complexidade adicional.

## Uma decisão que deveria ter tomado antes

Olhando para trás, provavelmente deveria ter tomado essa decisão mais cedo.

Às vezes gastamos muito tempo tentando forçar uma ferramenta a se adequar à nossa arquitetura em vez de dar um passo atrás e fazer uma pergunta mais simples:

**Esta ferramenta ainda está resolvendo meus problemas ou criando novos?**

## Pensamentos finais

Isso não é uma crítica ao Next.js. Ele permanece um framework excelente e uma ótima escolha para muitos tipos de aplicações, particularmente plataformas com muito conteúdo e produtos orientados a SEO.

Mas decisões de engenharia devem sempre ser orientadas pelo contexto.

**A popularidade de um framework nunca deve substituir o ajuste arquitetural.**

Às vezes, a otimização mais impactante que você pode fazer é simplesmente escolher o nível certo de complexidade para o seu sistema.

E no meu caso, remover o Next.js acabou sendo exatamente isso.`,
    },
  },
];
