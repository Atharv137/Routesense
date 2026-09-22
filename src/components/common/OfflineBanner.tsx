import React from 'react';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';

export const OfflineBanner: React.FC = () => {
  const { isOffline, offlineQueueCount, toggleOfflineMode, syncOfflineData } = useOperations();

  if (!isOffline && offlineQueueCount === 0) return null;

  return (
    <div className="bg-[#171717] text-white px-4 py-2 text-xs flex items-center justify-between border-b border-neutral-800 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-2">
        <WifiOff className="w-3.5 h-3.5 text-[#FF8A1F] animate-pulse" />
        <div>
          <span className="font-semibold text-[#FF8A1F]">Offline Mode Active.</span>
          <span className="text-neutral-300 ml-1">
            {offlineQueueCount > 0
              ? `${offlineQueueCount} action${offlineQueueCount > 1 ? 's' : ''} queued locally.`
              : 'Your data will sync when connection is restored.'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isOffline ? (
          <button
            onClick={toggleOfflineMode}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
          >
            Go Online
          </button>
        ) : (
          <button
            onClick={syncOfflineData}
            className="px-2.5 py-1 bg-[#FF6B00] hover:bg-[#E55F00] text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 animate-spin" /> Sync Now ({offlineQueueCount})
          </button>
        )}
      </div>
    </div>
  );
};
