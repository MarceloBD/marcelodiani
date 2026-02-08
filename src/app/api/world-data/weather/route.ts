import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/api-cache";

const CACHE_TTL_MS = 5 * 60 * 1_000; // 5 minutes
const CACHE_KEY_PREFIX = "weather";

interface OpenMeteoCurrentWeather {
  temperature_2m: number;
  weather_code: number;
  wind_speed_10m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
}

interface OpenMeteoDaily {
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  time: string[];
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrentWeather;
  daily: OpenMeteoDaily;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const latitude = searchParams.get("lat") || "-23.55";
  const longitude = searchParams.get("lon") || "-46.63";

  const cacheKey = `${CACHE_KEY_PREFIX}:${latitude}:${longitude}`;
  const cached = getCached<OpenMeteoResponse>(cacheKey);

  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", latitude);
    url.searchParams.set("longitude", longitude);
    url.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature");
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,weather_code");
    url.searchParams.set("forecast_days", "5");
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url.toString(), { next: { revalidate: 300 } });

    if (!response.ok) {
      return NextResponse.json({ error: "Weather API unavailable" }, { status: 502 });
    }

    const data: OpenMeteoResponse = await response.json();
    setCache(cacheKey, data, CACHE_TTL_MS);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
  }
}
