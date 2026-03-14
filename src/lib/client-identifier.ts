import { headers } from "next/headers";

export async function getClientIdentifier(): Promise<string> {
  const requestHeaders = await headers();
  const vercelForwarded = requestHeaders.get("x-vercel-forwarded-for");
  const forwarded = requestHeaders.get("x-forwarded-for");
  const realIp = requestHeaders.get("x-real-ip");
  
  return (
    vercelForwarded?.split(",")[0]?.trim() ||
    forwarded?.split(",")[0]?.trim() ||
    realIp ||
    "unknown"
  );
}
