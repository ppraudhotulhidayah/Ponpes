import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Menu,
  X,
  LogOut,
  Volume2,
  ChevronDown,
  ShieldCheck,
  BookOpen,
  User as UserIcon,
  Cloud,
} from 'lucide-react';
import { User, PesantrenSettings } from '../types';
import {
  getPrayerTimes,
  formatDateIndo,
  formatTimeWIB,
  getHijriDate,
} from '../data/mockData';

interface HeaderProps {
  currentUser: User;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  settings: PesantrenSettings;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  mobileMenuOpen,
  setMobileMenuOpen,
  settings,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prayerTimes = getPrayerTimes(currentTime);
  const nextPrayer = prayerTimes.find((p) => p.isNext) || prayerTimes[0];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin / Pengurus Utama',
          color: 'bg-emerald-800 text-amber-200 border-emerald-600',
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
        };
      case 'guru':
        return {
          label: 'Dewan Asatidz / Guru',
          color: 'bg-emerald-700 text-emerald-100 border-emerald-500',
          icon: <BookOpen className="w-3.5 h-3.5" />,
        };
      case 'wali':
        return {
          label: 'Wali Santri',
          color: 'bg-amber-700 text-amber-100 border-amber-500',
          icon: <UserIcon className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: 'Pengguna',
          color: 'bg-stone-700 text-stone-200 border-stone-500',
          icon: <UserIcon className="w-3.5 h-3.5" />,
        };
    }
  };

  const currentRoleBadge = getRoleBadge(currentUser.role);
  const userDisplayName = currentUser.displayName || currentUser.name;

  return (
    <header className="bg-emerald-950 text-white shadow-md border-b border-emerald-900 sticky top-0 z-40 no-print">
      {/* Top Bar: Jam Realtime, Hijri, Jadwal Sholat */}
      <div className="bg-emerald-900/60 border-b border-emerald-800/60 px-4 py-1 text-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-amber-300 font-bold bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>{formatTimeWIB(currentTime)} WIB</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-emerald-300">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDateIndo(currentTime)}</span>
            <span className="text-amber-400 font-arabic font-semibold ml-1">
              ({getHijriDate()})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded text-[11px] text-emerald-300">
            <Cloud className="w-3 h-3 text-emerald-400" />
            <span className="font-medium">Supabase Cloud Sync</span>
          </div>

          {nextPrayer && (
            <div className="flex items-center gap-1.5 bg-emerald-900/90 border border-emerald-700/60 px-2.5 py-0.5 rounded text-xs text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>
                Menuju {nextPrayer.nama} ({nextPrayer.waktu} WIB):
              </span>
              <span className="font-semibold text-white">{nextPrayer.countdownStr}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Bar: Logo, Nama Lembaga, & Profile */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-md text-emerald-200 hover:bg-emerald-800 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {settings?.logoUrl ? (
            <div className="w-11 h-11 rounded-lg bg-white p-1 shadow-md flex items-center justify-center shrink-0 border border-amber-400/40">
              <img
                src={settings.logoUrl}
                alt="Logo Lembaga"
                className="w-full h-full object-contain rounded"
              />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-lg bg-linear-to-br from-amber-400 via-amber-500 to-amber-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-emerald-950 rounded-md flex items-center justify-center text-amber-400 border border-amber-400/30">
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <path d="M12 2L4 7v13h16V7L12 2z" strokeLinejoin="round" />
                  <path d="M12 2v7" />
                  <path
                    d="M9 13a3 3 0 0 1 6 0v7H9v-7z"
                    fill="currentColor"
                    fillOpacity="0.2"
                  />
                  <circle cx="12" cy="5.5" r="1.5" fill="currentColor" />
                </svg>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {settings?.namaLembaga || 'Pondok Pesantren Raudhotu Hidayah'}
              </h1>
            </div>
            <p className="text-xs text-emerald-200/90 hidden sm:block">
              {settings?.subNamaTagline ||
                'Sistem Informasi Manajemen Santri, Absensi, Kedisiplinan & Perizinan Terpadu'}
            </p>
          </div>
        </div>

        {/* User Greeting (Desktop) */}
        <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-xs leading-tight">
            <span className="text-emerald-300 font-medium">Selamat Datang, </span>
            <span className="font-bold text-amber-300">{userDisplayName}</span>
          </div>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-700/80 transition text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-700 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-xs uppercase shadow-xs">
              {userDisplayName.charAt(0)}
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-xs font-semibold text-white leading-tight line-clamp-1 max-w-[170px]">
                {userDisplayName}
              </div>
              <div
                className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 rounded border ${currentRoleBadge.color}`}
              >
                {currentRoleBadge.icon}
                <span>{currentUser.role.toUpperCase()}</span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-emerald-300 ml-0.5" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 text-stone-800 py-2 z-50 animate-in fade-in">
              <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/80 rounded-t-2xl">
                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                  Akun Masuk
                </p>
                <p className="text-xs font-bold text-emerald-950 mt-0.5 truncate">
                  {userDisplayName}
                </p>
                <p className="text-[11px] text-stone-500 font-mono">@{currentUser.username}</p>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      currentUser.role === 'admin'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : currentUser.role === 'guru'
                          ? 'bg-teal-100 text-teal-800 border border-teal-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {currentRoleBadge.icon}
                    <span>{currentRoleBadge.label}</span>
                  </span>
                </div>
                {currentUser.santriName && (
                  <p className="text-[11px] text-amber-800 font-semibold mt-1.5 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                    Ananda Santri: {currentUser.santriName}
                  </p>
                )}
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-bold transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Keluar / Logout Sesi</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Running Announcement Ticker */}
      {showAnnouncement && (
        <div className="bg-emerald-800 text-emerald-100 text-xs px-3 py-1 flex items-center border-t border-emerald-700/60 overflow-hidden">
          <div className="flex items-center gap-1.5 font-semibold text-amber-300 shrink-0 mr-3 pr-3 border-r border-emerald-700">
            <Volume2 className="w-3.5 h-3.5 animate-bounce" />
            <span className="text-[11px] uppercase tracking-wider">Maklumat Pondok:</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap relative flex-1">
            <div className="inline-block text-emerald-100">
              <span className="mx-4 font-medium text-amber-200">
                ★ Tasmi&apos; Al-Qur&apos;an 5 Juz Bulanan Ahad 12 Oktober 2026
              </span>
              <span className="mx-4">
                | Seluruh santri wajib menuntaskan setoran tahfidz ba&apos;da maghrib
              </span>
              <span className="mx-4 font-medium text-amber-200">
                ★ Perizinan pulang diperketat menjelang UTS Madrasah Diniyah
              </span>
              <span className="mx-4">
                | Harap wali santri mematuhi batas tanggal wajib kembali
              </span>
              <span className="mx-4 font-medium text-amber-200">
                ★ Jumat Bersih: Kerja bakti akbar pembersihan maktabah dan serambi masjid jami&apos;
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="ml-2 text-emerald-300 hover:text-white p-0.5 rounded cursor-pointer"
            title="Tutup pengumuman"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
};
