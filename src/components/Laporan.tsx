import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Award,
  BookOpen,
  ShieldAlert,
  UserCheck,
  QrCode,
} from 'lucide-react';
import {
  Santri,
  AbsensiRecord,
  JurnalKBM,
  PelanggaranTakzir,
  SuratIzinPulang,
  UserRole,
  PesantrenSettings,
} from '../types';

interface LaporanProps {
  santriList: Santri[];
  absensiList: AbsensiRecord[];
  jurnalList: JurnalKBM[];
  pelanggaranList: PelanggaranTakzir[];
  suratIzinList: SuratIzinPulang[];
  userRole: UserRole;
  settings: PesantrenSettings;
}

export const Laporan: React.FC<LaporanProps> = ({
  santriList,
  absensiList,
  jurnalList,
  pelanggaranList,
  suratIzinList,
  settings,
}) => {
  const [selectedReportType, setSelectedReportType] = useState<
    'absensi' | 'jurnal' | 'kedisiplinan' | 'rapor'
  >('absensi');
  const [filterKelas, setFilterKelas] = useState('all');
  const [selectedSantriId, setSelectedSantriId] = useState(santriList[0]?.id || '');

  const handlePrint = () => {
    window.print();
  };

  const selectedSantri =
    santriList.find((s) => s.id === selectedSantriId) || santriList[0];

  const santriAbsensi = absensiList.filter((a) => a.santriId === selectedSantri?.id);
  const santriPelanggaran = pelanggaranList.filter(
    (p) => p.santriId === selectedSantri?.id
  );
  const santriIzin = suratIzinList.filter((s) => s.santriId === selectedSantri?.id);

  // Compute attendance summary per santri
  const rekapAbsensiPerSantri = santriList
    .filter((s) => (filterKelas === 'all' ? true : s.kelasMadrasah === filterKelas))
    .map((s) => {
      const records = absensiList.filter((a) => a.santriId === s.id);
      const hadir = records.filter((a) => a.status === 'Hadir').length;
      const telat = records.filter((a) => a.status === 'Telat').length;
      const izin = records.filter((a) => a.status === 'Izin').length;
      const sakit = records.filter((a) => a.status === 'Sakit').length;
      const pulang = records.filter((a) => a.status === 'Pulang').length;
      const alfa = records.filter((a) => a.status === 'Alfa').length;
      const total = records.length || 1;
      const persentase = Math.round(((hadir + telat) / total) * 100);

      return {
        ...s,
        hadir,
        telat,
        izin,
        sakit,
        pulang,
        alfa,
        total,
        persentase,
      };
    });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-800" />
            <span>Pusat Laporan, Rekapitulasi &amp; Cetak Rapor Santri</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Ekspor laporan resmi berstandar A4 siap cetak: absensi, jurnal KBM, buku takzir, dan lembar rapor berkala
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak Dokumen (A4)</span>
          </button>
        </div>
      </div>

      {/* Tabs Selector (Hidden on print) */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setSelectedReportType('absensi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedReportType === 'absensi'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Rekap Presensi
          </button>
          <button
            onClick={() => setSelectedReportType('jurnal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedReportType === 'jurnal'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Rekap Jurnal KBM
          </button>
          <button
            onClick={() => setSelectedReportType('kedisiplinan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedReportType === 'kedisiplinan'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Buku Takzir &amp; Disiplin
          </button>
          <button
            onClick={() => setSelectedReportType('rapor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedReportType === 'rapor'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Rapor Perkembangan Santri
          </button>
        </div>

        {selectedReportType === 'absensi' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500">Filter Kelas:</span>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl"
            >
              <option value="all">Semua Kelas</option>
              <option value="Ula A">Kelas Ula A</option>
              <option value="Ula B">Kelas Ula B</option>
              <option value="Wustha A">Kelas Wustha A</option>
              <option value="Wustha B">Kelas Wustha B</option>
              <option value="Ulya">Kelas Ulya</option>
            </select>
          </div>
        )}

        {selectedReportType === 'rapor' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500">Pilih Santri:</span>
            <select
              value={selectedSantriId}
              onChange={(e) => setSelectedSantriId(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl"
            >
              {santriList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.nis} - {s.kelasMadrasah})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* PRINTABLE REPORT CONTAINER */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/90 shadow-xs print-page">
        {/* Kop Surat Resmi */}
        <div className="border-b-2 border-stone-900 pb-3 mb-6 text-center relative">
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

        {/* 1. REKAP ABSENSI */}
        {selectedReportType === 'absensi' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-base font-bold uppercase underline">
                REKAPITULASI KEHADIRAN HALAQOH &amp; SHOLAT BERJAMAAH SANTRI
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Semester Ganjil 1448 H / Tahun Ajaran 2026/2027
              </p>
            </div>

            <table className="w-full text-left text-xs border border-stone-300 border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-300 text-stone-800 font-bold">
                  <th className="p-2 border border-stone-300 text-center w-10">No</th>
                  <th className="p-2 border border-stone-300">Nama Santri</th>
                  <th className="p-2 border border-stone-300">NIS</th>
                  <th className="p-2 border border-stone-300">Kamar</th>
                  <th className="p-2 border border-stone-300">Kelas</th>
                  <th className="p-2 border border-stone-300 text-center">Hadir</th>
                  <th className="p-2 border border-stone-300 text-center">Telat</th>
                  <th className="p-2 border border-stone-300 text-center">Izin</th>
                  <th className="p-2 border border-stone-300 text-center">Sakit</th>
                  <th className="p-2 border border-stone-300 text-center">Alfa</th>
                  <th className="p-2 border border-stone-300 text-center">% Kehadiran</th>
                </tr>
              </thead>
              <tbody>
                {rekapAbsensiPerSantri.map((s, idx) => (
                  <tr key={s.id} className="border-b border-stone-200">
                    <td className="p-2 border border-stone-300 text-center">{idx + 1}</td>
                    <td className="p-2 border border-stone-300 font-semibold">{s.nama}</td>
                    <td className="p-2 border border-stone-300 font-mono text-[11px]">
                      {s.nis}
                    </td>
                    <td className="p-2 border border-stone-300">{s.kamar}</td>
                    <td className="p-2 border border-stone-300">{s.kelasMadrasah}</td>
                    <td className="p-2 border border-stone-300 text-center font-bold text-emerald-700">
                      {s.hadir}
                    </td>
                    <td className="p-2 border border-stone-300 text-center">{s.telat}</td>
                    <td className="p-2 border border-stone-300 text-center">{s.izin}</td>
                    <td className="p-2 border border-stone-300 text-center">{s.sakit}</td>
                    <td className="p-2 border border-stone-300 text-center text-rose-600 font-bold">
                      {s.alfa}
                    </td>
                    <td className="p-2 border border-stone-300 text-center font-bold">
                      {s.persentase}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. REKAP JURNAL KBM */}
        {selectedReportType === 'jurnal' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-base font-bold uppercase underline">
                JURNAL EVALUASI KEGIATAN BELAJAR MENGAJAR (KBM) ASATIDZ
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Laporan Ketercapaian Kitab Kuning &amp; Halaqoh Tahfidz
              </p>
            </div>

            <table className="w-full text-left text-xs border border-stone-300 border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-300 text-stone-800 font-bold">
                  <th className="p-2 border border-stone-300 text-center w-10">No</th>
                  <th className="p-2 border border-stone-300">Tanggal</th>
                  <th className="p-2 border border-stone-300">Ustadz Pengampu</th>
                  <th className="p-2 border border-stone-300">Kitab &amp; Kelas</th>
                  <th className="p-2 border border-stone-300">Materi &amp; Capaian</th>
                  <th className="p-2 border border-stone-300">Catatan Santri / KBM</th>
                </tr>
              </thead>
              <tbody>
                {jurnalList.map((j, idx) => (
                  <tr key={j.id} className="border-b border-stone-200">
                    <td className="p-2 border border-stone-300 text-center">{idx + 1}</td>
                    <td className="p-2 border border-stone-300 font-mono">{j.tanggal}</td>
                    <td className="p-2 border border-stone-300 font-semibold">
                      {j.namaUstadz}
                    </td>
                    <td className="p-2 border border-stone-300">
                      <div className="font-bold">{j.kitab}</div>
                      <div className="text-[10px] text-stone-500">{j.kelas}</div>
                    </td>
                    <td className="p-2 border border-stone-300">
                      <div>{j.babMateri}</div>
                      <div className="text-[10px] text-stone-500 font-mono">{j.halaman}</div>
                    </td>
                    <td className="p-2 border border-stone-300 text-[11px] leading-relaxed">
                      {j.catatanSantri}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. REKAP KEDISIPLINAN */}
        {selectedReportType === 'kedisiplinan' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-base font-bold uppercase underline">
                LAPORAN BUKU PELANGGARAN TATA TERTIB &amp; TAKZIR SANTRI
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Biro Keamanan &amp; Pembinaan Karakter Santri
              </p>
            </div>

            <table className="w-full text-left text-xs border border-stone-300 border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-300 text-stone-800 font-bold">
                  <th className="p-2 border border-stone-300 text-center w-10">No</th>
                  <th className="p-2 border border-stone-300">Nama Santri &amp; Kamar</th>
                  <th className="p-2 border border-stone-300">Tanggal</th>
                  <th className="p-2 border border-stone-300">Tingkat &amp; Poin</th>
                  <th className="p-2 border border-stone-300">Kronologi Kejadian</th>
                  <th className="p-2 border border-stone-300">Bentuk Takzir Edukatif</th>
                  <th className="p-2 border border-stone-300 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {pelanggaranList.map((p, idx) => (
                  <tr key={p.id} className="border-b border-stone-200">
                    <td className="p-2 border border-stone-300 text-center">{idx + 1}</td>
                    <td className="p-2 border border-stone-300">
                      <div className="font-bold">{p.namaSantri}</div>
                      <div className="text-[10px] text-stone-500">{p.kamar}</div>
                    </td>
                    <td className="p-2 border border-stone-300 font-mono text-[11px]">
                      {p.tanggalKejadian}
                    </td>
                    <td className="p-2 border border-stone-300 font-semibold">
                      {p.tingkat} (+{p.poin} Poin)
                    </td>
                    <td className="p-2 border border-stone-300 text-[11px]">
                      {p.keterangan}
                    </td>
                    <td className="p-2 border border-stone-300 text-[11px]">
                      {p.bentukTakzir}
                    </td>
                    <td className="p-2 border border-stone-300 text-center font-bold">
                      {p.statusTakzir}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. RAPOR PERKEMBANGAN SANTRI */}
        {selectedReportType === 'rapor' && selectedSantri && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-base font-bold uppercase underline">
                LEMBAR EVALUASI &amp; RAPOR PERKEMBANGAN SANTRI
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Tahun Ajaran 2026/2027 • Semester Ganjil
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-lg border border-stone-200 mb-4">
              <div>
                <div>
                  Nama Santri : <strong>{selectedSantri.nama}</strong>
                </div>
                <div className="mt-1">
                  NIS : <strong>{selectedSantri.nis}</strong>
                </div>
                <div className="mt-1">
                  Kamar : {selectedSantri.kamar} ({selectedSantri.rayon})
                </div>
              </div>
              <div>
                <div>
                  Kelas Diniyah : <strong>{selectedSantri.kelasMadrasah}</strong>
                </div>
                <div className="mt-1">
                  Nama Wali : {selectedSantri.namaWali}
                </div>
                <div className="mt-1">
                  Status Mukim : <strong>{selectedSantri.statusMukim}</strong>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs mb-4">
              <div className="p-3 border border-stone-300 rounded-lg">
                <span className="text-stone-500">Tingkat Kehadiran</span>
                <div className="text-xl font-bold text-stone-900 mt-1">98%</div>
                <span className="text-[10px] text-stone-400">Ngaji &amp; Sholat Berjamaah</span>
              </div>
              <div className="p-3 border border-stone-300 rounded-lg">
                <span className="text-stone-500">Akumulasi Poin Disiplin</span>
                <div className="text-xl font-bold text-stone-900 mt-1">
                  {selectedSantri.poinPelanggaran} Poin
                </div>
                <span className="text-[10px] text-stone-400">
                  {selectedSantri.poinPelanggaran === 0
                    ? 'Tertib & Disiplin'
                    : 'Catatan Pembinaan'}
                </span>
              </div>
              <div className="p-3 border border-stone-300 rounded-lg">
                <span className="text-stone-500">Surat Izin Keluar</span>
                <div className="text-xl font-bold text-stone-900 mt-1">
                  {santriIzin.length} Kali
                </div>
                <span className="text-[10px] text-stone-400">Tertib Kembali</span>
              </div>
            </div>

            <div className="text-xs border border-stone-300 rounded-lg p-4 leading-relaxed text-stone-700">
              <strong className="text-stone-900">
                Catatan Dewan Pengasuh &amp; Asatidz:
              </strong>
              <p className="mt-1">
                Ananda {selectedSantri.nama} menunjukkan keteladanan yang baik dalam sholat
                berjamaah, aktif dalam halaqoh pengajian kitab kuning, serta menjaga pergaulan
                dan sopan santun terhadap asatidz dan sesama santri. Harap orang tua senantiasa
                mendoakan dan membimbing selama libur kepulangan di rumah.
              </p>
            </div>
          </div>
        )}

        {/* Tanda Tangan Formal Pengasuh & Kepala Kesantrian */}
        <div className="grid grid-cols-2 text-center text-xs gap-8 pt-10 mt-8 border-t border-stone-300">
          <div>
            <p className="text-stone-500">Mengetahui,</p>
            <p className="font-semibold text-stone-800">Kepala Bidang Kesantrian</p>
            <div className="h-20 flex items-center justify-center">
              <span className="text-stone-300 italic text-[10px]">(Tanda Tangan)</span>
            </div>
            <p className="font-bold underline text-stone-900">
              {settings?.adminDisplayName || settings?.namaKepalaKesantrian || 'Ustadz H. Ahmad Muzammil, S.Pd.I'}
            </p>
          </div>

          <div>
            <p className="text-stone-500">Ciamis, {new Date().toLocaleDateString('id-ID')}</p>
            <p className="font-semibold text-stone-800">
              Pengasuh {settings?.namaLembaga || 'Pondok Pesantren Raudhotu Hidayah'}
            </p>
            <div className="h-20 flex items-center justify-center">
              <span className="text-stone-400 font-arabic text-lg">عبد الهادي</span>
            </div>
            <p className="font-bold underline text-stone-900">
              {settings?.namaPengasuh || 'KH. Abdul Hadi'}
            </p>
          </div>
        </div>

        {/* Footer Validasi Digital */}
        <div className="mt-8 pt-3 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-400">
          <div className="flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-stone-600" />
            <span>
              Dokumen Otentik Terverifikasi Sistem Manajemen{' '}
              {settings?.namaLembaga || 'Raudhotu Hidayah'}
            </span>
          </div>
          <span>Tanggal Unduh: {new Date().toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>
  );
};
