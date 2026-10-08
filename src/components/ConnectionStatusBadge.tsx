import React, { useState } from 'react';
import { useSupabaseStatus } from '../hooks/useSupabaseStatus';
import { Wifi, WifiOff, Activity, RefreshCw, Radio, CheckCircle2, AlertCircle } from 'lucide-react';

interface ConnectionStatusBadgeProps {
  className?: string;
}

export const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({ className = '' }) => {
  const { status, ping, lastPingTime, channelName, isConfigured, reconnect, measurePing } =
    useSupabaseStatus();
  const [showPopover, setShowPopover] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    await measurePing();
    reconnect();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const isOnline = status === 'CONNECTED';
  const isConnecting = status === 'CONNECTING';

  // Ping quality colors
  const getPingColor = (ms: number | null) => {
    if (!ms) return 'text-stone-400';
    if (ms < 100) return 'text-emerald-700';
    if (ms < 250) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Small, Persistent Badge */}
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        title="Status Koneksi Supabase Realtime (Klik untuk detail)"
        className={`
          flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer select-none
          border shadow-2xs backdrop-blur-xs
          ${
            isOnline
              ? 'bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-900 border-emerald-200/80'
              : isConnecting
                ? 'bg-amber-50/80 hover:bg-amber-100/90 text-amber-900 border-amber-200/80'
                : 'bg-rose-50/80 hover:bg-rose-100/90 text-rose-900 border-rose-200/80'
          }
        `}
      >
        {/* Pulsing indicator dot */}
        <span className="relative flex h-2 w-2">
          {isOnline && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          {isConnecting && (
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isOnline
                ? 'bg-emerald-600'
                : isConnecting
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
            }`}
          />
        </span>

        {/* Text and ping indicator */}
        <div className="flex items-center gap-1 leading-none font-mono">
          <span className="font-sans font-medium text-[10px]">
            {isOnline ? 'Realtime' : isConnecting ? 'Connecting' : 'Offline'}
          </span>
          {isOnline && ping !== null && (
            <span className={`text-[9px] font-bold ${getPingColor(ping)}`}>
              • {ping}ms
            </span>
          )}
        </div>
      </button>

      {/* Popover Detail Modal / Flyout */}
      {showPopover && (
        <>
          {/* Backdrop click dismiss */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPopover(false)}
          />

          <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-3.5 z-50 animate-in fade-in slide-in-from-bottom-2 text-stone-800">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-stone-100">
              <div className="flex items-center gap-1.5">
                <Radio className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-700' : 'text-stone-400'}`} />
                <span className="text-xs font-bold text-stone-900">
                  Supabase Realtime
                </span>
              </div>
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="p-1 text-stone-400 hover:text-emerald-800 hover:bg-stone-50 rounded-md transition cursor-pointer"
                title="Cek Ping & Hubungkan Ulang"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-emerald-700' : ''}`}
                />
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Status Saluran:</span>
                <span
                  className={`font-semibold px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                    isOnline
                      ? 'bg-emerald-100 text-emerald-800'
                      : isConnecting
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isOnline ? (
                    <>
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Terhubung (Online)</span>
                    </>
                  ) : isConnecting ? (
                    <>
                      <Activity className="w-2.5 h-2.5 animate-spin" />
                      <span>Menghubungkan...</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-2.5 h-2.5" />
                      <span>Terputus (Offline)</span>
                    </>
                  )}
                </span>
              </div>

              {/* Latency Ping */}
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Latensi Jaringan:</span>
                <span className="font-mono font-bold text-stone-900">
                  {ping !== null ? (
                    <span className={getPingColor(ping)}>
                      {ping} ms ({ping < 100 ? 'Sangat Baik' : ping < 250 ? 'Stabil' : 'Lambat'})
                    </span>
                  ) : (
                    <span className="text-stone-400">-</span>
                  )}
                </span>
              </div>

              {/* Channel */}
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Nama Saluran:</span>
                <span className="font-mono text-[10px] text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
                  {channelName}
                </span>
              </div>

              {/* Last Checked */}
              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-50">
                <span>Update Terakhir:</span>
                <span>
                  {lastPingTime
                    ? lastPingTime.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : 'Baru saja'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              className="mt-2.5 w-full py-1.5 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Cek Koneksi &amp; Ping Ulang</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
