"use client";

import { useTranslations } from "next-intl";
import { SectionTitle } from "../ui/SectionTitle";
import { VisitorFingerprint } from "./VisitorFingerprint";

export function SecuritySection() {
  const translations = useTranslations("security");

  return (
    <section id="security" className="py-24 px-6 bg-section-alt relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title={translations("title")}
          subtitle={translations("subtitle")}
        />

        <VisitorFingerprint />
      </div>
    </section>
  );
}
