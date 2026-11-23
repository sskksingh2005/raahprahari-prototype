import {
  Link,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import "@/components/page-banner.css";
import { Button } from "@/components/ui/button";
import { PrototypeRibbon } from "@/components/prototype-ribbon";

/**
 * The secondary button on a glass card: transparent with a glass edge, so it
 * stays a quiet outline over the frosted fill (same pattern as the rail's
 * sign-in button).
 */
const GLASS_OUTLINE =
  "min-h-11 rounded-xl border-(--glass-line) bg-transparent text-foreground hover:bg-(--glass-hover) dark:border-(--glass-line) dark:bg-transparent dark:hover:bg-(--glass-hover)";

export function NotFoundPage() {
  useEffect(() => {
    document.title = "Page not found | RaahPrahari";
  }, []);
  return (
    <div className="rp-info-page rp-error-page">
      <div className="glass-strong w-full max-w-lg rounded-3xl p-8 text-center sm:p-10">
        <Logo variant="full" className="mx-auto mb-5 max-w-[11rem]" />
        <div className="flex justify-center">
          <p className="rp-info-eyebrow">
            <span aria-hidden />
            PAGE NOT FOUND
          </p>
        </div>
        <h1 className="rp-page-title">
          This page could not be found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          The address may be incorrect or the page may have moved. Choose one of
          these routes to continue.
        </p>
        <div className="rp-info-actions justify-center">
          <Button asChild className="min-h-11 rounded-xl">
            <Link to="/">
              <ArrowLeft aria-hidden />
              Back to home
            </Link>
          </Button>
          <Button asChild variant="outline" className={GLASS_OUTLINE}>
            <Link to="/traveller">
              Check a road
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
        <div className="mt-6 flex justify-center">
          <PrototypeRibbon />
        </div>
      </div>
    </div>
  );
}

export function RouteErrorPage({ reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <div className="rp-error-page">
      <div className="glass-strong w-full max-w-md space-y-6 rounded-3xl p-8 text-center sm:p-10">
        <h1 className="rp-page-title">
          This page couldn’t load
        </h1>
        <p role="alert" className="text-muted-foreground">
          Please try again, or return to the home page.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => {
              void router.invalidate();
              reset();
            }}
          >
            Try again
          </Button>
          <Button variant="outline" asChild className={GLASS_OUTLINE}>
            <a href="/">Go home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
