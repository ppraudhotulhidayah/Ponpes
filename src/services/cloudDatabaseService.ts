import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  User,
  Santri,
  AbsensiRecord,
  JadwalMadrasah,
  RutinitasHarian,
  PiketSantri,
  SuratIzinPulang,
  PelanggaranTakzir,
  IzinMengajar,
  JurnalKBM,
  Pengumuman,
  PesantrenSettings,
  MasterKelas,
  MasterKamar,
  PosPembayaran,
  TagihanSantri,
  PembayaranTransaksi,
  KasOperasional,
} from '../types';
import {
  initialUsers,
  initialSantri,
  initialAbsensi,
  initialJadwalMadrasah,
  initialRutinitas,
  initialPiket,
  initialSuratIzin,
  initialPelanggaran,
  initialIzinMengajar,
  initialJurnal,
  initialPengumuman,
  initialSettings,
  initialMasterKelas,
  initialMasterKamar,
  initialPosPembayaran,
  initialTagihanSantri,
  initialPembayaran,
  initialKasOperasional,
} from '../data/mockData';

export const ENTITY_KEYS = {
  USERS: 'pesantren_users',
  SANTRI: 'pesantren_santri',
  ABSENSI: 'pesantren_absensi',
  JADWAL: 'pesantren_jadwal_madrasah',
  RUTINITAS: 'pesantren_rutinitas',
  PIKET: 'pesantren_piket',
  SURAT_IZIN: 'pesantren_surat_izin',
  PELANGGARAN: 'pesantren_pelanggaran',
  IZIN_MENGAJAR: 'pesantren_izin_mengajar',
  JURNAL: 'pesantren_jurnal',
  PENGUMUMAN: 'pesantren_pengumuman',
  SETTINGS: 'pesantren_settings',
  MASTER_KELAS: 'pesantren_master_kelas',
  MASTER_KAMAR: 'pesantren_master_kamar',
  POS_PEMBAYARAN: 'pesantren_pos_pembayaran',
  TAGIHAN_SANTRI: 'pesantren_tagihan_santri',
  PEMBAYARAN: 'pesantren_pembayaran',
  KAS_OPERASIONAL: 'pesantren_kas_operasional',
} as const;

export type EntityKey = (typeof ENTITY_KEYS)[keyof typeof ENTITY_KEYS];

export interface CompleteDatasets {
  users: User[];
  santri: Santri[];
  absensi: AbsensiRecord[];
  jadwal: JadwalMadrasah[];
  rutinitas: RutinitasHarian[];
  piket: PiketSantri[];
  suratIzin: SuratIzinPulang[];
  pelanggaran: PelanggaranTakzir[];
  izinMengajar: IzinMengajar[];
  jurnal: JurnalKBM[];
  pengumuman: Pengumuman[];
  settings: PesantrenSettings;
  masterKelas: MasterKelas[];
  masterKamar: MasterKamar[];
  posPembayaran: PosPembayaran[];
  tagihanSantri: TagihanSantri[];
  pembayaran: PembayaranTransaksi[];
  kasOperasional: KasOperasional[];
}

export interface SyncStats {
  lastSyncTime: string | null;
  status: 'synced' | 'syncing' | 'offline' | 'error';
  source: 'cloud_supabase' | 'cache_local';
  totalEntities: number;
  message?: string;
}

// Helper to check network connectivity safely (in browser checks navigator.onLine, in Node/SSR returns true)
const isOnline = () =>
  typeof window !== 'undefined' && typeof navigator !== 'undefined'
    ? navigator.onLine
    : true;

// Local cache helper
export function getLocalData<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function setLocalData<T>(key: string, data: T): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    console.error('Local cache error:', e);
  }
}

