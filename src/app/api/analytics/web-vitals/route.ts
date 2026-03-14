import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface WebVitalMetric {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  navigationType: string;
}

export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalMetric = await request.json();

    if (process.env.NODE_ENV === "development") {
      console.log("Web Vital:", {
        name: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing web vitals:", error);
    return NextResponse.json(
      { error: "Failed to process metric" },
      { status: 500 }
    );
  }
}
