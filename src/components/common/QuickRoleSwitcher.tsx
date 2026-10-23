import React from 'react';
import { ShieldCheck, Bus, Users, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const QuickRoleSwitcher: React.FC = () => {
  const { currentUser } = useAuth();

  const roleMeta: Record<
    UserRole,
    { label: string; userName: string; icon: any; desc: string; color: string; short: string; badgeColor: string }
  > = {
    operations_manager: {
      label: 'Ops Manager',
      userName: 'Priya Sharma',
      icon: ShieldCheck,
      desc: 'Live Fleet GPS, Delay Heatmaps & Analytics',
      color: 'bg-[#FF6B00]',
      short: 'Ops',
      badgeColor: 'bg-orange-50 text-[#FF6B00]',
    },
    conductor: {
      label: 'Conductor',
      userName: 'Anita Deshmukh',
      icon: Users,
      desc: '10s Rapid Ticket Logger & Shift Reconciliation',
      color: 'bg-emerald-500',
      short: 'Conductor',
      badgeColor: 'bg-emerald-50 text-[#22A06B]',
    },
    driver: {
      label: 'Fleet Driver',
      userName: 'Ramesh Patil',
      icon: Bus,
      desc: 'Speedometer, Live Trips & Incident Reporting',
      color: 'bg-blue-500',
      short: 'Driver',
      badgeColor: 'bg-blue-50 text-blue-600',
    },
    passenger: {
      label: 'Passenger',
      userName: 'Aarav Kulkarni',
      icon: Sparkles,
      desc: 'Live Tracking, QR Tickets & Razorpay Pass',
      color: 'bg-purple-500',
      short: 'Passenger',
      badgeColor: 'bg-purple-50 text-purple-600',
    },
  };

  const currentRole = currentUser?.role || 'passenger';
  const activeMeta = roleMeta[currentRole] || roleMeta.passenger;

  // Display verified authorized role badge
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-2xs text-xs font-semibold text-[#171717] select-none">
      <span className={`w-2 h-2 rounded-full ${activeMeta.color} shrink-0`} />
      <span className="sm:hidden text-[11px] font-bold text-[#171717]">{activeMeta.short}</span>
      <span className="hidden sm:inline truncate max-w-[130px]">
        {currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}{' '}
        <span className="text-[#6B6B6B] font-normal">({activeMeta.short})</span>
      </span>
    </div>
  );
};
