export type UserRole = 'admin' | 'guru' | 'wali';

export interface User {
  id: string;
  name: string;
  displayName?: string;
  username: string;
  password?: string;
  email: string;
  role: UserRole;
  title: string;
  nip?: string;
  mapel?: string;
  noHp?: string;
  avatar?: string;
  santriId?: string;
  santriName?: string;
}

export interface Santri {
  id: string;
  nis: string;
  nama: string;
  gender: 'L' | 'P';
  kamar: string;
  rayon: string;
  kelasMadrasah: string;
  kelasFormal: string;
  namaWali: string;
  teleponWali: string;
  alamat: string;
  statusMukim: 'Mukim' | 'Izin Pulang' | 'Terlambat Kembali';
  poinPelanggaran: number;
}

export interface JadwalMadrasah {
  id: string;
  hari: string;
  waktu: string;
  kelas: string;
  kitab: string;
  pengajar: string;
  ruang: string;
}

export interface RutinitasHarian {
  id: string;
  waktuMulai: string;
  waktuSelesai: string;
  kegiatan: string;
  keterangan: string;
  kategori: 'Ibadah' | 'KBM' | 'Istirahat' | 'Umum';
  lokasi: string;
}

export interface PiketSantri {
  id: string;
  hari: string;
  lokasi: string;
  kelompok: string;
  kamar: string;
  koordinator: string;
  tugas: string[];
}

export interface IzinMengajar {
  id: string;
  ustadzId: string;
  namaUstadz: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  mapelKitab: string;
  alasan: string;
  ustadzBadal: string;
  status: 'Disetujui' | 'Menunggu' | 'Ditolak';
  catatanAdmin?: string;
  createdAt: string;
}

export interface JurnalKBM {
  id: string;
  tanggal: string;
  namaUstadz: string;
  kelas: string;
  kitab: string;
  babMateri: string;
  halaman: string;
  catatanSantri: string;
  kendalaKBM: string;
  jumlahHadir: number;
  jumlahSantri: number;
}

export interface SuratIzinPulang {
  id: string;
  nomorSurat: string;
  santriId: string;
  namaSantri: string;
  nis: string;
  kamar: string;
  alasanPulang: string;
  tanggalPergi: string;
  tanggalKembali: string;
  penanggungJawab: string;
  teleponPenanggungJawab: string;
  alamatTujuan: string;
  statusKepulangan: 'Sedang Di Luar' | 'Terlambat' | 'Sudah Kembali';
  tanggalRealisasiKembali?: string;
  petugasPemberiIzin: string;
  catatan: string;
  createdAt: string;
}

export interface PelanggaranTakzir {
  id: string;
  santriId: string;
  namaSantri: string;
  kamar: string;
  tingkat: 'Ringan' | 'Sedang' | 'Berat';
  kategori: string;
  tanggalKejadian: string;
  keterangan: string;
  poin: number;
  bentukTakzir: string;
  statusTakzir: 'Belum Dilaksanakan' | 'Sedang Proses' | 'Selesai';
  pencatat: string;
  diselesaikanPada?: string;
}

export interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  tanggal: string;
  prioritas: 'Penting' | 'Normal';
}

export interface AbsensiRecord {
  id: string;
  santriId: string;
  tanggal: string;
  sesi: string;
  status: 'Hadir' | 'Telat' | 'Izin' | 'Sakit' | 'Alfa' | 'Pulang';
  keterangan?: string;
  petugas: string;
  updatedAt: string;
}

export interface PesantrenSettings {
  namaLembaga: string;
  subNamaTagline: string;
  alamatLengkap: string;
  telepon: string;
  email: string;
  namaPengasuh: string;
  namaKepalaKesantrian: string;
  logoUrl: string;
  adminUsername: string;
  adminEmail: string;
  adminDisplayName: string;
}

export interface PrayerTimeItem {
  nama: string;
  waktu: string;
  icon?: string;
  isPassed: boolean;
  isNext: boolean;
  countdownStr?: string;
}

export interface MasterKelas {
  id: string;
  nama: string;
  tingkat: string;
  kategori: 'Formal' | 'Diniyah' | 'Tahfidz' | 'Lainnya';
  keterangan?: string;
  waliKelas?: string;
  createdAt?: string;
}

export interface MasterKamar {
  id: string;
  nama: string;
  rayon: string;
  gender: 'L' | 'P';
  kapasitas: number;
  fasilitas?: string;
  keterangan?: string;
  createdAt?: string;
}

