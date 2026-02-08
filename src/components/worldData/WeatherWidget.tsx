"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useWorldData } from "@/hooks/useWorldData";
import { WidgetError } from "./WidgetError";
import { WidgetLoading } from "./WidgetLoading";
import { WidgetLastUpdated } from "./WidgetLastUpdated";

interface CurrentWeather {
  temperature_2m: number;
  weather_code: number;
  wind_speed_10m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
}

interface DailyForecast {
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  time: string[];
}

interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast;
}

const CITIES = [
  { key: "saoPaulo", lat: "-23.55", lon: "-46.63" },
  { key: "newYork", lat: "40.71", lon: "-74.01" },
  { key: "london", lat: "51.51", lon: "-0.13" },
  { key: "tokyo", lat: "35.68", lon: "139.69" },
  { key: "berlin", lat: "52.52", lon: "13.41" },
  { key: "sydney", lat: "-33.87", lon: "151.21" },
] as const;

function getWeatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 57) return "🌧️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  if (code <= 82) return "🌧️";
  if (code <= 86) return "🌨️";
  if (code <= 99) return "⛈️";
  return "🌤️";
}

function getWeatherDescription(code: number, translation: (key: string) => string): string {
  if (code === 0) return translation("weather.conditions.clear");
  if (code <= 3) return translation("weather.conditions.partlyCloudy");
  if (code <= 48) return translation("weather.conditions.foggy");
  if (code <= 57) return translation("weather.conditions.drizzle");
  if (code <= 67) return translation("weather.conditions.rain");
  if (code <= 77) return translation("weather.conditions.snow");
  if (code <= 82) return translation("weather.conditions.showers");
  if (code <= 86) return translation("weather.conditions.snowShowers");
  if (code <= 99) return translation("weather.conditions.thunderstorm");
  return translation("weather.conditions.unknown");
}

export function WeatherWidget() {
  const [selectedCity, setSelectedCity] = useState(0);
  const translation = useTranslations("worldData");

  const city = CITIES[selectedCity];
  const endpoint = `/api/world-data/weather?lat=${city.lat}&lon=${city.lon}`;

  const identityTransform = useCallback((raw: Record<string, unknown>) => raw as unknown as WeatherData, []);

  const { data, isLoading, error, lastUpdated, refetch } = useWorldData<WeatherData>({
    endpoint,
    pollingIntervalMs: 5 * 60 * 1_000,
    transform: identityTransform,
  });

  const forecastDays = useMemo(() => {
    if (!data?.daily) return [];
    return data.daily.time.slice(1, 5).map((date, index) => ({
      date,
      maxTemp: data.daily.temperature_2m_max[index + 1],
      minTemp: data.daily.temperature_2m_min[index + 1],
      weatherCode: data.daily.weather_code[index + 1],
    }));
  }, [data]);

  if (error) return <WidgetError message={error} onRetry={refetch} />;
  if (isLoading && !data) return <WidgetLoading />;
  if (!data) return null;

  const { current } = data;

  return (
    <div className="space-y-4">
      {/* City selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {CITIES.map((cityItem, index) => (
          <button
            key={cityItem.key}
            onClick={() => setSelectedCity(index)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
              selectedCity === index
                ? "bg-accent/20 text-accent border border-accent/30"
                : "text-muted/70 hover:text-muted bg-card-border/20 border border-transparent"
            }`}
          >
            {translation(`weather.cities.${cityItem.key}`)}
          </button>
        ))}
      </div>

      {/* Current weather */}
      <div className="flex items-center gap-6">
        <div className="text-5xl">{getWeatherIcon(current.weather_code)}</div>
        <div>
          <div className="text-3xl font-bold text-foreground">
            {Math.round(current.temperature_2m)}°C
          </div>
          <div className="text-sm text-muted">
            {getWeatherDescription(current.weather_code, translation)}
          </div>
          <div className="text-xs text-muted/70 mt-1">
            {translation("weather.feelsLike")} {Math.round(current.apparent_temperature)}°C
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card-border/20 rounded-lg px-3 py-2">
          <div className="text-[10px] text-muted/70">{translation("weather.humidity")}</div>
          <div className="text-sm font-mono text-foreground">{current.relative_humidity_2m}%</div>
        </div>
        <div className="bg-card-border/20 rounded-lg px-3 py-2">
          <div className="text-[10px] text-muted/70">{translation("weather.wind")}</div>
          <div className="text-sm font-mono text-foreground">{current.wind_speed_10m} km/h</div>
        </div>
      </div>

      {/* Forecast */}
      {forecastDays.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-foreground/70 mb-2">
            {translation("weather.forecast")}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {forecastDays.map(({ date, maxTemp, minTemp, weatherCode }) => (
              <div key={date} className="bg-card-border/20 rounded-lg px-2 py-2 text-center">
                <div className="text-[10px] text-muted/70">
                  {new Date(date).toLocaleDateString(undefined, { weekday: "short" })}
                </div>
                <div className="text-lg my-1">{getWeatherIcon(weatherCode)}</div>
                <div className="text-[10px] font-mono">
                  <span className="text-foreground">{Math.round(maxTemp)}°</span>
                  <span className="text-muted/50 mx-0.5">/</span>
                  <span className="text-muted/70">{Math.round(minTemp)}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <WidgetLastUpdated lastUpdated={lastUpdated} onRefresh={refetch} />
    </div>
  );
}
