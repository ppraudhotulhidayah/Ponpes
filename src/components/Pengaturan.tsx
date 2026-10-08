import React, { useState } from 'react';
import {
  Settings,
  Building,
  KeyRound,
  ShieldCheck,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  User as UserIcon,
  RotateCcw,
  Layers,
  ChevronRight,
  Database,
  Cloud,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
  Server,
  Copy,
  Check,
  Smartphone,
  Laptop,
  AlertCircle,
  FileDown,
  FileUp,
  CheckCheck,
} from 'lucide-react';
import { PesantrenSettings, User, UserRole } from '../types';
import {
  CompleteDatasets,
  exportAllDataAsJson,
  parseAndImportData,
  SUPABASE_SQL_SETUP_SCRIPT,
  getSyncStats,
} from '../services/cloudDatabaseService';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  resetSupabaseConfig,
  testSupabaseConnection,
  reinitializeSupabaseClient,
  isSupabaseConfigured,
} from '../lib/supabase';

interface PengaturanProps {
  settings: PesantrenSettings;
  onUpdateSettings: (s: PesantrenSettings) => void;
  userRole: UserRole;
  currentUser: User;
  onUpdateAdminProfile: (profile: {
    name: string;
    username: string;
    password?: string;
  }) => void;
  onNavigateToMaster?: () => void;
  datasets?: CompleteDatasets;
  onSyncAllToCloud?: () => Promise<void>;
  onPullAllFromCloud?: () => Promise<void>;
  onImportData?: (imported: Partial<CompleteDatasets>) => void;
  onResetAllData?: () => void;
}