// Initial defaults mapping
export const DEFAULT_ENTITIES_MAP: Record<EntityKey, any> = {
  [ENTITY_KEYS.USERS]: initialUsers,
  [ENTITY_KEYS.SANTRI]: initialSantri,
  [ENTITY_KEYS.ABSENSI]: initialAbsensi,
  [ENTITY_KEYS.JADWAL]: initialJadwalMadrasah,
  [ENTITY_KEYS.RUTINITAS]: initialRutinitas,
  [ENTITY_KEYS.PIKET]: initialPiket,
  [ENTITY_KEYS.SURAT_IZIN]: initialSuratIzin,
  [ENTITY_KEYS.PELANGGARAN]: initialPelanggaran,
  [ENTITY_KEYS.IZIN_MENGAJAR]: initialIzinMengajar,
  [ENTITY_KEYS.JURNAL]: initialJurnal,
  [ENTITY_KEYS.PENGUMUMAN]: initialPengumuman,
  [ENTITY_KEYS.SETTINGS]: initialSettings,
  [ENTITY_KEYS.MASTER_KELAS]: initialMasterKelas,
  [ENTITY_KEYS.MASTER_KAMAR]: initialMasterKamar,
  [ENTITY_KEYS.POS_PEMBAYARAN]: initialPosPembayaran,
  [ENTITY_KEYS.TAGIHAN_SANTRI]: initialTagihanSantri,
  [ENTITY_KEYS.PEMBAYARAN]: initialPembayaran,
  [ENTITY_KEYS.KAS_OPERASIONAL]: initialKasOperasional,
};

// =========================================================================
// ONLINE CLOUD CRUD OPERATIONS (Supabase + Realtime Multi-Device Sync)
// =========================================================================

/**
 * Fetch a single entity from Supabase online database (falls back to local cache)
 */
export async function fetchEntityFromCloud<T>(key: EntityKey, fallback: T): Promise<T> {
  const cached = getLocalData<T>(key, fallback);

  if (!isOnline()) {
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from('ponpes_data_store')
      .select('key, data, updated_at')
      .eq('key', key)
      .maybeSingle();

    if (!error && data && data.data) {
      setLocalData(key, data.data);
      return data.data as T;
    }
  } catch (err) {
    // If connection blip, use local cache seamlessly
    console.warn(`Online fetch notice for ${key}:`, err);
  }

  return cached;
}

/**
 * Fetch all entities from Supabase online database in a single query
 */
export async function fetchAllEntitiesFromCloud(): Promise<{
  data: Partial<Record<EntityKey, any>>;
  fromCloud: boolean;
}> {
  if (!isOnline()) {
    return { data: {}, fromCloud: false };
  }

  try {
    const { data, error } = await supabase
      .from('ponpes_data_store')
      .select('key, data, updated_at');

    if (!error && data && Array.isArray(data) && data.length > 0) {
      const result: Partial<Record<EntityKey, any>> = {};
      data.forEach((row) => {
        if (row.key && row.data) {
          result[row.key as EntityKey] = row.data;
          setLocalData(row.key, row.data);
        }
      });
      return { data: result, fromCloud: true };
    } else if (!error && Array.isArray(data) && data.length === 0) {
      // Auto-seed Supabase online database with initial datasets
      const seedDatasets: CompleteDatasets = {
        users: initialUsers,
        santri: initialSantri,
        absensi: initialAbsensi,
        jadwal: initialJadwalMadrasah,
        rutinitas: initialRutinitas,
        piket: initialPiket,
        suratIzin: initialSuratIzin,
        pelanggaran: initialPelanggaran,
        izinMengajar: initialIzinMengajar,
        jurnal: initialJurnal,
        pengumuman: initialPengumuman,
        settings: initialSettings,
        masterKelas: initialMasterKelas,
        masterKamar: initialMasterKamar,
        posPembayaran: initialPosPembayaran,
        tagihanSantri: initialTagihanSantri,
        pembayaran: initialPembayaran,
        kasOperasional: initialKasOperasional,
      };
      await pushAllToCloud(seedDatasets);
      return {
        data: {
          [ENTITY_KEYS.USERS]: initialUsers,
          [ENTITY_KEYS.SANTRI]: initialSantri,
          [ENTITY_KEYS.ABSENSI]: initialAbsensi,
          [ENTITY_KEYS.JADWAL]: initialJadwalMadrasah,
          [ENTITY_KEYS.RUTINITAS]: initialRutinitas,
          [ENTITY_KEYS.PIKET]: initialPiket,
          [ENTITY_KEYS.SURAT_IZIN]: initialSuratIzin,
          [ENTITY_KEYS.PELANGGARAN]: initialPelanggaran,
          [ENTITY_KEYS.IZIN_MENGAJAR]: initialIzinMengajar,
          [ENTITY_KEYS.JURNAL]: initialJurnal,
          [ENTITY_KEYS.PENGUMUMAN]: initialPengumuman,
          [ENTITY_KEYS.SETTINGS]: initialSettings,
          [ENTITY_KEYS.MASTER_KELAS]: initialMasterKelas,
          [ENTITY_KEYS.MASTER_KAMAR]: initialMasterKamar,
          [ENTITY_KEYS.POS_PEMBAYARAN]: initialPosPembayaran,
          [ENTITY_KEYS.TAGIHAN_SANTRI]: initialTagihanSantri,
          [ENTITY_KEYS.PEMBAYARAN]: initialPembayaran,
          [ENTITY_KEYS.KAS_OPERASIONAL]: initialKasOperasional,
        },
        fromCloud: true,
      };
    }
  } catch (err) {
    console.warn('Supabase bulk fetch notice:', err);
  }

  return { data: {}, fromCloud: false };
}

