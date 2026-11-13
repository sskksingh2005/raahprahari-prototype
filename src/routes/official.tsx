import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { LoginDialog } from '@/components/login-dialog';
import { PageBanner } from '@/components/page-banner';
import { PrototypeRibbon } from '@/components/prototype-ribbon';
import { Button } from '@/components/ui/button';
import { usePrefs } from '@/i18n/preferences';
import { useAccountSession } from '@/lib/account-session';
import { OfficialNoticeForm } from '@/official/OfficialNoticeForm';

export const Route = createFileRoute('/official')({
  head: () => ({ meta: [{ title: 'Official notice | RaahPrahari' }] }),
  component: OfficialPageRoute,
});

function OfficialPageRoute() {
  const { t } = usePrefs();
  const navigate = useNavigate();
  const session = useAccountSession();
  const [loginOpen, setLoginOpen] = useState(false);
  const signInRef = useRef<HTMLButtonElement>(null);
  // The official role comes only from the server-controlled session role.
  // This gate is convenience; the publishing backend must enforce the role.
  const isOfficialAuthenticated =
    session.status === 'authenticated' && session.role === 'official';

  // Agar user official authenticated nahi hai, toh restricted access view dikhayein
  if (!isOfficialAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-background">
        <div className="max-w-md w-full bg-card text-card-foreground border border-border rounded-xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-status-caution/10 border border-status-caution/20 rounded-full flex items-center justify-center mx-auto text-status-caution">
            <ShieldAlert aria-hidden className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">Restricted Official Portal</h1>
            <p className="text-sm text-muted-foreground">
              This area is restricted to authorized district authorities and road maintenance officers only. Public access is not permitted.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Button
              ref={signInRef}
              type="button"
              onClick={() => setLoginOpen(true)}
              className="w-full"
            >
              <Lock aria-hidden className="w-4 h-4" />
              Sign in with Official Credentials
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate({ to: '/' })}
              className="w-full"
            >
              <ArrowLeft aria-hidden className="w-4 h-4" />
              Return to Public Home
            </Button>
          </div>
        </div>

        {/* Official Login Dialog Popup */}
        <LoginDialog
          open={loginOpen}
          onOpenChange={setLoginOpen}
          returnFocusRef={signInRef}
        />
      </div>
    );
  }

  // Agar authenticated hai, tabhi original publishing form dikhega
  return (
    <div className="rp-info-page">
      <PageBanner
        eyebrow={t('official.eyebrow')}
        title={t('official.title')}
        description={t('official.description')}
      />
      <div className="rp-info-container rp-info-content">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex flex-col items-start gap-2">
            <PrototypeRibbon />
            <p className="m-0 text-sm text-muted-foreground">{t('official.notice')}</p>
          </div>
          <OfficialNoticeForm />
        </div>
      </div>
    </div>
  );
}
