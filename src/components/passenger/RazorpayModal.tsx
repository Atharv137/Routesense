import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Smartphone, Check, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface RazorpayModalProps {
  isOpen: boolean;
  amount: number;
  routeName: string;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  amount,
  routeName,
  onSuccess,
  onClose,
}) => {
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('aarav@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const paymentId = 'pay_' + Math.random().toString(36).substring(2, 12);
      onSuccess(paymentId);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-neutral-100 flex flex-col">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0C2340] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3395FF] flex items-center justify-center font-black text-xs text-white">
              RZP
            </div>
            <div>
              <div className="text-xs font-bold tracking-wide">Razorpay Trusted Checkout</div>
              <p className="text-[10px] text-neutral-300">Merchant: RouteSense Transit Ltd</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Summary */}
        <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6B6B]">Payable Amount</span>
            <div className="text-xl font-black text-[#171717]">₹{amount.toFixed(2)}</div>
          </div>
          <div className="text-right text-[10px] text-[#6B6B6B]">
            <span>{routeName}</span>
            <div className="text-[#22A06B] font-bold flex items-center gap-1 justify-end">
              <ShieldCheck className="w-3 h-3" /> 256-bit Encrypted
            </div>
          </div>
        </div>

        {/* Method Picker */}
        <form onSubmit={handlePay} className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#6B6B6B] uppercase">Select Payment Method</label>

            {/* UPI Option */}
            <div
              onClick={() => setMethod('upi')}
              className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                method === 'upi' ? 'border-[#3395FF] bg-blue-50/50 ring-1 ring-[#3395FF]' : 'border-neutral-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-[#3395FF]" />
                <span className="text-xs font-bold text-[#171717]">UPI (GPay / PhonePe / Paytm)</span>
              </div>
              {method === 'upi' && <Check className="w-4 h-4 text-[#3395FF]" />}
            </div>

            {/* Card Option */}
            <div
              onClick={() => setMethod('card')}
              className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                method === 'card' ? 'border-[#3395FF] bg-blue-50/50 ring-1 ring-[#3395FF]' : 'border-neutral-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-neutral-600" />
                <span className="text-xs font-bold text-[#171717]">Debit / Credit Card / RuPay</span>
              </div>
              {method === 'card' && <Check className="w-4 h-4 text-[#3395FF]" />}
            </div>
          </div>

          {method === 'upi' && (
            <div>
              <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">VPA / UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-[#171717] focus:bg-white focus:border-[#3395FF] outline-hidden"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 bg-[#3395FF] hover:bg-[#2080ea] text-white rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Secure Payment...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹{amount.toFixed(2)}</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-[#6B6B6B]">
            Sandbox Payment Simulation • No actual card is charged
          </p>
        </form>
      </div>
    </div>
  );
};
