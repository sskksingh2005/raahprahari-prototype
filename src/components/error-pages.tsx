import {
  Link,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { PageBanner } from "@/components/page-banner";
import { Button } from "@/components/ui/button";
import { PrototypeRibbon } from "@/components/prototype-ribbon";

export function NotFoundPage() {
  useEffect(() => {
    document.title = "Page not found | RaahPrahari";
  }, []);

  return (
    <div className="rp-info-page flex min-h-full flex-col">
      <PageBanner
        eyebrow="PAGE NOT FOUND"
        title="This page could not be found"
      />
      <div className="rp-info-container rp-info-content">
        <Logo variant="full" className="mb-5 max-w-[11rem]" />
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The address may be incorrect or the page may have moved. Choose one of
          these routes to continue.
        </p>
        <div className="rp-info-actions">
          <Button asChild className="min-h-11 rounded-xl">
            <Link to="/">
              <ArrowLeft aria-hidden />
              Back to home
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11 rounded-xl">
            <Link to="/traveller">
              Check a road
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
        <div className="mt-6"><PrototypeRibbon /></div>
      </div>
    </div>
  );
}

export function RouteErrorPage({ reset }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <div className="grid min-h-svh place-items-center px-6 py-16">
      <div className="max-w-md space-y-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
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
          <Button variant="outline" asChild>
            <a href="/">Go home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
