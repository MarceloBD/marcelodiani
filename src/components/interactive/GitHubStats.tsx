"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";

interface GitHubRepo {
  name: string;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
}

interface GitHubProfile {
  public_repos: number;
  followers: number;
}

interface LanguageStat {
  name: string;
  count: number;
  percentage: number;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  "C#": "#178600",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  HTML: "#e34c26",
  MATLAB: "#e16737",
  VHDL: "#adb2cb",
  Jupyter: "#DA5B0B",
};

export function GitHubStats() {
  const translations = useTranslations("githubStats");
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [languages, setLanguages] = useState<LanguageStat[]>([]);
  const [totalStars, setTotalStars] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function fetchGitHubData() {
      try {
        const [profileResponse, reposResponse] = await Promise.all([
          fetch("https://api.github.com/users/marcelobd"),
          fetch("https://api.github.com/users/marcelobd/repos?per_page=100&sort=updated"),
        ]);

        if (!profileResponse.ok || !reposResponse.ok) {
          setHasError(true);
          return;
        }

        const profileData: GitHubProfile = await profileResponse.json();
        const reposData: GitHubRepo[] = await reposResponse.json();

        setProfile(profileData);

        const stars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        setTotalStars(stars);

        const languageCounts: Record<string, number> = {};
        const originalRepos = reposData.filter((repo) => !repo.fork);
        for (const repo of originalRepos) {
          if (repo.language) {
            languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
          }
        }

        const total = Object.values(languageCounts).reduce((sum, count) => sum + count, 0);
        const sorted = Object.entries(languageCounts)
          .sort(([, countA], [, countB]) => countB - countA)
          .slice(0, 6)
          .map(([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / total) * 100),
          }));

        setLanguages(sorted);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGitHubData();
  }, []);

  if (hasError) return null;

  return (
    <ScrollReveal className="mt-12">
      <div className="glass-card rounded-xl p-6 border border-card-border">
        <div className="flex items-center gap-2 mb-5">
          <a
            href="https://github.com/marcelobd"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group/link hover:text-accent transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-accent">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="text-xs font-semibold text-foreground/80 group-hover/link:text-accent transition-colors">{translations("title")}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-3.5 h-3.5 opacity-50 group-hover/link:opacity-100 transition-opacity"
            >
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </a>
          <span className="text-[9px] text-muted/70 ml-auto font-mono">{translations("techStack")}</span>
        </div>

        {isLoading ? (
          <div className="flex gap-8 animate-pulse">
            <div className="h-8 w-20 bg-card-border rounded" />
            <div className="h-8 w-20 bg-card-border rounded" />
            <div className="h-8 w-20 bg-card-border rounded" />
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="flex gap-8 mb-6">
              {[
                { value: profile?.public_repos ?? 0, label: translations("repos") },
                { value: totalStars, label: translations("stars") },
                { value: profile?.followers ?? 0, label: translations("followers") },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-xl font-bold text-accent">{value}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>

            {/* Language bars */}
            <div className="space-y-2">
              {languages.map(({ name, percentage }, index) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-[10px] text-muted w-20 text-right font-mono">{name}</span>
                  <div className="flex-1 h-2 bg-card-border/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: LANGUAGE_COLORS[name] || "#6b7280" }}
                    />
                  </div>
                  <span className="text-[10px] text-muted w-8 font-mono">{percentage}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ScrollReveal>
  );
}
