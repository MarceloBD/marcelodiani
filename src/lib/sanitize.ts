/**
 * Sanitizes user input by removing HTML tags and trimming whitespace.
 * Uses a multi-layered approach to prevent XSS through various bypass techniques.
 */
export function sanitize(input: string): string {
  return input
    .trim()
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, "")
    // Remove script/style blocks entirely
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
    // Remove all HTML tags (including self-closing)
    .replace(/<\/?[^>]+(>|$)/g, "")
    // Remove null bytes
    .replace(/\0/g, "");
}
