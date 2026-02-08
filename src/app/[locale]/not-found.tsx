import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
  const translations = await getTranslations("notFound");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {translations("title")}
        </h1>
        <p className="text-sm text-muted mb-8">
          {translations("description")}
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-full border border-accent text-accent hover:bg-accent hover:text-background transition-all duration-300 text-sm font-medium"
        >
          {translations("goHome")}
        </Link>
      </div>
    </div>
  );
}
