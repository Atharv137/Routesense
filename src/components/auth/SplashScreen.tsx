import React, { useEffect } from 'react';
import { Bus, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SplashScreen: React.FC = () => {
  const { dismissSplash } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      dismissSplash();
    }, 2800);
    return () => clearTimeout(timer);
  }, [dismissSplash]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-between p-8 select-none">
      <div />

      {/* Center Branding */}
      <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#FF6B00] to-[#FF8A1F] flex items-center justify-center text-white shadow-2xl shadow-orange-500/30">
            <Bus className="w-12 h-12 stroke-[2.2]" />
          </div>
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#22A06B] border-4 border-white animate-pulse" />
        </div>

        <h1 className="text-4xl font-extrabold text-[#171717] tracking-tight mb-2">
          Route<span className="text-[#FF6B00]">Sense</span>
        </h1>
        <p className="text-sm font-semibold text-[#6B6B6B] tracking-wide">
          “Smarter Operations. Better Journeys.”
        </p>

        <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
          <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
          Initializing real-time fleet engine...
        </div>
      </div>

      {/* Bottom CTA to Skip */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3">
        <button
          onClick={dismissSplash}
          className="w-full py-3.5 bg-gradient-to-r from-[#FF6B00] to-[#FF8A1F] hover:from-[#E55F00] hover:to-[#FF6B00] text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-[11px] text-[#6B6B6B]">Production Fleet Management & Transit Platform</p>
      </div>
    </div>
  );
};
