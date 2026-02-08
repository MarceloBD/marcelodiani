"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";

interface NavigatorExtended extends Navigator {
  deviceMemory?: number;
  connection?: { effectiveType?: string };
}

interface IpLocationResponse {
  ip: string;
  success: boolean;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  connection: {
    isp: string;
  };
}

interface LocationData {
  ip: string;
  city: string;
  region: string;
  country: string;
  isp: string;
  latitude: number;
  longitude: number;
}

const TRANSLATABLE_PREFIX = "t:";
const MAP_BBOX_OFFSET = 0.04;

const FINGERPRINT_KEYS = [
  "ipAddress",
  "location",
  "isp",
  "coordinates",
  "browser",
  "operatingSystem",
  "screenResolution",
  "timezone",
  "language",
  "cpuCores",
  "deviceMemory",
  "webglRenderer",
  "canvasHash",
  "platform",
  "colorDepth",
  "touchScreen",
  "cookiesEnabled",
  "doNotTrack",
  "connectionType",
] as const;

const CONTAINER_ANIMATION = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const ITEM_ANIMATION = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3 },
  },
};

// --- Utility functions ---

function parseUserAgent(userAgent: string): { browser: string; operatingSystem: string } {
  let browser = "Unknown";

  if (userAgent.includes("Firefox/")) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    browser = `Firefox ${match?.[1] ?? ""}`;
  } else if (userAgent.includes("Edg/")) {
    const match = userAgent.match(/Edg\/(\d+)/);
    browser = `Edge ${match?.[1] ?? ""}`;
  } else if (userAgent.includes("Chrome/")) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    browser = `Chrome ${match?.[1] ?? ""}`;
  } else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome")) {
    const match = userAgent.match(/Version\/(\d+)/);
    browser = `Safari ${match?.[1] ?? ""}`;
  }

  let operatingSystem = "Unknown";

  if (userAgent.includes("Windows NT 10.0")) operatingSystem = "Windows 10/11";
  else if (userAgent.includes("Windows")) operatingSystem = "Windows";
  else if (userAgent.includes("Mac OS X")) {
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
    operatingSystem = `macOS ${match?.[1]?.replace(/_/g, ".") ?? ""}`;
  } else if (userAgent.includes("Android")) operatingSystem = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) operatingSystem = "iOS";
  else if (userAgent.includes("Linux")) operatingSystem = "Linux";

  return { browser, operatingSystem };
}

function generateCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return "N/A";

    canvas.width = 200;
    canvas.height = 50;
    context.textBaseline = "top";
    context.font = "14px Arial";
    context.fillStyle = "#f60";
    context.fillRect(125, 1, 62, 20);
    context.fillStyle = "#069";
    context.fillText("Fingerprint", 2, 15);
    context.fillStyle = "rgba(102, 204, 0, 0.7)";
    context.fillText("Fingerprint", 4, 17);

    const dataUrl = canvas.toDataURL();
    let hash = 0;
    for (let i = 0; i < dataUrl.length; i++) {
      const charCode = dataUrl.charCodeAt(i);
      hash = ((hash << 5) - hash) + charCode;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, "0").toUpperCase();
  } catch {
    return "N/A";
  }
}

function getWebGLRenderer(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") as WebGLRenderingContext | null;
    if (!gl) return "N/A";

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "N/A";

    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
    if (!renderer) return "N/A";

    return renderer.length > 50 ? `${renderer.substring(0, 47)}...` : renderer;
  } catch {
    return "N/A";
  }
}

