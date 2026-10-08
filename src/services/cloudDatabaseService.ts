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
}

export interface SyncStats {
  lastSyncTime: string | null;
  status: 'synced' | 'syncing' | 'offline' | 'error';
  source: 'cloud_supabase' | 'cache_local';
  totalEntities: number;
  message?: string;
}

// Local cache helper
export function getLocalData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
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
};

// =========================================================================
// ONLINE CLOUD CRUD OPERATIONS (Supabase + Realtime Multi-Device Sync)
// =========================================================================

/**
 * Fetch a single entity from Supabase online database (falls back to local cache)
 */
export async function fetchEntityFromCloud<T>(key: EntityKey, fallback: T): Promise<T> {
  const cached = getLocalData<T>(key, fallback);

  if (!navigator.onLine) {
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
    // If table doesn't exist yet or connection blip, use local cache seamlessly
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
  if (!navigator.onLine) {
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

  if (!navigator.onLine) {
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
  if (!navigator.onLine) {
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

-- 4. Aktifkan Supabase Realtime agar sinkronisasi multi-device berjalan otomatis
ALTER PUBLICATION supabase_realtime ADD TABLE public.ponpes_data_store;

-- Berhasil! Database online siap menyinkronkan seluruh data aplikasi secara real-time.
`;
