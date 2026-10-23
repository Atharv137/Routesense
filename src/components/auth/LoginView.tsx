import React, { useState } from 'react';
import {
  Bus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Check,
  KeyRound,
  AlertCircle,
  Briefcase,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginViewProps {
  onSwitchToSignUp: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSwitchToSignUp }) => {
  const {
    loginWithEmail,
    loginAsStaff,
    loginWithGoogle,
    resetPassword,
  } = useAuth();

  // Tab state: 'passenger' or 'staff'
  const [loginTab, setLoginTab] = useState<'passenger' | 'staff'>('passenger');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  // Forgot password modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<{ loading: boolean; error?: string; success?: string }>({
    loading: false,
  });

  const handleTabSwitch = (tab: 'passenger' | 'staff') => {
    setLoginTab(tab);
    setError('');
    setSuccessMsg('');
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setError('');
    setSuccessMsg('');
    const res = await loginWithGoogle();
    setIsGoogleSigningIn(false);
    if (!res.success && res.error) {
      setError(res.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please enter your email address or staff login.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    if (loginTab === 'staff') {
      // Secure Staff Authentication Flow
      const res = await loginAsStaff(email, password);
      setIsSubmitting(false);
      if (!res.success && res.error) {
        setError(res.error);
      }
    } else {
      // Passenger Authentication Flow
      const res = await loginWithEmail(email, password);
      setIsSubmitting(false);
      if (!res.success && res.error) {
        setError(res.error);
      }
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setResetStatus({ loading: false, error: 'Please enter a valid email address.' });
      return;
    }

    setResetStatus({ loading: true });
    const res = await resetPassword(resetEmail);
    if (res.success) {
      setResetStatus({
        loading: false,
        success: 'Password reset link sent! Check your inbox or spam folder.',
      });
      setTimeout(() => {
        setShowResetModal(false);
        setResetStatus({ loading: false });
      }, 3500);
    } else {
      setResetStatus({ loading: false, error: res.error || 'Failed to send reset email.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-200/50 border border-neutral-100">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FF6B00] to-[#FF8A1F] flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-orange-500/25">
            <Bus className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#171717]">Sign In to RouteSense</h2>
          <p className="text-xs text-[#6B6B6B] mt-1">Smarter Operations. Better Journeys.</p>
        </div>

        {/* Portal Selection Tabs: Passenger Login vs Staff Login */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => handleTabSwitch('passenger')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginTab === 'passenger'
                ? 'bg-white text-[#FF6B00] shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Passenger</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('staff')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginTab === 'staff'
                ? 'bg-[#171717] text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Staff Portal</span>
          </button>
        </div>

        {/* Staff Portal Context Badge */}
        {loginTab === 'staff' && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-bold block">Transit Crew & Operations Gateway</span>
              <p className="text-[11px] text-amber-800/90 leading-relaxed mt-0.5">
                Authorized staff logins:
              </p>
              <div className="mt-1 text-[11px] text-neutral-800 space-y-1">
                <div>• <span className="font-semibold text-neutral-900">Bus Conductor:</span> <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-amber-200 text-amber-900 font-mono">anita.conductor@routesense.in</code></div>
                <div>• <span className="font-semibold text-neutral-900">Driver:</span> <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-amber-200 text-amber-900 font-mono">ramesh.driver@routesense.in</code></div>
                <div>• <span className="font-semibold text-neutral-900">Operations Manager:</span> <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-amber-200 text-amber-900 font-mono">priya.ops@routesense.in</code></div>
              </div>
              <p className="text-[10px] text-amber-800 font-medium mt-2 pt-1 border-t border-amber-200/60">
                All other users have Passenger access only.
              </p>
            </div>
          </div>
        )}

        {/* Error notification banner */}
        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Success message banner */}
        {successMsg && (
          <div className="mb-5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Sign-in with Firebase Auth (Available for Passengers) */}
        {loginTab === 'passenger' && (
          <>
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSigningIn}
                className="w-full py-3 px-4 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer hover:border-neutral-300 disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isGoogleSigningIn ? 'Connecting with Google...' : 'Continue with Google Account'}</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-[#6B6B6B] uppercase absolute">
                Or login with email
              </span>
            </div>
          </>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5">
              {loginTab === 'staff' ? 'Staff Email / Login Identifier' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder={loginTab === 'staff' ? 'e.g. anita.conductor@routesense.in' : 'name@domain.com'}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-sm text-[#171717] focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 outline-hidden transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#171717]">Password</label>
              <button
                type="button"
                className="text-[11px] text-[#FF6B00] font-semibold hover:underline cursor-pointer"
                onClick={() => {
                  setResetEmail(email);
                  setResetStatus({ loading: false });
                  setShowResetModal(true);
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-sm text-[#171717] focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 outline-hidden transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] disabled:opacity-60 ${
              loginTab === 'staff'
                ? 'bg-[#171717] hover:bg-neutral-800 shadow-neutral-700/20'
                : 'bg-[#FF6B00] hover:bg-[#E55F00] shadow-orange-500/25'
            }`}
          >
            <span>
              {isSubmitting
                ? 'Verifying Authorization...'
                : loginTab === 'staff'
                ? 'Sign In to Staff Portal'
                : 'Log In'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        {loginTab === 'passenger' ? (
          <div className="text-center mt-6 pt-4 border-t border-neutral-100">
            <p className="text-xs text-[#6B6B6B]">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignUp}
                className="text-[#FF6B00] font-bold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          </div>
        ) : (
          <div className="text-center mt-6 pt-4 border-t border-neutral-100">
            <p className="text-[11px] text-[#6B6B6B]">
              Transit Depot Operations Gateway • Strictly Authorized Personnel
            </p>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-[#171717]">Reset Password</h3>
            </div>
            <p className="text-xs text-[#6B6B6B] mb-4">
              Enter your registered RouteSense email address and we will send you a password reset link.
            </p>

            {resetStatus.error && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {resetStatus.error}
              </div>
            )}

            {resetStatus.success && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                {resetStatus.success}
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-3">
              <input
                type="email"
                required
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetStatus.loading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#E55F00] text-white shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {resetStatus.loading ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