async function fetchLocation(): Promise<LocationData> {
  const fallback: LocationData = {
    ip: "Unknown",
    city: "Unknown",
    region: "Unknown",
    country: "Unknown",
    isp: "Unknown",
    latitude: 0,
    longitude: 0,
  };

  try {
    // ipwho.is — free, HTTPS, no API key, CORS-enabled
    // Called from the browser so it resolves the user's real IP
    const response = await fetch("https://ipwho.is/");
    if (!response.ok) return fallback;

    const data = (await response.json()) as IpLocationResponse;
    if (!data.success) return fallback;

    return {
      ip: data.ip,
      city: data.city || "Unknown",
      region: data.region || "Unknown",
      country: data.country || "Unknown",
      isp: data.connection?.isp || "Unknown",
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch {
    return fallback;
  }
}

function buildLocationString({ city, region, country }: LocationData): string {
  const parts = [city, region, country].filter((part) => part && part !== "Unknown");
  return parts.length > 0 ? parts.join(", ") : "Unknown";
}

function buildCoordinatesString({ latitude, longitude }: LocationData): string {
  if (latitude === 0 && longitude === 0) return "Unknown";
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

function hasValidCoordinates({ latitude, longitude }: LocationData): boolean {
  return latitude !== 0 || longitude !== 0;
}

function buildMapEmbedUrl({ latitude, longitude }: LocationData): string {
  const west = longitude - MAP_BBOX_OFFSET;
  const south = latitude - MAP_BBOX_OFFSET;
  const east = longitude + MAP_BBOX_OFFSET;
  const north = latitude + MAP_BBOX_OFFSET;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${west},${south},${east},${north}&layer=mapnik&marker=${latitude},${longitude}`;
}

function buildFingerprintData(location: LocationData): Record<string, string> {
  const navigatorExtended = navigator as NavigatorExtended;
  const { browser, operatingSystem } = parseUserAgent(navigator.userAgent);

  return {
    ipAddress: location.ip,
    location: buildLocationString(location),
    isp: location.isp !== "Unknown" ? location.isp : `${TRANSLATABLE_PREFIX}unknown`,
    coordinates: buildCoordinatesString(location),
    browser,
    operatingSystem,
    screenResolution: `${screen.width} × ${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.languages?.join(", ") || navigator.language,
    cpuCores: navigator.hardwareConcurrency
      ? String(navigator.hardwareConcurrency)
      : `${TRANSLATABLE_PREFIX}unknown`,
    deviceMemory: navigatorExtended.deviceMemory
      ? `${navigatorExtended.deviceMemory} GB`
      : `${TRANSLATABLE_PREFIX}unknown`,
    webglRenderer: getWebGLRenderer(),
    canvasHash: generateCanvasFingerprint(),
    platform: navigator.platform || `${TRANSLATABLE_PREFIX}unknown`,
    colorDepth: `${screen.colorDepth}-bit`,
    touchScreen: "ontouchstart" in window
      ? `${TRANSLATABLE_PREFIX}yes`
      : `${TRANSLATABLE_PREFIX}no`,
    cookiesEnabled: navigator.cookieEnabled
      ? `${TRANSLATABLE_PREFIX}enabled`
      : `${TRANSLATABLE_PREFIX}disabled`,
    doNotTrack: navigator.doNotTrack === "1"
      ? `${TRANSLATABLE_PREFIX}enabled`
      : `${TRANSLATABLE_PREFIX}disabled`,
    connectionType: navigatorExtended.connection?.effectiveType?.toUpperCase()
      || `${TRANSLATABLE_PREFIX}unknown`,
  };
}

// --- Components ---

function ScanningIndicator() {
  const translations = useTranslations("security.fingerprint");

  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex items-center gap-3">
        <motion.div
          className="w-2.5 h-2.5 rounded-full bg-accent"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <span className="text-muted font-mono text-sm">{translations("scanning")}</span>
      </div>
    </div>
  );
}

function LocationMinimap({ location }: { location: LocationData }) {
  const translations = useTranslations("security.fingerprint");

  return (
    <motion.div
      className="mt-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
          <svg
            className="w-4 h-4 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
          <span className="text-xs text-muted uppercase tracking-wider">
            {translations("mapTitle")}
          </span>
        </div>

        <div className="relative">
          {/* Overlay to block all map interaction */}
          <div className="absolute inset-0 z-10" />
          <iframe
            title={translations("visitorLocationMap")}
            src={buildMapEmbedUrl(location)}
            className="w-full h-[250px] md:h-[300px] border-0"
            style={{
              filter: "invert(1) hue-rotate(180deg) brightness(0.7) contrast(1.3)",
            }}
            loading="lazy"
          />
        </div>
      </div>
    </motion.div>
  );
}

export function VisitorFingerprint() {
  const translations = useTranslations("security.fingerprint");
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    async function scan() {
      const locationResult = await fetchLocation();
      setLocation(locationResult);
      setData(buildFingerprintData(locationResult));
    }
    scan();
  }, []);

  function formatValue(value: string): string {
    if (value.startsWith(TRANSLATABLE_PREFIX)) {
      return translations(value.slice(TRANSLATABLE_PREFIX.length));
    }
    return value;
  }

  return (
    <ScrollReveal>
      <div className="glass-card rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-2">
          <svg
            className="w-5 h-5 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-foreground">
            {translations("title")}
          </h3>
        </div>

        <p className="text-muted text-sm mb-8">{translations("subtitle")}</p>

        {!data ? (
          <ScanningIndicator />
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
              variants={CONTAINER_ANIMATION}
              initial="hidden"
              animate="visible"
            >
              {FINGERPRINT_KEYS.map((key) => (
                <motion.div
                  key={key}
                  variants={ITEM_ANIMATION}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 hover:bg-white/[0.04] hover:border-accent/20 transition-colors"
                >
                  <p className="text-[11px] text-muted uppercase tracking-wider mb-1">
                    {translations(key)}
                  </p>
                  <p
                    className="text-sm font-mono text-foreground truncate"
                    title={data[key]}
                  >
                    {formatValue(data[key])}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {location && hasValidCoordinates(location) && (
              <LocationMinimap location={location} />
            )}
          </>
        )}

        <p className="text-xs text-muted/60 mt-6 text-center italic">
          {translations("disclaimer")}
        </p>
      </div>
    </ScrollReveal>
  );
}
