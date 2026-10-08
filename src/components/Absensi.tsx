import React, { useState } from 'react';
import {
  CheckCheck,
  Search,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { Santri, AbsensiRecord, UserRole } from '../types';

interface AbsensiProps {
  santriList: Santri[];
  absensiList: AbsensiRecord[];
  onSaveAbsensi: (records: AbsensiRecord[]) => void;
  userRole: UserRole;
  userName: string;
  onNavigateToLaporan: () => void;
}

const SESSIONS = [
  { id: 'ngaji_asar', label: 'Ngaji Asar', sub: 'Madrasah', icon: '📖' },
  { id: 'ngaji_maghrib', label: 'Ngaji Maghrib', sub: "Tahsin Qur'an", icon: '🕌' },
  { id: 'ngaji_isya', label: 'Ngaji Isya', sub: 'Bandongan/Tahfidz', icon: '🌙' },
  { id: 'sholat_subuh', label: 'Sholat Shubuh', sub: 'Berjamaah', icon: '🌅' },
  { id: 'sholat_dzuhur', label: 'Sholat Dzuhur', sub: 'Berjamaah', icon: '☀️' },
  { id: 'sholat_asar', label: 'Sholat Asar', sub: 'Berjamaah', icon: '🌤️' },
  { id: 'sholat_maghrib', label: 'Sholat Maghrib', sub: 'Berjamaah', icon: '🌇' },
  { id: 'sholat_isya', label: 'Sholat Isya', sub: 'Berjamaah', icon: '🌌' },
];

const STATUS_OPTIONS: Array<'Hadir' | 'Telat' | 'Izin' | 'Sakit' | 'Pulang' | 'Alfa'> = [
  'Hadir',
  'Telat',
  'Izin',
  'Sakit',
  'Pulang',
  'Alfa',
];

export const Absensi: React.FC<AbsensiProps> = ({
  santriList,
  absensiList,
  onSaveAbsensi,
  userRole,
  userName,
  onNavigateToLaporan,
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-10-07');
  const [selectedSession, setSelectedSession] = useState('ngaji_asar');
  const [filterKamar, setFilterKamar] = useState('all');
  const [filterKelas, setFilterKelas] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Initialize or fetch state for current session & date
  const [sessionData, setSessionData] = useState<
    Record<string, { status: 'Hadir' | 'Telat' | 'Izin' | 'Sakit' | 'Pulang' | 'Alfa'; keterangan: string }>
  >(() => {
    const map: Record<string, { status: any; keterangan: string }> = {};
    santriList.forEach((s) => {
      const existing = absensiList.find(
        (a) => a.santriId === s.id && a.sesi === 'ngaji_asar' && a.tanggal === '2026-10-07'
      );
      map[s.id] = {
        status: existing
          ? existing.status
          : s.statusMukim === 'Izin Pulang'
            ? 'Pulang'
            : 'Hadir',
        keterangan: existing?.keterangan || '',
      };
    });
    return map;
  });

  const handleSessionChange = (newSession: string, newDate: string = selectedDate) => {
    setSelectedSession(newSession);
    setSelectedDate(newDate);
    const map: Record<string, { status: any; keterangan: string }> = {};
    santriList.forEach((s) => {
      const existing = absensiList.find(
        (a) => a.santriId === s.id && a.sesi === newSession && a.tanggal === newDate
      );
      map[s.id] = {
        status: existing
          ? existing.status
          : s.statusMukim === 'Izin Pulang'
            ? 'Pulang'
            : 'Hadir',
        keterangan: existing?.keterangan || '',
      };
    });
    setSessionData(map);
  };

  const handleStatusChange = (
    santriId: string,
    status: 'Hadir' | 'Telat' | 'Izin' | 'Sakit' | 'Pulang' | 'Alfa'
  ) => {
    if (userRole === 'wali') return;
    setSessionData((prev) => ({
      ...prev,
      [santriId]: {
        ...prev[santriId],
        status,
      },
    }));
  };

  const handleKeteranganChange = (santriId: string, keterangan: string) => {
    if (userRole === 'wali') return;
    setSessionData((prev) => ({
      ...prev,
      [santriId]: {
        ...prev[santriId],
        keterangan,
      },
    }));
  };

  const handleSetAllHadir = () => {
    if (userRole === 'wali') return;
    setSessionData((prev) => {
      const updated = { ...prev };
      filteredSantri.forEach((s) => {
        if (s.statusMukim !== 'Izin Pulang') {
          updated[s.id] = { ...updated[s.id], status: 'Hadir' };
        }
      });
      return updated;
    });
  };

  const handleSave = () => {
    const updatedRecords: AbsensiRecord[] = santriList.map((s) => {
      const cur = sessionData[s.id] || { status: 'Hadir', keterangan: '' };
      return {
        id: `abs_${s.id}_${selectedSession}_${selectedDate}`,
        santriId: s.id,
        tanggal: selectedDate,
        sesi: selectedSession,
        status: cur.status,
        keterangan: cur.keterangan,
        petugas: userName || 'Petugas Kesantrian',
        updatedAt: `${selectedDate} ${new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
      };
    });

    // Merge with absensiList for other sessions/dates
    const remaining = absensiList.filter(
      (a) => !(a.sesi === selectedSession && a.tanggal === selectedDate)
    );
    onSaveAbsensi([...updatedRecords, ...remaining]);

    setSaveFeedback(
      `Presensi sesi "${
        SESSIONS.find((s) => s.id === selectedSession)?.label
      }" (${selectedDate}) berhasil disimpan!`
    );
    setTimeout(() => setSaveFeedback(null), 4000);
  };

  const filteredSantri = santriList.filter((s) => {
    if (filterKamar !== 'all' && !s.kamar.includes(filterKamar)) return false;
    if (filterKelas !== 'all' && s.kelasMadrasah !== filterKelas) return false;
    if (
      searchQuery &&
      !s.nama.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.nis.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const stats = {
    Hadir: 0,
    Telat: 0,
    Izin: 0,
    Sakit: 0,
    Pulang: 0,
    Alfa: 0,
  };

  filteredSantri.forEach((s) => {
    const st = sessionData[s.id]?.status || 'Hadir';
    if (stats[st] !== undefined) {
      stats[st]++;
    }
  });

  const getStatusButtonClass = (
    btnStatus: 'Hadir' | 'Telat' | 'Izin' | 'Sakit' | 'Pulang' | 'Alfa',
    isActive: boolean
  ) => {
    if (!isActive) {
      return 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200';
    }
    switch (btnStatus) {
      case 'Hadir':
        return 'bg-emerald-700 text-white border-emerald-800 shadow-xs';
      case 'Telat':
        return 'bg-amber-600 text-white border-amber-700 shadow-xs';
      case 'Izin':
        return 'bg-sky-600 text-white border-sky-700 shadow-xs';
      case 'Sakit':
        return 'bg-indigo-600 text-white border-indigo-700 shadow-xs';
      case 'Pulang':
        return 'bg-teal-600 text-white border-teal-700 shadow-xs';
      case 'Alfa':
        return 'bg-rose-700 text-white border-rose-800 shadow-xs';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info & Actions */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-emerald-800" />
            <span>Presensi Halaqoh Ngaji &amp; Sholat Berjamaah</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Pencatatan kehadiran santri per sesi kegiatan, ibadah wajib, dan halaqoh kitab kuning
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onNavigateToLaporan}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
            <span>Rekap Laporan</span>
          </button>

          {userRole !== 'wali' && (
            <>
              <button
                onClick={handleSetAllHadir}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                title="Tandai semua santri mukim berstatus Hadir"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Set Semua Hadir</span>
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-amber-300" />
                <span>Simpan Presensi</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Save Notification */}
      {saveFeedback && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{saveFeedback}</span>
        </div>
      )}

      {/* Session Selector (8 Sesi) */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200/90 shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 px-1">
          Pilih Sesi Absensi:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
          {SESSIONS.map((session) => {
            const isSelected = selectedSession === session.id;
            return (
              <button
                key={session.id}
                onClick={() => handleSessionChange(session.id, selectedDate)}
                className={`p-2.5 rounded-xl text-left border transition text-xs cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-900 text-white border-emerald-950 shadow-md font-bold'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="text-sm">{session.icon}</div>
                <div className="font-semibold leading-tight mt-1 line-clamp-1">
                  {session.label}
                </div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    isSelected ? 'text-emerald-200' : 'text-stone-400'
                  }`}
                >
                  {session.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters (Tanggal, Kamar, Kelas, Search) */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
            Tanggal Presensi:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleSessionChange(selectedSession, e.target.value)}
            className="w-full text-xs font-medium px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
            Filter Rayon / Kamar:
          </label>
          <select
            value={filterKamar}
            onChange={(e) => setFilterKamar(e.target.value)}
            className="w-full text-xs font-medium px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600"
          >
            <option value="all">Semua Kamar Asrama</option>
            <option value="Al-Ghazali">Kamar Al-Ghazali (01, 02, 03)</option>
            <option value="Ibnu Sina">Kamar Ibnu Sina (01, 02, 03)</option>
            <option value="Al-Fatih">Kamar Al-Fatih (01, 02, 03)</option>
            <option value="Imam Syafi'i">Kamar Imam Syafi&apos;i (01, 02)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
            Filter Kelas Madrasah:
          </label>
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="w-full text-xs font-medium px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600"
          >
            <option value="all">Semua Kelas Madrasah</option>
            <option value="Ula A">Kelas Ula A</option>
            <option value="Ula B">Kelas Ula B</option>
            <option value="Wustha A">Kelas Wustha A</option>
            <option value="Wustha B">Kelas Wustha B</option>
            <option value="Ulya">Kelas Ulya</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
            Cari Nama / NIS Santri:
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Ketik nama atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Attendance Stats Summary */}
      <div className="bg-stone-50 border border-stone-200/80 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="font-semibold text-stone-700">
          Statistik Presensi ({filteredSantri.length} Santri Terpilih):
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
            Hadir: {stats.Hadir}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold border border-amber-200">
            Telat: {stats.Telat}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 font-bold border border-sky-200">
            Izin: {stats.Izin}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
            Sakit: {stats.Sakit}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 font-bold border border-teal-200">
            Pulang: {stats.Pulang}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold border border-rose-200">
            Alfa: {stats.Alfa}
          </span>
        </div>
      </div>

      {/* Santri Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-600 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Santri &amp; Rayon</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Opsi Kehadiran (Pilih Status)</th>
                <th className="py-3 px-4 w-60">Keterangan / Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredSantri.map((santri, index) => {
                const cur = sessionData[santri.id] || { status: 'Hadir', keterangan: '' };
                const isPulangAktif = santri.statusMukim === 'Izin Pulang';

                return (
                  <tr key={santri.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3 px-4 text-center text-stone-400 font-medium">
                      {index + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-800 text-sm">{santri.nama}</div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-stone-400">{santri.nis}</span>
                        <span>•</span>
                        <span>{santri.kamar}</span>
                        {isPulangAktif && (
                          <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-medium">
                            Izin Pulang Aktif
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {santri.kelasMadrasah}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {STATUS_OPTIONS.map((st) => {
                          const active = cur.status === st;
                          return (
                            <button
                              key={st}
                              disabled={userRole === 'wali'}
                              onClick={() => handleStatusChange(santri.id, st)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${getStatusButtonClass(
                                st,
                                active
                              )} ${
                                userRole === 'wali'
                                  ? 'cursor-not-allowed opacity-80'
                                  : 'cursor-pointer'
                              }`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <input
                        type="text"
                        disabled={userRole === 'wali'}
                        placeholder={
                          userRole === 'wali'
                            ? '-'
                            : 'Contoh: Terlambat wudhu, sakit klinik...'
                        }
                        value={cur.keterangan || ''}
                        onChange={(e) => handleKeteranganChange(santri.id, e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-600 disabled:bg-stone-100 disabled:text-stone-400"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
