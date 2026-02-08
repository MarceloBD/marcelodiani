"use client";

import { motion } from "framer-motion";

interface ProjectCardProps {
  name: string;
  year: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  index: number;
}

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-5 h-5 text-accent"
    >
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-3.5 h-3.5"
    >
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  );
}

export function ProjectCard({
  name,
  year,
  description,
  techStack,
  githubUrl,
  index,
}: ProjectCardProps) {
  const Wrapper = githubUrl ? "a" : "div";
  const wrapperProps = githubUrl
    ? { href: githubUrl, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="glass-card rounded-xl glow-border transition-all duration-300 group"
    >
      <Wrapper {...wrapperProps} className="block p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <FolderIcon />
            </div>
            <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
              {name}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-mono">{year}</span>
            {githubUrl && (
              <span className="text-muted group-hover:text-accent transition-colors">
                <GitHubIcon />
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-foreground/70 leading-relaxed mb-4">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-[10px] font-mono rounded bg-card-border/50 text-muted"
              >
                {tech}
              </span>
            ))}
          </div>

          {githubUrl && (
            <span className="text-muted/70 group-hover:text-accent/60 transition-colors flex-shrink-0 ml-2">
              <ExternalLinkIcon />
            </span>
          )}
        </div>
      </Wrapper>
    </motion.div>
  );
}
