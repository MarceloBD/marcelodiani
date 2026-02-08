"use client";

import { useState, useEffect, useCallback } from "react";
import { CITY_TIMEZONES } from "./timezoneData";
import type { CityTimezone } from "./timezoneData";

export type DayPeriod = "morning" | "afternoon" | "evening" | "night";

export interface CityTime {
  city: CityTimezone;
  hours: number;
  minutes: number;
  seconds: number;
  formattedTime: string;
  period: string;
  isDayTime: boolean;
  dayPeriod: DayPeriod;
  utcOffset: string;
  formattedDate: string;
}

function parseTimeForTimezone(
  timezone: string,
  date: Date
): { hours: number; minutes: number; seconds: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(date);

  const rawHours = parseInt(parts.find((part) => part.type === "hour")?.value || "0");

  return {
    hours: rawHours === 24 ? 0 : rawHours,
    minutes: parseInt(parts.find((part) => part.type === "minute")?.value || "0"),
    seconds: parseInt(parts.find((part) => part.type === "second")?.value || "0"),
  };
}

function getDayPeriod(hours: number): DayPeriod {
  if (hours >= 6 && hours < 12) return "morning";
  if (hours >= 12 && hours < 18) return "afternoon";
  if (hours >= 18 && hours < 22) return "evening";
  return "night";
}

function getUtcOffset(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  }).formatToParts(new Date());

  return parts.find((part) => part.type === "timeZoneName")?.value || "";
}

function formatDateForTimezone(timezone: string, date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function buildCityTime(city: CityTimezone, adjustedDate: Date): CityTime {
  const { hours, minutes, seconds } = parseTimeForTimezone(city.timezone, adjustedDate);

  return {
    city,
    hours,
    minutes,
    seconds,
    formattedTime: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    period: hours >= 12 ? "PM" : "AM",
    isDayTime: hours >= 6 && hours < 18,
    dayPeriod: getDayPeriod(hours),
    utcOffset: getUtcOffset(city.timezone),
    formattedDate: formatDateForTimezone(city.timezone, adjustedDate),
  };
}

export function useWorldClock(offsetHours: number = 0): CityTime[] {
  const computeTimes = useCallback((): CityTime[] => {
    const adjustedDate = new Date(Date.now() + offsetHours * 3_600_000);
    return CITY_TIMEZONES.map((city) => buildCityTime(city, adjustedDate));
  }, [offsetHours]);

  const [cityTimes, setCityTimes] = useState<CityTime[]>([]);

  useEffect(() => {
    setCityTimes(computeTimes());
    const interval = setInterval(() => setCityTimes(computeTimes()), 1000);
    return () => clearInterval(interval);
  }, [computeTimes]);

  return cityTimes;
}
