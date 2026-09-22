import React, { useState } from 'react';
import { X, Bell, CheckCheck, AlertTriangle, Bus, Ticket, Sparkles, Clock, ExternalLink } from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from './StatusBadge';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useOperations();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const userNotifications = notifications.filter(n => {
    if (!currentUser) return true;
    return n.targetRoles.includes(currentUser.role) || n.targetRoles.length === 0;
  });

  const displayedNotifications = filter === 'unread' 
    ? userNotifications.filter(n => !n.read) 
    : userNotifications;

  const getIcon = (type: string, severity: string) => {
    switch (type) {
      case 'breakdown':
      case 'obstruction':
      case 'delay':
        return <AlertTriangle className="w-4 h-4 text-[#FF6B00]" />;
      case 'ticket':
        return <Ticket className="w-4 h-4 text-[#22A06B]" />;
      case 'recurring':
        return <Sparkles className="w-4 h-4 text-[#FF8A1F]" />;
      default:
        return <Bus className="w-4 h-4 text-[#3478F6]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-neutral-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#171717]">Operations Alerts</h3>
              <p className="text-xs text-[#6B6B6B]">Real-time fleet & dispatch notices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter / Actions Bar */}
        <div className="px-5 py-2.5 bg-neutral-50/80 border-b border-neutral-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                filter === 'all'
                  ? 'bg-white text-[#FF6B00] shadow-xs font-semibold'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              All ({userNotifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-white text-[#FF6B00] shadow-xs font-semibold'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              Unread ({userNotifications.filter(n => !n.read).length})
            </button>
          </div>
          <button
            onClick={markAllNotificationsRead}
            className="text-[#FF6B00] hover:text-[#E55F00] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayedNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#171717]">All caught up!</p>
              <p className="text-xs text-[#6B6B6B] mt-1">No operational notifications for your selected filter.</p>
            </div>
          ) : (
            displayedNotifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  notif.read
                    ? 'bg-white border-neutral-100 hover:border-neutral-200'
                    : 'bg-[#FF6B00]/5 border-[#FF6B00]/20 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl mt-0.5 ${notif.read ? 'bg-neutral-100' : 'bg-white shadow-xs'}`}>
                    {getIcon(notif.type, notif.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-bold truncate ${notif.read ? 'text-[#171717]' : 'text-[#FF6B00]'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-[#6B6B6B] shrink-0 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
