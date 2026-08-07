const ROBOTS_TXT = `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

Sitemap: https://marcelodiani.online/sitemap.xml
`;

export function GET() {
  return new Response(ROBOTS_TXT, {
    headers: { "Content-Type": "text/plain" },
  });
}
