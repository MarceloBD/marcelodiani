"use client";

import { useState, useTransition, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";
import { SectionTitle } from "../ui/SectionTitle";
import { submitQuoteRequest } from "@/app/actions/quote";
import { PromotionCountdown } from "./PromotionCountdown";
import { ProjectType } from "@/enums/projectType";

const PROJECT_TYPE_OPTIONS = [
  { value: "", labelKey: "projectTypeNotSure" },
  { value: ProjectType.LANDING_PAGE, labelKey: "projectTypeLandingPage" },
  { value: ProjectType.INSTITUTIONAL_WEBSITE, labelKey: "projectTypeInstitutional" },
  { value: ProjectType.ECOMMERCE, labelKey: "projectTypeEcommerce" },
  { value: ProjectType.BLOG, labelKey: "projectTypeBlog" },
  { value: ProjectType.DASHBOARD, labelKey: "projectTypeDashboard" },
  { value: ProjectType.MOBILE_APP, labelKey: "projectTypeMobileApp" },
  { value: ProjectType.SAAS_PLATFORM, labelKey: "projectTypeSaasPlatform" },
  { value: ProjectType.COMPLEX_SYSTEM, labelKey: "projectTypeComplexSystem" },
  { value: ProjectType.API_BACKEND, labelKey: "projectTypeApiBackend" },
  { value: ProjectType.OTHER, labelKey: "projectTypeOther" },
];

const BUDGET_OPTIONS = [
  { value: "", labelKey: "budgetNotSure" },
  { value: "< $1,000", labelKey: "budgetSmall" },
  { value: "$1,000 - $5,000", labelKey: "budgetMedium" },
  { value: "$5,000 - $15,000", labelKey: "budgetLarge" },
  { value: "> $15,000", labelKey: "budgetEnterprise" },
];

function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 text-green-400">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export function QuoteRequest() {
  const translations = useTranslations("quote");
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formReference = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    setFormError(null);

    startTransition(async () => {
      const result = await submitQuoteRequest(formData);

      if (result.success) {
        setIsSubmitted(true);
        formReference.current?.reset();
      } else {
        setFormError(result.error ?? translations("errorGeneric"));
      }
    });
  };

  return (
    <section id="quote" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionTitle
          title={translations("title")}
          subtitle={translations("subtitle")}
        />

        {/* Motivational text */}
        <ScrollReveal>
          <div className="text-center mb-8">
            <p className="text-lg font-medium text-foreground/90 italic mb-2">
              &ldquo;{translations("motivationalQuote")}&rdquo;
            </p>
            <p className="text-sm text-muted">
              {translations("motivationalSubtext")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          {/* Promotion countdown */}
          <PromotionCountdown />

          <div className="glass-card rounded-xl p-8 border border-card-border glow-border">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-accent">
                <RocketIcon />
              </span>
              <span className="text-sm font-semibold text-foreground/80">
                {translations("formTitle")}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="flex justify-center mb-4">
                    <CheckCircleIcon />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{translations("successTitle")}</h3>
                  <p className="text-sm text-muted mb-6">{translations("successMessage")}</p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs text-accent hover:text-accent/80 transition-colors cursor-pointer"
                  >
                    {translations("sendAnother")}
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  ref={formReference}
                  action={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="quote-name" className="block text-[10px] text-muted uppercase tracking-wider mb-1.5">
                        {translations("nameLabel")}
                      </label>
                      <input
                        id="quote-name"
                        name="name"
                        type="text"
                        required
                        maxLength={100}
                        placeholder={translations("namePlaceholder")}
                        className="w-full px-4 py-2.5 bg-background/50 border border-card-border rounded-lg text-sm text-foreground placeholder-muted/60 outline-none focus:border-accent/40 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="quote-email" className="block text-[10px] text-muted uppercase tracking-wider mb-1.5">
                        {translations("emailLabel")}
                      </label>
                      <input
                        id="quote-email"
                        name="email"
                        type="email"
                        required
                        maxLength={255}
                        placeholder={translations("emailPlaceholder")}
                        className="w-full px-4 py-2.5 bg-background/50 border border-card-border rounded-lg text-sm text-foreground placeholder-muted/60 outline-none focus:border-accent/40 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Project type selector */}
                  <div>
                    <label htmlFor="quote-project-type" className="block text-[10px] text-muted uppercase tracking-wider mb-1.5">
                      {translations("projectTypeLabel")}
                    </label>
                    <select
                      id="quote-project-type"
                      name="projectType"
                      className="w-full px-4 py-2.5 bg-background/50 border border-card-border rounded-lg text-sm text-foreground outline-none focus:border-accent/40 transition-colors cursor-pointer"
                    >
                      {PROJECT_TYPE_OPTIONS.map(({ value, labelKey }) => (
                        <option key={labelKey} value={value}>
                          {translations(labelKey)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quote-budget" className="block text-[10px] text-muted uppercase tracking-wider mb-1.5">
                      {translations("budgetLabel")}
                    </label>
                    <select
                      id="quote-budget"
                      name="budget"
                      className="w-full px-4 py-2.5 bg-background/50 border border-card-border rounded-lg text-sm text-foreground outline-none focus:border-accent/40 transition-colors cursor-pointer"
                    >
                      {BUDGET_OPTIONS.map(({ value, labelKey }) => (
                        <option key={labelKey} value={value}>
                          {translations(labelKey)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quote-description" className="block text-[10px] text-muted uppercase tracking-wider mb-1.5">
                      {translations("descriptionLabel")}
                    </label>
                    <textarea
                      id="quote-description"
                      name="description"
                      required
                      maxLength={2000}
                      rows={5}
                      placeholder={translations("descriptionPlaceholder")}
                      className="w-full px-4 py-2.5 bg-background/50 border border-card-border rounded-lg text-sm text-foreground placeholder-muted/60 outline-none focus:border-accent/40 transition-colors resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <AnimatePresence>
                      {formError && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-xs text-red-400"
                        >
                          {formError}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      disabled={isPending}
                      className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent/20 border border-accent/30 text-accent text-sm font-medium hover:bg-accent/30 transition-colors cursor-pointer disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <RocketIcon />
                      {isPending ? translations("sending") : translations("send")}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
