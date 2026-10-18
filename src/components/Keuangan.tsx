import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Coins,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Printer,
  Download,
  CreditCard,
  Banknote,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Trash2,
  Edit3,
  Eye,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Users,
  Check,
  X,
  FileSpreadsheet,
  AlertCircle,
  Receipt,
  Share2,
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';
import {
  Santri,
  MasterKelas,
  PesantrenSettings,
  User,
  UserRole,
  PosPembayaran,
  TagihanSantri,
  PembayaranTransaksi,
  KasOperasional,
  TipePosPembayaran,
  StatusTagihan,
  MetodePembayaran,
} from '../types';
import {
  formatRupiah,
  formatRupiahRaw,
  terbilang,
  generateNomorKwitansi,
  DAFTAR_BULAN_HIJRI_MASEHI,
  KATEGORI_KAS_DEFAULT,
  exportToCsv,
} from '../utils/financeUtils';

interface KeuanganProps {
  santriList: Santri[];
  masterKelasList: MasterKelas[];
  settings: PesantrenSettings;
  currentUser: User;
  userRole: UserRole;
  posPembayaranList: PosPembayaran[];
  tagihanSantriList: TagihanSantri[];
  pembayaranList: PembayaranTransaksi[];
  kasOperasionalList: KasOperasional[];
  onSavePos: (item: PosPembayaran) => void;
  onDeletePos: (id: string) => void;
  onSaveTagihan: (item: TagihanSantri) => void;
  onGenerateBatchTagihan: (tagihanItems: TagihanSantri[]) => void;
  onDeleteTagihan: (id: string) => void;
  onProcessPembayaran: (
    pembayaran: PembayaranTransaksi,
    updatedTagihan: TagihanSantri,
    catatKasMasuk: boolean
  ) => void;
  onSaveKas: (item: KasOperasional) => void;
  onDeleteKas: (id: string) => void;
  onSyncKeuanganCloud?: () => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const ChartCustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const pemasukanEntry = payload.find((p: any) => p.dataKey === 'pemasukan');
    const pengeluaranEntry = payload.find((p: any) => p.dataKey === 'pengeluaran');
    const pem = pemasukanEntry ? Number(pemasukanEntry.value) : 0;
    const peng = pengeluaranEntry ? Number(pengeluaranEntry.value) : 0;
    const selisih = pem - peng;

