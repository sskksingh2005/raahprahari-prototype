import { FlaskConical } from "lucide-react";
import { en, hi } from "@/i18n/dictionary";
import { useAppStore } from "@/lib/app-store";

/**
 * The one prototype label. It has no variants and takes no props: every page
 * shows the same text ("Prototype mockup, synthetic data") in the same style.
 * Place it in a wrapper if a page needs to position it.
 */
export function PrototypeRibbon() {
  // Reads the language from the store so it also works on pages rendered without the full preference layer.
  const { lang } = useAppStore();
  return (
    <span
      data-testid="prototype-ribbon"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/70 px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground"
    >
      <FlaskConical aria-hidden className="size-3" />
      {(lang === "hi" ? hi : en)["demo.badge"]}
    </span>
  );
}
