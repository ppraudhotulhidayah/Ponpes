import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  Phone,
  Home,
  ShieldAlert,
  FileText,
  Printer,
  BedDouble,
  GraduationCap,
  Filter,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Building,
  UserCheck,
  ChevronRight,
  Layers,
} from 'lucide-react';
import {
  Santri,
  UserRole,
  SuratIzinPulang,
  PelanggaranTakzir,
  PesantrenSettings,
  MasterKelas,
  MasterKamar,
} from '../types';

interface SantriProps {
  santriList: Santri[];
  onAddSantri: (santri: Santri) => void;
  onUpdateSantri: (santri: Santri) => void;
  onDeleteSantri: (id: string) => void;
  userRole: UserRole;
  suratIzinList: SuratIzinPulang[];
  pelanggaranList: PelanggaranTakzir[];
  settings?: PesantrenSettings;
  masterKelasList?: MasterKelas[];
  masterKamarList?: MasterKamar[];
  onNavigateToMaster?: () => void;
}

// Preset standard classes & rooms
const PRESET_KELAS_FORMAL = [
  'MTs Kelas 7',
  'MTs Kelas 8',
  'MTs Kelas 9',
  'MA Kelas 10',
  'MA Kelas 11',
  'MA Kelas 12',
  'SMP Kelas 7',
  'SMP Kelas 8',
  'SMP Kelas 9',
  'SMA Kelas 10',
  'SMA Kelas 11',
  'SMA Kelas 12',
  'Tahfidz Khusus',
  "Ma'had Aly",
  'Salafiyah / Khusus Kitab',
];

const PRESET_KELAS_DINIYAH = [
  'Ula A',
  'Ula B',
  'Wustha A',
  'Wustha B',
  'Ulya',
  'Ulya A',
  'Ulya B',
  "I'dadi (Persiapan)",
  "Tahfidz Al-Qur'an",
  'Takhassus Fiqih',
];

const PRESET_KAMAR = [
  { kamar: 'Al-Ghazali 01', rayon: 'Rayon Putra Al-Ghazali' },
  { kamar: 'Al-Ghazali 02', rayon: 'Rayon Putra Al-Ghazali' },
  { kamar: 'Al-Ghazali 03', rayon: 'Rayon Putra Al-Ghazali' },
  { kamar: 'Al-Ghazali 04', rayon: 'Rayon Putra Al-Ghazali' },
  { kamar: 'Al-Ghazali 05', rayon: 'Rayon Putra Al-Ghazali' },
  { kamar: 'Ibnu Sina 01', rayon: 'Rayon Putra Ibnu Sina' },
  { kamar: 'Ibnu Sina 02', rayon: 'Rayon Putra Ibnu Sina' },
  { kamar: 'Ibnu Sina 03', rayon: 'Rayon Putra Ibnu Sina' },
  { kamar: 'Ibnu Sina 04', rayon: 'Rayon Putra Ibnu Sina' },
  { kamar: 'Ibnu Sina 05', rayon: 'Rayon Putra Ibnu Sina' },
  { kamar: 'Al-Fatih 01', rayon: 'Rayon Putra Al-Fatih' },
  { kamar: 'Al-Fatih 02', rayon: 'Rayon Putra Al-Fatih' },
  { kamar: 'Al-Fatih 03', rayon: 'Rayon Putra Al-Fatih' },
  { kamar: 'Al-Fatih 04', rayon: 'Rayon Putra Al-Fatih' },
  { kamar: "Imam Syafi'i 01", rayon: "Rayon Putra Imam Syafi'i" },
  { kamar: "Imam Syafi'i 02", rayon: "Rayon Putra Imam Syafi'i" },
  { kamar: "Imam Syafi'i 03", rayon: "Rayon Putra Imam Syafi'i" },
  { kamar: 'Abu Bakar 01', rayon: 'Rayon Putra Abu Bakar' },
  { kamar: 'Abu Bakar 02', rayon: 'Rayon Putra Abu Bakar' },
  { kamar: 'Khadijah 01', rayon: 'Rayon Putri Khadijah' },
  { kamar: 'Khadijah 02', rayon: 'Rayon Putri Khadijah' },
  { kamar: 'Khadijah 03', rayon: 'Rayon Putri Khadijah' },
  { kamar: 'Aisyah 01', rayon: 'Rayon Putri Aisyah' },
  { kamar: 'Aisyah 02', rayon: 'Rayon Putri Aisyah' },
  { kamar: 'Aisyah 03', rayon: 'Rayon Putri Aisyah' },
  { kamar: 'Fatimah 01', rayon: 'Rayon Putri Fatimah' },
  { kamar: 'Fatimah 02', rayon: 'Rayon Putri Fatimah' },
];

const PRESET_RAYON = [
  'Rayon Putra Al-Ghazali',
  'Rayon Putra Ibnu Sina',
  'Rayon Putra Al-Fatih',
  "Rayon Putra Imam Syafi'i",
  'Rayon Putra Abu Bakar',
  'Rayon Putri Khadijah',
  'Rayon Putri Aisyah',
  'Rayon Putri Fatimah',
  'Rayon Mandiri / Khusus',
];

