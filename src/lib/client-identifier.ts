import { headers } from "next/headers";

export async function getClientIdentifier(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  const realIp = requestHeaders.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}
