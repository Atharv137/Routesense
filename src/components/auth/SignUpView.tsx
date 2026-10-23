import React, { useState } from 'react';
import {
  Bus,
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SignUpViewProps {
  onSwitchToLogin: () => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({ onSwitchToLogin }) => {
  const { signupWithEmail } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Field presence
    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim() || !validateEmail(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both password entries.');
      return;
    }
    if (!agreedTerms) {
      setError('Please accept the RouteSense Terms of Service and Transit Safety Policies.');
      return;
    }

    setIsSubmitting(true);
    // Public registration strictly registers a passenger
    const res = await signupWithEmail({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    });
    setIsSubmitting(false);

    if (!res.success && res.error) {
      setError(res.error);
    }
  };

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
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold mb-2">
            <Sparkles className="w-3 h-3 text-purple-600" />
            Passenger Registration
          </div>
          <h2 className="text-2xl font-extrabold text-[#171717]">Create Passenger Account</h2>
          <p className="text-xs text-[#6B6B6B] mt-1">Join RouteSense for real-time tracking, ETAs & digital ticketing</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Info */}
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="e.g. Aarav Kulkarni"
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
                  onChange={e => {
                    setEmail(e.target.value);
                    setError('');
                  }}
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
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value);
                    setError('');
                  }}
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Min 6 chars"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-sm text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-sm text-[#171717] focus:bg-white focus:border-[#FF6B00] outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={e => {
                  setAgreedTerms(e.target.checked);
                  setError('');
                }}
                className="mt-0.5 w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00] accent-[#FF6B00]"
              />
              <span className="text-xs text-[#6B6B6B] leading-tight select-none">
                I agree to the{' '}
                <span className="text-[#171717] font-semibold">Terms of Service</span> and{' '}
                <span className="text-[#171717] font-semibold">Transit Safety Guidelines</span>.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-2xl font-bold text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] mt-2 disabled:opacity-60"
          >
            <span>{isSubmitting ? 'Creating Passenger Account...' : 'Create Passenger Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Staff Notice Box */}
        <div className="mt-5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/70 flex items-start gap-2.5 text-left">
          <ShieldCheck className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
            <span className="font-bold text-[#171717]">Need Staff & Crew Access?</span> Drivers, conductors, and depot operations managers are provisioned directly by Transit Depot Administration. Please log in using the Staff Portal.
          </p>
        </div>

        <div className="text-center mt-5 pt-4 border-t border-neutral-100">
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
