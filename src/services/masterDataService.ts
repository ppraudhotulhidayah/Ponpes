import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MasterKelas, MasterKamar } from '../types';
import { initialMasterKelas, initialMasterKamar } from '../data/mockData';
import {
  ENTITY_KEYS,
  fetchEntityFromCloud,
  saveEntityToCloud,
} from './cloudDatabaseService';

const STORAGE_KEY_KELAS = 'pesantren_master_kelas';
const STORAGE_KEY_KAMAR = 'pesantren_master_kamar';

// Helper for local cache
function getLocal<T>(key: string, fallback: T): T {
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

function setLocal<T>(key: string, data: T): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    console.error('Storage error:', e);
  }
}

// ==========================================
// MASTER KELAS API (Supabase Online + Cache)
// ==========================================

export async function fetchMasterKelasList(): Promise<MasterKelas[]> {
  try {
    // 1. Fetch from cloud document store
    const cloudData = await fetchEntityFromCloud<MasterKelas[]>(
      ENTITY_KEYS.MASTER_KELAS,
      initialMasterKelas
    );
    if (cloudData && cloudData.length > 0) {
      setLocal(STORAGE_KEY_KELAS, cloudData);
      return cloudData;
    }
  } catch {}

  const localData = getLocal<MasterKelas[]>(STORAGE_KEY_KELAS, initialMasterKelas);

  if (!isSupabaseConfigured || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return localData;
  }

  try {
    const { data, error } = await supabase
      .from('master_kelas')
      .select('*')
      .order('nama', { ascending: true });

    if (!error && data && data.length > 0) {
      setLocal(STORAGE_KEY_KELAS, data);
      return data as MasterKelas[];
    }
  } catch (err) {
    console.warn('Supabase fetch master_kelas notice:', err);
  }

  return localData;
}

export async function saveMasterKelasItem(item: MasterKelas): Promise<MasterKelas> {
  const current = getLocal<MasterKelas[]>(STORAGE_KEY_KELAS, initialMasterKelas);
  const existingIdx = current.findIndex((k) => k.id === item.id);
  let updated: MasterKelas[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = item;
  } else {
    updated = [item, ...current];
  }
  setLocal(STORAGE_KEY_KELAS, updated);

  // Sync to Supabase cloud document store
  await saveEntityToCloud(ENTITY_KEYS.MASTER_KELAS, updated);

  // Also try dedicated table if configured
  if (isSupabaseConfigured && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      await supabase.from('master_kelas').upsert({
        id: item.id,
        nama: item.nama,
        tingkat: item.tingkat,
        kategori: item.kategori,
        keterangan: item.keterangan || '',
        wali_kelas: item.waliKelas || '',
        updated_at: new Date().toISOString(),
      });
    } catch {}
  }

  return item;
}

export async function deleteMasterKelasItem(id: string): Promise<boolean> {
  const current = getLocal<MasterKelas[]>(STORAGE_KEY_KELAS, initialMasterKelas);
  const filtered = current.filter((k) => k.id !== id);
  setLocal(STORAGE_KEY_KELAS, filtered);

  await saveEntityToCloud(ENTITY_KEYS.MASTER_KELAS, filtered);

  if (isSupabaseConfigured && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      await supabase.from('master_kelas').delete().eq('id', id);
    } catch {}
  }

  return true;
}

// ==========================================
// MASTER KAMAR API (Supabase Online + Cache)
// ==========================================

export async function fetchMasterKamarList(): Promise<MasterKamar[]> {
  try {
    const cloudData = await fetchEntityFromCloud<MasterKamar[]>(
      ENTITY_KEYS.MASTER_KAMAR,
      initialMasterKamar
    );
    if (cloudData && cloudData.length > 0) {
      setLocal(STORAGE_KEY_KAMAR, cloudData);
      return cloudData;
    }
  } catch {}

  const localData = getLocal<MasterKamar[]>(STORAGE_KEY_KAMAR, initialMasterKamar);

  if (!isSupabaseConfigured || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return localData;
  }

  try {
    const { data, error } = await supabase
      .from('master_kamar')
      .select('*')
      .order('nama', { ascending: true });

    if (!error && data && data.length > 0) {
      setLocal(STORAGE_KEY_KAMAR, data);
      return data as MasterKamar[];
    }
  } catch (err) {
    console.warn('Supabase fetch master_kamar notice:', err);
  }

  return localData;
}

export async function saveMasterKamarItem(item: MasterKamar): Promise<MasterKamar> {
  const current = getLocal<MasterKamar[]>(STORAGE_KEY_KAMAR, initialMasterKamar);
  const existingIdx = current.findIndex((k) => k.id === item.id);
  let updated: MasterKamar[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = item;
  } else {
    updated = [item, ...current];
  }
  setLocal(STORAGE_KEY_KAMAR, updated);

  await saveEntityToCloud(ENTITY_KEYS.MASTER_KAMAR, updated);

  if (isSupabaseConfigured && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      await supabase.from('master_kamar').upsert({
        id: item.id,
        nama: item.nama,
        rayon: item.rayon,
        gender: item.gender,
        kapasitas: item.kapasitas,
        fasilitas: item.fasilitas || '',
        keterangan: item.keterangan || '',
        updated_at: new Date().toISOString(),
      });
    } catch {}
  }

  return item;
}

export async function deleteMasterKamarItem(id: string): Promise<boolean> {
  const current = getLocal<MasterKamar[]>(STORAGE_KEY_KAMAR, initialMasterKamar);
  const filtered = current.filter((k) => k.id !== id);
  setLocal(STORAGE_KEY_KAMAR, filtered);

  await saveEntityToCloud(ENTITY_KEYS.MASTER_KAMAR, filtered);

  if (isSupabaseConfigured && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      await supabase.from('master_kamar').delete().eq('id', id);
    } catch {}
  }

  return true;
}
