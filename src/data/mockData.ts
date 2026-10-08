import mockJson from './mockData.json';
import {
  User,
  Santri,
  JadwalMadrasah,
  RutinitasHarian,
  PiketSantri,
  IzinMengajar,
  JurnalKBM,
  SuratIzinPulang,
  PelanggaranTakzir,
  Pengumuman,
  AbsensiRecord,
  PesantrenSettings,
  PrayerTimeItem,
  MasterKelas,
  MasterKamar,
} from '../types';

export const initialUsers: User[] = mockJson.users as User[];
export const initialSantri: Santri[] = mockJson.santri as Santri[];
export const initialJadwalMadrasah: JadwalMadrasah[] = mockJson.jadwalMadrasah as JadwalMadrasah[];
export const initialRutinitas: RutinitasHarian[] = mockJson.rutinitas as RutinitasHarian[];
export const initialPiket: PiketSantri[] = mockJson.piket as PiketSantri[];
export const initialIzinMengajar: IzinMengajar[] = mockJson.izinMengajar as IzinMengajar[];
export const initialJurnal: JurnalKBM[] = mockJson.jurnal as JurnalKBM[];
export const initialSuratIzin: SuratIzinPulang[] = mockJson.suratIzin as SuratIzinPulang[];
export const initialPelanggaran: PelanggaranTakzir[] = mockJson.pelanggaran as PelanggaranTakzir[];
export const initialPengumuman: Pengumuman[] = mockJson.pengumuman as Pengumuman[];
export const initialAbsensi: AbsensiRecord[] = mockJson.absensi as AbsensiRecord[];
export const initialSettings: PesantrenSettings = mockJson.settings as PesantrenSettings;

export const initialMasterKelas: MasterKelas[] = [
  { id: 'kls_1', nama: '7 MTs', tingkat: 'Tingkat MTs (Kelas 7)', kategori: 'Formal', keterangan: 'Madrasah Tsanawiyah Kelas VII' },
  { id: 'kls_2', nama: '8 MTs', tingkat: 'Tingkat MTs (Kelas 8)', kategori: 'Formal', keterangan: 'Madrasah Tsanawiyah Kelas VIII' },
  { id: 'kls_3', nama: '9 MTs', tingkat: 'Tingkat MTs (Kelas 9)', kategori: 'Formal', keterangan: 'Madrasah Tsanawiyah Kelas IX' },
  { id: 'kls_4', nama: '10 MA', tingkat: 'Tingkat MA (Kelas 10)', kategori: 'Formal', keterangan: 'Madrasah Aliyah Kelas X (Keagamaan & IPA)' },
  { id: 'kls_5', nama: '11 MA', tingkat: 'Tingkat MA (Kelas 11)', kategori: 'Formal', keterangan: 'Madrasah Aliyah Kelas XI' },
  { id: 'kls_6', nama: '12 MA', tingkat: 'Tingkat MA (Kelas 12)', kategori: 'Formal', keterangan: 'Madrasah Aliyah Kelas XII' },
  { id: 'kls_7', nama: '1 Ula', tingkat: 'Diniyah Dasar (Ula)', kategori: 'Diniyah', keterangan: 'Kitab Jurumiyah, Safinatun Najah, Aqidatul Awam' },
  { id: 'kls_8', nama: '2 Wustho', tingkat: 'Diniyah Menengah (Wustha)', kategori: 'Diniyah', keterangan: 'Kitab Imrithi, Taqrib, Fathul Qorib' },
  { id: 'kls_9', nama: 'Ula A', tingkat: 'Diniyah Dasar (Ula)', kategori: 'Diniyah', keterangan: 'Nahwu Sharaf Dasar & Fiqih Ibadah' },
  { id: 'kls_10', nama: 'Ula B', tingkat: 'Diniyah Dasar (Ula)', kategori: 'Diniyah', keterangan: 'Nahwu Sharaf Dasar & Fiqih Ibadah' },
  { id: 'kls_11', nama: 'Wustha A', tingkat: 'Diniyah Menengah (Wustha)', kategori: 'Diniyah', keterangan: 'Kaidah Fiqhiyyah & Balaghah' },
  { id: 'kls_12', nama: 'Wustha B', tingkat: 'Diniyah Menengah (Wustha)', kategori: 'Diniyah', keterangan: 'Kaidah Fiqhiyyah & Balaghah' },
  { id: 'kls_13', nama: 'Ulya', tingkat: 'Diniyah Tinggi (Ulya)', kategori: 'Diniyah', keterangan: 'Kitab Ihya Ulumuddin & Alfiyah Ibnu Malik' },
  { id: 'kls_14', nama: "Tahfidz Al-Qur'an", tingkat: 'Khusus Al-Qur\'an', kategori: 'Tahfidz', keterangan: 'Halaqah Tahfidz & Tahsin Tartil 30 Juz' },
];

