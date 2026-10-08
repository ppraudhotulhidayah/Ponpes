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
