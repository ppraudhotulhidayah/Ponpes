import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  GraduationCap,
  Users,
  FileText,
  ShieldAlert,
  FileSpreadsheet,
  HeartHandshake,
  UserCog,
  Settings,
  LogOut,
  Layers,
} from 'lucide-react';
import { User, PesantrenSettings, UserRole } from '../types';
import { ConnectionStatusBadge } from './ConnectionStatusBadge';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  counts: {
    suratIzinAktif: number;
    takzirAktif: number;
    izinUstadzPending: number;
  };
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  settings: PesantrenSettings;
  currentUser: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  counts,
  mobileMenuOpen,
  setMobileMenuOpen,
  currentUser,
  onLogout,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Utama',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['admin', 'guru'],
    },
    {
      id: 'absensi',
      label: 'Absensi Santri',
      icon: <CheckSquare className="w-5 h-5" />,
      sub: 'Ngaji & Sholat Berjamaah',
      roles: ['admin', 'guru'],
    },
    {
      id: 'jadwal',
      label: 'Jadwal & Kegiatan',
      icon: <CalendarDays className="w-5 h-5" />,
      sub: 'Madrasah, 24 Jam & Piket',
      roles: ['admin', 'guru'],
    },
    {
      id: 'pengajar',
      label: 'Dewan Pengajar / Asatidz',
      icon: <GraduationCap className="w-5 h-5" />,
      sub: 'Izin Mengajar & Jurnal KBM',
      roles: ['admin', 'guru'],
      badge:
        counts.izinUstadzPending > 0 && userRole === 'admin'
          ? counts.izinUstadzPending
          : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'santri',
      label: 'Data Santri & Kelas',
      icon: <Users className="w-5 h-5" />,
      sub: 'Biodata, Kamar & Rayon',
      roles: ['admin', 'guru'],
    },
    {
      id: 'surat_izin',
      label: 'Surat Izin Pulang',
      icon: <FileText className="w-5 h-5" />,
      sub: 'Cetak Surat & Tracing',
      roles: ['admin', 'guru'],
      badge: counts.suratIzinAktif > 0 ? counts.suratIzinAktif : undefined,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'kedisiplinan',
      label: 'Kedisiplinan & Takzir',
      icon: <ShieldAlert className="w-5 h-5" />,
      sub: 'Pelanggaran & Hukuman Edukatif',
      roles: ['admin', 'guru'],
      badge: counts.takzirAktif > 0 ? counts.takzirAktif : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'laporan',
      label: 'Laporan & Rekap PDF',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      sub: 'Export A4 Siap Cetak',
      roles: ['admin', 'guru'],
    },
    {
      id: 'wali_portal',
      label: 'Portal Wali Santri',
      icon: <HeartHandshake className="w-5 h-5" />,
      sub: 'Khusus Pantau Ananda',
      roles: ['wali', 'admin'],
      highlight: true,
    },
    {
      id: 'kelola_master',
      label: 'Kelola Kelas & Kamar',
      icon: <Layers className="w-5 h-5" />,
      sub: 'Master Data Kelas & Asrama',
      roles: ['admin'],
    },
    {
      id: 'kelola_pengguna',
      label: 'Kelola Pengguna',
      icon: <UserCog className="w-5 h-5" />,
      sub: 'Manajemen Akun Guru & Wali',
      roles: ['admin'],
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan Sistem',
      icon: <Settings className="w-5 h-5" />,
      sub: 'Identitas & Database Cloud',
      roles: ['admin'],
    },
  ].filter((item) => item.roles.includes(userRole));

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const displayName = currentUser.displayName || currentUser.name;

  return (
    <>
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`
        fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-stone-200/90 flex flex-col justify-between
        transition-transform duration-200 ease-in-out no-print
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
          <div className="pb-3 mb-2 border-b border-stone-100 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Menu Navigasi
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                userRole === 'admin'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : userRole === 'guru'
                    ? 'bg-teal-100 text-teal-800 border border-teal-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {userRole === 'admin'
                ? 'Administrator'
                : userRole === 'guru'
                  ? 'Dewan Guru'
                  : 'Wali Santri'}
            </span>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`
                    w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center justify-between group cursor-pointer
                    ${
                      active
                        ? 'bg-emerald-800 text-white shadow-md shadow-emerald-950/10'
                        : item.highlight && userRole === 'wali'
                          ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                          : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1 rounded-lg ${
                        active
                          ? 'text-amber-300'
                          : item.highlight
                            ? 'text-amber-600'
                            : 'text-stone-500 group-hover:text-emerald-700'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold leading-tight flex items-center gap-1.5">
                        {item.label}
                        {item.highlight && userRole === 'wali' && (
                          <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.2 rounded font-bold uppercase">
                            Utama
                          </span>
                        )}
                      </div>
                      {item.sub && (
                        <div
                          className={`text-[11px] leading-tight ${
                            active ? 'text-emerald-200' : 'text-stone-400'
                          }`}
                        >
                          {item.sub}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card & Clean Logout Button */}
        <div className="p-3 border-t border-stone-100 bg-stone-50/90 space-y-2">
          {currentUser && (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
                  {displayName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-stone-800 truncate">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-stone-500 font-mono truncate">
                    @{currentUser.username}
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Keluar / Logout Sesi"
                className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-100 hover:border-rose-300 transition shrink-0 ml-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bottom Row: Persistent Connection Status (Bottom-Left) & Logout Action */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <ConnectionStatusBadge />

            <button
              onClick={onLogout}
              className="py-1.5 px-2.5 bg-stone-200/80 hover:bg-rose-100 hover:text-rose-700 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Keluar / Logout dari aplikasi"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