    return (
      <div className="bg-stone-900/95 backdrop-blur-xs text-white p-3.5 rounded-xl shadow-2xl border border-stone-700/80 text-xs min-w-[220px]">
        <div className="flex items-center justify-between border-b border-stone-800 pb-1.5 mb-2">
          <span className="font-bold text-stone-200">Bulan: {label}</span>
          {pemasukanEntry && pengeluaranEntry && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                selisih >= 0
                  ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/60'
                  : 'bg-rose-900/80 text-rose-300 border border-rose-700/60'
              }`}
            >
              {selisih >= 0 ? 'Surplus' : 'Defisit'}
            </span>
          )}
        </div>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-stone-300">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-serif font-bold text-white">
                {formatRupiah(entry.value)}
              </span>
            </div>
          ))}
          {pemasukanEntry && pengeluaranEntry && (
            <div className="pt-2 mt-2 border-t border-stone-800 flex items-center justify-between font-semibold">
              <span className="text-stone-400">Arus Kas Bersih:</span>
              <span
                className={`font-serif font-bold ${
                  selisih >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {selisih >= 0 ? `+${formatRupiah(selisih)}` : `-${formatRupiah(Math.abs(selisih))}`}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const PieCustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-stone-900/95 backdrop-blur-xs text-white p-3 rounded-xl shadow-xl border border-stone-700/80 text-xs">
        <p className="font-semibold text-stone-200">{data.name}</p>
        <p className="font-serif font-bold text-emerald-400 text-sm mt-0.5">
          {formatRupiah(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

export const Keuangan: React.FC<KeuanganProps> = ({
  santriList,
  masterKelasList,
  settings,
  currentUser,
  userRole,
  posPembayaranList,
  tagihanSantriList,
  pembayaranList,
  kasOperasionalList,
  onSavePos,
  onDeletePos,
  onSaveTagihan,
  onGenerateBatchTagihan,
  onDeleteTagihan,
  onProcessPembayaran,
  onSaveKas,
  onDeleteKas,
  onSyncKeuanganCloud,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'transaksi' | 'pos_tagihan' | 'kas_operasional' | 'laporan'
  >('dashboard');

  // Filter States for Transaksi / Tagihan
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterPos, setFilterPos] = useState('Semua');
  const [filterBulan, setFilterBulan] = useState('Semua');

  // Filter States for Kas Operasional
  const [searchKas, setSearchKas] = useState('');
  const [filterJenisKas, setFilterJenisKas] = useState<'Semua' | 'Masuk' | 'Keluar'>('Semua');
  const [filterKategoriKas, setFilterKategoriKas] = useState('Semua');

  // Modal States
  const [modalPembayaranOpen, setModalPembayaranOpen] = useState(false);
  const [selectedTagihanForPay, setSelectedTagihanForPay] = useState<TagihanSantri | null>(null);

  const [modalKwitansiOpen, setModalKwitansiOpen] = useState(false);
  const [selectedPembayaranForKwitansi, setSelectedPembayaranForKwitansi] =
    useState<PembayaranTransaksi | null>(null);

  const [modalPosOpen, setModalPosOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<PosPembayaran | null>(null);

  const [modalBatchTagihanOpen, setModalBatchTagihanOpen] = useState(false);
  const [modalCustomTagihanOpen, setModalCustomTagihanOpen] = useState(false);

  const [modalKasOpen, setModalKasOpen] = useState(false);
  const [kasJenisForm, setKasJenisForm] = useState<'Masuk' | 'Keluar'>('Keluar');

  // Laporan Rekapitulasi State
  const [rekapSelectedKelas, setRekapSelectedKelas] = useState<string>(
    masterKelasList[0]?.nama || '7 MTs'
  );
  const [rekapSelectedPos, setRekapSelectedPos] = useState<string>(
    posPembayaranList[0]?.id || 'pos_1'
  );
  const [rekapTahunAjaran, setRekapTahunAjaran] = useState<string>('2024/2025');

  // Toast / Feedback message
  const [notification, setNotification] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // =========================================================================
  // CALCULATIONS & METRICS
  // =========================================================================

  const summary = useMemo(() => {
    // 1. Total Pembayaran Santri yang sudah masuk
    const totalBayarSantri = pembayaranList.reduce((acc, p) => acc + (p.nominalBayar || 0), 0);

    // 2. Total Kas Masuk (selain otomatis dari pembayaran jika dipisah, atau total masuk)
    const totalKasMasuk = kasOperasionalList
      .filter((k) => k.jenis === 'Masuk')
      .reduce((acc, k) => acc + (k.nominal || 0), 0);

    // 3. Total Pengeluaran Operasional
    const totalKasKeluar = kasOperasionalList
      .filter((k) => k.jenis === 'Keluar')
      .reduce((acc, k) => acc + (k.nominal || 0), 0);

    // 4. Saldo Kas Riil (Total Kas Masuk - Total Kas Keluar)
    const saldoKas = totalKasMasuk - totalKasKeluar;

    // 5. Total Piutang / Tunggakan Santri yang belum dibayar
    const totalTunggakan = tagihanSantriList
      .filter((t) => t.status !== 'Lunas')
      .reduce((acc, t) => acc + (t.sisa || 0), 0);

    // 6. Jumlah Tagihan Lunas vs Total
    const totalTagihanCount = tagihanSantriList.length;
    const lunasCount = tagihanSantriList.filter((t) => t.status === 'Lunas').length;
    const nunggakCount = tagihanSantriList.filter((t) => t.status === 'Menunggak').length;
    const kurangBayarCount = tagihanSantriList.filter((t) => t.status === 'Kurang Bayar').length;
    const persentaseLunas =
      totalTagihanCount > 0 ? Math.round((lunasCount / totalTagihanCount) * 100) : 0;

    return {
      totalBayarSantri,
      totalKasMasuk,
      totalKasKeluar,
      saldoKas,
      totalTunggakan,
      totalTagihanCount,
      lunasCount,
      nunggakCount,
      kurangBayarCount,
      persentaseLunas,
    };
  }, [pembayaranList, kasOperasionalList, tagihanSantriList]);

  // Filtered Tagihan Santri
  const filteredTagihan = useMemo(() => {
    return tagihanSantriList.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.santriNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.posNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kelas.toLowerCase().includes(searchQuery.toLowerCase());

      const matchKelas = filterKelas === 'Semua' || item.kelas === filterKelas;
      const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
      const matchPos = filterPos === 'Semua' || item.posId === filterPos;
      const matchBulan =
        filterBulan === 'Semua' || item.bulan.toLowerCase().includes(filterBulan.toLowerCase());

      return matchSearch && matchKelas && matchStatus && matchPos && matchBulan;
    });
  }, [tagihanSantriList, searchQuery, filterKelas, filterStatus, filterPos, filterBulan]);

  // Filtered Kas Operasional
  const filteredKas = useMemo(() => {
    return kasOperasionalList.filter((item) => {
      const matchSearch =
        searchKas === '' ||
        item.keterangan.toLowerCase().includes(searchKas.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchKas.toLowerCase()) ||
        item.nomorBukti.toLowerCase().includes(searchKas.toLowerCase()) ||
        item.pihakTerkait.toLowerCase().includes(searchKas.toLowerCase());

      const matchJenis = filterJenisKas === 'Semua' || item.jenis === filterJenisKas;
      const matchKategori = filterKategoriKas === 'Semua' || item.kategori === filterKategoriKas;

      return matchSearch && matchJenis && matchKategori;
    });
  }, [kasOperasionalList, searchKas, filterJenisKas, filterKategoriKas]);

  // List of Unique Classes from santri & master
  const daftarKelas = useMemo(() => {
    const fromMaster = masterKelasList.map((k) => k.nama);
    const fromSantri = santriList.map((s) => s.kelasMadrasah || s.kelasFormal);
    return Array.from(new Set([...fromMaster, ...fromSantri])).filter(Boolean);
  }, [masterKelasList, santriList]);

  // Visual Chart State
  const [chartViewMode, setChartViewMode] = useState<'bar' | 'area' | 'composed'>('bar');
  const [donutViewMode, setDonutViewMode] = useState<'kategori' | 'metode'>('kategori');

  // Month detection helper
  const isDateInMonth = (dateStr: string, monthName: string): boolean => {
    if (!dateStr) return false;
    const lowerDate = dateStr.toLowerCase();
    const lowerMonth = monthName.toLowerCase();
    if (lowerDate.includes(lowerMonth)) return true;

    const monthMap: Record<string, string> = {
      januari: '-01-',
      februari: '-02-',
      maret: '-03-',
      april: '-04-',
      mei: '-05-',
      juni: '-06-',
      juli: '-07-',
      agustus: '-08-',
      september: '-09-',
      oktober: '-10-',
      november: '-11-',
      desember: '-12-',
    };
    const code = monthMap[lowerMonth];
    if (code && dateStr.includes(code)) return true;

    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        const monthNames = [
          'januari',
          'februari',
          'maret',
          'april',
          'mei',
          'juni',
          'juli',
          'agustus',
          'september',
          'oktober',
          'november',
          'desember',
        ];
        return monthNames[parsed.getMonth()] === lowerMonth;
      }
    } catch {
      // ignore
    }
    return false;
  };

  // Monthly Comparison Data for Recharts
  const monthlyComparisonData = useMemo(() => {
    let runningSaldo = 0;
    return DAFTAR_BULAN_HIJRI_MASEHI.map((bulan) => {
      // 1. Kas Masuk Operasional (selain setoran otomatis santri agar tidak dobel hitung)
      const kasMasukNonSantri = kasOperasionalList
        .filter(
          (k) =>
            k.jenis === 'Masuk' &&
            k.kategori !== 'Kas Pembayaran Santri' &&
            isDateInMonth(k.tanggal, bulan)
        )
        .reduce((sum, k) => sum + (k.nominal || 0), 0);

      // 2. Setoran Kas Santri di Buku Kas
      const kasMasukSantri = kasOperasionalList
        .filter(
          (k) =>
            k.jenis === 'Masuk' &&
            k.kategori === 'Kas Pembayaran Santri' &&
            isDateInMonth(k.tanggal, bulan)
        )
        .reduce((sum, k) => sum + (k.nominal || 0), 0);

      // 3. Pembayaran Santri di Tabel Transaksi Langsung
      const bayarSantri = pembayaranList
        .filter(
          (p) =>
            isDateInMonth(p.tanggalBayar, bulan) ||
            (p.posNama && p.posNama.toLowerCase().includes(bulan.toLowerCase()))
        )
        .reduce((sum, p) => sum + (p.nominalBayar || 0), 0);

      const penerimaanSantri = Math.max(kasMasukSantri, bayarSantri);
      const totalPemasukan = kasMasukNonSantri + penerimaanSantri;

      // 4. Kas Keluar (Pengeluaran Operasional)
      const kasKeluar = kasOperasionalList
        .filter((k) => k.jenis === 'Keluar' && isDateInMonth(k.tanggal, bulan))
        .reduce((sum, k) => sum + (k.nominal || 0), 0);

      const netSurplus = totalPemasukan - kasKeluar;
      runningSaldo += netSurplus;

      return {
        bulan,
        bulanShort: bulan.substring(0, 3),
        pemasukan: totalPemasukan,
        pengeluaran: kasKeluar,
        surplus: netSurplus,
        saldoAkumulatif: runningSaldo,
      };
    });
  }, [kasOperasionalList, pembayaranList]);

  // Visual Quick Stats & Analytical Insights
  const monthlyStats = useMemo(() => {
    const totalPemasukan = monthlyComparisonData.reduce((acc, m) => acc + m.pemasukan, 0);
    const totalPengeluaran = monthlyComparisonData.reduce((acc, m) => acc + m.pengeluaran, 0);
    const monthsWithActivity = monthlyComparisonData.filter(
      (m) => m.pemasukan > 0 || m.pengeluaran > 0
    );
    const countActive = Math.max(1, monthsWithActivity.length);
    const avgPemasukan = Math.round(totalPemasukan / countActive);
    const avgPengeluaran = Math.round(totalPengeluaran / countActive);

    let peakMonth = monthlyComparisonData[0] || { bulan: 'Juli', pemasukan: 0 };
    monthlyComparisonData.forEach((m) => {
      if (m.pemasukan > peakMonth.pemasukan) {
        peakMonth = m;
      }
    });

    const rasioEfisiensi =
      totalPemasukan > 0 ? Math.round((totalPengeluaran / totalPemasukan) * 100) : 0;

    return {
      totalPemasukan,
      totalPengeluaran,
      surplusTahunan: totalPemasukan - totalPengeluaran,
      avgPemasukan,
      avgPengeluaran,
      peakMonth,
      rasioEfisiensi,
    };
  }, [monthlyComparisonData]);

  // Operational Expenses Category Breakdown for Donut Chart
  const kategoriPengeluaranData = useMemo(() => {
    const map: Record<string, number> = {};
    kasOperasionalList
      .filter((k) => k.jenis === 'Keluar')
      .forEach((k) => {
        map[k.kategori] = (map[k.kategori] || 0) + k.nominal;
      });

    const entries = Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);

    return entries.length > 0
      ? entries
      : [
          { name: 'Bisyarah Pengajar', value: 4200000 },
          { name: 'Dapur & Logistik', value: 1850000 },
          { name: 'Listrik & Air', value: 650000 },
          { name: 'Pemeliharaan Gedung', value: 420000 },
        ];
  }, [kasOperasionalList]);

  // Payment Method Breakdown (Tunai vs Transfer)
  const metodePembayaranData = useMemo(() => {
    let tunai = 0;
    let transfer = 0;
    let countTunai = 0;
    let countTransfer = 0;

    pembayaranList.forEach((p) => {
      if (p.metodePembayaran === 'Tunai') {
        tunai += p.nominalBayar || 0;
        countTunai += 1;
      } else {
        transfer += p.nominalBayar || 0;
        countTransfer += 1;
      }
    });

    const totalNominal = tunai + transfer;
    return [
      {
        name: 'Transfer Bank',
        value: transfer > 0 ? transfer : 1650000,
        count: countTransfer > 0 ? countTransfer : 3,
        color: '#047857',
        percentage:
          totalNominal > 0 ? Math.round((transfer / totalNominal) * 100) : 75,
      },
      {
        name: 'Tunai Langsung',
        value: tunai > 0 ? tunai : 550000,
        count: countTunai > 0 ? countTunai : 2,
        color: '#d97706',
        percentage: totalNominal > 0 ? Math.round((tunai / totalNominal) * 100) : 25,
      },
    ];
  }, [pembayaranList]);

  // Laporan Rekap SPP Bulanan Kelas Chart Data
  const rekapBulananKelasChartData = useMemo(() => {
    return DAFTAR_BULAN_HIJRI_MASEHI.map((bulan) => {
      const tagihanInMonth = tagihanSantriList.filter(
        (t) =>
          t.kelas === rekapSelectedKelas &&
          t.posId === rekapSelectedPos &&
          t.bulan.toLowerCase().includes(bulan.toLowerCase())
      );

      const terbayar = tagihanInMonth.reduce((acc, t) => acc + (t.terbayar || 0), 0);
      const sisa = tagihanInMonth.reduce((acc, t) => acc + (t.sisa || 0), 0);
      const total = terbayar + sisa;

      return {
        bulan,
        bulanShort: bulan.substring(0, 3),
        terbayar,
        sisa,
        total,
        persen: total > 0 ? Math.round((terbayar / total) * 100) : 0,
      };
    });
  }, [tagihanSantriList, rekapSelectedKelas, rekapSelectedPos]);

  const PIE_COLORS = [
    '#047857', // emerald-700
    '#b45309', // amber-700
    '#e11d48', // rose-600
    '#0284c7', // sky-600
    '#7c3aed', // violet-600
    '#475569', // slate-600
    '#0d9488', // teal-600
    '#ca8a04', // yellow-600
  ];

  // =========================================================================
  // HANDLERS
  // =========================================================================

  // Buka modal bayar
  const handleOpenBayarModal = (tagihan: TagihanSantri) => {
    setSelectedTagihanForPay(tagihan);
    setModalPembayaranOpen(true);
  };

  // Submit Pembayaran
  const handleSubmitPembayaran = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTagihanForPay) return;

    const form = e.currentTarget;
    const nominalBayar = Number(form.nominalBayar.value);
    const metode = form.metodePembayaran.value as MetodePembayaran;
    const tanggalBayar = form.tanggalBayar.value;
    const penyetor = form.penyetor.value;
    const keterangan = form.keterangan.value;
    const catatKas = form.catatKas.checked;

    if (isNaN(nominalBayar) || nominalBayar <= 0) {
      alert('Masukkan nominal pembayaran yang valid.');
      return;
    }

    if (nominalBayar > selectedTagihanForPay.sisa) {
      alert(`Nominal bayar (${formatRupiah(nominalBayar)}) melebihi sisa tagihan (${formatRupiah(selectedTagihanForPay.sisa)}).`);
      return;
    }

    const nomorKwitansi = generateNomorKwitansi('KWT');
    const newTerbayar = selectedTagihanForPay.terbayar + nominalBayar;
    const newSisa = selectedTagihanForPay.nominal - newTerbayar;
    const newStatus: StatusTagihan = newSisa <= 0 ? 'Lunas' : 'Kurang Bayar';

    const updatedTagihan: TagihanSantri = {
      ...selectedTagihanForPay,
      terbayar: newTerbayar,
      sisa: Math.max(0, newSisa),
      status: newStatus,
      catatan: keterangan ? keterangan : selectedTagihanForPay.catatan,
    };

