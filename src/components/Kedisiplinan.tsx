import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Plus,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { PelanggaranTakzir, Santri, UserRole } from '../types';

interface KedisiplinanProps {
  pelanggaranList: PelanggaranTakzir[];
  santriList: Santri[];
  onAddPelanggaran: (item: PelanggaranTakzir) => void;
  onUpdateStatusTakzir: (
    id: string,
    status: 'Belum Dilaksanakan' | 'Sedang Proses' | 'Selesai'
  ) => void;
  userRole: UserRole;
  userName: string;
  onNavigateToLaporan: () => void;
}

export const Kedisiplinan: React.FC<KedisiplinanProps> = ({
  pelanggaranList,
  santriList,
  onAddPelanggaran,
  onUpdateStatusTakzir,
  userRole,
  userName,
  onNavigateToLaporan,
}) => {
  const [filterTingkat, setFilterTingkat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [santriId, setSantriId] = useState(santriList[0]?.id || '');
  const [tingkat, setTingkat] = useState<'Ringan' | 'Sedang' | 'Berat'>('Sedang');
  const [kategori, setKategori] = useState('Pelanggaran Kedisiplinan Asrama');
  const [tanggalKejadian, setTanggalKejadian] = useState('2026-10-07');
  const [keterangan, setKeterangan] = useState('');
  const [poin, setPoin] = useState(15);
  const [bentukTakzir, setBentukTakzir] = useState(
    "Setor hafalan Surat Al-Waqi'ah & piket selasar 3 hari"
  );
  const [statusTakzir, setStatusTakzir] = useState<
    'Belum Dilaksanakan' | 'Sedang Proses' | 'Selesai'
  >('Belum Dilaksanakan');

  const handleTingkatChange = (val: 'Ringan' | 'Sedang' | 'Berat') => {
    setTingkat(val);
    if (val === 'Ringan') {
      setPoin(5);
      setBentukTakzir('Membaca Al-Qur&apos;an 1 Juz ba&apos;da sholat Subuh');
    } else if (val === 'Sedang') {
      setPoin(15);
      setBentukTakzir("Setor hafalan Surat Al-Waqi'ah & piket selasar 3 hari");
    } else {
      setPoin(25);
      setBentukTakzir(
        "Membaca Al-Qur'an 3 Juz di depan Pengasuh & pembersihan maktabah"
      );
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const santriObj = santriList.find((s) => s.id === santriId);
    if (!santriObj || !keterangan) return;

    onAddPelanggaran({
      id: `plg_${Date.now()}`,
      santriId: santriObj.id,
      namaSantri: santriObj.nama,
      kamar: santriObj.kamar,
      tingkat,
      kategori,
      tanggalKejadian,
      keterangan,
      poin,
      bentukTakzir,
      statusTakzir,
      pencatat: userName || 'Biro Keamanan Santri',
      diselesaikanPada: statusTakzir === 'Selesai' ? tanggalKejadian : undefined,
    });

    setShowAddForm(false);
    setKeterangan('');
  };

  const filteredList = pelanggaranList.filter((item) => {
    if (filterTingkat !== 'all' && item.tingkat !== filterTingkat) return false;
    if (filterStatus !== 'all' && item.statusTakzir !== filterStatus) return false;
    if (
      searchQuery &&
      !item.namaSantri.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.keterangan.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getTingkatBadge = (t: string) => {
    switch (t) {
      case 'Ringan':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Sedang':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Berat':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Sedang Proses':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-700" />
            <span>Kedisiplinan, Buku Pelanggaran &amp; Takzir Edukatif</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Pencatatan pelanggaran tata tertib asrama, pembobotan poin disiplin, dan pemberian takzir edukatif pembinaan karakter
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToLaporan}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
            <span>Cetak Rekap Disiplin</span>
          </button>

          {userRole !== 'wali' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>{showAddForm ? 'Tutup Formulir' : 'Catat Pelanggaran'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Form Input Pelanggaran */}
      {showAddForm && (
        <div className="bg-white p-5 rounded-2xl border border-rose-300 shadow-md animate-in fade-in">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
            <h3 className="font-bold text-sm text-rose-950 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-700" />
              <span>Catat Pelanggaran &amp; Takzir Baru</span>
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Pilih Santri:
                </label>
                <select
                  value={santriId}
                  onChange={(e) => setSantriId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                >
                  {santriList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.kamar})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Tingkat Pelanggaran:
                </label>
                <select
                  value={tingkat}
                  onChange={(e) => handleTingkatChange(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                >
                  <option value="Ringan">Ringan (5 Poin)</option>
                  <option value="Sedang">Sedang (15 Poin)</option>
                  <option value="Berat">Berat (25 Poin)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Tanggal Kejadian:
                </label>
                <input
                  type="date"
                  value={tanggalKejadian}
                  onChange={(e) => setTanggalKejadian(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Kategori Pelanggaran:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kedisiplinan Ibadah / HP / Piket"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Poin Penalti Pelanggaran:
                </label>
                <input
                  type="number"
                  value={poin}
                  onChange={(e) => setPoin(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-600 mb-1">
                Keterangan Kronologi Kejadian:
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Terlambat mengikuti halaqoh ngaji asar tanpa udzur syar'i..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Bentuk Takzir Edukatif:
                </label>
                <input
                  type="text"
                  value={bentukTakzir}
                  onChange={(e) => setBentukTakzir(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Status Pelaksanaan Takzir:
                </label>
                <select
                  value={statusTakzir}
                  onChange={(e) => setStatusTakzir(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                >
                  <option value="Belum Dilaksanakan">Belum Dilaksanakan</option>
                  <option value="Sedang Proses">Sedang Proses</option>
                  <option value="Selesai">Selesai (Sudah Tuntas)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="submit"
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Simpan Catatan Pelanggaran &amp; Takzir</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
            Filter Tingkat:
          </label>
          <select
            value={filterTingkat}
            onChange={(e) => setFilterTingkat(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600"
          >
            <option value="all">Semua Tingkat (Ringan, Sedang, Berat)</option>
            <option value="Ringan">Ringan</option>
            <option value="Sedang">Sedang</option>
            <option value="Berat">Berat</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
            Filter Status Takzir:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600"
          >
            <option value="all">Semua Status Takzir</option>
            <option value="Belum Dilaksanakan">Belum Dilaksanakan</option>
            <option value="Sedang Proses">Sedang Proses</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
            Pencarian Santri / Kasus:
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama atau kronologi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-600 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Santri &amp; Tanggal</th>
                <th className="py-3 px-4">Tingkat &amp; Poin</th>
                <th className="py-3 px-4">Kronologi &amp; Keterangan</th>
                <th className="py-3 px-4">Bentuk Takzir Edukatif</th>
                <th className="py-3 px-4 text-center">Status Takzir</th>
                <th className="py-3 px-4 text-center w-32">Aksi Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/70 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-stone-800 text-sm">{item.namaSantri}</div>
                    <div className="text-[11px] text-stone-500">{item.kamar}</div>
                    <div className="text-[10px] font-mono text-stone-400 mt-0.5">
                      📅 {item.tanggalKejadian}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getTingkatBadge(
                        item.tingkat
                      )}`}
                    >
                      {item.tingkat}
                    </span>
                    <div className="font-bold text-rose-600 text-xs mt-1">
                      +{item.poin} Poin
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-stone-800">{item.kategori}</div>
                    <p className="text-stone-600 text-xs mt-0.5 max-w-md">{item.keterangan}</p>
                    <div className="text-[10px] text-stone-400 mt-1">
                      Pencatat: {item.pencatat}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-200 text-stone-800 font-medium">
                      {item.bentukTakzir}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                        item.statusTakzir
                      )}`}
                    >
                      {item.statusTakzir}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    {userRole === 'wali' ? (
                      <span className="text-stone-400 text-[11px]">-</span>
                    ) : (
                      <div className="flex flex-col gap-1 items-center">
                        {item.statusTakzir === 'Selesai' ? (
                          <span className="text-emerald-700 font-semibold text-[11px]">
                            ✓ Tuntas
                          </span>
                        ) : (
                          <button
                            onClick={() => onUpdateStatusTakzir(item.id, 'Selesai')}
                            className="w-full px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 rounded-lg text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                            title="Tandai Takzir Telah Tuntas"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>Set Selesai</span>
                          </button>
                        )}
                        {item.statusTakzir === 'Belum Dilaksanakan' && (
                          <button
                            onClick={() => onUpdateStatusTakzir(item.id, 'Sedang Proses')}
                            className="w-full px-2 py-0.5 text-stone-600 hover:bg-stone-100 rounded text-[10px] cursor-pointer"
                          >
                            Set Proses
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
