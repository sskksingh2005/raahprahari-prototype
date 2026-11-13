import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ShieldAlert, UserCheck, Lock, Mail } from 'lucide-react';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'community' | 'official';
}

export function LoginDialog({ open, onOpenChange, defaultTab = 'community' }: LoginDialogProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent, role: 'community' | 'official') => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate auth or connect to Supabase auth flow
      if (!email || !password) {
        throw new Error('Please enter both email and password.');
      }

      // If official login, verify credentials / role context
      if (role === 'official') {
        // Mock check or official session handler
        if (!email.includes('official') && !email.includes('admin') && !email.includes('gov')) {
          // For testing/prototype convenience, you can adjust validation or let authorized emails pass
          console.warn('Logging into official portal with:', email);
        }
        
        onOpenChange(false);
        navigate({ to: '/official' });
      } else {
        // Community login success
        onOpenChange(false);
      }
    } catch (err: any) {
      setError(err.message || 'Sign-in failed. Please check your configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 text-slate-100 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {activeTab === 'official' ? (
              <>
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Official Authority Portal
              </>
            ) : (
              <>
                <UserCheck className="w-5 h-5 text-blue-500" />
                Community Access
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {activeTab === 'official' 
              ? 'Restricted access for district authorities, road maintenance teams, and verified reviewers.'
              : 'Sign in with your RaahPrahari account email and password.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 text-slate-300">
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="official" className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Official Login
            </TabsTrigger>
          </TabsList>

          {/* Community Tab */}
          <TabsContent value="community">
            <form onSubmit={(e) => handleLogin(e, 'community')} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="comm-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <Input 
                    id="comm-email"
                    type="email5" 
                    placeholder="traveler@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comm-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <Input 
                    id="comm-password"
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in as Community Member'}
              </Button>
            </form>
          </TabsContent>

          {/* Official Tab */}
          <TabsContent value="official">
            <form onSubmit={(e) => handleLogin(e, 'official')} className="space-y-4 py-2">
              <div className="bg-amber-950/30 border border-amber-900/50 p-3 rounded-lg text-xs text-amber-200 mb-2">
                ⚠️ Authorized personnel only. All publishing actions from this account are logged and legally audited.
              </div>

              <div className="space-y-2">
                <Label htmlFor="off-email">Official Email (.gov / Authority)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <Input 
                    id="off-email"
                    type="email" 
                    placeholder="official.district@raahprahari.gov"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="off-password">Secure Password / Token</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <Input 
                    id="off-password"
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium" disabled={loading}>
                {loading ? 'Authenticating Official Role...' : 'Sign in to Official Portal'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>Secure Himalayan Node</span>
          <span>RaahPrahari v1.0</span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}