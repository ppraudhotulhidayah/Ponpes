import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MasterKelas, MasterKamar } from '../types';
import { initialMasterKelas, initialMasterKamar } from '../data/mockData';

const STORAGE_KEY_KELAS = 'pesantren_master_kelas';
const STORAGE_KEY_KAMAR = 'pesantren_master_kamar';

// Helper for local storage
function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

// ==========================================
// MASTER KELAS API (Supabase + Local Fallback)
// ==========================================

export async function fetchMasterKelasList(): Promise<MasterKelas[]> {
  const localData = getLocal<MasterKelas[]>(STORAGE_KEY_KELAS, initialMasterKelas);

  if (!isSupabaseConfigured || !navigator.onLine) {
    return localData;
  }

  try {
    const { data, error } = await supabase
      .from('master_kelas')
      .select('*')
      .order('nama', { ascending: true });

    if (error) {
      console.warn('Supabase fetch master_kelas error, using local data:', error.message);
      return localData;
    }

    if (data && data.length > 0) {
      setLocal(STORAGE_KEY_KELAS, data);
      return data as MasterKelas[];
    } else {
      // If table exists but is empty, seed with initial data
      return localData;
    }
  } catch (err) {
    console.warn('Supabase fetch failed, fallback to local:', err);
    return localData;
  }
}

export async function saveMasterKelasItem(item: MasterKelas): Promise<MasterKelas> {
  // Always update local cache first for instant UI response
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

  // Sync to Supabase if configured & online
  if (isSupabaseConfigured && navigator.onLine) {
    try {
      const { error } = await supabase
        .from('master_kelas')
        .upsert({
          id: item.id,
          nama: item.nama,
          tingkat: item.tingkat,
          kategori: item.kategori,
          keterangan: item.keterangan || '',
          wali_kelas: item.waliKelas || '',
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.warn('Supabase upsert master_kelas notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase save error:', err);
    }
  }

  return item;
}

export async function deleteMasterKelasItem(id: string): Promise<boolean> {
  const current = getLocal<MasterKelas[]>(STORAGE_KEY_KELAS, initialMasterKelas);
  const filtered = current.filter((k) => k.id !== id);
  setLocal(STORAGE_KEY_KELAS, filtered);

  if (isSupabaseConfigured && navigator.onLine) {
    try {
      const { error } = await supabase.from('master_kelas').delete().eq('id', id);
      if (error) console.warn('Supabase delete master_kelas notice:', error.message);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  return true;
}

// ==========================================
// MASTER KAMAR API (Supabase + Local Fallback)
// ==========================================

export async function fetchMasterKamarList(): Promise<MasterKamar[]> {
  const localData = getLocal<MasterKamar[]>(STORAGE_KEY_KAMAR, initialMasterKamar);

  if (!isSupabaseConfigured || !navigator.onLine) {
    return localData;
  }

  try {
    const { data, error } = await supabase
      .from('master_kamar')
      .select('*')
      .order('nama', { ascending: true });

    if (error) {
      console.warn('Supabase fetch master_kamar error, using local data:', error.message);
      return localData;
    }

    if (data && data.length > 0) {
      setLocal(STORAGE_KEY_KAMAR, data);
      return data as MasterKamar[];
    } else {
      return localData;
    }
  } catch (err) {
    console.warn('Supabase fetch kamar failed, fallback to local:', err);
    return localData;
  }
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

  if (isSupabaseConfigured && navigator.onLine) {
    try {
      const { error } = await supabase
        .from('master_kamar')
        .upsert({
          id: item.id,
          nama: item.nama,
          rayon: item.rayon,
          gender: item.gender,
          kapasitas: item.kapasitas,
          fasilitas: item.fasilitas || '',
          keterangan: item.keterangan || '',
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.warn('Supabase upsert master_kamar notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase save error:', err);
    }
  }

  return item;
}

export async function deleteMasterKamarItem(id: string): Promise<boolean> {
  const current = getLocal<MasterKamar[]>(STORAGE_KEY_KAMAR, initialMasterKamar);
  const filtered = current.filter((k) => k.id !== id);
  setLocal(STORAGE_KEY_KAMAR, filtered);

  if (isSupabaseConfigured && navigator.onLine) {
    try {
      const { error } = await supabase.from('master_kamar').delete().eq('id', id);
      if (error) console.warn('Supabase delete master_kamar notice:', error.message);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  return true;
}
