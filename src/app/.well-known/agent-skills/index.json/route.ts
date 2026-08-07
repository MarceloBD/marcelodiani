import { NextResponse } from "next/server";

const BASE_URL = "https://marcelodiani.online";

const AGENT_SKILLS_INDEX = {
  $schema: "https://specs.agentskills.org/v0.2.0/schema.json",
  skills: [
    {
      name: "portfolio-chat",
      type: "conversational",
      description: "AI assistant that answers questions about Marcelo Diani's experience, skills, projects, and professional background.",
      url: `${BASE_URL}/api/chat`,
      sha256: "",
    },
    {
      name: "portfolio-llms-txt",
      type: "informational",
      description: "Machine-readable summary of Marcelo Diani's portfolio, blog posts, and professional information.",
      url: `${BASE_URL}/llms.txt`,
      sha256: "",
    },
  ],
};

export function GET() {
  return NextResponse.json(AGENT_SKILLS_INDEX);
}
