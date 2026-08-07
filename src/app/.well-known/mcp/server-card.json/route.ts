import { NextResponse } from "next/server";

const BASE_URL = "https://marcelodiani.online";

const SERVER_CARD = {
  serverInfo: {
    name: "marcelodiani-portfolio",
    version: "1.0.0",
    description: "Marcelo B. Diani portfolio and blog — Senior Full Stack Developer specializing in React, Node.js, and cloud technologies.",
  },
  transport: {
    type: "https",
    endpoint: `${BASE_URL}/api/chat`,
  },
  capabilities: {
    resources: true,
    tools: false,
    prompts: false,
  },
};

export function GET() {
  return NextResponse.json(SERVER_CARD);
}
