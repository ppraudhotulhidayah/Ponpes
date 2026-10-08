import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';
import {
  JadwalMadrasah,
  RutinitasHarian,
  PiketSantri,
  UserRole,
} from '../types';

interface JadwalProps {
  jadwalMadrasahList: JadwalMadrasah[];
  rutinitasList: RutinitasHarian[];
  piketList: PiketSantri[];
  userRole: UserRole;
  onAddJadwalMadrasah: (item: JadwalMadrasah) => void;
  onUpdateJadwalMadrasah: (item: JadwalMadrasah) => void;
  onDeleteJadwalMadrasah: (id: string) => void;
  onAddRutinitas: (item: RutinitasHarian) => void;
  onUpdateRutinitas: (item: RutinitasHarian) => void;
  onDeleteRutinitas: (id: string) => void;
  onAddPiket: (item: PiketSantri) => void;
  onUpdatePiket: (item: PiketSantri) => void;
  onDeletePiket: (id: string) => void;
}

const HARI_LIST = ['Semua Hari', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'];

export const Jadwal: React.FC<JadwalProps> = ({
  jadwalMadrasahList,
  rutinitasList,
  piketList,
  userRole,
  onAddJadwalMadrasah,
  onUpdateJadwalMadrasah,
  onDeleteJadwalMadrasah,
  onAddRutinitas,
  onUpdateRutinitas,
  onDeleteRutinitas,
  onAddPiket,
  onUpdatePiket,
  onDeletePiket,
}) => {
  const [activeTab, setActiveTab] = useState<'madrasah' | 'rutinitas' | 'piket'>('madrasah');
  const [filterHari, setFilterHari] = useState('Semua Hari');
  const [filterKelas, setFilterKelas] = useState('all');
  const [filterKategori, setFilterKategori] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modals state
  const [modalMadrasah, setModalMadrasah] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data: Partial<JadwalMadrasah> | null;
  }>({ isOpen: false, mode: 'add', data: null });

  const [modalRutinitas, setModalRutinitas] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data: Partial<RutinitasHarian> | null;
  }>({ isOpen: false, mode: 'add', data: null });

  const [modalPiket, setModalPiket] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data: Partial<PiketSantri> | null;
  }>({ isOpen: false, mode: 'add', data: null });

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Madrasah Filter
  const filteredMadrasah = jadwalMadrasahList.filter((item) => {
    if (filterHari !== 'Semua Hari' && item.hari !== filterHari) return false;
    if (filterKelas !== 'all' && item.kelas !== filterKelas) return false;
    if (
      searchQuery &&
      !item.kitab.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.pengajar.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Rutinitas Filter
  const filteredRutinitas = rutinitasList.filter((item) => {
    if (filterKategori !== 'all' && item.kategori !== filterKategori) return false;
    if (
      searchQuery &&
      !item.kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Piket Filter
  const filteredPiket = piketList.filter((item) => {
    if (filterHari !== 'Semua Hari' && item.hari !== filterHari) return false;
    if (
      searchQuery &&
      !item.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.koordinator.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-800" />
            <span>Jadwal &amp; Agenda Kegiatan Santri</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Manajemen kurikulum madrasah diniyah, siklus rutinitas harian 24 jam, dan jadwal piket gotong royong
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('madrasah')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'madrasah'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Madrasah Diniyah
          </button>
          <button
            onClick={() => setActiveTab('rutinitas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'rutinitas'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Rutinitas 24 Jam
          </button>
          <button
            onClick={() => setActiveTab('piket')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'piket'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Piket Kebersihan
          </button>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{feedback}</span>
        </div>
      )}

      {/* TAB 1: MADRASAH DINIYAH */}
      {activeTab === 'madrasah' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <select
                  value={filterHari}
                  onChange={(e) => setFilterHari(e.target.value)}
                  className="text-xs font-medium px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600"
                >
                  {HARI_LIST.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  className="text-xs font-medium px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600"
                >
                  <option value="all">Semua Kelas</option>
                  <option value="Semua Tingkat">Semua Tingkat</option>
                  <option value="Ula A">Kelas Ula A</option>
                  <option value="Ula B">Kelas Ula B</option>
                  <option value="Wustha A">Kelas Wustha A</option>
                  <option value="Wustha B">Kelas Wustha B</option>
                  <option value="Ulya">Kelas Ulya</option>
                </select>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari kitab atau pengajar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600 w-52"
                />
              </div>
            </div>

            {userRole === 'admin' && (
              <button
                onClick={() =>
                  setModalMadrasah({
                    isOpen: true,
                    mode: 'add',
                    data: { hari: 'Senin', waktu: '16:00 - 17:15', kelas: 'Wustha A' },
                  })
                }
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Tambah Jadwal Madrasah</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-600 font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4 w-28">Hari</th>
                    <th className="py-3 px-4 w-36">Waktu (WIB)</th>
                    <th className="py-3 px-4">Kitab Kuning / Mata Pelajaran</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Dewan Asatidz</th>
                    <th className="py-3 px-4">Ruang</th>
                    {userRole === 'admin' && (
                      <th className="py-3 px-4 text-center w-24">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredMadrasah.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-lg">
                          {item.hari}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-emerald-800">
                        {item.waktu}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 text-sm">{item.kitab}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {item.kelas}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-800">
                        {item.pengajar}
                      </td>
                      <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                        {item.ruang}
                      </td>
                      {userRole === 'admin' && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() =>
                                setModalMadrasah({
                                  isOpen: true,
                                  mode: 'edit',
                                  data: item,
                                })
                              }
                              className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-emerald-700 transition cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus jadwal "${item.kitab}"?`)) {
                                  onDeleteJadwalMadrasah(item.id);
                                  showFeedback('Jadwal madrasah berhasil dihapus.');
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RUTINITAS 24 JAM */}
      {activeTab === 'rutinitas' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="text-xs font-medium px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="Ibadah">Ibadah</option>
                  <option value="KBM">KBM (Pengajian &amp; Sekolah)</option>
                  <option value="Istirahat">Istirahat</option>
                  <option value="Kemandirian">Kemandirian</option>
                  <option value="Olahraga">Olahraga</option>
                </select>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari kegiatan atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600 w-52"
                />
              </div>
            </div>

            {userRole === 'admin' && (
              <button
                onClick={() =>
                  setModalRutinitas({
                    isOpen: true,
                    mode: 'add',
                    data: {
                      waktuMulai: '15:00',
                      waktuSelesai: '16:00',
                      kategori: 'KBM',
                    },
                  })
                }
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Tambah Rutinitas Harian</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRutinitas.map((item) => {
              const badgeClass =
                item.kategori === 'Ibadah'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : item.kategori === 'KBM'
                    ? 'bg-teal-100 text-teal-800 border-teal-300'
                    : item.kategori === 'Istirahat'
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-4 flex flex-col justify-between hover:border-emerald-300 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {item.waktuMulai} - {item.waktuSelesai} WIB
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}
                      >
                        {item.kategori}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-stone-900 mt-2">{item.kegiatan}</h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {item.keterangan}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-medium">📍 {item.lokasi}</span>
                    {userRole === 'admin' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setModalRutinitas({
                              isOpen: true,
                              mode: 'edit',
                              data: item,
                            })
                          }
                          className="p-1 rounded text-stone-500 hover:text-emerald-700 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus rutinitas "${item.kegiatan}"?`)) {
                              onDeleteRutinitas(item.id);
                              showFeedback('Rutinitas berhasil dihapus.');
                            }
                          }}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PIKET KEBERSIHAN */}
      {activeTab === 'piket' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <select
                  value={filterHari}
                  onChange={(e) => setFilterHari(e.target.value)}
                  className="text-xs font-medium px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600"
                >
                  {HARI_LIST.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari lokasi piket atau koordinator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600 w-52"
                />
              </div>
            </div>

            {userRole === 'admin' && (
              <button
                onClick={() =>
                  setModalPiket({
                    isOpen: true,
                    mode: 'add',
                    data: { hari: 'Senin', tugas: ['Menyapu & mengepel area', 'Merapikan rak'] },
                  })
                }
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Tambah Jadwal Piket</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPiket.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5 flex flex-col justify-between hover:border-emerald-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                    <span className="font-bold text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                      Hari {item.hari}
                    </span>
                    <span className="text-xs font-semibold text-stone-500">{item.kamar}</span>
                  </div>

                  <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{item.lokasi}</span>
                  </h4>

                  <div className="mt-2 text-xs text-stone-600">
                    <div>
                      Kelompok: <strong className="text-stone-800">{item.kelompok}</strong>
                    </div>
                    <div className="mt-0.5">
                      Koordinator:{' '}
                      <strong className="text-emerald-800">{item.koordinator}</strong>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                      Rincian Tugas Piket:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-xs text-stone-600">
                      {item.tugas.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {userRole === 'admin' && (
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end gap-1">
                    <button
                      onClick={() =>
                        setModalPiket({
                          isOpen: true,
                          mode: 'edit',
                          data: item,
                        })
                      }
                      className="p-1 rounded text-stone-500 hover:text-emerald-700 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus jadwal piket "${item.lokasi}"?`)) {
                          onDeletePiket(item.id);
                          showFeedback('Jadwal piket berhasil dihapus.');
                        }
                      }}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL MADRASAH (Add/Edit) */}
      {modalMadrasah.isOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">
                {modalMadrasah.mode === 'add'
                  ? 'Tambah Jadwal Madrasah Baru'
                  : 'Edit Jadwal Madrasah'}
              </h3>
              <button
                onClick={() => setModalMadrasah({ isOpen: false, mode: 'add', data: null })}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const d = modalMadrasah.data;
                if (!d?.kitab || !d?.pengajar) return;

                if (modalMadrasah.mode === 'add') {
                  onAddJadwalMadrasah({
                    id: `jm_${Date.now()}`,
                    hari: d.hari || 'Senin',
                    waktu: d.waktu || '16:00 - 17:15',
                    kelas: d.kelas || 'Wustha A',
                    kitab: d.kitab,
                    pengajar: d.pengajar,
                    ruang: d.ruang || 'Ruang Madrasah 01',
                  });
                  showFeedback('Jadwal madrasah berhasil ditambahkan!');
                } else if (d.id) {
                  onUpdateJadwalMadrasah(d as JadwalMadrasah);
                  showFeedback('Jadwal madrasah berhasil diperbarui!');
                }
                setModalMadrasah({ isOpen: false, mode: 'add', data: null });
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Hari:</label>
                  <select
                    value={modalMadrasah.data?.hari || 'Senin'}
                    onChange={(e) =>
                      setModalMadrasah({
                        ...modalMadrasah,
                        data: { ...modalMadrasah.data, hari: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    {HARI_LIST.filter((h) => h !== 'Semua Hari').map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-600 mb-1">
                    Waktu (WIB):
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 16:00 - 17:15"
                    value={modalMadrasah.data?.waktu || ''}
                    onChange={(e) =>
                      setModalMadrasah({
                        ...modalMadrasah,
                        data: { ...modalMadrasah.data, waktu: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Kitab Kuning / Mata Pelajaran:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Fathul Qorib Al-Mujib (Fiqih)"
                  value={modalMadrasah.data?.kitab || ''}
                  onChange={(e) =>
                    setModalMadrasah({
                      ...modalMadrasah,
                      data: { ...modalMadrasah.data, kitab: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Tingkat / Kelas:</label>
                  <select
                    value={modalMadrasah.data?.kelas || 'Wustha A'}
                    onChange={(e) =>
                      setModalMadrasah({
                        ...modalMadrasah,
                        data: { ...modalMadrasah.data, kelas: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="Semua Tingkat">Semua Tingkat</option>
                    <option value="Ula A">Ula A</option>
                    <option value="Ula B">Ula B</option>
                    <option value="Wustha A">Wustha A</option>
                    <option value="Wustha B">Wustha B</option>
                    <option value="Ulya">Ulya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Ruang / Tempat:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ruang Madrasah 01"
                    value={modalMadrasah.data?.ruang || ''}
                    onChange={(e) =>
                      setModalMadrasah({
                        ...modalMadrasah,
                        data: { ...modalMadrasah.data, ruang: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Ustadz Pengampu:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ustadz Ridwan Al-Bantani, Lc."
                  value={modalMadrasah.data?.pengajar || ''}
                  onChange={(e) =>
                    setModalMadrasah({
                      ...modalMadrasah,
                      data: { ...modalMadrasah.data, pengajar: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalMadrasah({ isOpen: false, mode: 'add', data: null })}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold cursor-pointer"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RUTINITAS */}
      {modalRutinitas.isOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">
                {modalRutinitas.mode === 'add'
                  ? 'Tambah Rutinitas Harian'
                  : 'Edit Rutinitas Harian'}
              </h3>
              <button
                onClick={() => setModalRutinitas({ isOpen: false, mode: 'add', data: null })}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const d = modalRutinitas.data;
                if (!d?.kegiatan || !d?.waktuMulai) return;

                if (modalRutinitas.mode === 'add') {
                  onAddRutinitas({
                    id: `rh_${Date.now()}`,
                    waktuMulai: d.waktuMulai,
                    waktuSelesai: d.waktuSelesai || d.waktuMulai,
                    kegiatan: d.kegiatan,
                    keterangan: d.keterangan || '',
                    kategori: d.kategori || 'KBM',
                    lokasi: d.lokasi || 'Area Pesantren',
                  });
                  showFeedback('Rutinitas harian berhasil ditambahkan!');
                } else if (d.id) {
                  onUpdateRutinitas(d as RutinitasHarian);
                  showFeedback('Rutinitas harian berhasil diperbarui!');
                }
                setModalRutinitas({ isOpen: false, mode: 'add', data: null });
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-600 mb-1">
                    Waktu Mulai:
                  </label>
                  <input
                    type="time"
                    value={modalRutinitas.data?.waktuMulai || '15:00'}
                    onChange={(e) =>
                      setModalRutinitas({
                        ...modalRutinitas,
                        data: { ...modalRutinitas.data, waktuMulai: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-600 mb-1">
                    Waktu Selesai:
                  </label>
                  <input
                    type="time"
                    value={modalRutinitas.data?.waktuSelesai || '16:00'}
                    onChange={(e) =>
                      setModalRutinitas({
                        ...modalRutinitas,
                        data: { ...modalRutinitas.data, waktuSelesai: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Nama Kegiatan / Agenda:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sholat Ashar Berjamaah & Wirid"
                  value={modalRutinitas.data?.kegiatan || ''}
                  onChange={(e) =>
                    setModalRutinitas({
                      ...modalRutinitas,
                      data: { ...modalRutinitas.data, kegiatan: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Kategori:</label>
                  <select
                    value={modalRutinitas.data?.kategori || 'KBM'}
                    onChange={(e) =>
                      setModalRutinitas({
                        ...modalRutinitas,
                        data: { ...modalRutinitas.data, kategori: e.target.value as any },
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="Ibadah">Ibadah</option>
                    <option value="KBM">KBM (Pengajian)</option>
                    <option value="Istirahat">Istirahat</option>
                    <option value="Kemandirian">Kemandirian</option>
                    <option value="Olahraga">Olahraga</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Lokasi:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Masjid Jami'"
                    value={modalRutinitas.data?.lokasi || ''}
                    onChange={(e) =>
                      setModalRutinitas({
                        ...modalRutinitas,
                        data: { ...modalRutinitas.data, lokasi: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">Keterangan:</label>
                <textarea
                  rows={2}
                  placeholder="Rincian atau petunjuk pelaksanaan..."
                  value={modalRutinitas.data?.keterangan || ''}
                  onChange={(e) =>
                    setModalRutinitas({
                      ...modalRutinitas,
                      data: { ...modalRutinitas.data, keterangan: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalRutinitas({ isOpen: false, mode: 'add', data: null })}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold cursor-pointer"
                >
                  Simpan Rutinitas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PIKET */}
      {modalPiket.isOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">
                {modalPiket.mode === 'add'
                  ? 'Tambah Jadwal Piket Kebersihan'
                  : 'Edit Jadwal Piket'}
              </h3>
              <button
                onClick={() => setModalPiket({ isOpen: false, mode: 'add', data: null })}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const d = modalPiket.data;
                if (!d?.lokasi || !d?.koordinator) return;

                if (modalPiket.mode === 'add') {
                  onAddPiket({
                    id: `piket_${Date.now()}`,
                    hari: d.hari || 'Senin',
                    lokasi: d.lokasi,
                    kelompok: d.kelompok || 'Regu Santri',
                    kamar: d.kamar || 'Al-Ghazali 01',
                    koordinator: d.koordinator,
                    tugas:
                      d.tugas && d.tugas.length > 0
                        ? d.tugas
                        : ['Menyapu & mengepel area', 'Merapikan peralatan'],
                  });
                  showFeedback('Jadwal piket berhasil ditambahkan!');
                } else if (d.id) {
                  onUpdatePiket(d as PiketSantri);
                  showFeedback('Jadwal piket berhasil diperbarui!');
                }
                setModalPiket({ isOpen: false, mode: 'add', data: null });
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Hari:</label>
                  <select
                    value={modalPiket.data?.hari || 'Senin'}
                    onChange={(e) =>
                      setModalPiket({
                        ...modalPiket,
                        data: { ...modalPiket.data, hari: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    {HARI_LIST.filter((h) => h !== 'Semua Hari').map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-600 mb-1">
                    Lokasi / Zona:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Masjid Jami' & Serambi"
                    value={modalPiket.data?.lokasi || ''}
                    onChange={(e) =>
                      setModalPiket({
                        ...modalPiket,
                        data: { ...modalPiket.data, lokasi: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-600 mb-1">
                    Kelompok Piket:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Regu Al-Ghazali 1"
                    value={modalPiket.data?.kelompok || ''}
                    onChange={(e) =>
                      setModalPiket({
                        ...modalPiket,
                        data: { ...modalPiket.data, kelompok: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-600 mb-1">
                    Kamar / Rayon:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Al-Ghazali 01"
                    value={modalPiket.data?.kamar || ''}
                    onChange={(e) =>
                      setModalPiket({
                        ...modalPiket,
                        data: { ...modalPiket.data, kamar: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Koordinator Santri:
                </label>
                <input
                  type="text"
                  placeholder="Nama santri penanggung jawab piket..."
                  value={modalPiket.data?.koordinator || ''}
                  onChange={(e) =>
                    setModalPiket({
                      ...modalPiket,
                      data: { ...modalPiket.data, koordinator: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Daftar Tugas (Pisahkan per baris):
                </label>
                <textarea
                  rows={4}
                  placeholder={`Menyapu & mengepel serambi masjid\nMembersihkan kran wudhu\nMerapikan sajadah & rak Al-Qur'an`}
                  value={(modalPiket.data?.tugas || []).join('\n')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter((l) => l.trim() !== '');
                    setModalPiket({
                      ...modalPiket,
                      data: { ...modalPiket.data, tugas: lines },
                    });
                  }}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalPiket({ isOpen: false, mode: 'add', data: null })}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold cursor-pointer"
                >
                  Simpan Piket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
