import React, { useState } from 'react';
import { Bus, Mail, Lock, ArrowRight, ShieldCheck, Users, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface LoginViewProps {
  onSwitchToSignUp: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSwitchToSignUp }) => {
  const { login, loginWithGoogle, loginAsRole, allUsers, switchUser } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setError('');
    const res = await loginWithGoogle('passenger');
    setIsGoogleSigningIn(false);
    if (!res.success && res.error) {
      setError(res.error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setError('Please enter your email address or mobile number.');
      return;
    }
    const success = login(emailOrPhone, password);
    if (!success) {
      setError('User credentials not found. Use one of the fast demo role profiles below or Sign Up.');
    }
  };

  const demoAccounts = [
    {
      role: 'conductor' as UserRole,
      name: 'Anita Deshmukh',
      roleLabel: 'Conductor',
      desc: 'Route 101 • Rapid Ticketing',
      icon: Users,
      color: 'bg-emerald-500',
    },
    {
      role: 'driver' as UserRole,
      name: 'Ramesh Patil',
      roleLabel: 'Driver',
      desc: 'Route 101 • Bus MH12 AB 1234',
      icon: Bus,
      color: 'bg-blue-500',
    },
    {
      role: 'operations_manager' as UserRole,
      name: 'Priya Sharma',
      roleLabel: 'Operations Manager',
      desc: 'Live Fleet, Incidents & Analytics',
      icon: ShieldCheck,
      color: 'bg-[#FF6B00]',
    },
    {
      role: 'passenger' as UserRole,
      name: 'Aarav Kulkarni',
      roleLabel: 'Passenger',
      desc: 'Live ETA & Digital QR Tickets',
      icon: Sparkles,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-200/50 border border-neutral-100">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FF6B00] to-[#FF8A1F] flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-orange-500/25">
            <Bus className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#171717]">Sign In to RouteSense</h2>
          <p className="text-xs text-[#6B6B6B] mt-1">Smarter Operations. Better Journeys.</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Demo Fast Login Switcher */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">
              Quick Demo Logins
            </span>
            <span className="text-[10px] text-[#FF6B00] font-semibold">1-Click Access</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map(demo => {
              const matched = allUsers.find(u => u.role === demo.role);
              const Icon = demo.icon;
              return (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => {
                    if (matched) {
                      switchUser(matched.uid);
                    } else {
                      loginAsRole(demo.role);
                    }
                  }}
                  className="p-3 rounded-2xl border border-neutral-100 bg-neutral-50 hover:bg-orange-50/50 hover:border-[#FF6B00]/30 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-white shadow-2xs flex items-center justify-center text-neutral-700 group-hover:text-[#FF6B00]">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-[#171717]">{demo.roleLabel}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-neutral-800 truncate">{demo.name}</p>
                  <p className="text-[10px] text-[#6B6B6B] truncate">{demo.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Google Sign-in with Firebase Auth */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSigningIn}
            className="w-full py-3 px-4 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer hover:border-neutral-300 disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            Or login with credentials
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5">Email or Mobile Number</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={emailOrPhone}
                onChange={e => {
                  setEmailOrPhone(e.target.value);
                  setError('');
                }}
                placeholder="e.g. anita.conductor@routesense.in"
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
                onClick={() => alert('For this demo, any password works. You can also click any Quick Demo profile above.')}
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-sm text-[#171717] focus:bg-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 outline-hidden transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-2xl font-bold text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
          >
            <span>Log In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
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
      </div>
    </div>
  );
};