// Helper to deduce rayon from kamar string
const autoDetectRayon = (kamarName: string): string => {
  const lower = kamarName.toLowerCase();
  if (lower.includes('ghazali')) return 'Rayon Putra Al-Ghazali';
  if (lower.includes('sina')) return 'Rayon Putra Ibnu Sina';
  if (lower.includes('fatih')) return 'Rayon Putra Al-Fatih';
  if (lower.includes('syafi')) return "Rayon Putra Imam Syafi'i";
  if (lower.includes('bakar')) return 'Rayon Putra Abu Bakar';
  if (lower.includes('khadijah')) return 'Rayon Putri Khadijah';
  if (lower.includes('aisyah')) return 'Rayon Putri Aisyah';
  if (lower.includes('fatimah')) return 'Rayon Putri Fatimah';
  return 'Rayon Asrama Santri';
};

export const SantriComponent: React.FC<SantriProps> = ({
  santriList,
  onAddSantri,
  onUpdateSantri,
  onDeleteSantri,
  userRole,
  suratIzinList,
  pelanggaranList,
  settings,
  masterKelasList,
  masterKamarList,
  onNavigateToMaster,
}) => {
  // View mode: Grid or Table
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters
  const [filterRayon, setFilterRayon] = useState('all');
  const [filterKamar, setFilterKamar] = useState('all');
  const [filterKelasFormal, setFilterKelasFormal] = useState('all');
  const [filterKelasDiniyah, setFilterKelasDiniyah] = useState('all');
  const [filterStatusMukim, setFilterStatusMukim] = useState('all');
  const [filterGender, setFilterGender] = useState<'all' | 'L' | 'P'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<Santri | null>(null);
  const [showDistribusiModal, setShowDistribusiModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Form Custom Toggles (allows typing new class / room directly)
  const [customKelasFormal, setCustomKelasFormal] = useState(false);
  const [customKelasDiniyah, setCustomKelasDiniyah] = useState(false);
  const [customKamar, setCustomKamar] = useState(false);
  const [customRayon, setCustomRayon] = useState(false);

  // Helper to deduce rayon from kamar with master list priority
  const resolveRayon = (kamarName: string): string => {
    if (masterKamarList) {
      const match = masterKamarList.find(
        (k) => k.nama.toLowerCase() === kamarName.toLowerCase()
      );
      if (match) return match.rayon;
    }
    return autoDetectRayon(kamarName);
  };

  // Form State
  const [formData, setFormData] = useState<Partial<Santri>>({
    nama: '',
    nis: '',
    gender: 'L',
    kamar: 'Al-Ghazali 01',
    rayon: 'Rayon Putra Al-Ghazali',
    kelasMadrasah: 'Wustha A',
    kelasFormal: 'MTs Kelas 8',
    namaWali: '',
    teleponWali: '',
    alamat: '',
    statusMukim: 'Mukim',
    poinPelanggaran: 0,
  });

  // Dynamic lists from Master Data + mock + presets
  const allFormalClasses = useMemo(() => {
    const fromMaster =
      masterKelasList?.filter((k) => k.kategori === 'Formal').map((k) => k.nama) || [];
    const fromData = santriList.map((s) => s.kelasFormal).filter(Boolean);
    return Array.from(new Set([...fromMaster, ...PRESET_KELAS_FORMAL, ...fromData]));
  }, [santriList, masterKelasList]);

  const allDiniyahClasses = useMemo(() => {
    const fromMaster =
      masterKelasList
        ?.filter((k) => k.kategori === 'Diniyah' || k.kategori === 'Tahfidz')
        .map((k) => k.nama) || [];
    const fromData = santriList.map((s) => s.kelasMadrasah).filter(Boolean);
    return Array.from(new Set([...fromMaster, ...PRESET_KELAS_DINIYAH, ...fromData]));
  }, [santriList, masterKelasList]);

  const allRooms = useMemo(() => {
    const fromMaster = masterKamarList?.map((k) => k.nama) || [];
    const fromData = santriList.map((s) => s.kamar).filter(Boolean);
    const presetKamarNames = PRESET_KAMAR.map((p) => p.kamar);
    return Array.from(new Set([...fromMaster, ...presetKamarNames, ...fromData]));
  }, [santriList, masterKamarList]);

  const allRayons = useMemo(() => {
    const fromMaster = masterKamarList?.map((k) => k.rayon) || [];
    const fromData = santriList.map((s) => s.rayon).filter(Boolean);
    return Array.from(new Set([...fromMaster, ...PRESET_RAYON, ...fromData]));
  }, [santriList, masterKamarList]);

  // Handle open Add
  const handleOpenAdd = () => {
    setEditingSantri(null);
    setCustomKelasFormal(false);
    setCustomKelasDiniyah(false);
    setCustomKamar(false);
    setCustomRayon(false);
    setFormData({
      nama: '',
      nis: `RH-2024-${String(santriList.length + 1).padStart(3, '0')}`,
      gender: 'L',
      kamar: 'Al-Ghazali 01',
      rayon: 'Rayon Putra Al-Ghazali',
      kelasMadrasah: 'Wustha A',
      kelasFormal: 'MTs Kelas 8',
      namaWali: '',
      teleponWali: '',
      alamat: '',
      statusMukim: 'Mukim',
      poinPelanggaran: 0,
    });
    setShowAddModal(true);
  };

  // Handle open Edit
  const handleOpenEdit = (s: Santri) => {
    setEditingSantri(s);
    setCustomKelasFormal(!PRESET_KELAS_FORMAL.includes(s.kelasFormal));
    setCustomKelasDiniyah(!PRESET_KELAS_DINIYAH.includes(s.kelasMadrasah));
    const isStandardRoom = PRESET_KAMAR.some((p) => p.kamar === s.kamar);
    setCustomKamar(!isStandardRoom);
    setCustomRayon(!PRESET_RAYON.includes(s.rayon));
    setFormData({ ...s });
  };

  // Filter logic
  const filteredSantri = useMemo(() => {
    return santriList.filter((s) => {
      if (filterRayon !== 'all' && s.rayon !== filterRayon && !s.kamar.includes(filterRayon)) {
        return false;
      }
      if (filterKamar !== 'all' && s.kamar !== filterKamar) return false;
      if (filterKelasFormal !== 'all' && s.kelasFormal !== filterKelasFormal) return false;
      if (filterKelasDiniyah !== 'all' && s.kelasMadrasah !== filterKelasDiniyah) return false;
      if (filterStatusMukim !== 'all' && s.statusMukim !== filterStatusMukim) return false;
      if (filterGender !== 'all' && s.gender !== filterGender) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = s.nama.toLowerCase().includes(q);
        const matchNis = s.nis.toLowerCase().includes(q);
        const matchKamar = s.kamar.toLowerCase().includes(q);
        const matchRayon = s.rayon.toLowerCase().includes(q);
        const matchFormal = s.kelasFormal.toLowerCase().includes(q);
        const matchMadrasah = s.kelasMadrasah.toLowerCase().includes(q);
        const matchWali = s.namaWali.toLowerCase().includes(q);
        if (
          !matchName &&
          !matchNis &&
          !matchKamar &&
          !matchRayon &&
          !matchFormal &&
          !matchMadrasah &&
          !matchWali
        ) {
          return false;
        }
      }
      return true;
    });
  }, [
    santriList,
    filterRayon,
    filterKamar,
    filterKelasFormal,
    filterKelasDiniyah,
    filterStatusMukim,
    filterGender,
    searchQuery,
  ]);

  // Statistics calculation
  const totalSantri = santriList.length;
  const totalMukim = santriList.filter((s) => s.statusMukim === 'Mukim').length;
  const totalIzinPulang = santriList.filter((s) => s.statusMukim === 'Izin Pulang').length;
  const totalTerlambat = santriList.filter((s) => s.statusMukim === 'Terlambat Kembali').length;
  const totalPutra = santriList.filter((s) => s.gender === 'L').length;
  const totalPutri = santriList.filter((s) => s.gender === 'P').length;

  // Distribution calculations
  const sebaranKamar = useMemo(() => {
    const map: Record<string, { total: number; mukim: number; rayon: string }> = {};
    santriList.forEach((s) => {
      if (!map[s.kamar]) {
        map[s.kamar] = { total: 0, mukim: 0, rayon: s.rayon };
      }
      map[s.kamar].total += 1;
      if (s.statusMukim === 'Mukim') map[s.kamar].mukim += 1;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [santriList]);

  const sebaranKelasFormal = useMemo(() => {
    const map: Record<string, number> = {};
    santriList.forEach((s) => {
      map[s.kelasFormal] = (map[s.kelasFormal] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [santriList]);

  const sebaranKelasDiniyah = useMemo(() => {
    const map: Record<string, number> = {};
    santriList.forEach((s) => {
      map[s.kelasMadrasah] = (map[s.kelasMadrasah] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [santriList]);

  const hasActiveFilters =
    filterRayon !== 'all' ||
    filterKamar !== 'all' ||
    filterKelasFormal !== 'all' ||
    filterKelasDiniyah !== 'all' ||
    filterStatusMukim !== 'all' ||
    filterGender !== 'all' ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setFilterRayon('all');
    setFilterKamar('all');
    setFilterKelasFormal('all');
    setFilterKelasDiniyah('all');
    setFilterStatusMukim('all');
    setFilterGender('all');
    setSearchQuery('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* TOP HEADER & ACTION BAR (NO-PRINT) */}
      {/* ========================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100/70 text-emerald-800">
              <Users className="w-5 h-5 text-emerald-800" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-stone-900 leading-tight">
                Direktori &amp; Manajemen Data Santri
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Pengelolaan fleksibel data santri mukim, penempatan kamar &amp; rayon, kelas formal &amp; madrasah diniyah
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userRole === 'admin' && onNavigateToMaster && (
            <button
              onClick={onNavigateToMaster}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              title="Kelola Master Data Kelas & Kamar"
            >
              <Layers className="w-4 h-4 text-emerald-800" />
              <span>Kelola Master Kelas &amp; Kamar</span>
            </button>
          )}

          <button
            onClick={() => setShowDistribusiModal(true)}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Kapasitas Kamar &amp; Kelas</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            title="Cetak Data Santri"
          >
            <Printer className="w-4 h-4 text-emerald-800" />
            <span>Cetak / Ekspor</span>
          </button>

          {userRole === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Tambah Santri Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUMMARY STATS CARDS (NO-PRINT) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 no-print">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Total Santri
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-stone-900">{totalSantri}</span>
              <span className="text-[11px] text-stone-500">
                ({totalPutra} Pa / {totalPutri} Pi)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Santri Mukim
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-teal-900">{totalMukim}</span>
              <span className="text-[11px] font-semibold text-teal-700">
                {totalSantri > 0 ? Math.round((totalMukim / totalSantri) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Izin Pulang
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-amber-900">{totalIzinPulang}</span>
              {totalTerlambat > 0 && (
                <span className="text-[11px] font-bold text-rose-600">
                  +{totalTerlambat} terlambat
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
            <BedDouble className="w-5 h-5 text-stone-700" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Kamar Terisi
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-stone-900">{sebaranKamar.length}</span>
              <span className="text-[11px] text-stone-500">Kamar Asrama</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FILTER & PENCARIAN (NO-PRINT) */}
      {/* ========================================================= */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-3.5 no-print">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-800" />
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Filter &amp; Pencarian Fleksibel
            </span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Filter Aktif
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}

            {/* Toggle View Mode */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Tampilan Kartu (Grid)"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline">Kartu</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Tampilan Tabel (List)"
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden md:inline">Tabel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Input Pencarian */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama santri, NIS, kamar, rayon, kelas, atau nama wali..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Baris Filter Dropdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* Filter Kelas Formal */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Kelas Formal:
            </label>
            <select
              value={filterKelasFormal}
              onChange={(e) => setFilterKelasFormal(e.target.value)}
              className="w-full text-xs font-medium px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600 cursor-pointer"
            >
              <option value="all">Semua Kelas Formal</option>
              {allFormalClasses.map((kf) => (
                <option key={kf} value={kf}>
                  {kf}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kelas Diniyah */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Kelas Diniyah:
            </label>
            <select
              value={filterKelasDiniyah}
              onChange={(e) => setFilterKelasDiniyah(e.target.value)}
              className="w-full text-xs font-medium px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600 cursor-pointer"
            >
              <option value="all">Semua Kelas Diniyah</option>
              {allDiniyahClasses.map((kd) => (
                <option key={kd} value={kd}>
                  {kd}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kamar */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Kamar Asrama:
            </label>
            <select
              value={filterKamar}
              onChange={(e) => setFilterKamar(e.target.value)}
              className="w-full text-xs font-medium px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600 cursor-pointer"
            >
              <option value="all">Semua Kamar</option>
              {allRooms.map((km) => (
                <option key={km} value={km}>
                  {km}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Rayon */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Rayon Asrama:
            </label>
            <select
              value={filterRayon}
              onChange={(e) => setFilterRayon(e.target.value)}
              className="w-full text-xs font-medium px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600 cursor-pointer"
            >
              <option value="all">Semua Rayon</option>
              {allRayons.map((ry) => (
                <option key={ry} value={ry}>
                  {ry}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status Mukim */}
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Status Santri:
            </label>
            <select
              value={filterStatusMukim}
              onChange={(e) => setFilterStatusMukim(e.target.value)}
              className="w-full text-xs font-medium px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="Mukim">Mukim</option>
              <option value="Izin Pulang">Izin Pulang</option>
              <option value="Terlambat Kembali">Terlambat Kembali</option>
            </select>
          </div>
        </div>

        {/* Counter keterangan */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
          <span>
            Menampilkan <strong>{filteredSantri.length}</strong> dari total <strong>{totalSantri}</strong> santri mukim
          </span>
          {filteredSantri.length === 0 && (
            <span className="text-rose-600 font-semibold">
              Tidak ada data yang cocok dengan kriteria pencarian / filter.
            </span>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAMPILAN KARTU (GRID VIEW) - NO-PRINT */}
      {/* ========================================================= */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 no-print">
          {filteredSantri.map((santri) => {
            const statusClass =
              santri.statusMukim === 'Mukim'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : santri.statusMukim === 'Izin Pulang'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300';

            return (
              <div
                key={santri.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5 hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                        {santri.nama.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-stone-900 leading-tight truncate">
                          {santri.nama}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-mono text-stone-400">
                            {santri.nis}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded font-semibold">
                            {santri.gender === 'L' ? 'Putra' : 'Putri'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusClass}`}
                    >
                      {santri.statusMukim}
                    </span>
                  </div>

                  {/* Badges Kelas & Kamar Fleksibel */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 bg-stone-50 rounded-xl border border-stone-100">
                      <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                        <BedDouble className="w-3 h-3 text-emerald-700" />
                        <span>Kamar</span>
                      </span>
                      <p className="font-semibold text-stone-900 text-xs mt-0.5 truncate">
                        {santri.kamar}
                      </p>
                    </div>

                    <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-100">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-emerald-700" />
                        <span>Diniyah</span>
                      </span>
                      <p className="font-semibold text-emerald-950 text-xs mt-0.5 truncate">
                        {santri.kelasMadrasah}
                      </p>
                    </div>
                  </div>

                  {/* List Spesifik */}
                  <div className="space-y-1.5 text-xs text-stone-600">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Pendidikan Formal:</span>
                      <span className="font-medium text-stone-800 text-right truncate max-w-[170px]">
                        {santri.kelasFormal}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Rayon Asrama:</span>
                      <span className="text-stone-700 text-right truncate max-w-[170px]">
                        {santri.rayon}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Wali Santri:</span>
                      <span className="text-stone-800 font-medium text-right truncate max-w-[170px]">
                        {santri.namaWali}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Poin Pelanggaran:</span>
                      <span
                        className={`font-bold ${
                          santri.poinPelanggaran > 0 ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {santri.poinPelanggaran} Poin
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedDetail(santri)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Detail Biodata</span>
                  </button>

                  {userRole === 'admin' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(santri)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-stone-100 transition cursor-pointer"
                        title="Edit Data Santri"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Apakah Anda yakin ingin menghapus data santri "${santri.nama}" (NIS: ${santri.nis})?`
                            )
                          ) {
                            onDeleteSantri(santri.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus Data Santri"
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
      )}

      {/* ========================================================= */}
      {/* TAMPILAN TABEL RINGKAS (TABLE VIEW) - NO-PRINT */}
      {/* ========================================================= */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden no-print">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">No &amp; Santri</th>
                  <th className="py-3 px-3">NIS</th>
                  <th className="py-3 px-3">L/P</th>
                  <th className="py-3 px-3">Kamar &amp; Rayon</th>
                  <th className="py-3 px-3">Kelas Diniyah</th>
                  <th className="py-3 px-3">Kelas Formal</th>
                  <th className="py-3 px-3">Wali &amp; Kontak</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Poin</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSantri.map((santri, index) => {
                  const statusClass =
                    santri.statusMukim === 'Mukim'
                      ? 'bg-emerald-100 text-emerald-800'
                      : santri.statusMukim === 'Izin Pulang'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800';

                  return (
                    <tr
                      key={santri.id}
                      className="hover:bg-stone-50/80 transition group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-stone-400 font-mono text-[11px] w-5">
                            {index + 1}.
                          </span>
                          <div className="w-7 h-7 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
                            {santri.nama.charAt(0)}
                          </div>
                          <span className="font-bold text-stone-900 group-hover:text-emerald-900">
                            {santri.nama}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-stone-500 text-[11px]">
                        {santri.nis}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700">
                          {santri.gender}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-stone-900">{santri.kamar}</div>
                        <div className="text-[10px] text-stone-400">{santri.rayon}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-semibold text-[11px]">
                          {santri.kelasMadrasah}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-stone-700">
                        {santri.kelasFormal}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-stone-800">{santri.namaWali}</div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          {santri.teleponWali || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClass}`}
                        >
                          {santri.statusMukim}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-bold ${
                            santri.poinPelanggaran > 0 ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {santri.poinPelanggaran}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedDetail(santri)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-stone-100 cursor-pointer"
                            title="Detail Biodata"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {userRole === 'admin' && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(santri)}
                                className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-stone-100 cursor-pointer"
                                title="Edit Santri"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Apakah Anda yakin ingin menghapus data santri "${santri.nama}"?`
                                    )
                                  ) {
                                    onDeleteSantri(santri.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                                title="Hapus Santri"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: DISTRIBUSI KAPASITAS KAMAR & KELAS (NO-PRINT) */}
      {/* ========================================================= */}
      {showDistribusiModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-800" />
                <h3 className="font-bold text-base text-stone-900">
                  Distribusi Santri Berdasarkan Kamar &amp; Kelas
                </h3>
              </div>
              <button
                onClick={() => setShowDistribusiModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500 mb-4">
              Klik pada tag kamar atau kelas untuk langsung memfilter daftar santri di bawah.
            </p>

            <div className="space-y-5">
              {/* Sebaran Kamar */}
              <div>
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-emerald-700" />
                  <span>Sebaran Santri per Kamar Asrama ({sebaranKamar.length} Kamar Terisi)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {sebaranKamar.map(([kamar, data]) => (
                    <button
                      key={kamar}
                      onClick={() => {
                        setFilterKamar(kamar);
                        setShowDistribusiModal(false);
                      }}
                      className="p-2.5 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 rounded-xl text-left transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-xs text-stone-900 truncate">{kamar}</div>
                        <div className="text-[10px] text-stone-400 truncate">{data.rayon}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px] shrink-0">
                        {data.total}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sebaran Kelas Formal */}
              <div>
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-700" />
                  <span>Sebaran Santri per Kelas Formal</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {sebaranKelasFormal.map(([kelas, count]) => (
                    <button
                      key={kelas}
                      onClick={() => {
                        setFilterKelasFormal(kelas);
                        setShowDistribusiModal(false);
                      }}
                      className="p-2.5 bg-stone-50 hover:bg-blue-50 hover:border-blue-300 border border-stone-200 rounded-xl text-left transition cursor-pointer flex items-center justify-between"
                    >
                      <span className="font-semibold text-xs text-stone-800 truncate">{kelas}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[11px]">
                        {count} santri
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sebaran Kelas Diniyah */}
              <div>
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-700" />
                  <span>Sebaran Santri per Kelas Diniyah / Madrasah</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {sebaranKelasDiniyah.map(([kelas, count]) => (
                    <button
                      key={kelas}
                      onClick={() => {
                        setFilterKelasDiniyah(kelas);
                        setShowDistribusiModal(false);
                      }}
                      className="p-2.5 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 rounded-xl text-left transition cursor-pointer flex items-center justify-between"
                    >
                      <span className="font-semibold text-xs text-stone-800 truncate">{kelas}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                        {count} santri
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setShowDistribusiModal(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DETAIL SANTRI & BIODATA (NO-PRINT) */}
      {/* ========================================================= */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-800" />
                <span>Biodata &amp; Rekam Jejak Santri</span>
              </h3>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Header Santri */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-800 text-amber-300 font-bold text-xl flex items-center justify-center shadow-xs shrink-0">
                  {selectedDetail.nama.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-900">
                    {selectedDetail.nama}
                  </h4>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">
                    NIS: {selectedDetail.nis} • {selectedDetail.gender === 'L' ? 'Putra' : 'Putri'}
                  </p>
                  <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                    {selectedDetail.kamar} • Kelas Diniyah {selectedDetail.kelasMadrasah}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Status Keberadaan
                  </span>
                  <span className="font-bold text-stone-800 text-sm">
                    {selectedDetail.statusMukim}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block text-right">
                    Poin Takzir
                  </span>
                  <span
                    className={`font-bold text-sm text-right block ${
                      selectedDetail.poinPelanggaran > 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {selectedDetail.poinPelanggaran} Poin
                  </span>
                </div>
              </div>

              {/* Grid Info Penempatan & Akademik */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Kamar Asrama
                  </span>
                  <p className="font-semibold text-stone-900 mt-0.5">
                    {selectedDetail.kamar}
                  </p>
                  <span className="text-[10px] text-stone-400">
                    {selectedDetail.rayon}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Pendidikan Formal
                  </span>
                  <p className="font-semibold text-stone-900 mt-0.5">
                    {selectedDetail.kelasFormal}
                  </p>
                  <span className="text-[10px] text-stone-400">
                    Diniyah: {selectedDetail.kelasMadrasah}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Nama Wali Santri
                  </span>
                  <p className="font-semibold text-stone-900 mt-0.5">
                    {selectedDetail.namaWali || '-'}
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Nomor WhatsApp Wali
                  </span>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="font-semibold text-stone-900 font-mono">
                      {selectedDetail.teleponWali || '-'}
                    </p>
                    {selectedDetail.teleponWali && (
                      <a
                        href={`https://wa.me/${selectedDetail.teleponWali.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:text-emerald-900 p-1"
                        title="Chat WhatsApp Wali"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Alamat */}
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Alamat Asal Santri
                </span>
                <p className="font-medium text-stone-800 mt-0.5">
                  {selectedDetail.alamat || 'Belum diisi'}
                </p>
              </div>

              {/* Riwayat Surat Izin Pulang */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                  Riwayat Izin Pulang Terakhir:
                </span>
                {suratIzinList.filter((s) => s.santriId === selectedDetail.id).length > 0 ? (
                  <div className="space-y-1.5">
                    {suratIzinList
                      .filter((s) => s.santriId === selectedDetail.id)
                      .slice(0, 3)
                      .map((s) => (
                        <div
                          key={s.id}
                          className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-stone-800">
                              {s.alasanPulang}
                            </span>
                            <div className="text-[10px] text-stone-400">
                              {s.tanggalPergi} s/d {s.tanggalKembali}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              s.statusKepulangan === 'Sudah Kembali'
                                ? 'bg-emerald-100 text-emerald-800'
                                : s.statusKepulangan === 'Sedang Di Luar'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {s.statusKepulangan}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-stone-400 italic text-[11px]">
                    Belum pernah mengajukan izin pulang.
                  </p>
                )}
              </div>

              {/* Riwayat Pelanggaran */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                  Catatan Pelanggaran &amp; Takzir:
                </span>
                {pelanggaranList.filter((p) => p.santriId === selectedDetail.id).length > 0 ? (
                  <div className="space-y-1.5">
                    {pelanggaranList
                      .filter((p) => p.santriId === selectedDetail.id)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="p-2.5 bg-rose-50/50 rounded-xl border border-rose-200 text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-rose-950">{p.kategori}</span>
                            <div className="text-[11px] text-stone-600">{p.keterangan}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-rose-600">+{p.poin} Poin</span>
                            <div className="text-[10px] text-stone-500">{p.statusTakzir}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-emerald-700 italic text-[11px]">
                    Alhamdulillah, belum ada catatan pelanggaran.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
              {userRole === 'admin' ? (
                <button
                  onClick={() => {
                    handleOpenEdit(selectedDetail);
                    setSelectedDetail(null);
                  }}
                  className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Santri Ini</span>
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: INPUT / EDIT DATA SANTRI FLEKSIBEL (NO-PRINT) */}
      {/* ========================================================= */}
      {(showAddModal || editingSantri) && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Users className="w-4 h-4 text-emerald-800" />
                </span>
                <h3 className="font-bold text-base text-stone-900">
                  {editingSantri ? 'Edit Data Santri' : 'Tambah Santri Baru'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingSantri(null);
                }}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!formData.nama || !formData.nis) return;

                const finalKamar = formData.kamar?.trim() || 'Al-Ghazali 01';
                const finalRayon = formData.rayon?.trim() || resolveRayon(finalKamar);
                const finalKelasFormal = formData.kelasFormal?.trim() || 'MTs Kelas 8';
                const finalKelasMadrasah = formData.kelasMadrasah?.trim() || 'Wustha A';

                if (editingSantri) {
                  onUpdateSantri({
                    ...editingSantri,
                    ...formData,
                    nama: formData.nama.trim(),
                    nis: formData.nis.trim(),
                    gender: formData.gender || 'L',
                    kamar: finalKamar,
                    rayon: finalRayon,
                    kelasFormal: finalKelasFormal,
                    kelasMadrasah: finalKelasMadrasah,
                  } as Santri);
                  setEditingSantri(null);
                } else {
                  onAddSantri({
                    id: `santri_${Date.now()}`,
                    nama: formData.nama.trim(),
                    nis: formData.nis.trim(),
                    gender: formData.gender || 'L',
                    kamar: finalKamar,
                    rayon: finalRayon,
                    kelasMadrasah: finalKelasMadrasah,
                    kelasFormal: finalKelasFormal,
                    namaWali: formData.namaWali?.trim() || '',
                    teleponWali: formData.teleponWali?.trim() || '',
                    alamat: formData.alamat?.trim() || '',
                    statusMukim: formData.statusMukim || 'Mukim',
                    poinPelanggaran: 0,
                  });
                  setShowAddModal(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              {/* Nama Lengkap & NIS */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Lengkap Santri <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Muhammad Rayhan Al-Fatih"
                  value={formData.nama || ''}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nomor Induk Santri (NIS) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nis || ''}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:bg-white focus:outline-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.gender || 'L'}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600 cursor-pointer"
                  >
                    <option value="L">Laki-laki (Putra)</option>
                    <option value="P">Perempuan (Putri)</option>
                  </select>
                </div>
              </div>

              {/* SEKSI KAMAR & ASRAMA FLEKSIBEL */}
              <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-emerald-800" />
                    <span>Penempatan Kamar &amp; Rayon Asrama</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomKamar(!customKamar)}
                    className="text-[11px] font-semibold text-emerald-800 hover:underline cursor-pointer"
                  >
                    {customKamar ? '← Pilih dari Daftar Preset' : '+ Ketik Kamar Kustom'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Kamar Asrama:
                    </label>
                    {customKamar ? (
                      <input
                        type="text"
                        placeholder="Ketik nama/nomor kamar baru..."
                        value={formData.kamar || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({
                            ...formData,
                            kamar: val,
                            rayon: customRayon ? formData.rayon : autoDetectRayon(val),
                          });
                        }}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-emerald-600"
                        required
                      />
                    ) : (
                      <select
                        value={formData.kamar || 'Al-Ghazali 01'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({
                            ...formData,
                            kamar: val,
                            rayon: autoDetectRayon(val),
                          });
                        }}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-emerald-600 cursor-pointer"
                      >
                        {allRooms.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-stone-600">
                        Rayon Asrama:
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomRayon(!customRayon)}
                        className="text-[10px] text-stone-500 hover:text-emerald-800 cursor-pointer"
                      >
                        {customRayon ? 'Auto-detect' : 'Ubah Manual'}
                      </button>
                    </div>
                    {customRayon ? (
                      <input
                        type="text"
                        placeholder="Ketik nama rayon kustom..."
                        value={formData.rayon || ''}
                        onChange={(e) => setFormData({ ...formData, rayon: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-emerald-600"
                      />
                    ) : (
                      <select
                        value={formData.rayon || 'Rayon Putra Al-Ghazali'}
                        onChange={(e) => setFormData({ ...formData, rayon: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-emerald-600 cursor-pointer"
                      >
                        {allRayons.map((ry) => (
                          <option key={ry} value={ry}>
                            {ry}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* SEKSI KELAS MADRASAH & KELAS FORMAL FLEKSIBEL */}
              <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-800" />
                    <span>Pendidikan Formal &amp; Madrasah Diniyah</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Kelas Formal */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-stone-600">
                        Kelas Formal:
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomKelasFormal(!customKelasFormal)}
                        className="text-[10px] font-semibold text-emerald-800 hover:underline cursor-pointer"
                      >
                        {customKelasFormal ? '← Pilihan Dropdown' : '+ Kelas Kustom'}
                      </button>
                    </div>

                    {customKelasFormal ? (
                      <input
                        type="text"
                        placeholder="Contoh: 7 MTs, 8 MTs, 10 MA, dll."
                        value={formData.kelasFormal || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, kelasFormal: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-emerald-600"
                        required
                      />
                    ) : (
                      <select
                        value={formData.kelasFormal || 'MTs Kelas 8'}
                        onChange={(e) =>
                          setFormData({ ...formData, kelasFormal: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-emerald-600 cursor-pointer"
                      >
                        {allFormalClasses.map((kf) => (
                          <option key={kf} value={kf}>
                            {kf}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Kelas Diniyah */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-stone-600">
                        Kelas Diniyah:
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomKelasDiniyah(!customKelasDiniyah)}
                        className="text-[10px] font-semibold text-emerald-800 hover:underline cursor-pointer"
                      >
                        {customKelasDiniyah ? '← Pilihan Dropdown' : '+ Kelas Kustom'}
                      </button>
                    </div>

                    {customKelasDiniyah ? (
                      <input
                        type="text"
                        placeholder="Contoh: Ula A, Wustha B, Ulya, dll."
                        value={formData.kelasMadrasah || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, kelasMadrasah: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-emerald-600"
                        required
                      />
                    ) : (
                      <select
                        value={formData.kelasMadrasah || 'Wustha A'}
                        onChange={(e) =>
                          setFormData({ ...formData, kelasMadrasah: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-emerald-600 cursor-pointer"
                      >
                        {allDiniyahClasses.map((kd) => (
                          <option key={kd} value={kd}>
                            {kd}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Mukim */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Status Mukim Santri
                  </label>
                  <select
                    value={formData.statusMukim || 'Mukim'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        statusMukim: e.target.value as 'Mukim' | 'Izin Pulang' | 'Terlambat Kembali',
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600 cursor-pointer"
                  >
                    <option value="Mukim">Mukim di Asrama</option>
                    <option value="Izin Pulang">Izin Pulang ke Rumah</option>
                    <option value="Terlambat Kembali">Terlambat Kembali</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Poin Pelanggaran Awal
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.poinPelanggaran ?? 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        poinPelanggaran: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Data Wali Santri */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nama Wali Santri
                  </label>
                  <input
                    type="text"
                    placeholder="Nama orang tua/wali"
                    value={formData.namaWali || ''}
                    onChange={(e) => setFormData({ ...formData, namaWali: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    No. Telepon / WhatsApp Wali
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-3456-7890"
                    value={formData.teleponWali || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, teleponWali: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:bg-white focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Alamat Asal */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Alamat Rumah Asal Santri
                </label>
                <textarea
                  rows={2}
                  placeholder="Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi..."
                  value={formData.alamat || ''}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingSantri(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  {editingSantri ? 'Simpan Perubahan' : 'Tambahkan Santri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: CETAK / EXPORT DAFTAR SANTRI (PRINT PREVIEW) */}
      {/* ========================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-800" />
                <h3 className="font-bold text-base text-stone-900">
                  Cetak Dokumen Resmi Data Santri
                </h3>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-4">
              Dokumen cetak akan menggunakan format Kop Surat Resmi{' '}
              <strong>{settings?.namaLembaga || 'Pondok Pesantren Raudhotu Hidayah'}</strong>{' '}
              beserta tanda tangan Kepala Kesantrian.
            </p>

            <div className="space-y-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Jumlah Data yang Dicetak:</span>
                <span className="font-bold text-emerald-900">
                  {filteredSantri.length} Santri
                </span>
              </div>
              {hasActiveFilters && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-500">Keterangan Filter:</span>
                  <span className="font-medium text-stone-700">
                    Sesuai filter pencarian aktif di layar
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Kop Dokumen:</span>
                <span className="font-medium text-stone-800">
                  {settings?.namaLembaga || 'Pondok Pesantren Raudhotu Hidayah'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Penanda Tangan:</span>
                <span className="font-medium text-stone-800">
                  {settings?.namaKepalaKesantrian || 'Ustadz H. Ahmad Muzammil, S.Pd.I'}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setShowPrintModal(false);
                  setTimeout(() => handlePrint(), 200);
                }}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Buka Dialog Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PRINT-ONLY FORMATTED OFFICIAL DOCUMENT */}
      {/* Ditampilkan hanya saat dialog cetak / window.print() */}
      {/* ========================================================= */}
      <div className="print-only p-8 text-black bg-white">
        {/* Kop Resmi Pesantren */}
        <div className="text-center pb-4 mb-6 border-b-2 border-black flex flex-col items-center">
          <h1 className="text-xl font-bold tracking-wide uppercase">
            {settings?.namaLembaga || 'PONDOK PESANTREN RAUDHOTU HIDAYAH'}
          </h1>
          <p className="text-xs italic text-stone-700 mt-0.5">
            {settings?.subNamaTagline || 'Membentuk Generasi Qur’ani, Berakhlakul Karimah & Berwawasan Global'}
          </p>
          <p className="text-[11px] text-stone-600 mt-1">
            {settings?.alamatLengkap || 'Jl. Pesantren No. 45, Ciawi, Bogor, Jawa Barat 16720'} • Telp:{' '}
            {settings?.telepon || '0251-8245991'}
          </p>
        </div>

        {/* Judul Laporan Cetak */}
        <div className="text-center mb-6">
          <h2 className="text-base font-bold uppercase underline">
            DAFTAR DATA SANTRI MUKIM
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
            {filterKelasFormal !== 'all' ? ` • Kelas Formal: ${filterKelasFormal}` : ''}
            {filterKelasDiniyah !== 'all' ? ` • Diniyah: ${filterKelasDiniyah}` : ''}
            {filterKamar !== 'all' ? ` • Kamar: ${filterKamar}` : ''}
          </p>
        </div>

        {/* Tabel Data Santri Cetak */}
        <table className="w-full text-xs border-collapse border border-black mb-8">
          <thead>
            <tr className="bg-stone-100 font-bold text-center">
              <th className="border border-black p-1.5 w-8">No</th>
              <th className="border border-black p-1.5 w-24">NIS</th>
              <th className="border border-black p-1.5">Nama Santri</th>
              <th className="border border-black p-1.5 w-10">L/P</th>
              <th className="border border-black p-1.5">Kamar / Rayon</th>
              <th className="border border-black p-1.5">Kelas Diniyah</th>
              <th className="border border-black p-1.5">Kelas Formal</th>
              <th className="border border-black p-1.5">Wali Santri</th>
              <th className="border border-black p-1.5 w-20">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSantri.map((s, idx) => (
              <tr key={s.id} className="text-center">
                <td className="border border-black p-1">{idx + 1}</td>
                <td className="border border-black p-1 font-mono">{s.nis}</td>
                <td className="border border-black p-1 text-left font-semibold">{s.nama}</td>
                <td className="border border-black p-1">{s.gender}</td>
                <td className="border border-black p-1 text-left">{s.kamar}</td>
                <td className="border border-black p-1">{s.kelasMadrasah}</td>
                <td className="border border-black p-1">{s.kelasFormal}</td>
                <td className="border border-black p-1 text-left">
                  {s.namaWali} {s.teleponWali ? `(${s.teleponWali})` : ''}
                </td>
                <td className="border border-black p-1 font-semibold">{s.statusMukim}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Ringkasan & Tanda Tangan */}
        <div className="flex justify-between items-end text-xs mt-10">
          <div>
            <p>
              Total Santri Terdata: <strong>{filteredSantri.length}</strong> orang
            </p>
            <p className="text-[11px] text-stone-600">
              Dokumen ini dihasilkan secara otomatis oleh Sistem Informasi Pesantren.
            </p>
          </div>

          <div className="text-center w-56">
            <p className="mb-14">
              Bogor, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
              <br />
              Kepala Bagian Kesantrian,
            </p>
            <p className="font-bold underline">
              {settings?.namaKepalaKesantrian || 'Ustadz H. Ahmad Muzammil, S.Pd.I'}
            </p>
            <p className="text-[11px] text-stone-600">NIP. 19840912 201001 1 003</p>
          </div>
        </div>
      </div>
    </div>
  );
};
