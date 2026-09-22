import React from 'react';
import {
  Home,
  MapPin,
  Ticket,
  Clock,
  User as UserIcon,
  AlertTriangle,
  LayoutDashboard,
  Navigation,
  Compass,
  Bus,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface BottomNavProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  userRole?: UserRole;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  setActiveTab,
  userRole,
}) => {
  const { currentUser } = useAuth();
  const role: UserRole = userRole || currentUser?.role || 'conductor';

  const handleTabSelect = (tabId: string) => {
    if (onTabChange) onTabChange(tabId);
    if (setActiveTab) setActiveTab(tabId);
  };

  const getNavItems = () => {
    switch (role) {
      case 'conductor':
        return [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'trips', label: 'Trips', icon: Navigation },
          { id: 'tickets', label: 'Tickets', icon: Ticket },
          { id: 'history', label: 'History', icon: Clock },
          { id: 'profile', label: 'Profile', icon: UserIcon },
        ];

      case 'driver':
        return [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'trips', label: 'Trips', icon: Navigation },
          { id: 'issues', label: 'Issues', icon: AlertTriangle },
          { id: 'history', label: 'History', icon: Clock },
          { id: 'profile', label: 'Profile', icon: UserIcon },
        ];

      case 'operations_manager':
        return [
          { id: 'home', label: 'Overview', icon: Home },
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'fleet', label: 'Live Map', icon: MapPin },
          { id: 'issues', label: 'Incidents', icon: AlertTriangle },
          { id: 'profile', label: 'Profile', icon: UserIcon },
        ];

      case 'passenger':
        return [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'routes', label: 'Routes', icon: Compass },
          { id: 'tickets', label: 'Tickets', icon: Ticket },
          { id: 'tracking', label: 'Tracking', icon: MapPin },
          { id: 'profile', label: 'Profile', icon: UserIcon },
        ];

      default:
        return [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'profile', label: 'Profile', icon: UserIcon },
        ];
    }
  };

  const items = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-100/90 px-2 py-2 safe-area-bottom shadow-lg shadow-neutral-900/5">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {items.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabSelect(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-3 rounded-2xl transition-all duration-200 cursor-pointer min-w-[46px] sm:min-w-[56px] relative ${
                isActive ? 'text-[#FF6B00]' : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] mt-0.5 font-semibold tracking-tight transition-all truncate max-w-[58px] sm:max-w-none text-center ${isActive ? 'text-[#FF6B00]' : 'text-[#6B6B6B]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