export const Pengaturan: React.FC<PengaturanProps> = ({
  settings,
  onUpdateSettings,
  currentUser,
  onUpdateAdminProfile,
  onNavigateToMaster,
  datasets,
  onSyncAllToCloud,
  onPullAllFromCloud,
  onImportData,
  onResetAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'identitas' | 'keamanan' | 'sistem'>(
    'identitas'
  );
  const [formData, setFormData] = useState<PesantrenSettings>({ ...settings });
  const [adminDisplayName, setAdminDisplayName] = useState(
    currentUser.displayName || currentUser.name || settings.adminDisplayName
  );
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Cloud config state
  const currentDbConfig = getSupabaseConfig();
  const [dbUrl, setDbUrl] = useState(currentDbConfig.url);
  const [dbAnonKey, setDbAnonKey] = useState(currentDbConfig.anonKey);
  const [showCustomDbForm, setShowCustomDbForm] = useState(currentDbConfig.isCustom);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latency?: number;
  } | null>(null);
  const [isPushingCloud, setIsPushingCloud] = useState(false);
  const [isPullingCloud, setIsPullingCloud] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const syncStats = getSyncStats();

  const showNotif = (
    type: 'success' | 'error' | 'info',
    message: string
  ) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleSaveIdentitas = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...formData,
      adminDisplayName,
    });
    showNotif('success', 'Pengaturan identitas lembaga pesantren berhasil disimpan!');
  };

  const handleSaveKeamanan = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword) {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        showNotif('error', 'Konfirmasi kata sandi baru tidak cocok.');
        return;
      }
      if (passwordForm.newPassword.length < 5) {
        showNotif('error', 'Kata sandi baru minimal harus 5 karakter.');
        return;
      }
    }

    // Update admin profile name and credentials
    onUpdateAdminProfile({
      name: adminDisplayName.trim(),
      username: formData.adminUsername.trim(),
      password: passwordForm.newPassword ? passwordForm.newPassword : undefined,
    });

    onUpdateSettings({
      ...formData,
      adminDisplayName: adminDisplayName.trim(),
      namaKepalaKesantrian: adminDisplayName.trim(),
    });

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showNotif(
      'success',
      `Nama Admin & Profil berhasil diperbarui menjadi "${adminDisplayName.trim()}".`
    );
  };

  // Database operations
  const handleTestConnection = async () => {
    setIsTestingDb(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection(dbUrl, dbAnonKey);
      setTestResult(result);
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleSaveDbConfig = () => {
    saveSupabaseConfig(dbUrl, dbAnonKey);
    reinitializeSupabaseClient();
    showNotif('success', 'Konfigurasi database online Supabase berhasil disimpan.');
  };

  const handleResetDbConfig = () => {
    resetSupabaseConfig();
    const def = getSupabaseConfig();
    setDbUrl(def.url);
    setDbAnonKey(def.anonKey);
    setShowCustomDbForm(false);
    reinitializeSupabaseClient();
    showNotif('info', 'Konfigurasi database dikembalikan ke setelan bawaan.');
  };

  const handleTriggerPushCloud = async () => {
    if (!onSyncAllToCloud) return;
    setIsPushingCloud(true);
    try {
      await onSyncAllToCloud();
      showNotif('success', 'Semua data berhasil disinkronkan ke server online Supabase.');
    } catch {
      showNotif('error', 'Gagal menyinkronkan data ke cloud.');
    } finally {
      setIsPushingCloud(false);
    }
  };

  const handleTriggerPullCloud = async () => {
    if (!onPullAllFromCloud) return;
    setIsPullingCloud(true);
    try {
      await onPullAllFromCloud();
      showNotif('success', 'Data terbaru berhasil ditarik dari server online Supabase.');
    } catch {
      showNotif('error', 'Gagal menarik data dari cloud.');
    } finally {
      setIsPullingCloud(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    showNotif('success', 'Skrip SQL berhasil disalin ke clipboard.');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleDownloadBackup = () => {
    if (!datasets) return;
    const jsonStr = exportAllDataAsJson(datasets);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_ponpes_raudhotu_hidayah_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotif('success', 'File cadangan JSON berhasil diunduh.');
  };

  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = parseAndImportData(content);
      if (res.success && res.data) {
        if (onImportData) {
          onImportData(res.data);
          showNotif('success', 'Data cadangan berhasil dipulihkan ke aplikasi.');
        }
      } else {
        showNotif('error', res.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetData = () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mengatur ulang data ke kondisi bawaan awal? Seluruh data santri, absensi, jadwal, dan riwayat akan di-reset ke template resmi Pesantren Raudhotu Hidayah.'
      )
    ) {
      if (onResetAllData) {
        onResetAllData();
      } else {
        try {
          localStorage.clear();
        } catch {}
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-800" />
            <span>Pengaturan Identitas Lembaga &amp; Keamanan</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Konfigurasi profil resmi pesantren, nama admin, kop surat dokumen, dan database online cloud
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('identitas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'identitas'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Identitas Lembaga
          </button>
          <button
            onClick={() => setActiveTab('keamanan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'keamanan'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Profil Admin &amp; Sandi
          </button>
          <button
            onClick={() => setActiveTab('sistem')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sistem'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Database Online &amp; Cloud Sync</span>
          </button>
        </div>
      </div>

      {onNavigateToMaster && (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-800 text-amber-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950">
                Manajemen Master Data Kelas &amp; Kamar Asrama
              </h4>
              <p className="text-[11px] text-emerald-800">
                Kelola referensi resmi daftar kelas formal, madrasah diniyah, dan kamar santri secara dinamis.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToMaster}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shrink-0 cursor-pointer shadow-xs"
          >
            <span>Buka Master Data</span>
            <ChevronRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      )}

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : feedback.type === 'info'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : feedback.type === 'info' ? (
            <Cloud className="w-5 h-5 shrink-0 text-amber-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* TAB 1: IDENTITAS LEMBAGA */}
      {activeTab === 'identitas' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-800" />
              <span>Profil &amp; Kop Surat Resmi Lembaga</span>
            </h3>
            <p className="text-stone-500 mt-1">
              Informasi ini digunakan pada kop surat resmi, surat izin santri, sertifikat, dan laporan cetak PDF.
            </p>
          </div>

          <form onSubmit={handleSaveIdentitas} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Lembaga Pesantren:
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaLembaga}
                  onChange={(e) =>
                    setFormData({ ...formData, namaLembaga: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tagline / Visi Singkat:
                </label>
                <input
                  type="text"
                  value={formData.subNamaTagline}
                  onChange={(e) =>
                    setFormData({ ...formData, subNamaTagline: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">
                  Alamat Lengkap Pesantren:
                </label>
                <textarea
                  rows={2}
                  value={formData.alamatLengkap}
                  onChange={(e) =>
                    setFormData({ ...formData, alamatLengkap: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nomor Telepon / WhatsApp Sekretariat:
                </label>
                <input
                  type="text"
                  value={formData.telepon}
                  onChange={(e) =>
                    setFormData({ ...formData, telepon: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Email Resmi Pesantren:
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Pengasuh / Pimpinan Pondok:
                </label>
                <input
                  type="text"
                  value={formData.namaPengasuh}
                  onChange={(e) =>
                    setFormData({ ...formData, namaPengasuh: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Kepala Kesantrian (Tanda Tangan Surat):
                </label>
                <input
                  type="text"
                  value={formData.namaKepalaKesantrian}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      namaKepalaKesantrian: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Simpan Identitas Lembaga</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: PROFIL ADMIN & KEAMANAN */}
      {activeTab === 'keamanan' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-800" />
              <span>Profil Nama Admin &amp; Keamanan Akun</span>
            </h3>
            <p className="text-stone-500 mt-1">
              Ubah nama lengkap Admin, username login, serta kata sandi akun Administrator Anda.
            </p>
          </div>

          <form onSubmit={handleSaveKeamanan} className="space-y-4">
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-4">
              <h4 className="font-bold text-emerald-950 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-emerald-800" />
                <span>Nama Lengkap &amp; Username Administrator</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nama Lengkap Admin (Tampil di Header &amp; Surat):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ustadz H. Ahmad Muzammil, S.Pd.I"
                    value={adminDisplayName}
                    onChange={(e) => setAdminDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 font-medium"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Nama ini akan langsung tampil di ucapan selamat datang header dan tanda tangan berkas resmi.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Username ID Login Admin:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.adminUsername}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adminUsername: e.target.value.toLowerCase(),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 font-mono"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Digunakan untuk masuk ke sistem bersama kata sandi.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-4">
              <h4 className="font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Ubah Kata Sandi (Opsional)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Kata Sandi Baru:
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      placeholder="Masukkan sandi baru (kosongkan jika tidak ingin diubah)"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 pr-10 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showNewPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Konfirmasi Kata Sandi Baru:
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      placeholder="Ulangi kata sandi baru"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 pr-10 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showConfirmPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Simpan Perubahan Profil Admin</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: DATABASE ONLINE & CLOUD SYNC */}
      {activeTab === 'sistem' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Database className="w-4.5 h-4.5 text-emerald-800" />
                <span>Penyimpanan Database Online &amp; Sinkronisasi Cloud (Supabase)</span>
              </h3>
              <p className="text-stone-600 mt-1 leading-relaxed">
                Aplikasi ini terhubung langsung ke database online Supabase Cloud secara real-time. Seluruh perubahan data absensi, santri, jadwal, surat izin, pelanggaran, dan kredensial akun tersimpan aman di server awan dan otomatis tersinkronisasi saat pengguna berpindah perangkat (smartphone, tablet, maupun komputer desktop).
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Database Cloud Aktif</span>
              </span>
            </div>
          </div>

          {/* Device & Sync Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-linear-to-br from-emerald-50 to-teal-50/70 border border-emerald-200/90 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-800 text-amber-300 shrink-0">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-stone-500">Status Server Cloud</div>
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Online &amp; Real-Time</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5 font-mono">
                  {syncStats.lastSyncTime
                    ? `Sinkron: ${new Date(syncStats.lastSyncTime).toLocaleTimeString('id-ID')} WIB`
                    : 'Terhubung ke server'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-linear-to-br from-amber-50 to-orange-50/70 border border-amber-200/90 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-600 text-white shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-stone-500">Dukungan Multi-Device</div>
                <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-amber-700" />
                  <span>Otomatis Sinkron di HP &amp; PC</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  Data tidak hilang saat ganti perangkat
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-linear-to-br from-stone-50 to-stone-100/90 border border-stone-200 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-stone-700 text-white shrink-0">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-stone-500">Penyimpanan Terintegrasi</div>
                <div className="text-xs font-bold text-stone-900">
                  {datasets ? `${datasets.santri.length} Santri • ${datasets.absensi.length} Absensi` : '14 Modul Data'}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  Supabase + Offline Cache Guard
                </div>
              </div>
            </div>
          </div>

          {/* Cloud Action Buttons */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-bold text-stone-900">Aksi Sinkronisasi Cepat</div>
              <p className="text-[11px] text-stone-500">
                Kirim seluruh data lokal ke cloud atau tarik data terbaru jika baru saja diedit dari perangkat lain.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTriggerPushCloud}
                disabled={isPushingCloud || isPullingCloud}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                title="Kirim dan simpan semua data ke server online Supabase"
              >
                <UploadCloud
                  className={`w-4 h-4 ${isPushingCloud ? 'animate-bounce' : 'text-amber-300'}`}
                />
                <span>{isPushingCloud ? 'Mengirim Data...' : 'Kirim Semua ke Cloud'}</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerPullCloud}
                disabled={isPushingCloud || isPullingCloud}
                className="px-4 py-2 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                title="Tarik data terkini dari server online Supabase"
              >
                <DownloadCloud
                  className={`w-4 h-4 ${isPullingCloud ? 'animate-spin text-emerald-700' : 'text-stone-600'}`}
                />
                <span>{isPullingCloud ? 'Menarik Data...' : 'Tarik Data dari Cloud'}</span>
              </button>
            </div>
          </div>

          {/* Custom Supabase Configuration */}
          <div className="p-5 rounded-xl border border-stone-200/90 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-800" />
                  <span>Koneksi Proyek Supabase Cloud</span>
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Secara default sistem menggunakan server cloud Ponpes Raudhotu Hidayah. Anda juga dapat menghubungkannya ke proyek Supabase mandiri Anda.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCustomDbForm(!showCustomDbForm)}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg cursor-pointer text-[11px]"
              >
                {showCustomDbForm ? 'Tutup Pengaturan' : 'Ubah URL / Kunci'}
              </button>
            </div>

            {showCustomDbForm && (
              <div className="space-y-3 pt-3 border-t border-stone-100 animate-in fade-in">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Supabase Project URL:
                  </label>
                  <input
                    type="url"
                    value={dbUrl}
                    onChange={(e) => setDbUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Supabase Anon Public Key:
                  </label>
                  <input
                    type="text"
                    value={dbAnonKey}
                    onChange={(e) => setDbAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs"
                  />
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingDb}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin' : ''}`}
                    />
                    <span>{isTestingDb ? 'Menguji...' : 'Uji Koneksi'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDbConfig}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-300" />
                    <span>Simpan &amp; Aktifkan Proyek</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetDbConfig}
                    className="px-3 py-2 text-stone-500 hover:text-stone-800 font-bold rounded-xl cursor-pointer"
                  >
                    Kembali ke Bawaan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SQL Setup Script (Collapsible Card) */}
          <div className="p-5 rounded-xl border border-stone-200/90 bg-stone-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-800" />
                  <span>Skrip SQL Setup Database Supabase</span>
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Jalankan di <em>Supabase Dashboard &gt; SQL Editor &gt; New Query &gt; Run</em> untuk mengaktifkan tabel penyimpanan dan realtime.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySql}
                className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs text-[11px]"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-amber-300" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-300" />
                    <span>Salin Skrip SQL</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-stone-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-36 border border-stone-800">
              {SUPABASE_SQL_SETUP_SCRIPT}
            </pre>
          </div>

          {/* Backup & Restore JSON */}
          <div className="p-5 rounded-xl border border-stone-200/90 bg-white space-y-3">
            <div>
              <h4 className="font-bold text-stone-900 flex items-center gap-2">
                <FileDown className="w-4 h-4 text-amber-600" />
                <span>Cadangan Offline &amp; Pemulihan Data (JSON Backup)</span>
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Simpan berkas cadangan offline seluruh database pesantren ke laptop Anda sewaktu-waktu sebagai arsip mandiri.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <FileDown className="w-4 h-4 text-emerald-700" />
                <span>Unduh Cadangan Lengkap (JSON)</span>
              </button>

              <label className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs">
                <FileUp className="w-4 h-4 text-amber-600" />
                <span>Pulihkan Data dari JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleUploadBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset Section */}
          <div className="p-5 rounded-xl border border-rose-200/90 bg-rose-50/50 space-y-3">
            <h4 className="font-bold text-rose-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-700" />
              <span>Reset Data ke Pengaturan Awal (Default Pesantren)</span>
            </h4>

            <p className="text-stone-600 leading-relaxed">
              Tindakan ini akan mengembalikan data santri, absensi hari ini, serta riwayat pelanggaran ke template awal Pondok Pesantren Raudhotu Hidayah. Gunakan hanya jika Anda ingin memulai ulang data percontohan.
            </p>

            <div>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Data ke Pengaturan Awal (Default)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