/**
 * Save an entity to Supabase online database and broadcast update to all connected devices
 */
export async function saveEntityToCloud<T>(
  key: EntityKey,
  data: T
): Promise<{ success: boolean; cloudSynced: boolean }> {
  // Always update local cache instantly for zero UI lag
  setLocalData(key, data);

  if (!isOnline()) {
    return { success: true, cloudSynced: false };
  }

  let cloudSynced = false;
  try {
    const { error } = await supabase.from('ponpes_data_store').upsert(
      {
        key,
        data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    if (!error) {
      cloudSynced = true;
    }
  } catch (err) {
    console.warn(`Cloud push notice for ${key}:`, err);
  }

  // Broadcast to other devices via Supabase Realtime channel
  try {
    const channel = supabase.channel('pesantren-realtime-sync');
    channel.send({
      type: 'broadcast',
      event: 'entity_mutation',
      payload: {
        key,
        timestamp: Date.now(),
      },
    });
  } catch {}

  // Update sync stats in local storage
  updateSyncTimestamp();

  return { success: true, cloudSynced };
}

/**
 * Push all local data to Supabase in one go (One-Click Cloud Sync)
 */
export async function pushAllToCloud(datasets: CompleteDatasets): Promise<{
  success: boolean;
  syncedKeys: string[];
  error?: string;
}> {
  if (!isOnline()) {
    return {
      success: false,
      syncedKeys: [],
      error: 'Perangkat sedang offline. Sambungkan internet untuk menyinkronkan.',
    };
  }

  const payload = [
    { key: ENTITY_KEYS.USERS, data: datasets.users },
    { key: ENTITY_KEYS.SANTRI, data: datasets.santri },
    { key: ENTITY_KEYS.ABSENSI, data: datasets.absensi },
    { key: ENTITY_KEYS.JADWAL, data: datasets.jadwal },
    { key: ENTITY_KEYS.RUTINITAS, data: datasets.rutinitas },
    { key: ENTITY_KEYS.PIKET, data: datasets.piket },
    { key: ENTITY_KEYS.SURAT_IZIN, data: datasets.suratIzin },
    { key: ENTITY_KEYS.PELANGGARAN, data: datasets.pelanggaran },
    { key: ENTITY_KEYS.IZIN_MENGAJAR, data: datasets.izinMengajar },
    { key: ENTITY_KEYS.JURNAL, data: datasets.jurnal },
    { key: ENTITY_KEYS.PENGUMUMAN, data: datasets.pengumuman },
    { key: ENTITY_KEYS.SETTINGS, data: datasets.settings },
    { key: ENTITY_KEYS.MASTER_KELAS, data: datasets.masterKelas },
    { key: ENTITY_KEYS.MASTER_KAMAR, data: datasets.masterKamar },
    { key: ENTITY_KEYS.POS_PEMBAYARAN, data: datasets.posPembayaran },
    { key: ENTITY_KEYS.TAGIHAN_SANTRI, data: datasets.tagihanSantri },
    { key: ENTITY_KEYS.PEMBAYARAN, data: datasets.pembayaran },
    { key: ENTITY_KEYS.KAS_OPERASIONAL, data: datasets.kasOperasional },
  ].map((item) => ({
    ...item,
    updated_at: new Date().toISOString(),
  }));

  try {
    const { error } = await supabase
      .from('ponpes_data_store')
      .upsert(payload, { onConflict: 'key' });

    if (error) {
      return {
        success: false,
        syncedKeys: [],
        error: error.message || 'Gagal menyimpan ke tabel Supabase.',
      };
    }

    // Broadcast sync
    try {
      const channel = supabase.channel('pesantren-realtime-sync');
      channel.send({
        type: 'broadcast',
        event: 'bulk_sync',
        payload: { timestamp: Date.now() },
      });
    } catch {}

    updateSyncTimestamp();

    return {
      success: true,
      syncedKeys: payload.map((p) => p.key),
    };
  } catch (err: any) {
    return {
      success: false,
      syncedKeys: [],
      error: err?.message || 'Koneksi ke server cloud gagal.',
    };
  }
}

/**
 * Setup Realtime Listener for Multi-Device synchronization
 */
export function setupRealtimeSyncListener(
  onRemoteEntityChange: (key: EntityKey, newData?: any) => void
): () => void {
  const channel = supabase.channel('pesantren-realtime-sync', {
    config: { broadcast: { self: false } },
  });

  channel
    .on('broadcast', { event: 'entity_mutation' }, async (payload) => {
      const key = payload?.payload?.key as EntityKey;
      if (key && Object.values(ENTITY_KEYS).includes(key)) {
        // Fetch the fresh updated data from cloud
        const freshData = await fetchEntityFromCloud(
          key,
          DEFAULT_ENTITIES_MAP[key]
        );
        onRemoteEntityChange(key, freshData);
      }
    })
    .on('broadcast', { event: 'bulk_sync' }, async () => {
      // Reload all
      const { data } = await fetchAllEntitiesFromCloud();
      Object.entries(data).forEach(([k, v]) => {
        onRemoteEntityChange(k as EntityKey, v);
      });
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// =========================================================================
// SYNC STATS & BACKUP/RESTORE UTILITIES
// =========================================================================

export function getSyncStats(): SyncStats {
  try {
    const raw = localStorage.getItem('pesantren_sync_stats');
    if (raw) return JSON.parse(raw);
  } catch {}

  return {
    lastSyncTime: null,
    status: navigator.onLine ? 'synced' : 'offline',
    source: isSupabaseConfigured ? 'cloud_supabase' : 'cache_local',
    totalEntities: Object.keys(ENTITY_KEYS).length,
  };
}

export function updateSyncTimestamp(message?: string): void {
  const stats: SyncStats = {
    lastSyncTime: new Date().toISOString(),
    status: navigator.onLine ? 'synced' : 'offline',
    source: isSupabaseConfigured ? 'cloud_supabase' : 'cache_local',
    totalEntities: Object.keys(ENTITY_KEYS).length,
    message,
  };
  try {
    localStorage.setItem('pesantren_sync_stats', JSON.stringify(stats));
  } catch {}
}

export function exportAllDataAsJson(datasets: CompleteDatasets): string {
  const exportPayload = {
    app: 'Sistem Manajemen Ponpes Raudhotu Hidayah',
    version: '2.5.0',
    exportedAt: new Date().toISOString(),
    database: datasets,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function parseAndImportData(
  jsonString: string
): { success: boolean; data?: Partial<CompleteDatasets>; message: string } {
  try {
    const parsed = JSON.parse(jsonString);
    const db = parsed.database || parsed;

    if (!db || typeof db !== 'object') {
      return { success: false, message: 'Format data JSON tidak valid.' };
    }

    return {
      success: true,
      data: db,
      message: 'Data backup berhasil diurai dan siap disinkronkan.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal membaca file JSON: ${err?.message || 'Sintaks tidak valid'}`,
    };
  }
}

/**
 * Sync individual finance tables directly to Supabase if relational tables exist
 */
export async function syncKeuanganDirectTables(
  pos: PosPembayaran[],
  tagihan: TagihanSantri[],
  bayar: PembayaranTransaksi[],
  kas: KasOperasional[]
): Promise<void> {
  if (!isOnline() || !isSupabaseConfigured) return;

  try {
    // 1. pos_pembayaran
    if (pos && pos.length > 0) {
      await supabase.from('pos_pembayaran').upsert(
        pos.map((p) => ({
          id: p.id,
          nama: p.nama,
          tipe: p.tipe,
          tarif_default: p.tarifDefault,
          keterangan: p.keterangan || '',
          tahun_ajaran: p.tahunAjaran,
          is_active: p.isActive,
          created_at: p.createdAt,
        })),
        { onConflict: 'id' }
      );
    }

    // 2. tagihan_santri
    if (tagihan && tagihan.length > 0) {
      await supabase.from('tagihan_santri').upsert(
        tagihan.map((t) => ({
          id: t.id,
          santri_id: t.santriId,
          santri_nama: t.santriNama,
          nis: t.nis,
          kelas: t.kelas,
          kamar: t.kamar || '',
          pos_id: t.posId,
          pos_nama: t.posNama,
          tipe: t.tipe,
          bulan: t.bulan,
          tahun: t.tahun,
          nominal: t.nominal,
          terbayar: t.terbayar,
          sisa: t.sisa,
          status: t.status,
          jatuh_tempo: t.jatuhTempo || null,
          catatan: t.catatan || '',
          created_at: t.createdAt,
        })),
        { onConflict: 'id' }
      );
    }

    // 3. pembayaran
    if (bayar && bayar.length > 0) {
      await supabase.from('pembayaran').upsert(
        bayar.map((b) => ({
          id: b.id,
          nomor_transaksi: b.nomorTransaksi,
          tagihan_id: b.tagihanId,
          santri_id: b.santriId,
          santri_nama: b.santriNama,
          nis: b.nis,
          kelas: b.kelas,
          pos_nama: b.posNama,
          nominal_bayar: b.nominalBayar,
          metode_pembayaran: b.metodePembayaran,
          tanggal_bayar: b.tanggalBayar,
          petugas: b.petugas,
          penyetor: b.penyetor || '',
          keterangan: b.keterangan || '',
          created_at: b.createdAt,
        })),
        { onConflict: 'id' }
      );
    }

    // 4. kas_operasional
    if (kas && kas.length > 0) {
      await supabase.from('kas_operasional').upsert(
        kas.map((k) => ({
          id: k.id,
          nomor_bukti: k.nomorBukti,
          jenis: k.jenis,
          kategori: k.kategori,
          nominal: k.nominal,
          tanggal: k.tanggal,
          pihak_terkait: k.pihakTerkait,
          keterangan: k.keterangan,
          petugas: k.petugas,
          metode: k.metode,
          created_at: k.createdAt,
        })),
        { onConflict: 'id' }
      );
    }
  } catch (err) {
    // If table doesn't exist yet, it's safe because document store already has the data
    console.warn('Direct financial tables notice:', err);
  }
}

/**
 * SQL script for Supabase SQL Editor
 */
export const SUPABASE_SQL_SETUP_SCRIPT = `-- ================================================================
-- SKRIP SETUP TABEL DATABASE ONLINE SISTEM PONPES RAUDHOTU HIDAYAH
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ================================================================

-- 1. Buat Tabel Penyimpanan Cloud Universal (Key-Value Document Store)
CREATE TABLE IF NOT EXISTS public.ponpes_data_store (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.ponpes_data_store ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Akses Baca & Tulis Terbuka untuk Sistem Ponpes (Anon Key)
DROP POLICY IF EXISTS "Akses Publik Baca Ponpes Store" ON public.ponpes_data_store;
CREATE POLICY "Akses Publik Baca Ponpes Store"
  ON public.ponpes_data_store FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Akses Publik Tulis Ponpes Store" ON public.ponpes_data_store;
CREATE POLICY "Akses Publik Tulis Ponpes Store"
  ON public.ponpes_data_store FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Aktifkan Supabase Realtime untuk Dokumen Store
ALTER PUBLICATION supabase_realtime ADD TABLE public.ponpes_data_store;

-- ================================================================
-- MODUL ADMINISTRASI & KEUANGAN BENDAHARA (TABEL RELASIONAL SUPABASE)
-- ================================================================

-- 5. Tabel Master Pos Pembayaran
CREATE TABLE IF NOT EXISTS public.pos_pembayaran (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  tipe TEXT NOT NULL, -- 'bulanan' | 'tahunan' | 'bebas'
  tarif_default NUMERIC DEFAULT 0,
  keterangan TEXT,
  tahun_ajaran TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.pos_pembayaran ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Publik Pos Pembayaran" ON public.pos_pembayaran;
CREATE POLICY "Akses Publik Pos Pembayaran" ON public.pos_pembayaran FOR ALL USING (true) WITH CHECK (true);

-- 6. Tabel Tagihan Santri (Syahriah, Uang Makan, Kitab, Gedung, dll)
CREATE TABLE IF NOT EXISTS public.tagihan_santri (
  id TEXT PRIMARY KEY,
  santri_id TEXT NOT NULL,
  santri_nama TEXT NOT NULL,
  nis TEXT,
  kelas TEXT,
  kamar TEXT,
  pos_id TEXT,
  pos_nama TEXT NOT NULL,
  tipe TEXT NOT NULL,
  bulan TEXT,
  tahun TEXT,
  nominal NUMERIC NOT NULL,
  terbayar NUMERIC DEFAULT 0,
  sisa NUMERIC NOT NULL,
  status TEXT NOT NULL, -- 'Lunas' | 'Menunggak' | 'Kurang Bayar'
  jatuh_tempo TEXT,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.tagihan_santri ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Publik Tagihan Santri" ON public.tagihan_santri;
CREATE POLICY "Akses Publik Tagihan Santri" ON public.tagihan_santri FOR ALL USING (true) WITH CHECK (true);

-- 7. Tabel Transaksi Pembayaran Santri & Kwitansi Digital
CREATE TABLE IF NOT EXISTS public.pembayaran (
  id TEXT PRIMARY KEY,
  nomor_transaksi TEXT NOT NULL,
  tagihan_id TEXT,
  santri_id TEXT NOT NULL,
  santri_nama TEXT NOT NULL,
  nis TEXT,
  kelas TEXT,
  pos_nama TEXT,
  nominal_bayar NUMERIC NOT NULL,
  metode_pembayaran TEXT NOT NULL, -- 'Tunai' | 'Transfer'
  tanggal_bayar TEXT NOT NULL,
  petugas TEXT,
  penyetor TEXT,
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.pembayaran ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Publik Pembayaran" ON public.pembayaran;
CREATE POLICY "Akses Publik Pembayaran" ON public.pembayaran FOR ALL USING (true) WITH CHECK (true);

-- 8. Tabel Buku Kas & Pengeluaran Operasional Pesantren
CREATE TABLE IF NOT EXISTS public.kas_operasional (
  id TEXT PRIMARY KEY,
  nomor_bukti TEXT NOT NULL,
  jenis TEXT NOT NULL, -- 'Masuk' | 'Keluar'
  kategori TEXT NOT NULL,
  nominal NUMERIC NOT NULL,
  tanggal TEXT NOT NULL,
  pihak_terkait TEXT,
  keterangan TEXT,
  petugas TEXT,
  metode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.kas_operasional ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Publik Kas Operasional" ON public.kas_operasional;
CREATE POLICY "Akses Publik Kas Operasional" ON public.kas_operasional FOR ALL USING (true) WITH CHECK (true);

-- Tambahkan seluruh tabel ke Publikasi Realtime Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE public.pos_pembayaran;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tagihan_santri;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pembayaran;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kas_operasional;

-- Berhasil! Database online siap menyinkronkan seluruh data aplikasi secara real-time.
`;
