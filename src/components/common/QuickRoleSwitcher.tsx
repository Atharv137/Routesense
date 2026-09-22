import React, { useState } from 'react';
import { ShieldCheck, Bus, Users, Sparkles, ChevronDown, Check, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const QuickRoleSwitcher: React.FC = () => {
  const { currentUser, switchUser, allUsers, loginAsRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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

  const currentRole = currentUser?.role || 'operations_manager';
  const activeMeta = roleMeta[currentRole] || roleMeta.operations_manager;

  const handleSelectRole = (r: UserRole) => {
    const matchedUser = allUsers.find(u => u.role === r);
    if (matchedUser) {
      switchUser(matchedUser.uid);
    } else {
      loginAsRole(r);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button - Mobile Optimized */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Switch active role profile"
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-2xs hover:border-[#FF6B00]/40 transition-all cursor-pointer text-xs font-semibold text-[#171717] select-none"
      >
        <span className={`w-2 h-2 rounded-full ${activeMeta.color} shrink-0 animate-pulse`} />
        {/* On mobile show short role label */}
        <span className="sm:hidden text-[11px] font-bold text-[#171717]">{activeMeta.short}</span>
        {/* On desktop show user name + role */}
        <span className="hidden sm:inline truncate max-w-[130px]">
          {currentUser?.name ? currentUser.name.split(' ')[0] : activeMeta.userName.split(' ')[0]}{' '}
          <span className="text-[#6B6B6B] font-normal">({activeMeta.short})</span>
        </span>
        <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#6B6B6B] shrink-0" />
      </button>

      {/* Dropdown Menu - Mobile Friendly Sheet/Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal / Menu */}
          <div className="fixed inset-x-3 top-18 sm:inset-auto sm:absolute sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-80 bg-white rounded-2xl sm:rounded-2xl shadow-2xl border border-neutral-100 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="px-3 py-2 border-b border-neutral-100 mb-1.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-[#FF6B00]">
                  Switch Role Profile
                </p>
                <p className="text-[11px] text-[#6B6B6B]">Explore RouteSense across all 4 personas</p>
              </div>
              <span className="text-[10px] font-bold text-[#22A06B] bg-emerald-50 px-2 py-0.5 rounded-full">
                Instant
              </span>
            </div>

            <div className="space-y-1">
              {(Object.keys(roleMeta) as UserRole[]).map(r => {
                const isSelected = currentRole === r;
                const meta = roleMeta[r];
                const IconComponent = meta.icon;

                return (
                  <button
                    key={r}
                    onClick={() => handleSelectRole(r)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF6B00]/10 text-[#FF6B00] ring-1 ring-[#FF6B00]/30 font-semibold'
                        : 'hover:bg-neutral-50 text-[#171717]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#FF6B00] text-white shadow-xs' : meta.badgeColor
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{meta.userName}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                            isSelected ? 'bg-[#FF6B00] text-white' : 'bg-neutral-100 text-[#6B6B6B]'
                          }`}>
                            {meta.label}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#6B6B6B] leading-tight truncate mt-0.5">
                          {meta.desc}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#FF6B00] text-white flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
