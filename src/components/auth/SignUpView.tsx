import React, { useState } from 'react';
import { Bus, User as UserIcon, Mail, Phone, Lock, ArrowRight, ArrowLeft, ShieldCheck, Users, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOperations } from '../../context/OperationsContext';
import { UserRole } from '../../types';

interface SignUpViewProps {
  onSwitchToLogin: () => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({ onSwitchToLogin }) => {
  const { signup } = useAuth();
  const { routes } = useOperations();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('conductor');
  const [routeAssigned, setRouteAssigned] = useState('route_101');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    signup({
      name,
      email,
      phone,
      role,
      routeAssigned: role === 'conductor' || role === 'driver' ? routeAssigned : undefined,
      shiftStatus: 'on_duty',
      profilePhoto: `https://images.unsplash.com/photo-${role === 'conductor' ? '1573496359142-b8d87734a5a2' : '1507003211169-0a1dd7228f2d'}?w=200&auto=format&fit=crop&q=80`,
    });
  };

  const rolesList: { id: UserRole; title: string; desc: string; icon: any }[] = [
    { id: 'conductor', title: 'Conductor', desc: '10s ticket logging & shift reconciliations', icon: Users },
    { id: 'driver', title: 'Driver', desc: 'Trip execution & instant incident reporting', icon: Bus },
    { id: 'operations_manager', title: 'Operations Mgr', desc: 'Fleet visibility & analytics dashboard', icon: ShieldCheck },
    { id: 'passenger', title: 'Passenger', desc: 'Digital QR ticketing & live ETA tracking', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-center items-center p-4 sm:p-6 py-10">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-200/50 border border-neutral-100">
        <button
          onClick={onSwitchToLogin}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] hover:text-[#171717] mb-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FF8A1F] flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-orange-500/25">
            <Bus className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#171717]">Create RouteSense Account</h2>
          <p className="text-xs text-[#6B6B6B] mt-1">Join the intelligent regional transit network</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-2">Select Your Role</label>
            <div className="grid grid-cols-2 gap-2">
              {rolesList.map(r => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#FF6B00] bg-[#FF6B00]/5 ring-1 ring-[#FF6B00]'
                        : 'border-neutral-200/80 bg-neutral-50 hover:bg-neutral-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-[#FF6B00] text-white' : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-xs font-bold ${isSelected ? 'text-[#FF6B00]' : 'text-[#171717]'}`}>
                        {r.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#6B6B6B] leading-tight line-clamp-2">{r.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assigned Route if Conductor or Driver */}
          {(role === 'conductor' || role === 'driver') && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-amber-900 mb-1.5">
                Assigned Operational Route
              </label>
              <select
                value={routeAssigned}
                onChange={e => setRouteAssigned(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-amber-200 text-xs font-semibold text-[#171717] focus:outline-hidden focus:ring-2 focus:ring-[#FF6B00]"
              >
                {routes.map(rt => (
                  <option key={rt.routeId} value={rt.routeId}>
                    Route {rt.routeNumber} — {rt.routeName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Personal Info */}
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Anita Deshmukh"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-sm text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-sm text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98230 XXXXX"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-sm text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-sm text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-sm text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-2xl font-bold text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] mt-2"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-neutral-100">
          <p className="text-xs text-[#6B6B6B]">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-[#FF6B00] font-bold hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
