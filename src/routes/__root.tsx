
import {
  HeadContent,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { EnvBanner } from "@/components/EnvBanner";

import { SkipLink } from "@/components/ui/feedback";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotFoundPage } from "@/components/error-pages";
import { AppShell } from "@/components/app-shell/app-shell";
import { SiteFooter } from "@/components/app-shell/site-footer";
import {
  BackToTop,
  PageTransition,
  RevealObserver,
} from "@/components/motion";
import {
  BootGate,
  RouteProgress,
  bootGuardScript,
} from "@/components/boot-screen";
import { PrototypeRibbon } from "@/components/prototype-ribbon";
import { AccountScopeBoundary } from "@/components/account-scope-boundary";
import { AuthSessionBridge } from "@/components/auth-session-bridge";
import { SyncProvider } from "@/components/sync-provider";
import {
  PreferencesProvider,
  themeBootScript,
  usePrefs,
} from "@/i18n/preferences";

import "../styles.css";

if (
  import.meta.env.DEV &&
  import.meta.env.VITE_DEV_RECEIPT_STUB === "true"
) {
  void import("@/dev/receipt-stub").catch((error: unknown) => {
    console.error(
      "Unable to initialize the development receipt stub",
      error,
    );
  });
}

const siteName = "RaahPrahari: Know before you go";

const siteDescription =
  "Check reported road hazards, information freshness, and official restrictions across Uttarakhand before your journey.";

export const Route = createRootRoute({
  head: ({ matches }) => {
    const isNotFound = matches.some(
      (match) => match.status === "notFound" || match._notFound,
    );

    const title = isNotFound
      ? "Page not found | RaahPrahari"
      : siteName;

    return {
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        { title },
        {
          name: "description",
          content: siteDescription,
        },
        {
          property: "og:title",
          content: title,
        },
        {
          property: "og:description",
          content: siteDescription,
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "theme-color",
          content: "#07151f",
          media: "(prefers-color-scheme: dark)",
        },
        {
          name: "theme-color",
          content: "#e6e4dc",
          media: "(prefers-color-scheme: light)",
        },
      ],
      links: [
        { rel: "manifest", href: "/manifest.webmanifest" },
        { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon-32.png",
          sizes: "32x32",
        },
        {
          rel: "apple-touch-icon",
          href: "/apple-touch-icon.png",
          sizes: "180x180",
        },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&family=Noto+Sans+Devanagari:wght@400;600&display=swap",
        },
      ],
    };
  },

  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
});

/** First focusable element: jumps past the rail and top bar to the page. */
function ShellSkipLink() {
  const { t } = usePrefs();

  return <SkipLink>{t("shell.skip")}</SkipLink>;
}

function RootDocument({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isHome,
    isTraveller,
    isMap,
    isHelp,
    isNotFound,
    isAdvisories,
    isReport,
    hasInlineRibbon,
  } = useRouterState({
    select: (state) => ({
      isReport: state.location.pathname.startsWith("/report"),

      hasInlineRibbon:
        state.location.pathname === "/contributions" ||
        state.location.pathname === "/review" ||
        state.location.pathname.startsWith("/review/"),

      isHome: state.location.pathname === "/",
      isTraveller: state.location.pathname === "/traveller",
      isMap: state.location.pathname === "/map",
      isHelp: state.location.pathname === "/help",

      isNotFound: state.matches.some(
        (match) =>
          match.status === "notFound" || match._notFound,
      ),

      isAdvisories:
        state.location.pathname === "/advisories" ||
        state.location.pathname === "/advisories/",
    }),
  });

  return (
    <html
      lang="en"
      className="dark"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeBootScript }}
        />
        <HeadContent />
      </head>

      <body>
        {/* Fixed photo, warm glows and overlay behind every page (.rp-backdrop). */}
        <div aria-hidden="true" className="rp-backdrop" />
        <BootGate />

        <script
          dangerouslySetInnerHTML={{ __html: bootGuardScript }}
        />

        <noscript>
          <style>{"#rp-boot{display:none!important}"}</style>
        </noscript>

        <PreferencesProvider>
          <TooltipProvider>
            <AuthSessionBridge />

            <AccountScopeBoundary>
              <SyncProvider>
                <ShellSkipLink />
                <PageTransition />
                <RouteProgress />
                <RevealObserver />
                <BackToTop />

                <AppShell
                  footer={
                    !isHome &&
                    !isTraveller &&
                    !isMap &&
                    !isHelp ? (
                      <SiteFooter />
                    ) : null
                  }
                >
                  <EnvBanner />

                  {children}

                  {!isHome &&
                    !isTraveller &&
                    !isMap &&
                    !isHelp &&
                    !isNotFound &&
                    !isReport &&
                    !isAdvisories &&
                    !hasInlineRibbon && (
                      <div className="rp-demo-badge-ribbon pointer-events-none fixed right-2 bottom-[calc(var(--shell-tabs-height)+1.5rem+env(safe-area-inset-bottom))] left-16 z-(--z-bottom-nav) flex justify-end lg:bottom-2">
                        <PrototypeRibbon />
                      </div>
                    )}
                </AppShell>
              </SyncProvider>
            </AccountScopeBoundary>
          </TooltipProvider>
        </PreferencesProvider>

        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
