import React from 'react';
import {
  Sparkles,
  Users,
  CheckCheck,
  FileText,
  ShieldAlert,
  BookOpen,
  ArrowRight,
  ArrowUpRight,
  Volume2,
} from 'lucide-react';
import {
  User,
  Santri,
  AbsensiRecord,
  SuratIzinPulang,
  PelanggaranTakzir,
  RutinitasHarian,
  Pengumuman,
} from '../types';
import {
  formatDateIndo,
  getHijriDate,
  getPrayerTimes,
} from '../data/mockData';

interface DashboardProps {
  currentUser: User;
  santriList: Santri[];
  absensiList: AbsensiRecord[];
  suratIzinList: SuratIzinPulang[];
  pelanggaranList: PelanggaranTakzir[];
  rutinitasList: RutinitasHarian[];
  pengumumanList: Pengumuman[];
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  santriList,
  absensiList,
  suratIzinList,
  pelanggaranList,
  rutinitasList,
  pengumumanList,
  onNavigate,
}) => {
  const now = new Date();
  const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const currentRoutine =
    rutinitasList.find(
      (r) => currentHourMin >= r.waktuMulai && currentHourMin <= r.waktuSelesai
    ) || rutinitasList[8];

  const todaySessionAbsensi = absensiList.filter(
    (a) => a.tanggal === '2026-10-07' && a.sesi === 'ngaji_asar'
  );

  const hadirCount = todaySessionAbsensi.filter((a) => a.status === 'Hadir').length;
  const telatCount = todaySessionAbsensi.filter((a) => a.status === 'Telat').length;
  const izinCount = todaySessionAbsensi.filter((a) => a.status === 'Izin').length;
  const sakitCount = todaySessionAbsensi.filter((a) => a.status === 'Sakit').length;
  const pulangCount = todaySessionAbsensi.filter((a) => a.status === 'Pulang').length;
  const alfaCount = todaySessionAbsensi.filter((a) => a.status === 'Alfa').length;

  const totalAbsen = todaySessionAbsensi.length || santriList.length;
  const kehadiranPercent = Math.round(((hadirCount + telatCount) / (totalAbsen || 1)) * 100);

  const santriDiLuar = suratIzinList.filter(
    (s) => s.statusKepulangan === 'Sedang Di Luar'
  ).length;
  const santriTerlambat = suratIzinList.filter(
    (s) => s.statusKepulangan === 'Terlambat'
  ).length;

  const takzirAktifCount = pelanggaranList.filter(
    (p) => p.statusTakzir !== 'Selesai'
  ).length;

  const prayerTimes = getPrayerTimes(now);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 shadow-lg border border-emerald-700/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Assalamu&apos;alaikum Warahmatullahi Wabarakatuh</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              {currentUser.role === 'wali'
                ? `Ahlan Wa Sahlan, ${currentUser.displayName || currentUser.name}`
                : `Selamat Bertugas, ${currentUser.displayName || currentUser.name}`}
            </h2>
            <p className="text-sm text-emerald-200 mt-1 max-w-2xl">
              Sistem Manajemen Santri Pondok Pesantren Raudhotu Hidayah hari ini,{' '}
              {formatDateIndo(now)} ({getHijriDate()}).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.role === 'wali' ? (
              <button
                onClick={() => onNavigate('wali_portal')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                <span>Buka Portal Santri Ananda</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('absensi')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Input Absensi Hari Ini</span>
              </button>
            )}
          </div>
        </div>

        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-emerald-700/20 pointer-events-none blur-2xl" />
        <div className="absolute left-1/3 bottom-0 translate-y-8 w-48 h-48 rounded-full bg-amber-500/10 pointer-events-none blur-xl" />
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('santri')}
          className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Santri
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-800">{santriList.length}</span>
            <span className="text-xs text-stone-500 font-medium">Santri Mukim</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 flex items-center gap-1">
            <span>4 Rayon Asrama Putra</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('absensi')}
          className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Kehadiran Ngaji
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-800">{kehadiranPercent}%</span>
            <span className="text-xs text-stone-500 font-medium">{hadirCount} Hadir</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-500 flex items-center gap-1">
            <span>
              {telatCount} Telat • {izinCount + sakitCount} Izin/Sakit
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('surat_izin')}
          className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Izin Pulang Aktif
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-800">{santriDiLuar}</span>
            <span className="text-xs text-stone-500 font-medium">Santri di Luar</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-800 font-medium">
            {santriTerlambat > 0 ? (
              <span className="text-rose-600 font-bold">
                ⚠️ {santriTerlambat} Santri Terlambat Kembali
              </span>
            ) : (
              <span>Semua kepulangan terpantau</span>
            )}
          </div>
        </div>

        <div
          onClick={() => onNavigate('kedisiplinan')}
          className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs hover:border-rose-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Takzir Berjalan
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-800">{takzirAktifCount}</span>
            <span className="text-xs text-stone-500 font-medium">Tugas Pembinaan</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            <span>Dewan Keamanan Pondok</span>
          </div>
        </div>
      </div>

      {/* Row: Jadwal Sholat & Current Active Routine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jadwal Sholat */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-stone-800">Jadwal Sholat 5 Waktu</h3>
              <p className="text-xs text-stone-500">Kemenag Wilayah Jawa Barat</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              WIB
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {prayerTimes.map((p) => (
              <div
                key={p.nama}
                className={`p-2.5 rounded-xl text-center border transition ${
                  p.isNext
                    ? 'bg-amber-500 text-stone-900 border-amber-600 shadow-sm font-bold scale-102'
                    : p.isPassed
                      ? 'bg-stone-50 text-stone-400 border-stone-200'
                      : 'bg-emerald-50/50 text-emerald-900 border-emerald-100 font-medium'
                }`}
              >
                <div className="text-[11px] uppercase tracking-wider">{p.nama}</div>
                <div className="text-sm font-bold mt-0.5">{p.waktu}</div>
                {p.isNext && (
                  <div className="text-[9px] font-bold text-stone-950 uppercase mt-0.5 animate-pulse">
                    Berikutnya
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Adzan dikumandangkan tepat waktu</span>
            <span className="font-semibold text-emerald-700">Wajib Berjamaah</span>
          </div>
        </div>

        {/* Agenda Berlangsung Saat Ini */}
        <div className="lg:col-span-2 bg-linear-to-br from-stone-900 via-stone-800 to-emerald-950 text-white rounded-2xl p-5 shadow-sm border border-stone-700/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Agenda Berlangsung Saat Ini
                </span>
              </div>
              <span className="text-xs bg-emerald-800/80 text-emerald-200 border border-emerald-600/50 px-2 py-0.5 rounded-full font-mono">
                {currentRoutine.waktuMulai} - {currentRoutine.waktuSelesai} WIB
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{currentRoutine.kegiatan}</span>
            </h3>
            <p className="text-sm text-stone-300 mt-1">{currentRoutine.keterangan}</p>

            <div className="mt-2 flex items-center gap-4 text-xs text-emerald-300">
              <span>
                📍 Lokasi: <strong>{currentRoutine.lokasi}</strong>
              </span>
              <span>
                🏷️ Kategori: <strong>{currentRoutine.kategori}</strong>
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-700/60 flex items-center justify-between">
            <span className="text-xs text-stone-400">
              Seluruh santri wajib hadir 5 menit sebelum waktu dimulai
            </span>
            <button
              onClick={() => onNavigate('jadwal')}
              className="text-xs text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 group cursor-pointer"
            >
              <span>Lihat Jadwal 24 Jam Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        </div>
      </div>

      {/* Row: Quick Attendance Summary & Official Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-stone-800">
                Status Kehadiran Sesi Ngaji Sore
              </h3>
              <p className="text-xs text-stone-500">Rekapitulasi real-time 12 santri mukim</p>
            </div>
            <button
              onClick={() => onNavigate('absensi')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Kelola Absensi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <div className="text-xs text-emerald-800 font-semibold">Hadir</div>
              <div className="text-xl font-bold text-emerald-700 mt-1">{hadirCount}</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <div className="text-xs text-amber-800 font-semibold">Telat</div>
              <div className="text-xl font-bold text-amber-700 mt-1">{telatCount}</div>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-center">
              <div className="text-xs text-sky-800 font-semibold">Izin</div>
              <div className="text-xl font-bold text-sky-700 mt-1">{izinCount}</div>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center">
              <div className="text-xs text-indigo-800 font-semibold">Sakit</div>
              <div className="text-xl font-bold text-indigo-700 mt-1">{sakitCount}</div>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-center">
              <div className="text-xs text-teal-800 font-semibold">Pulang</div>
              <div className="text-xl font-bold text-teal-700 mt-1">{pulangCount}</div>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
              <div className="text-xs text-rose-800 font-semibold">Alfa</div>
              <div className="text-xl font-bold text-rose-700 mt-1">{alfaCount}</div>
            </div>
          </div>

          <div className="border border-stone-100 rounded-xl overflow-hidden text-xs">
            <div className="bg-stone-50 px-3 py-2 font-semibold text-stone-600 grid grid-cols-12">
              <span className="col-span-5">Nama Santri</span>
              <span className="col-span-3">Kamar / Rayon</span>
              <span className="col-span-2">Kelas</span>
              <span className="col-span-2 text-right">Status</span>
            </div>
            <div className="divide-y divide-stone-100">
              {santriList.slice(0, 5).map((santri) => {
                const status =
                  absensiList.find(
                    (a) => a.santriId === santri.id && a.sesi === 'ngaji_asar'
                  )?.status || 'Hadir';

                const colorClass =
                  status === 'Hadir'
                    ? 'bg-emerald-100 text-emerald-800'
                    : status === 'Telat'
                      ? 'bg-amber-100 text-amber-800'
                      : status === 'Pulang'
                        ? 'bg-teal-100 text-teal-800'
                        : status === 'Sakit'
                          ? 'bg-indigo-100 text-indigo-800'
                          : status === 'Izin'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-rose-100 text-rose-800';

                return (
                  <div
                    key={santri.id}
                    className="px-3 py-2 grid grid-cols-12 items-center hover:bg-stone-50"
                  >
                    <span className="col-span-5 font-medium text-stone-800 truncate">
                      {santri.nama}
                    </span>
                    <span className="col-span-3 text-stone-500">{santri.kamar}</span>
                    <span className="col-span-2 text-stone-500">
                      {santri.kelasMadrasah}
                    </span>
                    <div className="col-span-2 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${colorClass}`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pengumuman */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-stone-800 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-500" />
                <span>Pengumuman Pesantren</span>
              </h3>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Resmi
              </span>
            </div>

            <div className="space-y-3">
              {pengumumanList.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900">
                      {item.judul}
                    </span>
                    {item.prioritas === 'Penting' && (
                      <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-bold uppercase">
                        Penting
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {item.isi}
                  </p>
                  <div className="text-[10px] text-stone-400 mt-1.5">
                    {item.tanggal}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-center">
            <span className="text-xs text-stone-400">
              Sekretariat Pondok Pesantren Raudhotu Hidayah
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
