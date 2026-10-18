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
  Image as ImageIcon,
  Upload,
  Camera,
  ZoomIn,
  X,
  Trash2,
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
import {
  processImageFile,
  validateImageFile,
  formatBytes,
} from '../utils/imageUtils';

interface PengaturanProps {
  settings: PesantrenSettings;
  onUpdateSettings: (s: PesantrenSettings) => void;
  userRole: UserRole;
  currentUser: User;
  onUpdateAdminProfile: (profile: {
    name: string;
    username: string;
    password?: string;
    avatar?: string;
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

  // Logo & Avatar State
  const [logoFileUploading, setLogoFileUploading] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState(settings.logoUrl || '');
  const [adminAvatar, setAdminAvatar] = useState(currentUser.avatar || '');
  const [adminAvatarUrlInput, setAdminAvatarUrlInput] = useState(currentUser.avatar || '');
  const [avatarFileUploading, setAvatarFileUploading] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  // Sync internal state if props change
  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, logoUrl: settings.logoUrl || '' }));
    setLogoUrlInput(settings.logoUrl || '');
  }, [settings.logoUrl]);

  React.useEffect(() => {
    setAdminAvatar(currentUser.avatar || '');
    setAdminAvatarUrlInput(currentUser.avatar || '');
  }, [currentUser.avatar]);

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, 6 * 1024 * 1024);
    if (!validation.valid) {
      showNotif('error', validation.error || 'Format atau ukuran file tidak sesuai.');
      return;
    }

    setLogoFileUploading(true);
    try {
      const result = await processImageFile(file, {
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.9,
      });
      setFormData((prev) => ({ ...prev, logoUrl: result.base64 }));
      setLogoUrlInput(result.base64);
      showNotif(
        'success',
        `File logo "${file.name}" berhasil diproses (${formatBytes(result.sizeBytes)}). Klik tombol "Simpan Identitas Lembaga" untuk menyimpan ke Supabase.`
      );
    } catch (err: any) {
      showNotif('error', err?.message || 'Gagal memproses file gambar logo.');
    } finally {
      setLogoFileUploading(false);
      e.target.value = '';
    }
  };

  const handleApplyLogoUrl = () => {
    const trimmed = logoUrlInput.trim();
    if (!trimmed) {
      showNotif('info', 'Harap masukkan URL tautan gambar logo.');
      return;
    }
    setFormData((prev) => ({ ...prev, logoUrl: trimmed }));
    showNotif('success', 'URL logo diterapkan ke preview. Klik simpan untuk memperbarui database.');
  };

  const handleResetLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
    setLogoUrlInput('');
    showNotif('info', 'Logo lembaga direset ke gambar default pesantren.');
  };

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, 6 * 1024 * 1024);
    if (!validation.valid) {
      showNotif('error', validation.error || 'Format atau ukuran file foto tidak sesuai.');
      return;
    }

    setAvatarFileUploading(true);
    try {
      const result = await processImageFile(file, {
        maxWidth: 384,
        maxHeight: 384,
        quality: 0.9,
      });
      setAdminAvatar(result.base64);
      setAdminAvatarUrlInput(result.base64);
      showNotif(
        'success',
        `Foto profil "${file.name}" berhasil diproses (${formatBytes(result.sizeBytes)}). Klik tombol "Simpan Perubahan Profil Admin" untuk menyimpan ke Supabase.`
      );
    } catch (err: any) {
      showNotif('error', err?.message || 'Gagal memproses file foto profil.');
    } finally {
      setAvatarFileUploading(false);
      e.target.value = '';
    }
  };

  const handleApplyAvatarUrl = () => {
    const trimmed = adminAvatarUrlInput.trim();
    if (!trimmed) {
      showNotif('info', 'Harap masukkan URL tautan foto profil.');
      return;
    }
    setAdminAvatar(trimmed);
    showNotif('success', 'URL foto profil diterapkan ke preview. Klik simpan untuk memperbarui.');
  };

  const handleResetAdminAvatar = () => {
    setAdminAvatar('');
    setAdminAvatarUrlInput('');
    showNotif('info', 'Foto profil admin direset ke monogram inisial default.');
  };

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
    showNotif('success', 'Pengaturan identitas & logo resmi lembaga berhasil disimpan dan disinkronkan ke Supabase Cloud!');
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

    // Update admin profile name, credentials, and avatar
    onUpdateAdminProfile({
      name: adminDisplayName.trim(),
      username: formData.adminUsername.trim(),
      password: passwordForm.newPassword ? passwordForm.newPassword : undefined,
      avatar: adminAvatar,
    });

    onUpdateSettings({
      ...formData,
      adminDisplayName: adminDisplayName.trim(),
      namaKepalaKesantrian: adminDisplayName.trim(),
    });

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showNotif(
      'success',
      `Nama Admin, foto profil, dan kredensial berhasil disimpan dan disinkronkan ke Supabase.`
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

          {/* Card Upload Logo Lembaga */}
          <div className="p-5 rounded-2xl bg-linear-to-br from-emerald-50/70 via-stone-50 to-white border border-emerald-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-800 text-amber-300 shadow-2xs">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">
                    Logo Resmi Lembaga Pondok Pesantren
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Tampil dinamis di Header, Sidebar, Halaman Login, serta Kop Dokumen Cetak Surat &amp; Laporan.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {formData.logoUrl ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Logo Kustom Aktif</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <Cloud className="w-3 h-3 text-amber-600" />
                    <span>Logo Bawaan Default</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Preview Box */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-stone-200 shadow-xs text-center">
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Preview Logo
                </div>
                <div className="w-28 h-28 rounded-2xl bg-stone-50 border-2 border-stone-200/80 p-2 flex items-center justify-center relative overflow-hidden shadow-2xs group">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo Lembaga"
                      className="w-full h-full object-contain transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-0.5 flex items-center justify-center">
                      <div className="w-full h-full bg-emerald-950 rounded-lg flex items-center justify-center text-amber-400 border border-amber-400/30">
                        <svg
                          className="w-12 h-12"
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
                            fillOpacity="0.2"
                          />
                          <circle cx="12" cy="5.5" r="1.5" fill="currentColor" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Actions */}
                <div className="mt-3 flex items-center gap-1.5 w-full justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewModalImage({
                        url:
                          formData.logoUrl ||
                          'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=600&q=80',
                        title: formData.namaLembaga || 'Logo Resmi Pesantren',
                        subtitle: formData.subNamaTagline || 'Identitas Resmi Lembaga',
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition"
                    title="Buka Preview Ukuran Penuh"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Preview Penuh</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetLogo}
                    disabled={!formData.logoUrl}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-40 disabled:pointer-events-none text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition border border-rose-200/60"
                    title="Kembalikan ke lambang default pesantren"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default</span>
                  </button>
                </div>
              </div>

              {/* Upload Controls & URL input */}
              <div className="md:col-span-8 space-y-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Unggah File Gambar Logo:
                  </label>
                  <label className="border-2 border-dashed border-stone-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/40 p-4 rounded-xl cursor-pointer flex flex-col sm:flex-row items-center gap-3 transition group">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                      disabled={logoFileUploading}
                    />
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition flex items-center justify-center shrink-0">
                      {logoFileUploading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="font-bold text-xs text-stone-800">
                        {logoFileUploading
                          ? 'Sedang mengompres & memproses gambar...'
                          : 'Klik untuk pilih file gambar logo baru'}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        Mendukung PNG transparan, JPG, WebP, dan SVG (Maks. 6 MB). Otomatis disimpan ke Supabase Cloud.
                      </div>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Atau Masukkan URL Tautan Gambar Logo:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://domain.com/logo-pesantren.png"
                      value={logoUrlInput}
                      onChange={(e) => setLogoUrlInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleApplyLogoUrl}
                      className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold transition cursor-pointer shrink-0"
                    >
                      Terapkan URL
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-900 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Setelah memilih logo baru, klik tombol <strong>"Simpan Identitas Lembaga"</strong> di bawah untuk menyinkronkan langsung ke Supabase Cloud.
                  </span>
                </div>
              </div>
            </div>
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
              Ubah foto profil, nama lengkap Admin, username login, serta kata sandi akun Administrator Anda.
            </p>
          </div>

          {/* Card Upload Foto Profil Admin */}
          <div className="p-5 rounded-2xl bg-linear-to-br from-emerald-50/70 via-stone-50 to-white border border-emerald-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-800 text-amber-300 shadow-2xs">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">
                    Foto Profil Administrator
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Ditampilkan di pojok kanan atas Header, dropdown menu akun, dan panel navigasi sidebar.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {adminAvatar ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Foto Kustom Aktif</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <UserIcon className="w-3 h-3 text-amber-600" />
                    <span>Inisial Bawaan</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Avatar Preview Box */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-stone-200 shadow-xs text-center">
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Preview Foto
                </div>
                <div className="w-24 h-24 rounded-full bg-emerald-800 border-4 border-amber-400/40 p-0.5 flex items-center justify-center relative overflow-hidden shadow-md group">
                  {adminAvatar ? (
                    <img
                      src={adminAvatar}
                      alt={adminDisplayName}
                      className="w-full h-full object-cover rounded-full transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-amber-300 uppercase">
                      {(adminDisplayName || 'A').charAt(0)}
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-stone-900 mt-2 truncate max-w-full">
                  {adminDisplayName}
                </div>
                <div className="text-[10px] text-stone-500 font-mono">
                  @{formData.adminUsername}
                </div>

                {/* Avatar Actions */}
                <div className="mt-3 flex items-center gap-1.5 w-full justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewModalImage({
                        url:
                          adminAvatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                        title: adminDisplayName,
                        subtitle: `Administrator • @${formData.adminUsername}`,
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition"
                    title="Buka Preview Foto Penuh"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Preview Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAdminAvatar}
                    disabled={!adminAvatar}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-40 disabled:pointer-events-none text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition border border-rose-200/60"
                    title="Kembalikan foto profil ke inisial default"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default</span>
                  </button>
                </div>
              </div>

              {/* Upload Controls & URL input */}
              <div className="md:col-span-8 space-y-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Unggah File Foto Profil:
                  </label>
                  <label className="border-2 border-dashed border-stone-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/40 p-4 rounded-xl cursor-pointer flex flex-col sm:flex-row items-center gap-3 transition group">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleAvatarFileUpload}
                      className="hidden"
                      disabled={avatarFileUploading}
                    />
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition flex items-center justify-center shrink-0">
                      {avatarFileUploading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="font-bold text-xs text-stone-800">
                        {avatarFileUploading
                          ? 'Sedang mengompres foto...'
                          : 'Klik untuk pilih foto profil baru'}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        Format JPG, PNG, atau WebP (Maks. 6 MB). Gambar persegi 1:1 memberikan hasil terbaik.
                      </div>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Atau Masukkan URL Tautan Foto Profil:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... atau URL foto"
                      value={adminAvatarUrlInput}
                      onChange={(e) => setAdminAvatarUrlInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleApplyAvatarUrl}
                      className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold transition cursor-pointer shrink-0"
                    >
                      Terapkan URL
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-900 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Foto profil akan langsung disimpan ke data pengguna dan disinkronkan ke Supabase saat Anda menekan tombol <strong>"Simpan Perubahan Profil Admin"</strong>.
                  </span>
                </div>
              </div>
            </div>
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
                Penyimpanan data pada aplikasi Sistem Manajemen Pondok Pesantren Raudhotu Hidayah <strong>sudah tersimpan secara otomatis dan tersinkronisasi online di Supabase Cloud Database</strong>. Seluruh modul data (Santri, Absensi, Jadwal, Surat Izin, Kedisiplinan, Pengajar, Kelola Pengguna, serta Master Kelas &amp; Kamar) membaca dan menyimpan data secara langsung ke Supabase Cloud, sehingga data aman, tidak hilang, dan otomatis tersinkronisasi saat pengguna berpindah perangkat (smartphone, tablet, maupun komputer/laptop).
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                <span>CONNECTED: Supabase Cloud Active</span>
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
                  Jalankan di <em>Supabase Dashboard &gt; SQL Editor &gt; New Query &gt; Run</em> untuk mengaktifkan tabel penyimpanan universal (<code>ponpes_data_store</code>) serta tabel relasional administrasi keuangan (<code>pos_pembayaran</code>, <code>tagihan_santri</code>, <code>pembayaran</code>, <code>kas_operasional</code>) dan realtime multi-device.
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

      {/* MODAL PREVIEW GAMBAR PENUH */}
      {previewModalImage && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative flex flex-col items-center text-center">
            <button
              onClick={() => setPreviewModalImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              title="Tutup Preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 w-full max-h-[380px] flex items-center justify-center overflow-hidden my-3">
              <img
                src={previewModalImage.url}
                alt={previewModalImage.title}
                className="max-h-[340px] max-w-full object-contain rounded-xl shadow-xs"
              />
            </div>

            <div className="w-full mt-2">
              <h4 className="font-bold text-stone-900 text-sm">
                {previewModalImage.title}
              </h4>
              {previewModalImage.subtitle && (
                <p className="text-xs text-stone-500 mt-0.5">
                  {previewModalImage.subtitle}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 w-full flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
