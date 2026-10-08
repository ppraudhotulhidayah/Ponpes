import React, { useState } from 'react';
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { User, PesantrenSettings } from '../types';

interface LoginPageProps {
  allUsers: User[];
  onLoginSuccess: (user: User) => void;
  settings: PesantrenSettings;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  allUsers,
  onLoginSuccess,
  settings,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const cleanUser = username.trim().toLowerCase();

    // Auto-detect user & authenticate against users list
    setTimeout(() => {
      const foundUser = allUsers.find(
        (u) =>
          u.username.toLowerCase() === cleanUser ||
          u.email.toLowerCase() === cleanUser
      );

      if (!foundUser) {
        setErrorMessage('Username atau kata sandi tidak ditemukan.');
        setIsLoading(false);
        return;
      }

      if (foundUser.password && foundUser.password !== password) {
        setErrorMessage('Username atau kata sandi tidak ditemukan.');
        setIsLoading(false);
        return;
      }

      // Successful authentication
      setIsLoading(false);
      onLoginSuccess(foundUser);
    }, 300);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-stone-900 selection:bg-emerald-700 selection:text-white overflow-hidden">
      {/* Ambient background with Islamic pattern aesthetic & blur lights */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.25),rgba(255,255,255,0))]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Islamic Geometric subtle lines */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Modern Glassmorphic Login Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl border border-white/60 p-8 sm:p-10 transition-all">
          {/* Header Kartu: Logo Lembaga & Nama Pesantren */}
          <div className="flex flex-col items-center text-center mb-8">
            {settings?.logoUrl ? (
              <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-md flex items-center justify-center mb-4 border border-emerald-100">
                <img
                  src={settings.logoUrl}
                  alt="Logo Lembaga"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-800 via-emerald-900 to-teal-950 p-1 shadow-lg shadow-emerald-950/20 flex items-center justify-center mb-4 border border-amber-400/40">
                <div className="w-full h-full rounded-xl flex items-center justify-center text-amber-400">
                  <svg
                    className="w-9 h-9"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  >
                    <path d="M12 2L4 7v13h16V7L12 2z" strokeLinejoin="round" />
                    <path d="M12 2v7" />
                    <path
                      d="M9 13a3 3 0 0 1 6 0v7H9v-7z"
                      fill="currentColor"
                      fillOpacity="0.25"
                    />
                    <circle cx="12" cy="5.5" r="1.5" fill="currentColor" />
                  </svg>
                </div>
              </div>
            )}

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              {settings?.namaLembaga || 'Pondok Pesantren Raudhotu Hidayah'}
            </h1>
            <p className="text-xs text-stone-500 mt-1.5 font-medium max-w-xs">
              {settings?.subNamaTagline ||
                'Sistem Informasi Manajemen Santri & Pengasuhan Terpadu'}
            </p>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Portal Akses Terpadu (Single Sign-On)</span>
            </div>
          </div>

          {/* Alert Error Message */}
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-rose-50/90 border border-rose-200/90 rounded-2xl text-xs text-rose-800 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Form Universal: Hanya Username & Password */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input 1: Username / ID Akun */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Username / ID Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Masukkan username atau email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50/80 border border-stone-200 rounded-2xl text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Input 2: Kata Sandi / Password */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-stone-50/80 border border-stone-200 rounded-2xl text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition cursor-pointer"
                  title={showPassword ? 'Sembunyikan Kata Sandi' : 'Lihat Kata Sandi'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Tombol Utama: Masuk ke Sistem */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 hover:shadow-xl transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-amber-300" />
                    <span>Masuk ke Sistem</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Card */}
          <div className="mt-8 pt-5 border-t border-stone-100 text-center">
            <p className="text-[11px] text-stone-400">
              Sistem akan otomatis mengidentifikasi hak akses Anda (Admin, Ustadz, atau Wali Santri).
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-stone-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Koneksi aman terenkripsi • Tersinkronisasi Online Cloud (Supabase)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
