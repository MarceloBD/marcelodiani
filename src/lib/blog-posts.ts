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
