import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Plus,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Clock,
  Calendar,
} from 'lucide-react';
import { User, IzinMengajar, JurnalKBM } from '../types';

interface PengajarProps {
  currentUser: User;
  izinMengajarList: IzinMengajar[];
  onAddIzinMengajar: (item: IzinMengajar) => void;
  onUpdateStatusIzin: (id: string, status: 'Disetujui' | 'Ditolak', catatanAdmin?: string) => void;
  jurnalList: JurnalKBM[];
  onAddJurnal: (item: JurnalKBM) => void;
  onNavigateToLaporan: () => void;
}

export const Pengajar: React.FC<PengajarProps> = ({
  currentUser,
  izinMengajarList,
  onAddIzinMengajar,
  onUpdateStatusIzin,
  jurnalList,
  onAddJurnal,
  onNavigateToLaporan,
}) => {
  const [activeTab, setActiveTab] = useState<'jurnal' | 'izin'>('jurnal');
  const [showJurnalForm, setShowJurnalForm] = useState(false);
  const [showIzinForm, setShowIzinForm] = useState(false);

  // New Jurnal form state
  const [jurnalForm, setJurnalForm] = useState<Partial<JurnalKBM>>({
    tanggal: '2026-10-07',
    namaUstadz: currentUser.displayName || currentUser.name,
    kelas: 'Wustha A',
    kitab: 'Fathul Qorib Al-Mujib',
    babMateri: '',
    halaman: '',
    catatanSantri: '',
    kendalaKBM: '',
    jumlahHadir: 12,
    jumlahSantri: 12,
  });

  // New Izin form state
  const [izinForm, setIzinForm] = useState({
    tanggalMulai: '2026-10-10',
    tanggalSelesai: '2026-10-10',
    mapelKitab: 'Fathul Qorib Al-Mujib (Fiqih) - Wustha A',
    alasan: '',
    ustadzBadal: 'Ustadz Faisal Basri, S.Hum',
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-800" />
            <span>Dewan Asatidz &amp; Kinerja Pengajaran</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Jurnal evaluasi KBM halaqoh santri dan permohonan izin udzur asatidz beserta penugasan ustadz badal
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToLaporan}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
            <span>Rekap Jurnal PDF</span>
          </button>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('jurnal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'jurnal'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Jurnal KBM Harian
            </button>
            <button
              onClick={() => setActiveTab('izin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'izin'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Izin Mengajar &amp; Badal
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: JURNAL KBM HARIAN */}
      {activeTab === 'jurnal' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Riwayat Jurnal KBM Halaqoh Asatidz ({jurnalList.length})
            </span>
            {currentUser.role !== 'wali' && (
              <button
                onClick={() => setShowJurnalForm(!showJurnalForm)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>{showJurnalForm ? 'Tutup Formulir' : 'Input Jurnal KBM'}</span>
              </button>
            )}
          </div>

          {/* Form Jurnal */}
          {showJurnalForm && (
            <div className="bg-white p-5 rounded-2xl border border-emerald-300 shadow-md">
              <h3 className="text-sm font-bold text-emerald-950 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>Formulir Jurnal Pengajaran Santri</span>
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!jurnalForm.babMateri || !jurnalForm.kitab) return;
                  onAddJurnal({
                    id: `jrn_${Date.now()}`,
                    tanggal: jurnalForm.tanggal || '2026-10-07',
                    namaUstadz:
                      jurnalForm.namaUstadz || currentUser.displayName || currentUser.name,
                    kelas: jurnalForm.kelas || 'Wustha A',
                    kitab: jurnalForm.kitab,
                    babMateri: jurnalForm.babMateri,
                    halaman: jurnalForm.halaman || 'Bait / Hal Terkait',
                    catatanSantri:
                      jurnalForm.catatanSantri || 'KBM terlaksana dengan khidmat dan tertib.',
                    kendalaKBM: jurnalForm.kendalaKBM || '',
                    jumlahHadir: Number(jurnalForm.jumlahHadir) || 12,
                    jumlahSantri: Number(jurnalForm.jumlahSantri) || 12,
                  });
                  setShowJurnalForm(false);
                  setJurnalForm({
                    ...jurnalForm,
                    babMateri: '',
                    halaman: '',
                    catatanSantri: '',
                    kendalaKBM: '',
                  });
                }}
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Tanggal KBM:
                    </label>
                    <input
                      type="date"
                      value={jurnalForm.tanggal}
                      onChange={(e) =>
                        setJurnalForm({ ...jurnalForm, tanggal: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Ustadz Pengampu:
                    </label>
                    <input
                      type="text"
                      value={jurnalForm.namaUstadz}
                      onChange={(e) =>
                        setJurnalForm({ ...jurnalForm, namaUstadz: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Tingkat / Kelas:
                    </label>
                    <select
                      value={jurnalForm.kelas}
                      onChange={(e) =>
                        setJurnalForm({ ...jurnalForm, kelas: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    >
                      <option value="Ula A">Ula A</option>
                      <option value="Ula B">Ula B</option>
                      <option value="Wustha A">Wustha A</option>
                      <option value="Wustha B">Wustha B</option>
                      <option value="Ulya">Ulya</option>
                      <option value="Semua Tingkat">Semua Tingkat</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Kitab / Mata Pelajaran:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Fathul Qorib Al-Mujib"
                      value={jurnalForm.kitab}
                      onChange={(e) =>
                        setJurnalForm({ ...jurnalForm, kitab: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Bab / Fasal Materi:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Bab Wudhu & Tayammum"
                      value={jurnalForm.babMateri}
                      onChange={(e) =>
                        setJurnalForm({ ...jurnalForm, babMateri: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Halaman / Bait Capaian:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Hal 12 - 15 / Bait 20-35"
                      value={jurnalForm.halaman}
                      onChange={(e) =>
                        setJurnalForm({ ...jurnalForm, halaman: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Catatan Pemahaman Santri:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Catatan perkembangan atau pemahaman santri saat sorogan/bandongan..."
                      value={jurnalForm.catatanSantri}
                      onChange={(e) =>
                        setJurnalForm({ ...jurnalForm, catatanSantri: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Kendala KBM (Opsional):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Buku rujukan kurang, mikrofon mati..."
                      value={jurnalForm.kendalaKBM}
                      onChange={(e) =>
                        setJurnalForm({ ...jurnalForm, kendalaKBM: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowJurnalForm(false)}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs text-stone-600 hover:bg-stone-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold cursor-pointer"
                  >
                    Simpan Jurnal KBM
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Jurnal List Cards */}
          <div className="space-y-3">
            {jurnalList.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs hover:border-emerald-200 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-900">{item.kitab}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded font-bold">
                        {item.kelas}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Pengampu: <strong className="text-stone-800">{item.namaUstadz}</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-medium text-stone-500">
                      📅 {item.tanggal}
                    </span>
                    <div className="text-[11px] text-emerald-700 font-semibold">
                      Kehadiran: {item.jumlahHadir}/{item.jumlahSantri} Santri
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Materi Pembahasan:
                    </div>
                    <div className="font-semibold text-stone-800">{item.babMateri}</div>
                    <div className="text-stone-500">Halaman / Capaian: {item.halaman}</div>
                  </div>

                  <div className="space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Catatan &amp; Kendala KBM:
                    </div>
                    <p className="text-stone-700">
                      {item.catatanSantri || 'KBM berjalan lancar dan tertib.'}
                    </p>
                    {item.kendalaKBM && (
                      <p className="text-amber-800 text-[11px] font-medium mt-1">
                        ⚠️ Kendala: {item.kendalaKBM}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: IZIN MENGAJAR & USTADZ BADAL */}
      {activeTab === 'izin' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Daftar Pengajuan Izin Mengajar Asatidz ({izinMengajarList.length})
            </span>
            {currentUser.role !== 'wali' && (
              <button
                onClick={() => setShowIzinForm(!showIzinForm)}
                className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>{showIzinForm ? 'Tutup Formulir' : 'Ajukan Izin Mengajar'}</span>
              </button>
            )}
          </div>

          {/* Form Izin */}
          {showIzinForm && (
            <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-md">
              <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Formulir Pengajuan Izin Mengajar Ustadz</span>
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!izinForm.alasan) return;
                  onAddIzinMengajar({
                    id: `im_${Date.now()}`,
                    ustadzId: currentUser.id,
                    namaUstadz: currentUser.displayName || currentUser.name,
                    tanggalMulai: izinForm.tanggalMulai,
                    tanggalSelesai: izinForm.tanggalSelesai,
                    mapelKitab: izinForm.mapelKitab,
                    alasan: izinForm.alasan,
                    ustadzBadal: izinForm.ustadzBadal,
                    status: 'Menunggu',
                    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                  });
                  setShowIzinForm(false);
                  setIzinForm({ ...izinForm, alasan: '' });
                }}
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Mulai Tanggal:
                    </label>
                    <input
                      type="date"
                      value={izinForm.tanggalMulai}
                      onChange={(e) =>
                        setIzinForm({ ...izinForm, tanggalMulai: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Sampai Tanggal:
                    </label>
                    <input
                      type="date"
                      value={izinForm.tanggalSelesai}
                      onChange={(e) =>
                        setIzinForm({ ...izinForm, tanggalSelesai: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Kitab / Halaqoh:
                    </label>
                    <input
                      type="text"
                      value={izinForm.mapelKitab}
                      onChange={(e) =>
                        setIzinForm({ ...izinForm, mapelKitab: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Ustadz Badal (Pengganti):
                    </label>
                    <input
                      type="text"
                      placeholder="Nama ustadz badal yang bersedia menggantikan"
                      value={izinForm.ustadzBadal}
                      onChange={(e) =>
                        setIzinForm({ ...izinForm, ustadzBadal: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">
                      Alasan Berhalangan:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Undangan Bahtsul Masail, keluarga sakit..."
                      value={izinForm.alasan}
                      onChange={(e) =>
                        setIzinForm({ ...izinForm, alasan: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowIzinForm(false)}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                  >
                    Kirim Permohonan Izin
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Izin List Cards */}
          <div className="space-y-3">
            {izinMengajarList.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs hover:border-stone-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-stone-900">
                      {item.namaUstadz}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.status === 'Disetujui'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : item.status === 'Ditolak'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600">
                    Mata Pelajaran: <strong>{item.mapelKitab}</strong>
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">Alasan: &ldquo;{item.alasan}&rdquo;</p>
                  <p className="text-xs text-emerald-800 font-medium mt-1">
                    🔄 Ustadz Badal (Pengganti): {item.ustadzBadal}
                  </p>
                  {item.catatanAdmin && (
                    <p className="text-xs text-stone-500 italic mt-0.5">
                      Catatan Admin: {item.catatanAdmin}
                    </p>
                  )}
                  <div className="text-[11px] text-stone-400 mt-1">
                    Tanggal Izin: {item.tanggalMulai}{' '}
                    {item.tanggalMulai !== item.tanggalSelesai &&
                      `s/d ${item.tanggalSelesai}`}{' '}
                    • Diajukan: {item.createdAt}
                  </div>
                </div>

                {currentUser.role === 'admin' && item.status === 'Menunggu' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        onUpdateStatusIzin(
                          item.id,
                          'Disetujui',
                          'Disetujui oleh Kepala Kesantrian'
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Setujui</span>
                    </button>
                    <button
                      onClick={() =>
                        onUpdateStatusIzin(
                          item.id,
                          'Ditolak',
                          'Jadwal ujian santri tidak dapat diganti'
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
