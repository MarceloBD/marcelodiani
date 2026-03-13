"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useRouter, usePathname } from "@/i18n/navigation";

const NAV_ITEMS = [
  "about",
  "experience",
  "skills",
  "projects",
  "education",
  "blog",
  "contact",
] as const;

type NavItem = (typeof NAV_ITEMS)[number];

const SECTION_ID_MAP: Partial<Record<NavItem, string>> = {};
const NAV_ROUTES: Partial<Record<NavItem, string>> = {
  blog: "/blog",
};

export function Navbar() {
  const translations = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<NavItem | "">("");
  const animationFrameRef = useRef<number | undefined>(undefined);

  const isHomePage = pathname === "/" || pathname === "";

  useEffect(() => {
    const handleScroll = () => {
      if (animationFrameRef.current !== undefined) return;

      animationFrameRef.current = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 50);

        const sectionIds = NAV_ITEMS.map((item) => SECTION_ID_MAP[item] ?? item);
        const sections = sectionIds.map((id) => document.getElementById(id));
        const scrollPosition = window.scrollY + 100;

        for (let index = sections.length - 1; index >= 0; index--) {
          const section = sections[index];
          if (section && section.offsetTop <= scrollPosition) {
            setActiveSection(NAV_ITEMS[index]);
            break;
          }
        }

        animationFrameRef.current = undefined;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isHomePage) return;

    const handleHashScroll = () => {
      if (window.location.hash) {
        const sectionId = window.location.hash.substring(1);
        const element = document.getElementById(sectionId);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth" });
          }, 300);
        }
      }
    };

    handleHashScroll();

    window.addEventListener("hashchange", handleHashScroll);
    return () => {
      window.removeEventListener("hashchange", handleHashScroll);
    };
  }, [isHomePage, pathname]);

  const scrollToSection = (navItem: NavItem) => {
    if (NAV_ROUTES[navItem]) {
      return;
    }
    const targetId = SECTION_ID_MAP[navItem] ?? navItem;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (navItem: NavItem) => {
    const route = NAV_ROUTES[navItem];
    setIsMobileMenuOpen(false);
    
    if (route) {
      router.push(route);
      return;
    }

    if (isHomePage) {
      scrollToSection(navItem);
    } else {
      router.push(`/#${navItem}`);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-card border-b border-card-border"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-lg font-bold tracking-tight hover:text-accent transition-colors cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Marcelo Diani
        </motion.button>

        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isRoute = !!NAV_ROUTES[item];

            return (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                aria-label={`Navigate to ${translations(item)}`}
                aria-current={activeSection === item ? "true" : undefined}
                className={`text-sm transition-colors cursor-pointer relative ${
                  activeSection === item && !isRoute
                    ? "text-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {translations(item)}
                {activeSection === item && !isRoute && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-accent"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
          <LanguageSwitcher />
        </div>

        <div className="flex md:hidden items-center gap-4">
          <LanguageSwitcher />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-foreground cursor-pointer p-1"
            aria-label={translations("toggleMenu")}
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {isMobileMenuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card border-b border-card-border"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {NAV_ITEMS.map((item) => {
                const isRoute = !!NAV_ROUTES[item];

                return (
                  <button
                    key={item}
                    onClick={() => handleNavClick(item)}
                    className={`text-sm text-left cursor-pointer transition-colors ${
                      activeSection === item && !isRoute
                        ? "text-accent"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {translations(item)}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
