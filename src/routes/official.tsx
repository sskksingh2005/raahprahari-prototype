import { createFileRoute } from '@tanstack/react-router';
import { OfficialNoticeForm } from '../official/OfficialNoticeForm';

export const Route = createFileRoute('/official')({
  component: OfficialWorkspacePage,
});

function OfficialWorkspacePage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-xl mx-auto mb-6 text-center">
        <h1 className="text-2xl font-bold text-brand-orange">Official Authority Portal</h1>
        <p className="text-sm text-muted-foreground mt-1">Publish verified road restrictions and traffic advisories</p>
      </div>
      <OfficialNoticeForm />
    </div>
  );
}