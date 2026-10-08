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
} from 'lucide-react';
import { PesantrenSettings, User, UserRole } from '../types';

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
}

export const Pengaturan: React.FC<PengaturanProps> = ({
  settings,
  onUpdateSettings,
  currentUser,
  onUpdateAdminProfile,
  onNavigateToMaster,
}) => {
  const [activeTab, setActiveTab] = useState<'identitas' | 'keamanan' | 'sistem'>('identitas');
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
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const showNotif = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
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
      if (passwordForm.newPassword.length < 6) {
        showNotif('error', 'Kata sandi baru minimal harus 6 karakter.');
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

  const handleResetData = () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mengatur ulang data ke kondisi bawaan awal? Semua data tersimpan di browser akan diperbarui.'
      )
    ) {
      try {
        localStorage.clear();
      } catch {}
      window.location.reload();
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
            Konfigurasi profil resmi pesantren, nama admin, kop surat dokumen, dan keamanan akun
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
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'sistem'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sistem Data
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
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-2xs"
          >
            <span>Buka Kelola Master Data</span>
            <ChevronRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      )}

      {feedback && (
        <div
          className={`px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border border-rose-300 text-rose-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* TAB 1: IDENTITAS LEMBAGA */}
      {activeTab === 'identitas' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs">
          <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-700" />
            <span>Informasi Identitas Resmi Pondok Pesantren</span>
          </h3>

          <form onSubmit={handleSaveIdentitas} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Nama Lengkap Pesantren / Lembaga:
              </label>
              <input
                type="text"
                value={formData.namaLembaga}
                onChange={(e) => setFormData({ ...formData, namaLembaga: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Sub-Nama / Slogan / Tagline Lembaga:
              </label>
              <input
                type="text"
                value={formData.subNamaTagline}
                onChange={(e) => setFormData({ ...formData, subNamaTagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Alamat Lengkap Komplek Pondok:
              </label>
              <textarea
                rows={2}
                value={formData.alamatLengkap}
                onChange={(e) => setFormData({ ...formData, alamatLengkap: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nomor Telepon / WhatsApp Resmi:
                </label>
                <input
                  type="text"
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Email Resmi Sekretariat:
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Pengasuh / Pimpinan Pondok:
                </label>
                <input
                  type="text"
                  value={formData.namaPengasuh}
                  onChange={(e) => setFormData({ ...formData, namaPengasuh: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Kepala Bidang Kesantrian:
                </label>
                <input
                  type="text"
                  value={formData.namaKepalaKesantrian}
                  onChange={(e) =>
                    setFormData({ ...formData, namaKepalaKesantrian: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                URL Gambar Logo Lembaga (Opsional):
              </label>
              <input
                type="text"
                placeholder="https://... / Kosongkan untuk memakai lambang kubah default"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>Simpan Pengaturan Identitas</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: PROFIL ADMIN & KATA SANDI */}
      {activeTab === 'keamanan' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs">
          <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-emerald-700" />
            <span>Edit Profil Administrator &amp; Kredensial Akses</span>
          </h3>

          <form onSubmit={handleSaveKeamanan} className="space-y-4 text-xs">
            {/* Dynamic Admin Full Name */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
              <label className="block font-bold text-emerald-950 mb-1 text-sm">
                Nama Lengkap Administrator (Nama Tampilan):
              </label>
              <input
                type="text"
                value={adminDisplayName}
                onChange={(e) => setAdminDisplayName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda..."
                className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl font-bold text-stone-900 focus:outline-emerald-600 text-sm shadow-2xs"
                required
              />
              <p className="text-[11px] text-emerald-800 mt-1.5 leading-relaxed">
                Nama ini akan langsung tampil di ucapan <strong>&quot;Selamat Datang, [Nama Admin]&quot;</strong> di Header, menu profil pojok kanan atas, serta di tanda tangan berkas cetak/laporan resmi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Username Login Admin:
                </label>
                <input
                  type="text"
                  value={formData.adminUsername}
                  onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Email Pemulihan Akun Admin:
                </label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-800"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 space-y-3">
              <h4 className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Perbarui Kata Sandi (Kosongkan jika tidak ingin mengubah):</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Kata Sandi Baru:
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      placeholder="Masukkan kata sandi baru (min. 6 karakter)"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
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

      {/* TAB 3: SISTEM & RESET */}
      {activeTab === 'sistem' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Manajemen Penyimpanan &amp; Reset Data</span>
          </h3>

          <p className="text-stone-600 leading-relaxed">
            Aplikasi ini menyimpan seluruh perubahan absensi, santri, jadwal, surat izin, dan kredensial secara lokal di peramban Anda (Local Storage).
          </p>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
            <strong>Peringatan Reset:</strong> Tindakan ini akan mengembalikan data santri, absensi hari ini, serta riwayat pelanggaran ke template awal Pondok Pesantren Raudhotu Hidayah.
          </div>

          <div>
            <button
              onClick={handleResetData}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Data ke Pengaturan Awal (Default)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