export const initialMasterKamar: MasterKamar[] = [
  { id: 'kmr_1', nama: 'Al-Ghazali 01', rayon: 'Rayon Putra Al-Ghazali', gender: 'L', kapasitas: 4, fasilitas: 'Kasur Tingkat, Lemari Santri, Meja Belajar', keterangan: 'Lantai 1 Gedung Al-Ghazali' },
  { id: 'kmr_2', nama: 'Al-Ghazali 02', rayon: 'Rayon Putra Al-Ghazali', gender: 'L', kapasitas: 4, fasilitas: 'Kasur Tingkat, Lemari Santri, Meja Belajar', keterangan: 'Lantai 1 Gedung Al-Ghazali' },
  { id: 'kmr_3', nama: 'Al-Ghazali 03', rayon: 'Rayon Putra Al-Ghazali', gender: 'L', kapasitas: 4, fasilitas: 'Kasur Tingkat, Lemari Santri, Meja Belajar', keterangan: 'Lantai 2 Gedung Al-Ghazali' },
  { id: 'kmr_4', nama: 'Ibnu Sina 01', rayon: 'Rayon Putra Ibnu Sina', gender: 'L', kapasitas: 6, fasilitas: 'Kasur Tingkat, Lemari Santri, Kipas Angin', keterangan: 'Lantai 1 Gedung Ibnu Sina' },
  { id: 'kmr_5', nama: 'Ibnu Sina 02', rayon: 'Rayon Putra Ibnu Sina', gender: 'L', kapasitas: 6, fasilitas: 'Kasur Tingkat, Lemari Santri, Kipas Angin', keterangan: 'Lantai 1 Gedung Ibnu Sina' },
  { id: 'kmr_6', nama: 'Ibnu Sina 03', rayon: 'Rayon Putra Ibnu Sina', gender: 'L', kapasitas: 6, fasilitas: 'Kasur Tingkat, Lemari Santri, Kipas Angin', keterangan: 'Lantai 2 Gedung Ibnu Sina' },
  { id: 'kmr_7', nama: 'Al-Fatih 01', rayon: 'Rayon Putra Al-Fatih', gender: 'L', kapasitas: 4, fasilitas: 'Kasur Tingkat, Lemari Santri, Rak Kitab', keterangan: 'Gedung Depan Al-Fatih' },
  { id: 'kmr_8', nama: 'Al-Fatih 02', rayon: 'Rayon Putra Al-Fatih', gender: 'L', kapasitas: 4, fasilitas: 'Kasur Tingkat, Lemari Santri, Rak Kitab', keterangan: 'Gedung Depan Al-Fatih' },
  { id: 'kmr_9', nama: 'Al-Fatih 03', rayon: 'Rayon Putra Al-Fatih', gender: 'L', kapasitas: 4, fasilitas: 'Kasur Tingkat, Lemari Santri, Rak Kitab', keterangan: 'Gedung Depan Al-Fatih' },
  { id: 'kmr_10', nama: "Imam Syafi'i 01", rayon: "Rayon Putra Imam Syafi'i", gender: 'L', kapasitas: 4, fasilitas: 'Kasur Tingkat, Lemari Santri', keterangan: 'Lantai 1 Asrama Syafi\'i' },
  { id: 'kmr_11', nama: "Imam Syafi'i 02", rayon: "Rayon Putra Imam Syafi'i", gender: 'L', kapasitas: 4, fasilitas: 'Kasur Tingkat, Lemari Santri', keterangan: 'Lantai 2 Asrama Syafi\'i' },
  { id: 'kmr_12', nama: 'Abu Bakar 01', rayon: 'Rayon Putra Abu Bakar', gender: 'L', kapasitas: 4, fasilitas: 'Kasur Tingkat, Lemari Santri', keterangan: 'Asrama Baru Abu Bakar' },
  { id: 'kmr_13', nama: 'Umar 02', rayon: 'Rayon Putra Umar bin Khattab', gender: 'L', kapasitas: 4, fasilitas: 'Kasur Tingkat, Lemari Santri', keterangan: 'Asrama Umar Lantai 2' },
  { id: 'kmr_14', nama: 'Khadijah 01', rayon: 'Rayon Putri Khadijah', gender: 'P', kapasitas: 4, fasilitas: 'Kasur Tingkat, Lemari Santri, Kamar Mandi Dalam', keterangan: 'Kompleks Asrama Putri' },
  { id: 'kmr_15', nama: 'Aisyah 01', rayon: 'Rayon Putri Aisyah', gender: 'P', kapasitas: 4, fasilitas: 'Kasur Tingkat, Lemari Santri, Kamar Mandi Dalam', keterangan: 'Kompleks Asrama Putri' },
];


