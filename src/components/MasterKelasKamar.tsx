import React, { useState, useMemo } from 'react';
import {
  Layers,
  GraduationCap,
  BedDouble,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  Building,
  Users,
  ShieldAlert,
  Info,
  Database,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { MasterKelas, MasterKamar, Santri } from '../types';

interface MasterKelasKamarProps {
  masterKelasList: MasterKelas[];
  masterKamarList: MasterKamar[];
  santriList: Santri[];
  onAddKelas: (item: MasterKelas) => void;
  onUpdateKelas: (item: MasterKelas) => void;
  onDeleteKelas: (id: string) => void;
  onAddKamar: (item: MasterKamar) => void;
  onUpdateKamar: (item: MasterKamar) => void;
  onDeleteKamar: (id: string) => void;
  onRefreshFromSupabase?: () => void;
}

export const MasterKelasKamar: React.FC<MasterKelasKamarProps> = ({
  masterKelasList,
  masterKamarList,
  santriList,
  onAddKelas,
  onUpdateKelas,
  onDeleteKelas,
  onAddKamar,
  onUpdateKamar,
  onDeleteKamar,
  onRefreshFromSupabase,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'kelas' | 'kamar'>('kelas');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('all');
  const [filterRayon, setFilterRayon] = useState<string>('all');

  // Modals
  const [showKelasModal, setShowKelasModal] = useState(false);
  const [editingKelas, setEditingKelas] = useState<MasterKelas | null>(null);

  const [showKamarModal, setShowKamarModal] = useState(false);
  const [editingKamar, setEditingKamar] = useState<MasterKamar | null>(null);

  // Form states
  const [kelasForm, setKelasForm] = useState<Partial<MasterKelas>>({
    nama: '',
    tingkat: 'Tingkat MTs',
    kategori: 'Formal',
    keterangan: '',
    waliKelas: '',
  });

  const [kamarForm, setKamarForm] = useState<Partial<MasterKamar>>({
    nama: '',
    rayon: 'Rayon Putra Al-Ghazali',
    gender: 'L',
    kapasitas: 4,
    fasilitas: 'Kasur Tingkat, Lemari Santri',
    keterangan: '',
  });

  // Delete Confirmation state
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'kelas' | 'kamar';
    item: MasterKelas | MasterKamar;
    activeSantriCount: number;
    santriNames: string[];
  } | null>(null);

  // ---------------------------------------------------------------------------
  // KELAS HELPERS
  // ---------------------------------------------------------------------------
  const getSantriInKelasCount = (namaKelas: string) => {
    return santriList.filter(
      (s) => s.kelasFormal === namaKelas || s.kelasMadrasah === namaKelas
    ).length;
  };

  const filteredKelas = useMemo(() => {
    return masterKelasList.filter((k) => {
      if (filterKategori !== 'all' && k.kategori !== filterKategori) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNama = k.nama.toLowerCase().includes(q);
        const matchTingkat = k.tingkat.toLowerCase().includes(q);
        const matchKet = (k.keterangan || '').toLowerCase().includes(q);
        if (!matchNama && !matchTingkat && !matchKet) return false;
      }
      return true;
    });
  }, [masterKelasList, filterKategori, searchQuery]);

  const handleOpenAddKelas = () => {
    setEditingKelas(null);
    setKelasForm({
      nama: '',
      tingkat: 'Tingkat MTs',
      kategori: 'Formal',
      keterangan: '',
      waliKelas: '',
    });
    setShowKelasModal(true);
  };

  const handleOpenEditKelas = (item: MasterKelas) => {
    setEditingKelas(item);
    setKelasForm(item);
    setShowKelasModal(true);
  };

  const handleSubmitKelas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kelasForm.nama?.trim()) return;

    if (editingKelas) {
      onUpdateKelas({
        ...editingKelas,
        nama: kelasForm.nama.trim(),
        tingkat: kelasForm.tingkat?.trim() || 'Umum',
        kategori: kelasForm.kategori || 'Formal',
        keterangan: kelasForm.keterangan?.trim() || '',
        waliKelas: kelasForm.waliKelas?.trim() || '',
      });
    } else {
      onAddKelas({
        id: `kls_${Date.now()}`,
        nama: kelasForm.nama.trim(),
        tingkat: kelasForm.tingkat?.trim() || 'Umum',
        kategori: kelasForm.kategori || 'Formal',
        keterangan: kelasForm.keterangan?.trim() || '',
        waliKelas: kelasForm.waliKelas?.trim() || '',
        createdAt: new Date().toISOString(),
      });
    }
    setShowKelasModal(false);
    setEditingKelas(null);
  };

  const handleRequestDeleteKelas = (item: MasterKelas) => {
    const activeSantri = santriList.filter(
      (s) => s.kelasFormal === item.nama || s.kelasMadrasah === item.nama
    );
    setConfirmDelete({
      type: 'kelas',
      item,
      activeSantriCount: activeSantri.length,
      santriNames: activeSantri.slice(0, 5).map((s) => s.nama),
    });
  };

  // ---------------------------------------------------------------------------
  // KAMAR HELPERS
  // ---------------------------------------------------------------------------
  const getSantriInKamar = (namaKamar: string) => {
    return santriList.filter((s) => s.kamar === namaKamar);
  };

  const filteredKamar = useMemo(() => {
    return masterKamarList.filter((k) => {
      if (filterRayon !== 'all' && k.rayon !== filterRayon) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNama = k.nama.toLowerCase().includes(q);
        const matchRayon = k.rayon.toLowerCase().includes(q);
        const matchKet = (k.keterangan || '').toLowerCase().includes(q);
        if (!matchNama && !matchRayon && !matchKet) return false;
      }
      return true;
    });
  }, [masterKamarList, filterRayon, searchQuery]);

  const uniqueRayons = useMemo(() => {
    return Array.from(new Set(masterKamarList.map((k) => k.rayon)));
  }, [masterKamarList]);

  const handleOpenAddKamar = () => {
    setEditingKamar(null);
    setKamarForm({
      nama: '',
      rayon: 'Rayon Putra Al-Ghazali',
      gender: 'L',
      kapasitas: 4,
      fasilitas: 'Kasur Tingkat, Lemari Santri',
      keterangan: '',
    });
    setShowKamarModal(true);
  };

  const handleOpenEditKamar = (item: MasterKamar) => {
    setEditingKamar(item);
    setKamarForm(item);
    setShowKamarModal(true);
  };

  const handleSubmitKamar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kamarForm.nama?.trim()) return;

    if (editingKamar) {
      onUpdateKamar({
        ...editingKamar,
        nama: kamarForm.nama.trim(),
        rayon: kamarForm.rayon?.trim() || 'Rayon Asrama Santri',
        gender: kamarForm.gender || 'L',
        kapasitas: Number(kamarForm.kapasitas) || 4,
        fasilitas: kamarForm.fasilitas?.trim() || '',
        keterangan: kamarForm.keterangan?.trim() || '',
      });
    } else {
      onAddKamar({
        id: `kmr_${Date.now()}`,
        nama: kamarForm.nama.trim(),
        rayon: kamarForm.rayon?.trim() || 'Rayon Asrama Santri',
        gender: kamarForm.gender || 'L',
        kapasitas: Number(kamarForm.kapasitas) || 4,
        fasilitas: kamarForm.fasilitas?.trim() || '',
        keterangan: kamarForm.keterangan?.trim() || '',
        createdAt: new Date().toISOString(),
      });
    }
    setShowKamarModal(false);
    setEditingKamar(null);
  };

  const handleRequestDeleteKamar = (item: MasterKamar) => {
    const activeSantri = santriList.filter((s) => s.kamar === item.nama);
    setConfirmDelete({
      type: 'kamar',
      item,
      activeSantriCount: activeSantri.length,
      santriNames: activeSantri.slice(0, 5).map((s) => s.nama),
    });
  };

  // Stats calculation
  const totalKelasFormal = masterKelasList.filter((k) => k.kategori === 'Formal').length;
  const totalKelasDiniyah = masterKelasList.filter((k) => k.kategori === 'Diniyah').length;
  const totalKelasTahfidz = masterKelasList.filter((k) => k.kategori === 'Tahfidz').length;

  const totalKapasitasKasur = masterKamarList.reduce((acc, k) => acc + (k.kapasitas || 0), 0);
  const totalSantriMukimTerdata = santriList.filter((s) => s.statusMukim === 'Mukim').length;

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* HEADER & TOP BAR */}
      {/* ========================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100/80 text-emerald-800">
              <Layers className="w-5 h-5 text-emerald-800" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-stone-900 leading-tight">
                Manajemen Master Data Kelas &amp; Kamar
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Kelola referensi resmi daftar kelas dan kamar asrama. Tersinkronisasi dinamis ke formulir &amp; filter santri.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefreshFromSupabase && (
            <button
              onClick={onRefreshFromSupabase}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              title="Sinkronkan dengan Database Online"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-800" />
              <span>Sinkronkan Database</span>
            </button>
          )}

          {activeSubTab === 'kelas' ? (
            <button
              onClick={handleOpenAddKelas}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>+ Tambah Kelas Baru</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddKamar}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>+ Tambah Kamar Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB NAVIGATOR (KELAS vs KAMAR) */}
      {/* ========================================================= */}
      <div className="bg-white p-1.5 rounded-2xl border border-stone-200/90 shadow-2xs flex items-center gap-2 max-w-md">
        <button
          onClick={() => {
            setActiveSubTab('kelas');
            setSearchQuery('');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeSubTab === 'kelas'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Master Kelas ({masterKelasList.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('kamar');
            setSearchQuery('');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeSubTab === 'kamar'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <BedDouble className="w-4 h-4" />
          <span>Master Kamar Asrama ({masterKamarList.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: KELOLA MASTER KELAS */}
      {/* ========================================================= */}
      {activeSubTab === 'kelas' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Total Master Kelas
              </span>
              <span className="text-xl font-bold text-stone-900">{masterKelasList.length}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">
                Pendidikan Formal
              </span>
              <span className="text-xl font-bold text-blue-900">{totalKelasFormal}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                Madrasah Diniyah
              </span>
              <span className="text-xl font-bold text-emerald-900">{totalKelasDiniyah}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                Tahfidz Al-Qur&apos;an
              </span>
              <span className="text-xl font-bold text-purple-900">{totalKelasTahfidz}</span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama kelas, tingkat, atau kurikulum/keterangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500 font-semibold shrink-0">Kategori:</label>
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="text-xs font-medium px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600 cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                <option value="Formal">Formal (Sekolah)</option>
                <option value="Diniyah">Diniyah (Madrasah)</option>
                <option value="Tahfidz">Tahfidz</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          {/* Table Data Kelas */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 w-12">No</th>
                    <th className="py-3 px-4">Nama Kelas</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Tingkat / Jenjang</th>
                    <th className="py-3 px-4">Keterangan / Kurikulum</th>
                    <th className="py-3 px-4 text-center">Santri Aktif</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredKelas.map((item, idx) => {
                    const santriCount = getSantriInKelasCount(item.nama);
                    const kategoriBadge =
                      item.kategori === 'Formal'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : item.kategori === 'Diniyah'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-purple-50 text-purple-800 border-purple-200';

                    return (
                      <tr key={item.id} className="hover:bg-stone-50/80 transition group">
                        <td className="py-3 px-4 font-mono text-stone-400">{idx + 1}.</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-stone-900 group-hover:text-emerald-900 text-sm">
                            {item.nama}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${kategoriBadge}`}
                          >
                            {item.kategori}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-stone-700">{item.tingkat}</td>
                        <td className="py-3 px-4 text-stone-500 max-w-xs truncate">
                          {item.keterangan || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              santriCount > 0
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {santriCount} Santri
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditKelas(item)}
                              className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-stone-100 transition cursor-pointer"
                              title="Edit Kelas"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRequestDeleteKelas(item)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                              title="Hapus Kelas"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredKelas.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400">
                        Tidak ada kelas yang sesuai dengan filter atau kata kunci pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: KELOLA MASTER KAMAR ASRAMA */}
      {/* ========================================================= */}
      {activeSubTab === 'kamar' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Total Kamar Terdaftar
              </span>
              <span className="text-xl font-bold text-stone-900">{masterKamarList.length}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                Total Kapasitas Kasur
              </span>
              <span className="text-xl font-bold text-emerald-900">
                {totalKapasitasKasur} Kasur
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block">
                Santri Mukim Terisi
              </span>
              <span className="text-xl font-bold text-teal-900">
                {totalSantriMukimTerdata} Santri
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                Sisa Kasur Kosong
              </span>
              <span className="text-xl font-bold text-amber-900">
                {Math.max(0, totalKapasitasKasur - totalSantriMukimTerdata)} Tempat
              </span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama kamar, rayon, fasilitas, atau catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500 font-semibold shrink-0">Rayon Asrama:</label>
              <select
                value={filterRayon}
                onChange={(e) => setFilterRayon(e.target.value)}
                className="text-xs font-medium px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600 cursor-pointer"
              >
                <option value="all">Semua Rayon</option>
                {uniqueRayons.map((ry) => (
                  <option key={ry} value={ry}>
                    {ry}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Data Kamar */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 w-12">No</th>
                    <th className="py-3 px-4">Nama Kamar</th>
                    <th className="py-3 px-4">Rayon / Kompleks</th>
                    <th className="py-3 px-4">Asrama</th>
                    <th className="py-3 px-4">Fasilitas / Catatan</th>
                    <th className="py-3 px-4 text-center">Kapasitas &amp; Terisi</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredKamar.map((item, idx) => {
                    const santriInKamar = getSantriInKamar(item.nama);
                    const count = santriInKamar.length;
                    const max = item.kapasitas || 4;
                    const isFull = count >= max;

                    return (
                      <tr key={item.id} className="hover:bg-stone-50/80 transition group">
                        <td className="py-3 px-4 font-mono text-stone-400">{idx + 1}.</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-stone-900 group-hover:text-emerald-900 text-sm">
                            {item.nama}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-stone-700">{item.rayon}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.gender === 'P'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {item.gender === 'P' ? 'Putri' : 'Putra'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-500 max-w-xs truncate">
                          {item.fasilitas || item.keterangan || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                isFull
                                  ? 'bg-rose-100 text-rose-800'
                                  : count > 0
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {count} / {max} Santri {isFull ? '(Penuh)' : ''}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditKamar(item)}
                              className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-stone-100 transition cursor-pointer"
                              title="Edit Kamar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRequestDeleteKamar(item)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                              title="Hapus Kamar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredKamar.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400">
                        Tidak ada kamar asrama yang cocok dengan pencarian atau filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: FORM TAMBAH / EDIT MASTER KELAS */}
      {/* ========================================================= */}
      {showKelasModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-800" />
                <h3 className="font-bold text-base text-stone-900">
                  {editingKelas ? 'Edit Master Kelas' : 'Tambah Master Kelas Baru'}
                </h3>
              </div>
              <button
                onClick={() => setShowKelasModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitKelas} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 7 MTs, 8 MTs, 1 Ula, 2 Wustho, 10 MA..."
                  value={kelasForm.nama || ''}
                  onChange={(e) => setKelasForm({ ...kelasForm, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Kategori Kelas
                  </label>
                  <select
                    value={kelasForm.kategori || 'Formal'}
                    onChange={(e) =>
                      setKelasForm({
                        ...kelasForm,
                        kategori: e.target.value as 'Formal' | 'Diniyah' | 'Tahfidz' | 'Lainnya',
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600 cursor-pointer"
                  >
                    <option value="Formal">Formal (MTs / MA / Sekolah)</option>
                    <option value="Diniyah">Diniyah (Madrasah Salaf)</option>
                    <option value="Tahfidz">Tahfidz Al-Qur&apos;an</option>
                    <option value="Lainnya">Lainnya / Khusus</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tingkat / Jenjang
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Tingkat MTs, Diniyah Ula..."
                    value={kelasForm.tingkat || ''}
                    onChange={(e) => setKelasForm({ ...kelasForm, tingkat: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Keterangan / Kurikulum Kitab
                </label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi materi, kitab rujukan, atau keterangan kelas..."
                  value={kelasForm.keterangan || ''}
                  onChange={(e) => setKelasForm({ ...kelasForm, keterangan: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Wali Kelas / Ustadz Pembimbing (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Nama Ustadz / Guru pembimbing"
                  value={kelasForm.waliKelas || ''}
                  onChange={(e) => setKelasForm({ ...kelasForm, waliKelas: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowKelasModal(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-600 rounded-xl font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  {editingKelas ? 'Simpan Perubahan' : 'Tambahkan Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: FORM TAMBAH / EDIT MASTER KAMAR ASRAMA */}
      {/* ========================================================= */}
      {showKamarModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-emerald-800" />
                <h3 className="font-bold text-base text-stone-900">
                  {editingKamar ? 'Edit Master Kamar Asrama' : 'Tambah Kamar Asrama Baru'}
                </h3>
              </div>
              <button
                onClick={() => setShowKamarModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitKamar} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Kamar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Abu Bakar 01, Umar 02, Khadijah 01..."
                  value={kamarForm.nama || ''}
                  onChange={(e) => setKamarForm({ ...kamarForm, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Rayon / Kompleks
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rayon Putra Abu Bakar..."
                    value={kamarForm.rayon || ''}
                    onChange={(e) => setKamarForm({ ...kamarForm, rayon: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Jenis Asrama
                  </label>
                  <select
                    value={kamarForm.gender || 'L'}
                    onChange={(e) =>
                      setKamarForm({
                        ...kamarForm,
                        gender: e.target.value as 'L' | 'P',
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600 cursor-pointer"
                  >
                    <option value="L">Putra (Santri Laki-laki)</option>
                    <option value="P">Putri (Santriwati)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Kapasitas Kasur Santri (Maksimal)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={kamarForm.kapasitas ?? 4}
                  onChange={(e) =>
                    setKamarForm({
                      ...kamarForm,
                      kapasitas: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Fasilitas Kamar
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kasur Tingkat, Lemari Santri, Kipas Angin..."
                  value={kamarForm.fasilitas || ''}
                  onChange={(e) => setKamarForm({ ...kamarForm, fasilitas: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Keterangan / Lokasi Gedung
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Lantai 2 Gedung Asrama Baru"
                  value={kamarForm.keterangan || ''}
                  onChange={(e) => setKamarForm({ ...kamarForm, keterangan: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowKamarModal(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-600 rounded-xl font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  {editingKamar ? 'Simpan Perubahan' : 'Tambahkan Kamar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: PERINGATAN VALIDASI HAPUS (DELETE CONFIRMATION) */}
      {/* ========================================================= */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 animate-in fade-in text-xs">
            <div className="flex items-center gap-3 pb-3 mb-3 border-b border-rose-100">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-stone-900">
                  Konfirmasi Hapus Master {confirmDelete.type === 'kelas' ? 'Kelas' : 'Kamar'}
                </h3>
                <p className="text-[11px] text-stone-500">
                  Periksa keterkaitan data santri aktif sebelum menghapus
                </p>
              </div>
            </div>

            <p className="text-stone-700 leading-relaxed mb-3">
              Apakah Anda yakin ingin menghapus data{' '}
              <strong>
                {confirmDelete.type === 'kelas' ? 'Kelas' : 'Kamar'}: &quot;
                {confirmDelete.item.nama}&quot;
              </strong>
              ?
            </p>

            {confirmDelete.activeSantriCount > 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 space-y-1.5 text-amber-900">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Peringatan: Terdapat Santri Aktif!</span>
                </div>
                <p className="text-[11px]">
                  Saat ini masih terdapat <strong>{confirmDelete.activeSantriCount} santri aktif</strong>{' '}
                  yang terdaftar di {confirmDelete.type === 'kelas' ? 'kelas' : 'kamar'} ini:
                </p>
                <ul className="list-disc list-inside text-[11px] text-amber-800 font-medium pl-1">
                  {confirmDelete.santriNames.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                  {confirmDelete.activeSantriCount > 5 && (
                    <li>...dan {confirmDelete.activeSantriCount - 5} santri lainnya</li>
                  )}
                </ul>
                <p className="text-[10px] text-amber-700 italic pt-1">
                  Disarankan untuk memindahkan santri terlebih dahulu ke {confirmDelete.type === 'kelas' ? 'kelas' : 'kamar'} lain.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 flex items-center gap-2 text-emerald-800 text-[11px]">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Tidak ada santri aktif yang terhubung. Data aman untuk dihapus.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-stone-300 text-stone-600 rounded-xl font-semibold hover:bg-stone-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (confirmDelete.type === 'kelas') {
                    onDeleteKelas(confirmDelete.item.id);
                  } else {
                    onDeleteKamar(confirmDelete.item.id);
                  }
                  setConfirmDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
              >
                Ya, Tetap Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
