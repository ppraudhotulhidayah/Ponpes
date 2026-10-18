// Helper utilities for Administrasi & Keuangan Bendahara Pondok Pesantren

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRupiahRaw(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0';
  }
  return new Intl.NumberFormat('id-ID').format(amount);
}

/**
 * Konversi angka ke kalimat terbilang Rupiah untuk kwitansi resmi
 */
export function terbilang(n: number): string {
  if (n === 0) return 'Nol Rupiah';
  if (n < 0) return 'Minus ' + terbilang(Math.abs(n));

  const bilangan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  function toWords(num: number): string {
    if (num < 12) {
      return bilangan[num];
    } else if (num < 20) {
      return toWords(num - 10) + ' Belas';
    } else if (num < 100) {
      const sisa = num % 10;
      return toWords(Math.floor(num / 10)) + ' Puluh' + (sisa ? ' ' + toWords(sisa) : '');
    } else if (num < 200) {
      return 'Seratus' + (num - 100 ? ' ' + toWords(num - 100) : '');
    } else if (num < 1000) {
      const sisa = num % 100;
      return toWords(Math.floor(num / 100)) + ' Ratus' + (sisa ? ' ' + toWords(sisa) : '');
    } else if (num < 2000) {
      return 'Seribu' + (num - 1000 ? ' ' + toWords(num - 1000) : '');
    } else if (num < 1000000) {
      const sisa = num % 1000;
      return toWords(Math.floor(num / 1000)) + ' Ribu' + (sisa ? ' ' + toWords(sisa) : '');
    } else if (num < 1000000000) {
      const sisa = num % 1000000;
      return toWords(Math.floor(num / 1000000)) + ' Juta' + (sisa ? ' ' + toWords(sisa) : '');
    } else if (num < 1000000000000) {
      const sisa = num % 1000000000;
      return toWords(Math.floor(num / 1000000000)) + ' Miliar' + (sisa ? ' ' + toWords(sisa) : '');
    }
    return String(num);
  }

  const hasil = toWords(Math.floor(n)).trim();
  return (hasil ? hasil + ' Rupiah' : 'Nol Rupiah');
}

/**
 * Generate nomor kwitansi unik
 */
export function generateNomorKwitansi(prefix: 'KWT' | 'BKM' | 'BKK' = 'KWT'): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}${month}-${rand}`;
}

/**
 * Daftar 12 Bulan Pembelajaran Pondok Pesantren
 */
export const DAFTAR_BULAN_HIJRI_MASEHI = [
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
];

/**
 * Kategori Kas Operasional Bawaan
 */
export const KATEGORI_KAS_DEFAULT = {
  pemasukan: [
    'Kas Pembayaran Santri',
    'Infaq & Donasi Jamaah',
    'Wakaf & Shadaqah Pembangunan',
    'Hasil Usaha & Kantin Pesantren',
    'Bantuan Pemerintah / Lembaga',
    'Pemasukan Lainnya',
  ],
  pengeluaran: [
    'Bisyarah / Gaji Dewan Asatidz',
    'Belanja Logistik & Dapur Asrama',
    'Listrik, Air & Sarana Operasional',
    'Pemeliharaan Gedung & Sanitasi',
    'Pengadaan Kitab & ATK Kantor',
    'Kegiatan Santri & PHBI',
    'Kesehatan & P3K Santri',
    'Pengeluaran Lainnya',
  ],
};

/**
 * Export data ke format CSV
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent =
    '\uFEFF' + // UTF-8 BOM agar Excel membaca huruf & rupiah dengan benar
    [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
