import React from 'react';
import {
  HeartHandshake,
  CheckCircle2,
  BookOpen,
  FileText,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Phone,
} from 'lucide-react';
import {
  User,
  Santri,
  AbsensiRecord,
  SuratIzinPulang,
  PelanggaranTakzir,
  JadwalMadrasah,
} from '../types';

interface WaliPortalProps {
  currentUser: User;
  santri: Santri;
  absensiList: AbsensiRecord[];
  suratIzinList: SuratIzinPulang[];
  pelanggaranList: PelanggaranTakzir[];
  jadwalList: JadwalMadrasah[];
  onNavigateToRapor: () => void;
}

export const WaliPortal: React.FC<WaliPortalProps> = ({
  currentUser,
  santri,
  absensiList,
  suratIzinList,
  pelanggaranList,
  jadwalList,
  onNavigateToRapor,
}) => {
  const anandaAbsensi = absensiList.filter((a) => a.santriId === santri.id);
  const anandaIzin = suratIzinList.filter((s) => s.santriId === santri.id);
  const anandaTakzir = pelanggaranList.filter((p) => p.santriId === santri.id);
  const anandaJadwal = jadwalList.filter(
    (j) => j.kelas.includes(santri.kelasMadrasah) || j.kelas === 'Semua Tingkat'
  );

  const hadirCount = anandaAbsensi.filter((a) => a.status === 'Hadir').length;
  const telatCount = anandaAbsensi.filter((a) => a.status === 'Telat').length;
  const total = anandaAbsensi.length || 1;
  const persentase = Math.round(((hadirCount + telatCount) / total) * 100);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-amber-700 via-amber-800 to-emerald-900 text-white p-6 shadow-lg border border-amber-600/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <HeartHandshake className="w-4 h-4 text-amber-300" />
              <span>Portal Khusus Wali Santri &amp; Orang Tua</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Pantau Perkembangan: {santri.nama}
            </h2>
            <p className="text-sm text-amber-100 mt-1 max-w-2xl">
              Informasi langsung perkembangan ananda di kamar {santri.kamar} ({santri.rayon}),
              kehadiran sholat &amp; halaqoh, perizinan, dan kepatuhan disiplin.
            </p>
          </div>

          <button
            onClick={onNavigateToRapor}
            className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer shrink-0 border border-amber-400/40"
          >
            <span>Lihat Rapor Resmi Ananda</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Kehadiran Keseluruhan
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{persentase}%</div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {hadirCount} Hadir • {telatCount} Telat
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Poin Pelanggaran
          </span>
          <div className="text-2xl font-bold text-stone-900 mt-1">
            {santri.poinPelanggaran === 0 ? (
              <span className="text-emerald-700">0 Poin (Disiplin)</span>
            ) : (
              <span className="text-rose-600">{santri.poinPelanggaran} Poin</span>
            )}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {santri.poinPelanggaran === 0 ? 'Bebas dari takzir' : 'Dalam pembinaan'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Surat Izin Pulang
          </span>
          <div className="text-2xl font-bold text-stone-900 mt-1">
            {anandaIzin.length} Kali
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Riwayat kepulangan resmi</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Kelas Diniyah
          </span>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {santri.kelasMadrasah}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">{santri.kelasFormal}</p>
        </div>
      </div>

      {/* Row 1: Kehadiran Ananda & Jadwal Pengajian Ananda */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kehadiran */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-stone-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Rekapitulasi Kehadiran Ananda</span>
            </h3>
            <span className="text-xs text-stone-400">Bulan Ini</span>
          </div>

          <div className="space-y-2">
            {anandaAbsensi.map((item) => {
              const badgeClass =
                item.status === 'Hadir'
                  ? 'bg-emerald-100 text-emerald-800'
                  : item.status === 'Telat'
                    ? 'bg-amber-100 text-amber-800'
                    : item.status === 'Pulang'
                      ? 'bg-teal-100 text-teal-800'
                      : item.status === 'Sakit'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-rose-100 text-rose-800';

              const sessionLabel =
                item.sesi === 'ngaji_asar'
                  ? 'Ngaji Asar (Madrasah)'
                  : item.sesi === 'ngaji_maghrib'
                    ? "Ngaji Maghrib (Tahsin Qur'an)"
                    : item.sesi === 'ngaji_isya'
                      ? 'Ngaji Isya (Bandongan Kitab)'
                      : item.sesi === 'sholat_dzuhur'
                        ? 'Sholat Dzuhur Berjamaah'
                        : item.sesi === 'sholat_subuh'
                          ? 'Sholat Shubuh Berjamaah'
                          : 'Sholat Berjamaah';

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-stone-800">{sessionLabel}</div>
                    <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                      📅 {item.tanggal} • Petugas: {item.petugas}
                    </div>
                    {item.keterangan && (
                      <div className="text-[11px] text-stone-500 mt-0.5 italic">
                        &ldquo;{item.keterangan}&rdquo;
                      </div>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${badgeClass}`}>
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Jadwal Pelajaran Ananda */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-stone-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Jadwal Pengajian Kitab Ananda ({santri.kelasMadrasah})</span>
            </h3>
            <span className="text-xs text-stone-400">Madrasah Diniyah</span>
          </div>

          <div className="space-y-2.5">
            {anandaJadwal.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950">{item.kitab}</span>
                  <span className="font-bold text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                    {item.hari}
                  </span>
                </div>
                <div className="text-stone-600 mt-1 flex items-center gap-2">
                  <span>👳 {item.pengajar}</span>
                  <span>•</span>
                  <span>⏰ {item.waktu} WIB</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">📍 {item.ruang}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Riwayat Izin Pulang & Catatan Kedisiplinan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Izin Pulang */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-stone-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Riwayat Surat Izin Pulang</span>
            </h3>
            <span className="text-xs text-stone-400">Resmi</span>
          </div>

          {anandaIzin.length > 0 ? (
            <div className="space-y-3">
              {anandaIzin.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-900">
                      {item.nomorSurat}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {item.statusKepulangan}
                    </span>
                  </div>
                  <p className="font-semibold text-stone-800 mt-1">
                    Alasan: {item.alasanPulang}
                  </p>
                  <div className="text-stone-500 text-[11px] mt-1">
                    Masa Izin: {item.tanggalPergi} s/d {item.tanggalKembali}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-stone-500 bg-stone-50 rounded-xl">
              Belum ada riwayat izin kepulangan. Ananda mukim dengan tertib di pondok.
            </div>
          )}
        </div>

        {/* Kedisiplinan & Karakter */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-stone-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Catatan Kedisiplinan &amp; Karakter</span>
            </h3>
            <span className="text-xs text-stone-400">Biro Keamanan</span>
          </div>

          {anandaTakzir.length > 0 ? (
            <div className="space-y-3">
              {anandaTakzir.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-950">{item.kategori}</span>
                    <span className="font-bold text-rose-700">+{item.poin} Poin</span>
                  </div>
                  <p className="text-stone-700 mt-1">{item.keterangan}</p>
                  <div className="mt-2 text-[11px] text-stone-600">
                    Bentuk Takzir: <strong>{item.bentukTakzir}</strong>
                  </div>
                  <div className="mt-1 text-[10px] text-stone-400">
                    Status: {item.statusTakzir} • Tanggal: {item.tanggalKejadian}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <div className="font-bold text-sm">
                Alhamdulillah, Ananda Sangat Berdisiplin!
              </div>
              <p className="text-emerald-700 mt-1 leading-relaxed">
                Tidak ada catatan pelanggaran atau takzir tata tertib pesantren. Ananda
                senantiasa mematuhi sunnah dan ketertiban asrama.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
