import { NextResponse } from "next/server";

const BASE_URL = "https://marcelodiani.online";

const API_CATALOG = {
  linkset: [
    {
      anchor: `${BASE_URL}/api/chat`,
      "service-desc": [{ href: `${BASE_URL}/llms.txt`, type: "text/plain" }],
      "service-doc": [{ href: BASE_URL, type: "text/html" }],
      status: [{ href: `${BASE_URL}/api/chat`, type: "application/json" }],
    },
  ],
};

export function GET() {
  return NextResponse.json(API_CATALOG, {
    headers: { "Content-Type": "application/linkset+json" },
  });
}
