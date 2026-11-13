import {
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CircleHelp,
  ClipboardCheck,
  FileWarning,
  House,
  Info,
  ListChecks,
  Mail,
  Map as MapIcon,
  Search,
  ShieldCheck,
  Trophy,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { en } from "@/i18n/dictionary";
import { usePrefs } from "@/i18n/preferences";
import { useAccountSession } from "@/lib/account-session";
import {
  categoryKey,
  featureDescriptionKey,
  featureTitleKey,
  searchFeatures,
  type Feature,
  type FeatureId,
} from "@/lib/feature-search";
import { cn } from "@/lib/utils";

const FEATURE_ICON: Record<FeatureId, LucideIcon> = {
  home: House,
  map: MapIcon,
  review: ClipboardCheck,
  official: ShieldCheck,
  contributions: Trophy,
  traveller: Search,
  advisories: ListChecks,
  report: FileWarning,
  myReports: BookOpen,
  profile: UserRound,
  status: Activity,
  help: CircleHelp,
  about: Info,
  contact: Mail,
};

interface FeatureSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The button that opened the palette; focus returns there on close. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/** True for Ctrl+K, or Cmd+K on a Mac keyboard. */
function isToggleShortcut(event: globalThis.KeyboardEvent) {
  return (
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    event.key.toLowerCase() === "k"
  );
}

/**
 * Command palette for jumping to any screen.
 *
 * The input is an ARIA combobox that owns a listbox of results: arrow keys
 * move the highlighted option, Enter opens it, Escape closes the dialog.
 * Focus stays in the input throughout, and Radix Dialog traps it.
 */
export function FeatureSearchModal({
  open,
  onOpenChange,
  returnFocusRef,
}: FeatureSearchModalProps) {
  const { t } = usePrefs();
  const navigate = useNavigate();
  const signedIn = useAccountSession().status === "authenticated";
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (id: FeatureId) => `${baseId}-${id}`;

  const changeOpen = (next: boolean) => {
    // Every opening starts fresh with the suggestions.
    if (!next) {
      setQuery("");
      setActive(0);
    }
    onOpenChange(next);
  };

  // Where focus was when the shortcut opened the palette; it goes back there.
  const shortcutOrigin = useRef<HTMLElement | null>(null);

  // Ctrl+K / Cmd+K toggles the palette from anywhere on the page. The effect
  // event always sees the latest `open`, so the listener is attached once.
  const onShortcut = useEffectEvent((event: globalThis.KeyboardEvent) => {
    if (!isToggleShortcut(event) || event.repeat) return;
    event.preventDefault();
    if (!open && document.activeElement instanceof HTMLElement)
      shortcutOrigin.current = document.activeElement;
    changeOpen(!open);
  });
  useEffect(() => {
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  const results = useMemo(
    () => searchFeatures(query, t, (key) => en[key], { signedIn }),
    [query, t, signedIn],
  );
  const suggested = !query.trim();
  const current = results[Math.min(active, results.length - 1)];

  // Keep the highlighted option in view while moving with the keyboard.
  useEffect(() => {
    if (!current) return;
    document
      .getElementById(optionId(current.id))
      ?.scrollIntoView?.({ block: "nearest" });
    // optionId is derived from a stable id; only the selection matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  const select = (feature: Feature) => {
    changeOpen(false);
    // /report validates an optional ?segment= search param, so it is passed.
    if (feature.path === "/report")
      void navigate({ to: "/report", search: { segment: undefined } });
    else void navigate({ to: feature.path });
  };

  // Up and Down move the highlight and wrap; Enter opens it. Home, End and
  // the other keys keep their normal text-editing meaning in the input.
  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    const last = results.length - 1;
    const index = Math.min(active, last);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(index >= last ? 0 : index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(index <= 0 ? last : index - 1);
    } else if (event.key === "Enter" && current) {
      event.preventDefault();
      select(current);
    }
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent
        className="top-[12vh] translate-y-0 gap-0 overflow-hidden border-border bg-popover p-0 text-popover-foreground shadow-2xl sm:max-w-xl"
        showCloseButton={false}
        onCloseAutoFocus={(event) => {
          const target = shortcutOrigin.current ?? returnFocusRef?.current;
          shortcutOrigin.current = null;
          if (target?.isConnected) {
            event.preventDefault();
            target.focus();
          }
        }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t("palette.title")}</DialogTitle>
          <DialogDescription>{t("palette.description")}</DialogDescription>
        </DialogHeader>

        <div className="relative border-b border-border p-3">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-6 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            role="combobox"
            aria-label={t("palette.inputLabel")}
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={current ? optionId(current.id) : undefined}
            autoComplete="off"
            spellCheck={false}
            value={query}
            placeholder={t("palette.placeholder")}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKeyDown}
            className="h-11 pl-10"
          />
        </div>

        {/* Focusable so the list can be scrolled from the keyboard on short screens. */}
        <div
          role="region"
          aria-labelledby={`${baseId}-heading`}
          tabIndex={0}
          className="max-h-[min(60vh,24rem)] overflow-y-auto p-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <div className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <span id={`${baseId}-heading`}>
              {suggested ? t("palette.suggested") : t("palette.results")}
            </span>
            <span aria-live="polite" className="font-normal normal-case">
              {suggested
                ? ""
                : t("palette.resultCount").replace(
                    "{count}",
                    String(results.length),
                  )}
            </span>
          </div>

          {results.length === 0 ? (
            <p
              role="status"
              className="px-3 py-8 text-center text-sm text-muted-foreground"
            >
              {t("palette.noResults").replace("{query}", query.trim())}
            </p>
          ) : (
            <ul
              id={listId}
              role="listbox"
              aria-labelledby={`${baseId}-heading`}
              className="m-0 list-none space-y-1 p-0"
            >
              {results.map((feature, index) => {
                const Icon = FEATURE_ICON[feature.id];
                const selected = feature.id === current?.id;
                return (
                  <li
                    key={feature.id}
                    id={optionId(feature.id)}
                    role="option"
                    aria-selected={selected}
                    data-testid={`feature-${feature.id}`}
                    // Keep focus in the input so typing and arrow keys keep working.
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseMove={() => setActive(index)}
                    onClick={() => select(feature)}
                    className={cn(
                      "flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors motion-reduce:transition-none",
                      selected
                        ? "border-border bg-raised"
                        : "border-transparent",
                    )}
                  >
                    <span
                      aria-hidden
                      className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-brand-orange"
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-foreground">
                        {t(featureTitleKey(feature.id))}
                        <span className="text-xs font-normal text-muted-foreground">
                          {t(categoryKey(feature.category))}
                        </span>
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {t(featureDescriptionKey(feature.id))}
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden
                      className={cn(
                        "size-4 shrink-0",
                        selected ? "text-link" : "text-muted-foreground",
                      )}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div
          aria-hidden
          className="hidden flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2.5 text-xs text-muted-foreground sm:flex"
        >
          <span>
            <Kbd>↑</Kbd> <Kbd>↓</Kbd> {t("palette.hintNavigate")}
          </span>
          <span>
            <Kbd>Enter</Kbd> {t("palette.hintOpen")}
          </span>
          <span>
            <Kbd>Esc</Kbd> {t("palette.hintClose")}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
      {children}
    </kbd>
  );
}