export const PRAYER_SCHEDULE = [
  { nama: 'Shubuh', waktu: '04:28' },
  { nama: 'Terbit', waktu: '05:42' },
  { nama: 'Dzuhur', waktu: '11:49' },
  { nama: 'Asar', waktu: '15:08' },
  { nama: 'Maghrib', waktu: '17:54' },
  { nama: 'Isya', waktu: '19:04' },
];

export function getPrayerTimes(date: Date = new Date()): PrayerTimeItem[] {
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  let nextIdx = -1;

  const result: PrayerTimeItem[] = PRAYER_SCHEDULE.map((item, idx) => {
    const [hours, mins] = item.waktu.split(':').map(Number);
    const prayerMinutes = hours * 60 + mins;
    const isPassed = currentMinutes >= prayerMinutes;
    if (nextIdx === -1 && currentMinutes < prayerMinutes) {
      nextIdx = idx;
    }
    return {
      nama: item.nama,
      waktu: item.waktu,
      icon:
        item.nama === 'Shubuh'
          ? 'sunrise'
          : item.nama === 'Dzuhur'
            ? 'sun'
            : item.nama === 'Asar'
              ? 'cloud-sun'
              : item.nama === 'Maghrib'
                ? 'sunset'
                : 'moon',
      isPassed,
      isNext: false,
    };
  });

  if (nextIdx === -1) nextIdx = 0; // Next is tomorrow's Shubuh
  if (result[nextIdx]) {
    result[nextIdx].isNext = true;
    const [hours, mins] = result[nextIdx].waktu.split(':').map(Number);
    let diff = hours * 60 + mins - currentMinutes;
    if (diff < 0) diff += 1440;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    result[nextIdx].countdownStr = `${h > 0 ? `${h}j ` : ''}${m}m lagi`;
  }

  return result;
}

export function formatTimeWIB(date: Date = new Date()): string {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  });
}

export function formatDateIndo(date: Date = new Date()): string {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
}

export function getHijriDate(): string {
  return '25 Rabiul Akhir 1448 H';
}
