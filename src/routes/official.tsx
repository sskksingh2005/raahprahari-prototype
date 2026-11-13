import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { LoginDialog } from '@/components/login-dialog';

export const Route = createFileRoute('/official')({
  component: OfficialPageRoute,
});

function OfficialPageRoute() {
  const navigate = useNavigate();
  // State to track if the current user is authenticated as an official
  const [isOfficialAuthenticated, setIsOfficialAuthenticated] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  // Agar user official authenticated nahi hai, toh restricted access view dikhayein
  if (!isOfficialAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-950">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-100">Restricted Official Portal</h1>
            <p className="text-sm text-slate-400">
              This area is restricted to authorized district authorities and road maintenance officers only. Public access is not permitted.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={() => setLoginOpen(true)}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-900/20 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              Sign in with Official Credentials
            </button>

            <button
              onClick={() => navigate({ to: '/' })}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Public Home
            </button>
          </div>
        </div>

        {/* Official Login Dialog Popup */}
        <LoginDialog 
          open={loginOpen} 
          onOpenChange={(open) => {
            setLoginOpen(open);
            // Agar login successful ho jaye toh yahan state true kar sakte hain
          }} 
          defaultTab="official"
        />
      </div>
    );
  }

  // Agar authenticated hai, tabhi original publishing form dikhega
  return (
    <div className="container mx-auto py-8 text-slate-100">
      <h1 className="text-2xl font-bold mb-4">Official Notice Publishing Portal</h1>
      <p className="text-slate-400">Welcome, authorized official. You have full access to publish road restrictions.</p>
      {/* Yahan aapka baaki official form component aayega */}
    </div>
  );
}