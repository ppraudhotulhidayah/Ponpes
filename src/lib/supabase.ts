import { createClient, RealtimeChannel } from '@supabase/supabase-js';

// Read environment variables if available
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://sistem-ponpes-realtime.supabase.co';
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy_anon_key_for_client';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Create Supabase client with realtime settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

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