    const newPembayaran: PembayaranTransaksi = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nomorTransaksi: nomorKwitansi,
      tagihanId: selectedTagihanForPay.id,
      santriId: selectedTagihanForPay.santriId,
      santriNama: selectedTagihanForPay.santriNama,
      nis: selectedTagihanForPay.nis,
      kelas: selectedTagihanForPay.kelas,
      posNama: `${selectedTagihanForPay.posNama} (${selectedTagihanForPay.bulan !== '-' ? selectedTagihanForPay.bulan : selectedTagihanForPay.tahun})`,
      nominalBayar,
      metodePembayaran: metode,
      tanggalBayar: tanggalBayar || new Date().toISOString().split('T')[0],
      petugas: currentUser.displayName || currentUser.name || 'Bendahara',
      penyetor: penyetor || selectedTagihanForPay.santriNama,
      keterangan: keterangan || `Pembayaran ${selectedTagihanForPay.posNama}`,
      createdAt: new Date().toISOString(),
    };

    onProcessPembayaran(newPembayaran, updatedTagihan, catatKas);
    setModalPembayaranOpen(false);
    showNotification(
      `Pembayaran ${formatRupiah(nominalBayar)} untuk ${selectedTagihanForPay.santriNama} berhasil dicatat. Nomor Kuitansi: ${nomorKwitansi}`
    );

    // Auto open kwitansi modal for print
    setSelectedPembayaranForKwitansi(newPembayaran);
    setModalKwitansiOpen(true);
  };

  // Submit Kas Operasional (Masuk / Keluar)
  const handleSubmitKas = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const jenis = kasJenisForm;
    const kategori = form.kategori.value;
    const customKategori = form.customKategori?.value;
    const finalKategori = customKategori && customKategori.trim() !== '' ? customKategori.trim() : kategori;
    const nominal = Number(form.nominal.value);
    const tanggal = form.tanggal.value || new Date().toISOString().split('T')[0];
    const pihakTerkait = form.pihakTerkait.value;
    const keterangan = form.keterangan.value;
    const metode = form.metode.value as 'Tunai' | 'Transfer';

    if (isNaN(nominal) || nominal <= 0) {
      alert('Masukkan nominal kas yang valid.');
      return;
    }

    const nomorBukti = generateNomorKwitansi(jenis === 'Masuk' ? 'BKM' : 'BKK');

    const newKas: KasOperasional = {
      id: `kas_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nomorBukti,
      jenis,
      kategori: finalKategori,
      nominal,
      tanggal,
      pihakTerkait,
      keterangan,
      petugas: currentUser.displayName || currentUser.name || 'Bendahara',
      metode,
      createdAt: new Date().toISOString(),
    };

    onSaveKas(newKas);
    setModalKasOpen(false);
    showNotification(
      `Transaksi Kas ${jenis === 'Masuk' ? 'Masuk' : 'Keluar'} (${formatRupiah(nominal)}) berhasil disimpan dengan nomor ${nomorBukti}.`
    );
  };

  // Submit Master Pos Pembayaran
  const handleSubmitPos = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nama = form.nama.value.trim();
    const tipe = form.tipe.value as TipePosPembayaran;
    const tarifDefault = Number(form.tarifDefault.value) || 0;
    const tahunAjaran = form.tahunAjaran.value.trim() || '2024/2025';
    const keterangan = form.keterangan.value.trim();

    if (!nama) {
      alert('Nama pos pembayaran wajib diisi.');
      return;
    }

    const newPos: PosPembayaran = {
      id: editingPos ? editingPos.id : `pos_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      nama,
      tipe,
      tarifDefault,
      tahunAjaran,
      keterangan,
      isActive: true,
      createdAt: editingPos ? editingPos.createdAt : new Date().toISOString(),
    };

    onSavePos(newPos);
    setModalPosOpen(false);
    setEditingPos(null);
    showNotification(`Pos pembayaran "${nama}" berhasil disimpan.`);
  };

  // Generate Tagihan Massal per Kelas / Tingkat
  const handleGenerateBatchTagihan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const posId = form.posId.value;
    const targetKelas = form.targetKelas.value; // 'Semua' or specific class
    const nominal = Number(form.nominal.value);
    const jatuhTempo = form.jatuhTempo.value;
    const tahunAjaran = form.tahunAjaran.value || '2024/2025';

    const selectedPos = posPembayaranList.find((p) => p.id === posId);
    if (!selectedPos) {
      alert('Pilih pos pembayaran terlebih dahulu.');
      return;
    }

    if (isNaN(nominal) || nominal <= 0) {
      alert('Masukkan nominal tagihan yang valid.');
      return;
    }

    // Ambil bulan terpilih dari checkboxes
    const bulanCheckboxes = form.querySelectorAll<HTMLInputElement>('input[name="selectedBulan"]:checked');
    const selectedBulanList: string[] = [];
    bulanCheckboxes.forEach((cb) => selectedBulanList.push(cb.value));

    if (selectedPos.tipe === 'bulanan' && selectedBulanList.length === 0) {
      alert('Pilih minimal satu bulan untuk pos pembayaran bulanan.');
      return;
    }

    // Filter santri sasaran
    const targetSantri = santriList.filter((s) => {
      if (targetKelas === 'Semua') return true;
      return s.kelasMadrasah === targetKelas || s.kelasFormal === targetKelas;
    });

    if (targetSantri.length === 0) {
      alert('Tidak ada santri yang sesuai dengan kelas target yang dipilih.');
      return;
    }

    const newTagihanItems: TagihanSantri[] = [];
    const bulanIterations = selectedPos.tipe === 'bulanan' ? selectedBulanList : ['-'];

    targetSantri.forEach((santri) => {
      bulanIterations.forEach((bln) => {
        const blnStr = selectedPos.tipe === 'bulanan' ? `${bln} ${tahunAjaran.split('/')[0]}` : '-';

        // Cek duplikasi tagihan agar tidak double
        const isExists = tagihanSantriList.some(
          (t) =>
            t.santriId === santri.id &&
            t.posId === selectedPos.id &&
            t.bulan === blnStr &&
            t.tahun === tahunAjaran
        );

        if (!isExists) {
          newTagihanItems.push({
            id: `tag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            santriId: santri.id,
            santriNama: santri.nama,
            nis: santri.nis,
            kelas: santri.kelasMadrasah || santri.kelasFormal || 'Tanpa Kelas',
            kamar: santri.kamar,
            posId: selectedPos.id,
            posNama: selectedPos.nama,
            tipe: selectedPos.tipe,
            bulan: blnStr,
            tahun: tahunAjaran,
            nominal,
            terbayar: 0,
            sisa: nominal,
            status: 'Menunggak',
            jatuhTempo: jatuhTempo || undefined,
            createdAt: new Date().toISOString(),
          });
        }
      });
    });

    if (newTagihanItems.length === 0) {
      alert('Seluruh tagihan untuk santri dan periode yang dipilih sudah pernah dibuat sebelumnya.');
      return;
    }

    onGenerateBatchTagihan(newTagihanItems);
    setModalBatchTagihanOpen(false);
    showNotification(
      `Berhasil menerbitkan ${newTagihanItems.length} tagihan baru secara serentak untuk ${targetSantri.length} santri.`
    );
  };

  // Submit Tagihan Perorangan
  const handleSubmitCustomTagihan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const santriId = form.santriId.value;
    const posId = form.posId.value;
    const bulan = form.bulan.value;
    const tahunAjaran = form.tahunAjaran.value;
    const nominal = Number(form.nominal.value);
    const jatuhTempo = form.jatuhTempo.value;
    const catatan = form.catatan.value;

    const santri = santriList.find((s) => s.id === santriId);
    const pos = posPembayaranList.find((p) => p.id === posId);

    if (!santri || !pos) {
      alert('Pilih santri dan pos pembayaran dengan benar.');
      return;
    }

    if (isNaN(nominal) || nominal <= 0) {
      alert('Nominal tagihan harus berupa angka positif.');
      return;
    }

    const finalBulan = pos.tipe === 'bulanan' ? bulan : '-';

    const newTagihan: TagihanSantri = {
      id: `tag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      santriId: santri.id,
      santriNama: santri.nama,
      nis: santri.nis,
      kelas: santri.kelasMadrasah || santri.kelasFormal || 'Tanpa Kelas',
      kamar: santri.kamar,
      posId: pos.id,
      posNama: pos.nama,
      tipe: pos.tipe,
      bulan: finalBulan,
      tahun: tahunAjaran,
      nominal,
      terbayar: 0,
      sisa: nominal,
      status: 'Menunggak',
      jatuhTempo: jatuhTempo || undefined,
      catatan,
      createdAt: new Date().toISOString(),
    };

    onSaveTagihan(newTagihan);
    setModalCustomTagihanOpen(false);
    showNotification(`Tagihan khusus untuk ${santri.nama} (${pos.nama}) berhasil diterbitkan.`);
  };

  // Export Tagihan ke CSV
  const handleExportTagihanCsv = () => {
    const headers = [
      'Nomor Induk (NIS)',
      'Nama Santri',
      'Kelas',
      'Kamar',
      'Pos Pembayaran',
      'Periode/Bulan',
      'Tahun Ajaran',
      'Nominal Tagihan (Rp)',
      'Terbayar (Rp)',
      'Sisa Tunggakan (Rp)',
      'Status Pembayaran',
      'Jatuh Tempo',
    ];

    const rows = filteredTagihan.map((t) => [
      t.nis,
      t.santriNama,
      t.kelas,
      t.kamar || '-',
      t.posNama,
      t.bulan,
      t.tahun,
      t.nominal,
      t.terbayar,
      t.sisa,
      t.status,
      t.jatuhTempo || '-',
    ]);

    exportToCsv(
      `Laporan_Tagihan_Santri_${new Date().toISOString().split('T')[0]}`,
      headers,
      rows
    );
  };

  // Export Kas Operasional ke CSV
  const handleExportKasCsv = () => {
    const headers = [
      'Nomor Bukti',
      'Tanggal',
      'Jenis Kas',
      'Kategori',
      'Pihak Terkait (Penerima/Penyetor)',
      'Keterangan Transaksi',
      'Nominal (Rp)',
      'Metode',
      'Petugas Pencatat',
    ];

    const rows = filteredKas.map((k) => [
      k.nomorBukti,
      k.tanggal,
      k.jenis,
      k.kategori,
      k.pihakTerkait,
      k.keterangan,
      k.nominal,
      k.metode,
      k.petugas,
    ]);

    exportToCsv(
      `Buku_Kas_Operasional_${new Date().toISOString().split('T')[0]}`,
      headers,
      rows
    );
  };

  // Rekapitulasi Pembayaran Per Kelas (Matriks)
  const rekapPerKelasData = useMemo(() => {
    const santriInKelas = santriList.filter(
      (s) => s.kelasMadrasah === rekapSelectedKelas || s.kelasFormal === rekapSelectedKelas
    );

    const pos = posPembayaranList.find((p) => p.id === rekapSelectedPos);

    return santriInKelas.map((santri) => {
      const monthStatus: Record<string, { status: StatusTagihan; terbayar: number; sisa: number; tagihanId?: string }> = {};

      DAFTAR_BULAN_HIJRI_MASEHI.forEach((m) => {
        const found = tagihanSantriList.find(
          (t) =>
            t.santriId === santri.id &&
            t.posId === rekapSelectedPos &&
            t.bulan.toLowerCase().includes(m.toLowerCase())
        );

        if (found) {
          monthStatus[m] = {
            status: found.status,
            terbayar: found.terbayar,
            sisa: found.sisa,
            tagihanId: found.id,
          };
        } else {
          monthStatus[m] = { status: 'Menunggak', terbayar: 0, sisa: pos?.tarifDefault || 0 };
        }
      });

      return {
        santri,
        monthStatus,
      };
    });
  }, [santriList, tagihanSantriList, rekapSelectedKelas, rekapSelectedPos, posPembayaranList]);

  // WhatsApp Pengingat Tunggakan Generator
  const generateWhatsAppReminder = (tagihan: TagihanSantri) => {
    const santri = santriList.find((s) => s.id === tagihan.santriId);
    const waliPhone = santri?.teleponWali?.replace(/[^0-9]/g, '') || '';
    const formattedPhone = waliPhone.startsWith('0') ? '62' + waliPhone.slice(1) : waliPhone;

    const pesan = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb.\n\n` +
        `Yth. Bapak/Ibu Wali Santri dari ananda *${tagihan.santriNama}* (${tagihan.kelas}).\n\n` +
        `Kami dari Bendahara ${settings.namaLembaga} menginformasikan tagihan administrasi ananda:\n` +
        `• *Pos Tagihan*: ${tagihan.posNama}\n` +
        `• *Periode*: ${tagihan.bulan !== '-' ? tagihan.bulan : tagihan.tahun}\n` +
        `• *Nominal*: ${formatRupiah(tagihan.nominal)}\n` +
        `• *Sisa Tunggakan*: *${formatRupiah(tagihan.sisa)}*\n` +
        `• *Status*: ${tagihan.status}\n\n` +
        `Pembayaran dapat ditunaikan langsung di kantor bendahara pesantren atau via transfer bank.\n\n` +
        `Jazakumullah Khairan Katsiran.\n` +
        `_Wassalamu'alaikum Wr. Wb._\n` +
        `*Bendahara ${settings.namaLembaga}*`
    );

    window.open(`https://wa.me/${formattedPhone}?text=${pesan}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 transition-all transform animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'success'
              ? 'bg-emerald-800 text-white border-emerald-700'
              : notification.type === 'error'
              ? 'bg-rose-700 text-white border-rose-600'
              : 'bg-stone-800 text-white border-stone-700'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-300 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs shrink-0">
              <Coins className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
                  Administrasi & Keuangan Bendahara
                </h1>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                  Realtime Cloud
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Pengelolaan Syahriah SPP santri, kas operasional pondok, kuitansi digital, dan rekapitulasi keuangan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onSyncKeuanganCloud && (
              <button
                onClick={onSyncKeuanganCloud}
                title="Sinkronisasi ke Database Supabase Cloud"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Supabase</span>
              </button>
            )}

            {userRole === 'admin' && (
              <>
                <button
                  onClick={() => {
                    setKasJenisForm('Masuk');
                    setModalKasOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Kas Masuk</span>
                </button>

                <button
                  onClick={() => {
                    setKasJenisForm('Keluar');
                    setModalKasOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                  <span>Kas Keluar</span>
                </button>

                <button
                  onClick={() => setModalBatchTagihanOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 shadow-xs rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Terbitkan Tagihan</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Segmented Control Navigation */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Ringkasan Keuangan</span>
          </button>

          <button
            onClick={() => setActiveTab('transaksi')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'transaksi'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pembayaran & Tagihan Santri</span>
            <span className="ml-1 text-[10px] py-0.2 px-1.5 rounded-full bg-white/20 text-current">
              {tagihanSantriList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pos_tagihan')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pos_tagihan'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Pos Pembayaran & Tarif</span>
          </button>

          <button
            onClick={() => setActiveTab('kas_operasional')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'kas_operasional'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Buku Kas Operasional</span>
            <span className="ml-1 text-[10px] py-0.2 px-1.5 rounded-full bg-white/20 text-current">
              {kasOperasionalList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('laporan')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'laporan'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Laporan & Rekapitulasi</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: DASHBOARD RINGKASAN BENDAHARA
          ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 4 KPI Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Pemasukan Kas */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Total Kas Masuk</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-serif text-stone-900">
                {formatRupiah(summary.totalKasMasuk)}
              </div>
              <div className="mt-2 text-xs text-stone-500 flex items-center gap-1.5">
                <span>Pembayaran SPP + Infaq Masuk</span>
              </div>
            </div>

            {/* Total Pengeluaran Operasional */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Total Kas Keluar</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-serif text-stone-900">
                {formatRupiah(summary.totalKasKeluar)}
              </div>
              <div className="mt-2 text-xs text-stone-500 flex items-center gap-1.5">
                <span>Gaji ustadz, dapur & sarpras</span>
              </div>
            </div>

            {/* Saldo Kas Riil Tersedia */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Saldo Kas Bersih</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div
                className={`text-2xl font-bold font-serif ${
                  summary.saldoKas >= 0 ? 'text-emerald-800' : 'text-rose-700'
                }`}
              >
                {formatRupiah(summary.saldoKas)}
              </div>
              <div className="mt-2 text-xs text-stone-500 flex items-center gap-1.5">
                <span>Kas tersedia di bendahara</span>
              </div>
            </div>

            {/* Total Tunggakan Santri */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Tunggakan Santri</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-serif text-amber-900">
                {formatRupiah(summary.totalTunggakan)}
              </div>
              <div className="mt-2 text-xs text-stone-500 flex items-center justify-between">
                <span>{summary.nunggakCount + summary.kurangBayarCount} tagihan belum lunas</span>
                <span className="font-semibold text-stone-700">{summary.persentaseLunas}% lunas</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              VISUAL RECHARTS ANALYTICS: PEMASUKAN & PENGELUARAN BULANAN
              ========================================================================= */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-800" />
                  <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                    Analisis Visual Arus Kas &amp; Keuangan Bulanan
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Komparasi dinamis pemasukan kas vs pengeluaran operasional dan komposisi belanja pesantren
                </p>
              </div>

              {/* View Mode Toggle: Batang (Bar) vs Area Tren vs Kombinasi (Composed) */}
              <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setChartViewMode('bar')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    chartViewMode === 'bar'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                  title="Grafik Batang Perbandingan Masuk vs Keluar"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Batang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartViewMode('area')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    chartViewMode === 'area'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                  title="Grafik Area Tren Arus Kas"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Area (Tren)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartViewMode('composed')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    chartViewMode === 'composed'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                  title="Grafik Kombinasi Batang + Garis Surplus"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Kombinasi</span>
                </button>
              </div>
            </div>

            {/* Charts Grid: 2 Columns on Large Screens */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Kolom Kiri (2 cols): Bar / Area / Composed Chart Pemasukan vs Pengeluaran */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700">
                    Arus Kas Masuk vs Kas Keluar (Per Bulan Pembelajaran)
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block" />
                      Kas Masuk
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                      Kas Keluar
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      Surplus Bersih
                    </span>
                  </div>
                </div>

                <div className="w-full h-72 sm:h-80 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartViewMode === 'bar' ? (
                      <BarChart
                        data={monthlyComparisonData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="bulanShort"
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={{ stroke: '#e2e8f0' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(val) =>
                            val >= 1000000
                              ? `${(val / 1000000).toFixed(1)}jt`
                              : val > 0
                              ? `${Math.round(val / 1000)}rb`
                              : '0'
                          }
                        />
                        <Tooltip content={<ChartCustomTooltip />} />
                        <Bar
                          dataKey="pemasukan"
                          name="Kas Masuk"
                          fill="#047857"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={28}
                        />
                        <Bar
                          dataKey="pengeluaran"
                          name="Kas Keluar"
                          fill="#e11d48"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={28}
                        />
                      </BarChart>
                    ) : chartViewMode === 'area' ? (
                      <AreaChart
                        data={monthlyComparisonData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#047857" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="bulanShort"
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={{ stroke: '#e2e8f0' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(val) =>
                            val >= 1000000
                              ? `${(val / 1000000).toFixed(1)}jt`
                              : val > 0
                              ? `${Math.round(val / 1000)}rb`
                              : '0'
                          }
                        />
                        <Tooltip content={<ChartCustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="pemasukan"
                          name="Kas Masuk"
                          stroke="#047857"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorPemasukan)"
                        />
                        <Area
                          type="monotone"
                          dataKey="pengeluaran"
                          name="Kas Keluar"
                          stroke="#e11d48"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorPengeluaran)"
                        />
                      </AreaChart>
                    ) : (
                      <ComposedChart
                        data={monthlyComparisonData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="bulanShort"
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={{ stroke: '#e2e8f0' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(val) =>
                            val >= 1000000
                              ? `${(val / 1000000).toFixed(1)}jt`
                              : val > 0
                              ? `${Math.round(val / 1000)}rb`
                              : '0'
                          }
                        />
                        <Tooltip content={<ChartCustomTooltip />} />
                        <Bar
                          dataKey="pemasukan"
                          name="Kas Masuk"
                          fill="#047857"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={22}
                        />
                        <Bar
                          dataKey="pengeluaran"
                          name="Kas Keluar"
                          fill="#e11d48"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={22}
                        />
                        <Line
                          type="monotone"
                          dataKey="surplus"
                          name="Surplus Bersih"
                          stroke="#d97706"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: '#d97706' }}
                        />
                      </ComposedChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Analytical Mini KPI Ribbon Underneath Chart */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-100">
                  <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/60">
                    <div className="text-[10px] text-stone-500 font-medium">Rata-rata Masuk</div>
                    <div className="text-xs sm:text-sm font-bold font-serif text-emerald-800 mt-0.5">
                      {formatRupiah(monthlyStats.avgPemasukan)}
                      <span className="text-[10px] text-stone-400 font-sans font-normal"> /bln</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/60">
                    <div className="text-[10px] text-stone-500 font-medium">Rata-rata Keluar</div>
                    <div className="text-xs sm:text-sm font-bold font-serif text-rose-700 mt-0.5">
                      {formatRupiah(monthlyStats.avgPengeluaran)}
                      <span className="text-[10px] text-stone-400 font-sans font-normal"> /bln</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/60">
                    <div className="text-[10px] text-stone-500 font-medium">Bulan Puncak Masuk</div>
                    <div className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5 truncate">
                      {monthlyStats.peakMonth.bulan}{' '}
                      <span className="text-[10px] text-emerald-700 font-mono">
                        ({formatRupiah(monthlyStats.peakMonth.pemasukan)})
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/60">
                    <div className="text-[10px] text-stone-500 font-medium">Beban / Pemasukan</div>
                    <div className="text-xs sm:text-sm font-bold font-serif text-amber-800 mt-0.5">
                      {monthlyStats.rasioEfisiensi}%
                      <span className="text-[10px] text-stone-400 font-sans font-normal">
                        {' '}({monthlyStats.rasioEfisiensi <= 100 ? 'Sehat' : 'Defisit'})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan (1 col): Donut Chart with Category vs Payment Method Toggle */}
              <div className="bg-stone-50/70 rounded-xl p-4 border border-stone-200/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 p-0.5 bg-stone-200/70 rounded-lg text-[10px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setDonutViewMode('kategori')}
                        className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                          donutViewMode === 'kategori'
                            ? 'bg-white text-stone-900 shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Beban Kas
                      </button>
                      <button
                        type="button"
                        onClick={() => setDonutViewMode('metode')}
                        className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                          donutViewMode === 'metode'
                            ? 'bg-white text-stone-900 shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Metode Bayar
                      </button>
                    </div>

                    <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                      {donutViewMode === 'kategori' ? 'Operasional' : 'Santri'}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-500 mb-2">
                    {donutViewMode === 'kategori'
                      ? 'Proporsi alokasi belanja kas pesantren'
                      : 'Komparasi penerimaan Tunai vs Transfer bank'}
                  </p>

                  <div className="w-full h-44 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        {donutViewMode === 'kategori' ? (
                          <Pie
                            data={kategoriPengeluaranData}
                            cx="50%"
                            cy="50%"
                            innerRadius={46}
                            outerRadius={68}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {kategoriPengeluaranData.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                        ) : (
                          <Pie
                            data={metodePembayaranData}
                            cx="50%"
                            cy="50%"
                            innerRadius={46}
                            outerRadius={68}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {metodePembayaranData.map((entry, index) => (
                              <Cell key={`cell-metode-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        )}
                        <Tooltip content={<PieCustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Centered Donut Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-stone-400 uppercase font-semibold">Total</span>
                      <span className="text-xs font-serif font-bold text-stone-800">
                        {donutViewMode === 'kategori'
                          ? summary.totalKasKeluar >= 1000000
                            ? `${(summary.totalKasKeluar / 1000000).toFixed(1)} Jt`
                            : formatRupiah(summary.totalKasKeluar)
                          : summary.totalBayarSantri >= 1000000
                          ? `${(summary.totalBayarSantri / 1000000).toFixed(1)} Jt`
                          : formatRupiah(summary.totalBayarSantri)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* List Legend Rinci */}
                <div className="mt-2 space-y-1.5 border-t border-stone-200/80 pt-2.5">
                  {donutViewMode === 'kategori'
                    ? kategoriPengeluaranData.slice(0, 4).map((item, idx) => {
                        const totalKas = summary.totalKasKeluar || 1;
                        const pct = Math.round((item.value / totalKas) * 100);
                        return (
                          <div
                            key={item.name}
                            className="flex items-center justify-between text-[11px] text-stone-600"
                          >
                            <span className="flex items-center gap-1.5 truncate pr-2">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                              />
                              <span className="truncate">{item.name}</span>
                            </span>
                            <span className="font-semibold text-stone-800 shrink-0">
                              {pct}%
                            </span>
                          </div>
                        );
                      })
                    : metodePembayaranData.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between text-[11px] text-stone-600"
                        >
                          <span className="flex items-center gap-1.5 truncate pr-2">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="truncate">{item.name} ({item.count}x)</span>
                          </span>
                          <span className="font-semibold text-stone-800 shrink-0">
                            {item.percentage}% ({formatRupiah(item.value)})
                          </span>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Kelunasan & Quick Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visualisasi Progress Kelunasan */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 mb-1">
                  Status Kelunasan Tagihan Santri
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Rasio pembayaran dari seluruh pos tagihan yang telah diterbitkan
                </p>

                {/* Bar */}
                <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden flex">
                  <div
                    style={{ width: `${summary.persentaseLunas}%` }}
                    className="bg-emerald-700 h-full transition-all duration-500"
                    title={`Lunas: ${summary.persentaseLunas}%`}
                  />
                  <div
                    style={{
                      width: `${
                        summary.totalTagihanCount > 0
                          ? Math.round((summary.kurangBayarCount / summary.totalTagihanCount) * 100)
                          : 0
                      }%`,
                    }}
                    className="bg-amber-500 h-full transition-all duration-500"
                    title="Kurang Bayar"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <div className="text-emerald-800 font-bold text-base">{summary.lunasCount}</div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">Lunas</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                    <div className="text-amber-800 font-bold text-base">{summary.kurangBayarCount}</div>
                    <div className="text-[11px] text-amber-700 mt-0.5">Angsuran</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
                    <div className="text-rose-800 font-bold text-base">{summary.nunggakCount}</div>
                    <div className="text-[11px] text-rose-700 mt-0.5">Menunggak</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-500">Total Tagihan Diterbitkan:</span>
                <span className="text-xs font-bold text-stone-900">{summary.totalTagihanCount} Record</span>
              </div>
            </div>

            {/* Quick Actions & Shortcut */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 mb-1">
                  Aksi Cepat Bendahara
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Pintasan transaksi dan pengoperasian harian kas pesantren
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('transaksi')}
                    className="w-full text-left p-3 rounded-xl border border-stone-200/80 hover:border-emerald-600/50 hover:bg-stone-50 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-stone-900">Catat Pembayaran Santri</div>
                        <div className="text-[11px] text-stone-500">Terima SPP & cetak kuitansi</div>
                      </div>
                    </div>
                    <Check className="w-4 h-4 text-stone-400 group-hover:text-emerald-700" />
                  </button>

                  <button
                    onClick={() => {
                      setKasJenisForm('Keluar');
                      setModalKasOpen(true);
                    }}
                    className="w-full text-left p-3 rounded-xl border border-stone-200/80 hover:border-rose-600/50 hover:bg-stone-50 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center group-hover:bg-rose-700 group-hover:text-white transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-stone-900">Catat Kas Keluar Operasional</div>
                        <div className="text-[11px] text-stone-500">Belanja dapur, listrik & guru</div>
                      </div>
                    </div>
                    <Check className="w-4 h-4 text-stone-400 group-hover:text-rose-600" />
                  </button>

                  <button
                    onClick={() => setActiveTab('laporan')}
                    className="w-full text-left p-3 rounded-xl border border-stone-200/80 hover:border-stone-400 hover:bg-stone-50 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center group-hover:bg-stone-800 group-hover:text-white transition-colors">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-stone-900">Cetak Rekap Keuangan A4</div>
                        <div className="text-[11px] text-stone-500">Rekapitulasi per kelas & arus kas</div>
                      </div>
                    </div>
                    <Check className="w-4 h-4 text-stone-400 group-hover:text-stone-700" />
                  </button>
                </div>
              </div>
            </div>

            {/* Riwayat Pembayaran Terbaru */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Kuitansi Masuk Terakhir
                  </h3>
                  <button
                    onClick={() => setActiveTab('transaksi')}
                    className="text-xs text-emerald-800 font-semibold hover:underline cursor-pointer"
                  >
                    Lihat Semua
                  </button>
                </div>

                <div className="space-y-2.5">
                  {pembayaranList.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPembayaranForKwitansi(p);
                        setModalKwitansiOpen(true);
                      }}
                      className="p-2.5 rounded-xl bg-stone-50/70 border border-stone-100 hover:border-emerald-300 transition-colors flex items-center justify-between cursor-pointer group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-semibold text-stone-900 truncate">
                          {p.santriNama}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {p.posNama} · {p.metodePembayaran}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-emerald-800 font-serif">
                          {formatRupiah(p.nominalBayar)}
                        </div>
                        <div className="text-[10px] text-stone-400">{p.tanggalBayar}</div>
                      </div>
                    </div>
                  ))}

                  {pembayaranList.length === 0 && (
                    <div className="py-8 text-center text-stone-400 text-xs">
                      Belum ada transaksi pembayaran masuk.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 text-center">
                <span className="text-[11px] text-stone-500">
                  Klik kuitansi di atas untuk cetak ulang bukti resmi
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TRANSAKSI & PEMBAYARAN SANTRI
          ========================================================================= */}
      {activeTab === 'transaksi' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama santri / NIS / pos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-stone-50/50"
                />
              </div>

              {/* Filter Kelas */}
              <div>
                <select
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 bg-stone-50/50 text-stone-700"
                >
                  <option value="Semua">Semua Kelas</option>
                  {daftarKelas.map((kls) => (
                    <option key={kls} value={kls}>
                      Kelas {kls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Pos */}
              <div>
                <select
                  value={filterPos}
                  onChange={(e) => setFilterPos(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 bg-stone-50/50 text-stone-700"
                >
                  <option value="Semua">Semua Pos Tagihan</option>
                  {posPembayaranList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Status */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 bg-stone-50/50 text-stone-700"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Kurang Bayar">Kurang Bayar / Angsuran</option>
                  <option value="Menunggak">Menunggak (Belum Bayar)</option>
                </select>
              </div>

              {/* Filter Bulan */}
              <div>
                <select
                  value={filterBulan}
                  onChange={(e) => setFilterBulan(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 bg-stone-50/50 text-stone-700"
                >
                  <option value="Semua">Semua Bulan</option>
                  {DAFTAR_BULAN_HIJRI_MASEHI.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Total Filtered Stats & Export Button */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-stone-500">
                Menampilkan <span className="font-semibold text-stone-800">{filteredTagihan.length}</span> data tagihan santri.
              </div>

              <div className="flex items-center gap-2">
                {userRole === 'admin' && (
                  <button
                    onClick={() => setModalCustomTagihanOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-stone-500" />
                    <span>Tagihan Perorangan</span>
                  </button>
                )}

                <button
                  onClick={handleExportTagihanCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 font-medium cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor Excel/CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table Tagihan Santri */}
          <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50/90 text-stone-600 border-b border-stone-200/80 font-medium">
                  <tr>
                    <th className="py-3 px-4">Santri & NIS</th>
                    <th className="py-3 px-3">Kelas / Kamar</th>
                    <th className="py-3 px-3">Pos & Periode</th>
                    <th className="py-3 px-3 text-right">Nominal</th>
                    <th className="py-3 px-3 text-right">Terbayar</th>
                    <th className="py-3 px-3 text-right">Sisa Tunggakan</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi Transaksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredTagihan.map((t) => {
                    const latestPay = pembayaranList
                      .filter((p) => p.tagihanId === t.id)
                      .slice(-1)[0];

                    return (
                      <tr key={t.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-stone-900">{t.santriNama}</div>
                          <div className="text-[11px] text-stone-400 font-mono mt-0.5">{t.nis}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="text-stone-800 font-medium">{t.kelas}</div>
                          {t.kamar && <div className="text-[11px] text-stone-400">{t.kamar}</div>}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-medium text-stone-800">{t.posNama}</div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {t.bulan !== '-' ? `${t.bulan} (${t.tahun})` : `Biaya Tahunan (${t.tahun})`}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-right font-serif font-medium text-stone-700">
                          {formatRupiah(t.nominal)}
                        </td>

                        <td className="py-3.5 px-3 text-right font-serif font-medium text-emerald-800">
                          {formatRupiah(t.terbayar)}
                        </td>

                        <td className="py-3.5 px-3 text-right font-serif font-bold text-stone-900">
                          {t.sisa > 0 ? (
                            <span className="text-amber-800">{formatRupiah(t.sisa)}</span>
                          ) : (
                            <span className="text-emerald-700">Rp 0</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {t.status === 'Lunas' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Lunas
                            </span>
                          ) : t.status === 'Kurang Bayar' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Kurang Bayar
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Menunggak
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {t.status !== 'Lunas' && (
                              <button
                                onClick={() => handleOpenBayarModal(t)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                                title="Catat pembayaran santri"
                              >
                                <Banknote className="w-3.5 h-3.5 text-amber-300" />
                                <span>Bayar</span>
                              </button>
                            )}

                            {latestPay && (
                              <button
                                onClick={() => {
                                  setSelectedPembayaranForKwitansi(latestPay);
                                  setModalKwitansiOpen(true);
                                }}
                                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
                                title="Cetak Kuitansi Terakhir"
                              >
                                <Printer className="w-3.5 h-3.5 text-stone-600" />
                              </button>
                            )}

                            {t.status !== 'Lunas' && (
                              <button
                                onClick={() => generateWhatsAppReminder(t)}
                                className="p-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 text-emerald-800 transition-colors cursor-pointer"
                                title="Kirim Tagihan via WhatsApp Wali"
                              >
                                <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                              </button>
                            )}

                            {userRole === 'admin' && (
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Hapus tagihan ${t.posNama} untuk ${t.santriNama}? Data yang terhapus tidak dapat dikembalikan.`
                                    )
                                  ) {
                                    onDeleteTagihan(t.id);
                                    showNotification('Tagihan berhasil dihapus.', 'info');
                                  }
                                }}
                                className="p-1.5 rounded-lg border border-stone-200 hover:bg-rose-50 hover:border-rose-200 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Hapus Tagihan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTagihan.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-400">
                        Tidak ada tagihan yang cocok dengan filter yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: MASTER POS PEMBAYARAN & TARIF
          ========================================================================= */}
      {activeTab === 'pos_tagihan' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900">
                Pengaturan Master Pos Pembayaran
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Konfigurasi pos pembayaran bulanan (Syahriah, Makan, Listrik) dan tahunan/bebas (Infaq, Uang Gedung, Kitab).
              </p>
            </div>

            {userRole === 'admin' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingPos(null);
                    setModalPosOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Pos Pembayaran</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posPembayaranList.map((pos) => {
              const tagihanTerkait = tagihanSantriList.filter((t) => t.posId === pos.id);
              const totalNominal = tagihanTerkait.reduce((a, b) => a + b.nominal, 0);
              const totalTerbayar = tagihanTerkait.reduce((a, b) => a + b.terbayar, 0);
              const totalTunggakan = tagihanTerkait.reduce((a, b) => a + b.sisa, 0);

              return (
                <div
                  key={pos.id}
                  className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-600/40 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          pos.tipe === 'bulanan'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                            : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                        }`}
                      >
                        {pos.tipe === 'bulanan' ? 'Bulanan' : 'Tahunan / Infaq'}
                      </span>

                      <span className="text-[11px] text-stone-400">
                        TA {pos.tahunAjaran}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-stone-900">
                      {pos.nama}
                    </h3>

                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {pos.keterangan || 'Tidak ada catatan tambahan untuk pos ini.'}
                    </p>

                    <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                      <span className="text-xs text-stone-500">Tarif Standar:</span>
                      <span className="text-sm font-serif font-bold text-emerald-900">
                        {formatRupiah(pos.tarifDefault)}
                      </span>
                    </div>

                    {/* Progress Keuangan Pos */}
                    <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs">
                      <div className="flex justify-between text-stone-500">
                        <span>Total Diterbitkan:</span>
                        <span className="font-medium text-stone-800">{formatRupiah(totalNominal)}</span>
                      </div>
                      <div className="flex justify-between text-stone-500">
                        <span>Penerimaan Masuk:</span>
                        <span className="font-medium text-emerald-800">{formatRupiah(totalTerbayar)}</span>
                      </div>
                      <div className="flex justify-between text-stone-500">
                        <span>Sisa Tunggakan:</span>
                        <span className="font-medium text-amber-800">{formatRupiah(totalTunggakan)}</span>
                      </div>
                    </div>
                  </div>

                  {userRole === 'admin' && (
                    <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEditingPos(pos);
                          setModalPosOpen(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-emerald-800 font-medium cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Pos</span>
                      </button>

                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Apakah Anda yakin ingin menghapus pos "${pos.nama}"? Tagihan yang terhubung mungkin akan terdampak.`
                            )
                          ) {
                            onDeletePos(pos.id);
                            showNotification(`Pos pembayaran "${pos.nama}" dihapus.`, 'info');
                          }
                        }}
                        className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-rose-600 font-medium cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: BUKU KAS OPERASIONAL PESANTREN
          ========================================================================= */}
      {activeTab === 'kas_operasional' && (
        <div className="space-y-4">
          {/* Top Control Bar */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari transaksi / no bukti / keterangan..."
                  value={searchKas}
                  onChange={(e) => setSearchKas(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 bg-stone-50/50"
                />
              </div>

              {/* Filter Jenis */}
              <div>
                <select
                  value={filterJenisKas}
                  onChange={(e) => setFilterJenisKas(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 bg-stone-50/50 text-stone-700"
                >
                  <option value="Semua">Semua Arus (Masuk & Keluar)</option>
                  <option value="Masuk">Kas Masuk (Pemasukan)</option>
                  <option value="Keluar">Kas Keluar (Pengeluaran)</option>
                </select>
              </div>

              {/* Filter Kategori */}
              <div>
                <select
                  value={filterKategoriKas}
                  onChange={(e) => setFilterKategoriKas(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 bg-stone-50/50 text-stone-700"
                >
                  <option value="Semua">Semua Kategori</option>
                  <optgroup label="Kategori Pemasukan">
                    {KATEGORI_KAS_DEFAULT.pemasukan.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Kategori Pengeluaran">
                    {KATEGORI_KAS_DEFAULT.pengeluaran.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Ekspor Kas */}
              <div className="flex items-center justify-end">
                <button
                  onClick={handleExportKasCsv}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor Buku Kas (CSV)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabel Buku Kas */}
          <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50/90 text-stone-600 border-b border-stone-200/80 font-medium">
                  <tr>
                    <th className="py-3 px-4">Tanggal & No Bukti</th>
                    <th className="py-3 px-3">Jenis Kas</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Uraian / Keterangan</th>
                    <th className="py-3 px-3">Pihak Terkait</th>
                    <th className="py-3 px-3 text-right">Nominal</th>
                    <th className="py-3 px-3 text-center">Metode</th>
                    {userRole === 'admin' && <th className="py-3 px-4 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredKas.map((k) => (
                    <tr key={k.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-stone-800">{k.tanggal}</div>
                        <div className="text-[11px] font-mono text-stone-400 mt-0.5">{k.nomorBukti}</div>
                      </td>

                      <td className="py-3 px-3">
                        {k.jenis === 'Masuk' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                            Kas Masuk
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                            <ArrowUpRight className="w-3 h-3 text-rose-600" />
                            Kas Keluar
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-medium text-stone-700">{k.kategori}</td>

                      <td className="py-3 px-3 text-stone-800 max-w-xs truncate">{k.keterangan}</td>

                      <td className="py-3 px-3 text-stone-600">{k.pihakTerkait || '-'}</td>

                      <td
                        className={`py-3 px-3 text-right font-serif font-bold text-sm ${
                          k.jenis === 'Masuk' ? 'text-emerald-800' : 'text-rose-700'
                        }`}
                      >
                        {k.jenis === 'Masuk' ? '+' : '-'} {formatRupiah(k.nominal)}
                      </td>

                      <td className="py-3 px-3 text-center text-stone-500 font-mono text-[11px]">
                        {k.metode}
                      </td>

                      {userRole === 'admin' && (
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              if (confirm(`Hapus transaksi ${k.nomorBukti} (${k.keterangan})?`)) {
                                onDeleteKas(k.id);
                                showNotification('Transaksi kas berhasil dihapus.', 'info');
                              }
                            }}
                            className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Transaksi Kas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}

                  {filteredKas.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-400">
                        Belum ada pencatatan kas operasional yang sesuai.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: LAPORAN & REKAPITULASI
          ========================================================================= */}
      {activeTab === 'laporan' && (
        <div className="space-y-6">
          {/* Header & Selector */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-stone-900">
                  Rekapitulasi Pembayaran SPP & Tagihan Bulanan Per Kelas
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tabel matriks kontrol kelunasan santri sepanjang 1 tahun ajaran (Juli - Juni).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Select Kelas */}
                <div>
                  <select
                    value={rekapSelectedKelas}
                    onChange={(e) => setRekapSelectedKelas(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 bg-stone-50 text-stone-800 font-medium"
                  >
                    {daftarKelas.map((k) => (
                      <option key={k} value={k}>
                        Kelas {k}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Pos */}
                <div>
                  <select
                    value={rekapSelectedPos}
                    onChange={(e) => setRekapSelectedPos(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 bg-stone-50 text-stone-800 font-medium"
                  >
                    {posPembayaranList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Print Button */}
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-stone-800 hover:bg-stone-900 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>Cetak Lembar Rekap (A4)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Visual Recharts Summary: Progres Kelunasan Kelas Terpilih */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs print:hidden space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-800" />
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900">
                    Visualisasi Penerimaan vs Tunggakan Kelas {rekapSelectedKelas}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Progres kelunasan {posPembayaranList.find((p) => p.id === rekapSelectedPos)?.nama || 'SPP'} per bulan pembelajaran
                  </p>
                </div>
              </div>

              {/* Class Summary Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs flex items-center gap-1.5">
                  <span className="text-emerald-700 font-medium">Terbayar:</span>
                  <span className="font-serif font-bold text-emerald-900">
                    {formatRupiah(rekapBulananKelasChartData.reduce((a, b) => a + b.terbayar, 0))}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-xs flex items-center gap-1.5">
                  <span className="text-amber-700 font-medium">Tunggakan:</span>
                  <span className="font-serif font-bold text-amber-900">
                    {formatRupiah(rekapBulananKelasChartData.reduce((a, b) => a + b.sisa, 0))}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full h-56 pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rekapBulananKelasChartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="bulanShort"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) =>
                      val >= 1000000
                        ? `${(val / 1000000).toFixed(1)}jt`
                        : val > 0
                        ? `${Math.round(val / 1000)}rb`
                        : '0'
                    }
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const tb = payload.find((p: any) => p.dataKey === 'terbayar')?.value || 0;
                        const tg = payload.find((p: any) => p.dataKey === 'sisa')?.value || 0;
                        const tot = Number(tb) + Number(tg);
                        const pct = tot > 0 ? Math.round((Number(tb) / tot) * 100) : 0;
                        return (
                          <div className="bg-stone-900/95 backdrop-blur-xs text-white p-3 rounded-xl shadow-xl border border-stone-700/80 text-xs min-w-[200px]">
                            <div className="flex items-center justify-between border-b border-stone-800 pb-1 mb-1.5 font-bold">
                              <span>Bulan: {label}</span>
                              <span className="text-emerald-400 font-mono">{pct}% Lunas</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-stone-300">
                                <span>Terbayar:</span>
                                <span className="font-bold text-white font-serif">{formatRupiah(Number(tb))}</span>
                              </div>
                              <div className="flex justify-between text-stone-300">
                                <span>Tunggakan:</span>
                                <span className="font-bold text-amber-300 font-serif">{formatRupiah(Number(tg))}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="terbayar"
                    name="Terbayar"
                    fill="#047857"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                  <Bar
                    dataKey="sisa"
                    name="Tunggakan"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Matriks Rekap Pembayaran */}
          <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs print:border-none print:shadow-none">
            {/* Header Dokumen Siap Cetak (Tampil saat Cetak) */}
            <div className="hidden print:block p-6 text-center border-b border-stone-300">
              <div className="flex items-center justify-center gap-4 mb-2">
                {settings.logoUrl && (
                  <img
                    src={settings.logoUrl}
                    alt="Logo Pesantren"
                    className="w-14 h-14 object-contain"
                  />
                )}
                <div>
                  <h1 className="text-xl font-bold font-serif uppercase tracking-wider text-stone-900">
                    {settings.namaLembaga}
                  </h1>
                  <p className="text-xs text-stone-600">{settings.alamatLengkap}</p>
                  <p className="text-xs text-stone-500">
                    Telp: {settings.telepon} | Email: {settings.email}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t-2 border-stone-900">
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  LEMBAR REKAPITULASI PEMBAYARAN KELAS {rekapSelectedKelas}
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Pos: {posPembayaranList.find((p) => p.id === rekapSelectedPos)?.nama} · Tahun Ajaran {rekapTahunAjaran}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-700 border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 min-w-[140px]">Nama Santri</th>
                    <th className="py-2.5 px-2 text-center">NIS</th>
                    {DAFTAR_BULAN_HIJRI_MASEHI.map((bln) => (
                      <th key={bln} className="py-2.5 px-1.5 text-center text-[11px] font-medium">
                        {bln.substring(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rekapPerKelasData.map((item, idx) => (
                    <tr key={item.santri.id} className="hover:bg-stone-50/60">
                      <td className="py-2.5 px-3 text-center text-stone-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-stone-900 truncate">
                        {item.santri.nama}
                      </td>
                      <td className="py-2.5 px-2 text-center text-stone-400 font-mono text-[10px]">
                        {item.santri.nis}
                      </td>
                      {DAFTAR_BULAN_HIJRI_MASEHI.map((bln) => {
                        const statusObj = item.monthStatus[bln];
                        return (
                          <td key={bln} className="py-2 px-1 text-center">
                            {statusObj.status === 'Lunas' ? (
                              <span
                                title={`${bln}: Lunas`}
                                className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold"
                              >
                                ✓
                              </span>
                            ) : statusObj.status === 'Kurang Bayar' ? (
                              <span
                                title={`${bln}: Kurang bayar (${formatRupiah(statusObj.sisa)})`}
                                className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold"
                              >
                                ½
                              </span>
                            ) : (
                              <span
                                title={`${bln}: Belum dibayar`}
                                className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-stone-100 text-stone-400 text-[10px]"
                              >
                                -
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {rekapPerKelasData.length === 0 && (
                    <tr>
                      <td colSpan={15} className="py-12 text-center text-stone-400">
                        Tidak ada data santri yang terdaftar di kelas {rekapSelectedKelas}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Print Signatures */}
            <div className="hidden print:grid grid-cols-2 gap-8 p-8 mt-6 text-center text-xs text-stone-800">
              <div>
                <p>Mengetahui,</p>
                <p className="font-semibold">Pengasuh / Pimpinan Ponpes</p>
                <div className="h-16" />
                <p className="font-bold underline uppercase">{settings.namaPengasuh}</p>
              </div>

              <div>
                <p>Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
                <p className="font-semibold">Bendahara Pesantren</p>
                <div className="h-16" />
                <p className="font-bold underline uppercase">
                  {currentUser.displayName || currentUser.name || 'Bendahara Ponpes'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS SECTION
          ========================================================================= */}

      {/* 1. MODAL BAYAR TAGIHAN */}
      {modalPembayaranOpen && selectedTagihanForPay && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                  <Banknote className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Form Pencatatan Pembayaran Santri
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Penerimaan iuran santri dan pembuatan kuitansi digital
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalPembayaranOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPembayaran} className="mt-4 space-y-3.5 text-xs">
              {/* Detail Santri Card */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">Nama Santri:</span>
                  <span className="font-bold text-stone-900">{selectedTagihanForPay.santriNama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">NIS & Kelas:</span>
                  <span className="text-stone-800 font-medium">
                    {selectedTagihanForPay.nis} · {selectedTagihanForPay.kelas}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Pos & Periode:</span>
                  <span className="text-stone-800 font-medium">
                    {selectedTagihanForPay.posNama} ({selectedTagihanForPay.bulan})
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-stone-200">
                  <span className="text-stone-600 font-semibold">Sisa Tagihan:</span>
                  <span className="text-sm font-bold text-rose-700 font-serif">
                    {formatRupiah(selectedTagihanForPay.sisa)}
                  </span>
                </div>
              </div>

              {/* Nominal Pembayaran */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nominal Dibayar (Rp):
                </label>
                <input
                  type="number"
                  name="nominalBayar"
                  defaultValue={selectedTagihanForPay.sisa}
                  max={selectedTagihanForPay.sisa}
                  min={1000}
                  step={1000}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 font-serif font-bold text-base text-stone-900"
                />
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Maksimal sesuai sisa tagihan: {formatRupiah(selectedTagihanForPay.sisa)}. Bisa diangsur sebagian.
                </p>
              </div>

              {/* Metode Pembayaran & Tanggal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Metode Pembayaran:
                  </label>
                  <select
                    name="metodePembayaran"
                    defaultValue="Tunai"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Tunai">Tunai (Cash Bendahara)</option>
                    <option value="Transfer">Transfer Bank / QRIS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tanggal Pembayaran:
                  </label>
                  <input
                    type="date"
                    name="tanggalBayar"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Penyetor & Catatan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nama Penyetor:
                  </label>
                  <input
                    type="text"
                    name="penyetor"
                    placeholder="Wali Santri / Santri"
                    defaultValue={selectedTagihanForPay.santriNama}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Catatan / Keterangan:
                  </label>
                  <input
                    type="text"
                    name="keterangan"
                    placeholder="Contoh: Lunas via BSI"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Checkbox auto catat ke Kas Operasional Masuk */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 cursor-pointer">
                <input
                  type="checkbox"
                  name="catatKas"
                  defaultChecked={true}
                  className="rounded text-emerald-800 focus:ring-emerald-600 w-4 h-4"
                />
                <span className="text-stone-700 text-[11px]">
                  Otomatis catat pembayaran ini ke dalam <strong>Buku Kas Masuk</strong> operasional
                </span>
              </label>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalPembayaranOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold shadow-xs cursor-pointer"
                >
                  Simpan & Cetak Kuitansi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL KUITANSI DIGITAL RESMI (SIAP CETAK / DOWNLOAD) */}
      {modalKwitansiOpen && selectedPembayaranForKwitansi && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 no-print">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-800" />
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Bukti Pembayaran / Kuitansi Digital
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>Cetak (A4/Kwitansi)</span>
                </button>
                <button
                  onClick={() => setModalKwitansiOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Area Cetak Kwitansi */}
            <div
              id="kwitansi-print-area"
              className="mt-4 p-5 rounded-2xl border-2 border-stone-800 bg-stone-50/50 space-y-4"
            >
              {/* Kop Kuitansi */}
              <div className="flex items-center justify-between border-b-2 border-stone-800 pb-3">
                <div className="flex items-center gap-3">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt="Logo"
                      className="w-12 h-12 object-contain rounded-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-emerald-900 text-amber-300 flex items-center justify-center font-bold text-lg">
                      RH
                    </div>
                  )}
                  <div>
                    <h2 className="font-serif font-bold text-sm text-stone-900 tracking-tight uppercase">
                      {settings.namaLembaga}
                    </h2>
                    <p className="text-[10px] text-stone-500 leading-tight">
                      {settings.alamatLengkap}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      Telp: {settings.telepon}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                    BUKTI PEMBAYARAN
                  </div>
                  <div className="text-xs font-mono font-bold text-stone-900">
                    {selectedPembayaranForKwitansi.nomorTransaksi}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    {selectedPembayaranForKwitansi.tanggalBayar}
                  </div>
                </div>
              </div>

              {/* Rincian Kwitansi */}
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-4 gap-2">
                  <span className="text-stone-500">Telah Terima Dari:</span>
                  <span className="col-span-3 font-bold text-stone-900">
                    {selectedPembayaranForKwitansi.penyetor || selectedPembayaranForKwitansi.santriNama}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <span className="text-stone-500">Nama Santri (NIS):</span>
                  <span className="col-span-3 font-semibold text-stone-800">
                    {selectedPembayaranForKwitansi.santriNama} ({selectedPembayaranForKwitansi.nis}) · Kelas {selectedPembayaranForKwitansi.kelas}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <span className="text-stone-500">Guna Membayar:</span>
                  <span className="col-span-3 text-stone-800">
                    {selectedPembayaranForKwitansi.posNama}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <span className="text-stone-500">Metode Bayar:</span>
                  <span className="col-span-3 font-mono text-stone-700">
                    {selectedPembayaranForKwitansi.metodePembayaran}
                  </span>
                </div>

                {/* Terbilang Huruf */}
                <div className="p-3 bg-stone-100 rounded-xl border border-stone-200/80 mt-2">
                  <div className="text-[10px] text-stone-500 uppercase font-semibold">
                    Terbilang:
                  </div>
                  <div className="text-xs font-serif italic font-semibold text-stone-800">
                    "{terbilang(selectedPembayaranForKwitansi.nominalBayar)}"
                  </div>
                </div>
              </div>

              {/* Nominal & Tanda Tangan */}
              <div className="pt-2 flex items-end justify-between">
                <div>
                  <div className="text-[10px] text-stone-400 font-bold uppercase">Jumlah Tunai/Transfer:</div>
                  <div className="text-xl font-serif font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-lg border border-stone-200 inline-block mt-0.5">
                    {formatRupiah(selectedPembayaranForKwitansi.nominalBayar)}
                  </div>
                </div>

                <div className="text-center w-36">
                  {/* Stempel Lunas */}
                  <div className="inline-block px-2 py-0.5 mb-1 rounded-sm border-2 border-emerald-700 text-emerald-800 font-bold text-[10px] tracking-widest uppercase transform -rotate-3">
                    LUNAS
                  </div>
                  <div className="text-[10px] text-stone-400">Penerima / Bendahara,</div>
                  <div className="h-8" />
                  <div className="text-xs font-semibold text-stone-800 border-t border-stone-300 pt-0.5">
                    {selectedPembayaranForKwitansi.petugas}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-[11px] text-stone-400 no-print">
              Kuitansi sah yang diterbitkan secara digital oleh sistem administrasi pesantren.
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL POS PEMBAYARAN (TAMBAH / EDIT) */}
      {modalPosOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-base text-stone-900">
                {editingPos ? 'Edit Pos Pembayaran' : 'Tambah Pos Pembayaran Baru'}
              </h3>
              <button
                onClick={() => setModalPosOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPos} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Pos Pembayaran:
                </label>
                <input
                  type="text"
                  name="nama"
                  placeholder="Contoh: Syahriah SPP / Uang Makan / Wakaf"
                  defaultValue={editingPos?.nama || ''}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tipe Pembayaran:
                  </label>
                  <select
                    name="tipe"
                    defaultValue={editingPos?.tipe || 'bulanan'}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="bulanan">Bulanan (SPP, Makan, dll)</option>
                    <option value="tahunan">Tahunan / Infaq (Pangkal, Gedung)</option>
                    <option value="bebas">Bebas / Fleksibel</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tahun Ajaran:
                  </label>
                  <input
                    type="text"
                    name="tahunAjaran"
                    defaultValue={editingPos?.tahunAjaran || '2024/2025'}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tarif Standar Default (Rp):
                </label>
                <input
                  type="number"
                  name="tarifDefault"
                  defaultValue={editingPos?.tarifDefault || 350000}
                  step={5000}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 font-serif font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Keterangan Pos:
                </label>
                <textarea
                  name="keterangan"
                  rows={2}
                  defaultValue={editingPos?.keterangan || ''}
                  placeholder="Rincian peruntukan pos pembayaran ini..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalPosOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold cursor-pointer"
                >
                  Simpan Pos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL GENERATE TAGIHAN MASSAL PER KELAS */}
      {modalBatchTagihanOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-800" />
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Penetapan Tagihan Massal Per Kelas
                </h3>
              </div>
              <button
                onClick={() => setModalBatchTagihanOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateBatchTagihan} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Pilih Pos Pembayaran:
                </label>
                <select
                  name="posId"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 text-stone-800 font-medium"
                >
                  {posPembayaranList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama} ({p.tipe === 'bulanan' ? 'Bulanan' : 'Tahunan'}) - Default: {formatRupiah(p.tarifDefault)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Kelas Target Santri:
                  </label>
                  <select
                    name="targetKelas"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Semua">Semua Santri (Semua Kelas)</option>
                    {daftarKelas.map((k) => (
                      <option key={k} value={k}>
                        Kelas {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tahun Ajaran:
                  </label>
                  <input
                    type="text"
                    name="tahunAjaran"
                    defaultValue="2024/2025"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nominal Tagihan (Rp):
                  </label>
                  <input
                    type="number"
                    name="nominal"
                    defaultValue={350000}
                    step={5000}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 font-serif font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Batas Jatuh Tempo:
                  </label>
                  <input
                    type="date"
                    name="jatuhTempo"
                    defaultValue="2024-10-10"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Pilihan Bulan untuk Pos Bulanan */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Pilih Bulan Tagihan (Untuk Iuran Bulanan):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 p-3 rounded-xl bg-stone-50 border border-stone-200">
                  {DAFTAR_BULAN_HIJRI_MASEHI.map((b) => (
                    <label
                      key={b}
                      className="flex items-center gap-1.5 p-1 rounded hover:bg-white text-[11px] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name="selectedBulan"
                        value={b}
                        defaultChecked={b === 'Oktober'}
                        className="rounded text-emerald-800 focus:ring-emerald-600"
                      />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  * Sistem otomatis mencegah duplikasi tagihan santri untuk periode yang sama.
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalBatchTagihanOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Terbitkan Tagihan Serentak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL TAGIHAN PERORANGAN */}
      {modalCustomTagihanOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-base text-stone-900">
                Buat Tagihan Khusus Perorangan
              </h3>
              <button
                onClick={() => setModalCustomTagihanOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCustomTagihan} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Pilih Santri:
                </label>
                <select
                  name="santriId"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 text-stone-800 font-medium"
                >
                  {santriList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nis}) - Kelas {s.kelasMadrasah || s.kelasFormal}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Pos Pembayaran:
                </label>
                <select
                  name="posId"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 text-stone-800 font-medium"
                >
                  {posPembayaranList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama} ({p.tipe})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Bulan Tagihan:
                  </label>
                  <select
                    name="bulan"
                    defaultValue="Oktober 2024"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                  >
                    {DAFTAR_BULAN_HIJRI_MASEHI.map((b) => (
                      <option key={b} value={`${b} 2024`}>
                        {b} 2024
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tahun Ajaran:
                  </label>
                  <input
                    type="text"
                    name="tahunAjaran"
                    defaultValue="2024/2025"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nominal Tagihan (Rp):
                  </label>
                  <input
                    type="number"
                    name="nominal"
                    defaultValue={350000}
                    step={1000}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 font-serif font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Batas Jatuh Tempo:
                  </label>
                  <input
                    type="date"
                    name="jatuhTempo"
                    defaultValue="2024-10-10"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Catatan Tambahan:
                </label>
                <input
                  type="text"
                  name="catatan"
                  placeholder="Contoh: Keringanan khusus / Beasiswa"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalCustomTagihanOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Simpan Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL CATAT KAS OPERASIONAL (MASUK / KELUAR) */}
      {modalKasOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                    kasJenisForm === 'Masuk' ? 'bg-emerald-800' : 'bg-rose-700'
                  }`}
                >
                  {kasJenisForm === 'Masuk' ? (
                    <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-rose-200" />
                  )}
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Catat Kas Operasional {kasJenisForm === 'Masuk' ? 'Masuk' : 'Keluar'}
                </h3>
              </div>
              <button
                onClick={() => setModalKasOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitKas} className="mt-4 space-y-3.5 text-xs">
              {/* Jenis Kas Toggle */}
              <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setKasJenisForm('Masuk')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    kasJenisForm === 'Masuk'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Kas Masuk (Pemasukan)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setKasJenisForm('Keluar')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    kasJenisForm === 'Keluar'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Kas Keluar (Pengeluaran)</span>
                </button>
              </div>

              {/* Kategori */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Pilih Kategori:
                </label>
                <select
                  name="kategori"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 text-stone-800 font-medium"
                >
                  {(kasJenisForm === 'Masuk'
                    ? KATEGORI_KAS_DEFAULT.pemasukan
                    : KATEGORI_KAS_DEFAULT.pengeluaran
                  ).map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Kategori (Opsional) */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Atau Buat Kategori Baru (Opsional):
                </label>
                <input
                  type="text"
                  name="customKategori"
                  placeholder="Ketik kategori baru bila tidak ada di daftar..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Nominal & Tanggal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nominal Transaksi (Rp):
                  </label>
                  <input
                    type="number"
                    name="nominal"
                    placeholder="Contoh: 1500000"
                    step={1000}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600 font-serif font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tanggal Transaksi:
                  </label>
                  <input
                    type="date"
                    name="tanggal"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Pihak Terkait & Metode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {kasJenisForm === 'Masuk' ? 'Pihak Penyetor / Donatur:' : 'Penerima Pembayaran / Toko:'}
                  </label>
                  <input
                    type="text"
                    name="pihakTerkait"
                    placeholder={kasJenisForm === 'Masuk' ? 'Contoh: Hamba Allah / Alumni' : 'Contoh: Toko Beras / PLN'}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Metode Transaksi:
                  </label>
                  <select
                    name="metode"
                    defaultValue="Tunai"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Tunai">Tunai (Kas Fisik)</option>
                    <option value="Transfer">Transfer Bank / QRIS</option>
                  </select>
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Uraian / Keterangan Keperluan:
                </label>
                <textarea
                  name="keterangan"
                  rows={2}
                  required
                  placeholder="Rincian lengkap transaksi ini..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalKasOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-semibold text-white shadow-xs cursor-pointer ${
                    kasJenisForm === 'Masuk'
                      ? 'bg-emerald-800 hover:bg-emerald-900'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  Simpan Transaksi Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
