"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useWorldClock } from "./useWorldClock";
import type { CityTime } from "./useWorldClock";

const ORBIT_RADIUS_PX = 115;

function getOrbitalPosition(index: number, totalItems: number) {
  const angleDeg = (index * 360) / totalItems - 90;
  const angleRad = (angleDeg * Math.PI) / 180;

  return {
    x: Math.cos(angleRad) * ORBIT_RADIUS_PX,
    y: Math.sin(angleRad) * ORBIT_RADIUS_PX,
  };
}

interface OrbitalBadgeProps {
  cityTime: CityTime;
  cityLabel: string;
  index: number;
  totalItems: number;
}

function OrbitalBadge({ cityTime, cityLabel, index, totalItems }: OrbitalBadgeProps) {
  const { city, formattedTime, isDayTime } = cityTime;
  const { x, y } = getOrbitalPosition(index, totalItems);

  const borderClass = city.isHome ? "border-accent/25" : "border-card-border/15";
  const hoverBorderClass = isDayTime
    ? "hover:border-amber-400/30"
    : "hover:border-indigo-400/30";

  return (
    <div
      className="absolute"
      style={{
        top: "50%",
        left: "50%",
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3 + index * 0.1, duration: 0.4, ease: "backOut" }}
        whileHover={{ scale: 1.15 }}
        className={`
          flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl
          bg-card/50 backdrop-blur-sm border
          pointer-events-auto cursor-default transition-colors duration-300
          ${borderClass} ${hoverBorderClass}
        `}
      >
        <div className="flex items-center gap-1">
          <span className="text-[10px] md:text-[11px] leading-none">{city.flag}</span>
          <span
            className={`font-mono text-[10px] md:text-[11px] font-semibold leading-none whitespace-nowrap ${
              city.isHome ? "text-accent/80" : "text-foreground/60"
            }`}
            suppressHydrationWarning
          >
            {formattedTime}
          </span>
        </div>
        <span className="text-[7px] md:text-[8px] text-muted/50 leading-none whitespace-nowrap">
          {cityLabel}
        </span>
      </motion.div>
    </div>
  );
}

interface WorldClockOrbitProps {
  offsetHours?: number;
}

export function WorldClockOrbit({ offsetHours = 0 }: WorldClockOrbitProps) {
  const translations = useTranslations("worldClock");
  const cityTimes = useWorldClock(offsetHours);

  if (cityTimes.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Subtle rotating dashed ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1, rotate: 360 }}
        transition={{
          opacity: { delay: 1.0, duration: 0.6 },
          scale: { delay: 1.0, duration: 0.6, ease: "easeOut" },
          rotate: { duration: 120, repeat: Infinity, ease: "linear" },
        }}
        className="absolute border border-dashed border-card-border/10 rounded-full"
        style={{
          width: ORBIT_RADIUS_PX * 2,
          height: ORBIT_RADIUS_PX * 2,
          top: `calc(50% - ${ORBIT_RADIUS_PX}px)`,
          left: `calc(50% - ${ORBIT_RADIUS_PX}px)`,
        }}
      />

      {/* Clock badges */}
      {cityTimes.map((cityTime, index) => (
        <OrbitalBadge
          key={cityTime.city.id}
          cityTime={cityTime}
          cityLabel={translations(`cities.${cityTime.city.translationKey}`)}
          index={index}
          totalItems={cityTimes.length}
        />
      ))}
    </div>
  );
}
