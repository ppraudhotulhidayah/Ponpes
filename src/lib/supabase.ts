import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}

const DEFAULT_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  'https://pjakwkchjogjirbfbhmb.supabase.co';

const DEFAULT_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYWt3a2Noam9namlyYmZiaG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NzQyMjMsImV4cCI6MjEwNzA1MDIyM30._YG6xebd76gfPLDM6x6k_a_ybtNl8k1vs-PWM-PXsqc';

export function getSupabaseConfig(): SupabaseConfig {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('pesantren_supabase_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.url && parsed.anonKey) {
          return {
            url: parsed.url.trim(),
            anonKey: parsed.anonKey.trim(),
            isCustom: true,
          };
        }
      }
    }
  } catch {}

  const hasEnv = Boolean(
    (typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_SUPABASE_URL &&
      import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
      (typeof process !== 'undefined' &&
        process.env?.VITE_SUPABASE_URL &&
        process.env?.VITE_SUPABASE_ANON_KEY)
  );

  return {
    url: DEFAULT_URL,
    anonKey: DEFAULT_KEY,
    isCustom: false,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'pesantren_supabase_config',
        JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
      );
    }
  } catch (e) {
    console.error('Failed to save Supabase config:', e);
  }
}

export function resetSupabaseConfig(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('pesantren_supabase_config');
    }
  } catch {}
}

const activeConfig = getSupabaseConfig();

export let isSupabaseConfigured = true;

export let supabase: SupabaseClient = createClient(
  activeConfig.url,
  activeConfig.anonKey,
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export function reinitializeSupabaseClient(): SupabaseClient {
  const conf = getSupabaseConfig();
  isSupabaseConfigured = Boolean(
    conf.isCustom ||
      (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
  );
  supabase = createClient(conf.url, conf.anonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
  return supabase;
}

export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string; latency?: number }> {
  const startTime = performance.now();
  const cleanUrl = url.replace(/\/+$/, '');
  try {
    let res = await fetch(`${cleanUrl}/rest/v1/ponpes_data_store?limit=1`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      cache: 'no-store',
    });

    if (!res.ok && res.status !== 200 && res.status !== 404) {
      res = await fetch(`${cleanUrl}/rest/v1/santri?limit=1`, {
        method: 'GET',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        cache: 'no-store',
      });
    }
    const elapsed = Math.round(performance.now() - startTime);

    if (res.ok || res.status === 200 || res.status === 404) {
      return {
        success: true,
        message: `Terhubung sukses ke Supabase Cloud (${elapsed} ms).`,
        latency: elapsed,
      };
    } else if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        message: 'Kunci Anon Key tidak valid (Akses ditolak 401/403).',
      };
    } else {
      return {
        success: true,
        message: `Respon diterima (${res.status} - ${elapsed} ms).`,
        latency: elapsed,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menghubungi URL: ${err?.message || 'Network Error / CORS'}`,
    };
  }
}

export type RealtimeStatus =
  | 'CONNECTED'
  | 'CONNECTING'
  | 'DISCONNECTED'
  | 'ERROR';

export interface ConnectionInfo {
  status: RealtimeStatus;
  ping: number | null; // in ms
  lastPingTime: Date | null;
  channelName: string;
  isConfigured: boolean;
}
