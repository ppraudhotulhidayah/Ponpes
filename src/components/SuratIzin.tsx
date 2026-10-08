import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Printer,
  CheckCircle2,
  X,
  AlertTriangle,
  QrCode,
  Calendar,
} from 'lucide-react';
import {
  SuratIzinPulang,
  Santri,
  UserRole,
  PesantrenSettings,
} from '../types';

interface SuratIzinProps {
  suratIzinList: SuratIzinPulang[];
  santriList: Santri[];
  onAddSuratIzin: (item: SuratIzinPulang) => void;
  onUpdateStatusSurat: (
    id: string,
    status: 'Sedang Di Luar' | 'Terlambat' | 'Sudah Kembali'
  ) => void;
  userRole: UserRole;
  userName: string;
  settings: PesantrenSettings;
}

export const SuratIzin: React.FC<SuratIzinProps> = ({
  suratIzinList,
  santriList,
  onAddSuratIzin,
  onUpdateStatusSurat,
  userRole,
  userName,
  settings,
}) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [printDocument, setPrintDocument] = useState<SuratIzinPulang | null>(null);

  // Form State
  const [selectedSantriId, setSelectedSantriId] = useState(santriList[0]?.id || '');
  const [alasanPulang, setAlasanPulang] = useState('');
  const [tanggalPergi, setTanggalPergi] = useState('2026-10-07');
  const [tanggalKembali, setTanggalKembali] = useState('2026-10-10');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [teleponPJ, setTeleponPJ] = useState('');
  const [alamatTujuan, setAlamatTujuan] = useState('');
  const [catatan, setCatatan] = useState(
    'Wajib kembali sebelum adzan Maghrib dan menyetorkan hafalan Al-Qur&apos;an'
  );

  const selectedSantriObj = santriList.find((s) => s.id === selectedSantriId);

  const handleSelectSantriChange = (id: string) => {
    setSelectedSantriId(id);
    const s = santriList.find((item) => item.id === id);
    if (s) {
      setPenanggungJawab(s.namaWali);
      setTeleponPJ(s.teleponWali);
      setAlamatTujuan(s.alamat);
    }
  };

  const handleCreateSurat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantriObj || !alasanPulang) return;

    const romanMonth = 'X';
    const num = String(suratIzinList.length + 40).padStart(3, '0');
    const nomorSurat = `${num}/SIP/PPRH/${romanMonth}/2026`;

    const newSurat: SuratIzinPulang = {
      id: `sip_${Date.now()}`,
      nomorSurat,
      santriId: selectedSantriObj.id,
      namaSantri: selectedSantriObj.nama,
      nis: selectedSantriObj.nis,
      kamar: selectedSantriObj.kamar,
      alasanPulang,
      tanggalPergi,
      tanggalKembali,
      penanggungJawab: penanggungJawab || selectedSantriObj.namaWali,
      teleponPenanggungJawab: teleponPJ || selectedSantriObj.teleponWali,
      alamatTujuan: alamatTujuan || selectedSantriObj.alamat,
      statusKepulangan: 'Sedang Di Luar',
      petugasPemberiIzin: userName || 'Biro Keamanan Pondok',
      catatan,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    onAddSuratIzin(newSurat);
    setShowAddForm(false);
    setAlasanPulang('');
  };

  const filteredList = suratIzinList.filter((item) => {
    if (filterStatus !== 'all' && item.statusKepulangan !== filterStatus) return false;
    if (
      searchQuery &&
      !item.namaSantri.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-800" />
            <span>Penerbitan &amp; Pelacakan Surat Izin Pulang Santri</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Pengelolaan surat jalan resmi, verifikasi batas waktu kembali ke asrama, dan cetak format legalitas A4
          </p>
        </div>

        {userRole !== 'wali' && (
          <button
            onClick={() => {
              if (!showAddForm && selectedSantriObj) {
                setPenanggungJawab(selectedSantriObj.namaWali);
                setTeleponPJ(selectedSantriObj.teleponWali);
                setAlamatTujuan(selectedSantriObj.alamat);
              }
              setShowAddForm(!showAddForm);
            }}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>{showAddForm ? 'Tutup Formulir' : 'Terbitkan Surat Izin'}</span>
          </button>
        )}
      </div>

      {/* Form Terbitkan Surat Izin */}
      {showAddForm && (
        <div className="bg-white p-5 rounded-2xl border border-emerald-300 shadow-md animate-in fade-in">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
            <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Formulir Penerbitan Surat Jalan Santri Baru</span>
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateSurat} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Pilih Santri:
                </label>
                <select
                  value={selectedSantriId}
                  onChange={(e) => handleSelectSantriChange(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                >
                  {santriList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nis} - {s.kamar})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Tanggal Berangkat:
                </label>
                <input
                  type="date"
                  value={tanggalPergi}
                  onChange={(e) => setTanggalPergi(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Wajib Kembali (Batas Akhir):
                </label>
                <input
                  type="date"
                  value={tanggalKembali}
                  onChange={(e) => setTanggalKembali(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-rose-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Alasan Kepulangan / Hajat:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Menghadiri pernikahan kakak kandung / Udzur sakit..."
                  value={alasanPulang}
                  onChange={(e) => setAlasanPulang(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Nama Penanggung Jawab / Wali Penjemput:
                </label>
                <input
                  type="text"
                  placeholder="Nama orang tua atau wali..."
                  value={penanggungJawab}
                  onChange={(e) => setPenanggungJawab(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  No. Telepon / WhatsApp Wali:
                </label>
                <input
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  value={teleponPJ}
                  onChange={(e) => setTeleponPJ(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Alamat Tujuan Kepulangan:
                </label>
                <input
                  type="text"
                  placeholder="Alamat rumah tempat santri tinggal..."
                  value={alamatTujuan}
                  onChange={(e) => setAlamatTujuan(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-600 mb-1">
                Catatan / Mandat Khusus dari Pengasuh:
              </label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-600 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold cursor-pointer"
              >
                Terbitkan &amp; Simpan Surat
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-medium px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600"
            >
              <option value="all">Semua Status Kepulangan</option>
              <option value="Sedang Di Luar">Sedang Di Luar Pondok</option>
              <option value="Terlambat">Terlambat Kembali</option>
              <option value="Sudah Kembali">Sudah Kembali ke Asrama</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama santri atau no surat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600 w-60"
            />
          </div>
        </div>
      </div>

      {/* Table of Permits */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-600 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Nomor Surat &amp; Santri</th>
                <th className="py-3 px-4">Alasan &amp; Alamat Tujuan</th>
                <th className="py-3 px-4">Masa Izin (Pergi - Kembali)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-36">Aksi &amp; Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredList.map((item) => {
                const statusBadge =
                  item.statusKepulangan === 'Sedang Di Luar'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : item.statusKepulangan === 'Terlambat'
                      ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300';

                return (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono text-emerald-900 font-bold">
                        {item.nomorSurat}
                      </div>
                      <div className="font-bold text-stone-800 text-sm mt-0.5">
                        {item.namaSantri}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {item.nis} • {item.kamar}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-stone-800">{item.alasanPulang}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        Tujuan: {item.alamatTujuan}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        PJ: {item.penanggungJawab} ({item.teleponPenanggungJawab})
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-stone-800">
                        Pergi: <span className="font-mono">{item.tanggalPergi}</span>
                      </div>
                      <div className="font-bold text-rose-700 mt-0.5">
                        Wajib Kembali: <span className="font-mono">{item.tanggalKembali}</span>
                      </div>
                      {item.tanggalRealisasiKembali && (
                        <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                          Tiba: {item.tanggalRealisasiKembali}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadge}`}
                      >
                        {item.statusKepulangan}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <button
                          onClick={() => setPrintDocument(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1 transition cursor-pointer text-xs"
                          title="Cetak Surat Izin Resmi"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Cetak A4</span>
                        </button>

                        {userRole === 'admin' &&
                          item.statusKepulangan !== 'Sudah Kembali' && (
                            <button
                              onClick={() => onUpdateStatusSurat(item.id, 'Sudah Kembali')}
                              className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px] cursor-pointer"
                              title="Tandai Santri Sudah Tiba di Pondok"
                            >
                              Konfirmasi Kembali
                            </button>
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

      {/* PRINT OFFICIAL PERMIT MODAL */}
      {printDocument && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in max-h-[95vh] overflow-y-auto">
            {/* Action Bar (Hidden on print) */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200 no-print">
              <span className="font-bold text-sm text-stone-700">
                Pratinjau Dokumen Resmi Surat Jalan / Izin Pulang
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>Cetak Dokumen (A4)</span>
                </button>
                <button
                  onClick={() => setPrintDocument(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Printable Sheet */}
            <div className="p-6 border border-stone-300 bg-white text-stone-900 rounded-xl shadow-xs print-page">
              {/* Kop Surat */}
              <div className="border-b-2 border-stone-900 pb-3 mb-4 text-center relative">
                {settings?.logoUrl && (
                  <div className="absolute left-0 top-0 w-16 h-16 flex items-center justify-center">
                    <img
                      src={settings.logoUrl}
                      alt="Logo Lembaga"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <div className="text-xs uppercase tracking-widest font-semibold text-stone-600">
                  {settings?.subNamaTagline || 'Yayasan Pendidikan & Pondok Pesantren'}
                </div>
                <h1 className="text-xl font-bold tracking-wide uppercase text-stone-900 mt-0.5">
                  {settings?.namaLembaga || 'Pondok Pesantren Raudhotu Hidayah'}
                </h1>
                <p className="text-[11px] text-stone-600 italic">
                  {settings?.alamatLengkap || 'Jl. Pesantren No. 14, Ciamis, Jawa Barat'} • Telp:{' '}
                  {settings?.telepon || '(0265) 778899'} • Email:{' '}
                  {settings?.email || 'info@raudhotulhidayah.ponpes.id'}
                </p>
                <div className="w-full h-0.5 bg-stone-900 mt-2" />
                <div className="w-full h-px bg-stone-400 mt-0.5" />
              </div>

              {/* Title & Nomor */}
              <div className="text-center mb-5">
                <h2 className="text-sm font-bold uppercase underline tracking-wider">
                  SURAT IZIN PULANG / JALAN SANTRI
                </h2>
                <p className="text-xs font-mono font-medium mt-0.5">
                  Nomor: {printDocument.nomorSurat}
                </p>
              </div>

              {/* Opening */}
              <p className="text-xs leading-relaxed text-justify mb-3">
                Biro Kepengasuhan dan Keamanan Santri{' '}
                {settings?.namaLembaga || 'Pondok Pesantren Raudhotu Hidayah'} dengan ini
                memberikan izin kepada santri yang bersangkutan di bawah ini:
              </p>

              {/* Data Santri */}
              <div className="space-y-1.5 text-xs bg-stone-50 p-3 rounded-lg border border-stone-200 mb-4">
                <div className="grid grid-cols-12">
                  <span className="col-span-4 font-semibold">Nama Santri</span>
                  <span className="col-span-8">: <strong>{printDocument.namaSantri}</strong></span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-4 font-semibold">Nomor Induk Santri (NIS)</span>
                  <span className="col-span-8">: {printDocument.nis}</span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-4 font-semibold">Rayon / Kamar Asrama</span>
                  <span className="col-span-8">: {printDocument.kamar}</span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-4 font-semibold">Penanggung Jawab / Wali</span>
                  <span className="col-span-8">
                    : {printDocument.penanggungJawab} ({printDocument.teleponPenanggungJawab})
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-4 font-semibold">Alamat Tujuan</span>
                  <span className="col-span-8">: {printDocument.alamatTujuan}</span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-4 font-semibold">Alasan Kepulangan</span>
                  <span className="col-span-8">: {printDocument.alasanPulang}</span>
                </div>
              </div>

              {/* Jadwal Perizinan Box */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs mb-4">
                <div className="font-bold text-amber-950 mb-1">Jadwal Perizinan:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-stone-500">Tanggal Keberangkatan:</span>
                    <div className="font-bold text-stone-900">{printDocument.tanggalPergi}</div>
                  </div>
                  <div>
                    <span className="text-stone-500">Wajib Kembali ke Pesantren:</span>
                    <div className="font-bold text-stone-900">
                      {printDocument.tanggalKembali} (Maks. 17:00 WIB)
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-amber-900 italic">
                  *Catatan Pengasuh: {printDocument.catatan || 'Wajib menuntaskan kewajiban setoran hafalan.'}
                </div>
              </div>

              {/* Ketentuan */}
              <div className="text-[11px] text-stone-600 mb-6 space-y-1">
                <p className="font-bold text-stone-800">
                  Ketentuan Santri Selama di Luar Pondok:
                </p>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>Menjaga nama baik dan akhlak karimah Pondok Pesantren Raudhotu Hidayah.</li>
                  <li>Melaksanakan sholat 5 waktu secara berjamaah tepat waktu.</li>
                  <li>Kembali ke pondok tepat pada tanggal yang telah ditentukan tanpa keterlambatan.</li>
                  <li>Membawa kembali surat ini dengan ditandatangani oleh orang tua/wali santri.</li>
                </ol>
              </div>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-3 text-center text-xs gap-4 pt-4 border-t border-stone-200">
                <div>
                  <p className="text-stone-500">Wali / Penanggung Jawab,</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-stone-300 italic text-[10px]">(Tanda Tangan)</span>
                  </div>
                  <p className="font-bold underline text-stone-900">
                    {printDocument.penanggungJawab}
                  </p>
                </div>

                <div>
                  <p className="text-stone-500">Biro Keamanan Santri,</p>
                  <div className="h-16 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border border-stone-400 rounded flex items-center justify-center text-[9px] text-stone-400 font-mono">
                      STEMPEL
                    </div>
                  </div>
                  <p className="font-bold underline text-stone-900">
                    {printDocument.petugasPemberiIzin}
                  </p>
                </div>

                <div>
                  <p className="text-stone-500">Pengasuh Pondok Pesantren,</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-stone-400 font-arabic text-sm">عبد الهادي</span>
                  </div>
                  <p className="font-bold underline text-stone-900">
                    {settings?.namaPengasuh || 'KH. Abdul Hadi'}
                  </p>
                </div>
              </div>

              {/* Footer Validasi */}
              <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-stone-600" />
                  <span>Validasi Digital Kesantrian PPRH • ID: {printDocument.id}</span>
                </div>
                <span>Dicetak pada: {new Date().toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
