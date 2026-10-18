import React, { useState } from 'react';
import {
  UserCog,
  Search,
  Plus,
  KeyRound,
  Trash2,
  Edit2,
  X,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Camera,
  Upload,
  ZoomIn,
  RotateCcw,
  Image as ImageIcon,
  RefreshCw,
  User as UserIcon,
  Cloud,
} from 'lucide-react';
import { User, Santri } from '../types';
import {
  processImageFile,
  validateImageFile,
  formatBytes,
} from '../utils/imageUtils';

interface KelolaPenggunaProps {
  usersList: User[];
  santriList: Santri[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  currentUser: User;
}

export const KelolaPengguna: React.FC<KelolaPenggunaProps> = ({
  usersList,
  santriList,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  currentUser,
}) => {
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<
    'guru' | 'wali' | 'resetPass' | 'photo' | null
  >(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Photo modal dedicated state
  const [photoUser, setPhotoUser] = useState<User | null>(null);
  const [photoAvatar, setPhotoAvatar] = useState('');
  const [photoAvatarUrlInput, setPhotoAvatarUrlInput] = useState('');
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  // Teacher Form State
  const [guruForm, setGuruForm] = useState({
    name: '',
    nip: '',
    mapel: '',
    username: '',
    password: '',
    noHp: '',
    email: '',
    avatar: '',
  });

  // Guardian Form State
  const [waliForm, setWaliForm] = useState({
    name: '',
    username: '',
    password: '',
    noHp: '',
    email: '',
    santriId: santriList[0]?.id || '',
    avatar: '',
  });

  // Password reset state
  const [passForm, setPassForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleOpenGuruModal = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setGuruForm({
        name: user.name,
        nip: user.nip || '',
        mapel: user.mapel || '',
        username: user.username,
        password: '',
        noHp: user.noHp || '',
        email: user.email || '',
        avatar: user.avatar || '',
      });
    } else {
      setSelectedUser(null);
      setGuruForm({
        name: '',
        nip: '',
        mapel: 'Nahwu & Fiqih',
        username: '',
        password: '',
        noHp: '',
        email: '',
        avatar: '',
      });
    }
    setActiveModal('guru');
  };

  const handleOpenWaliModal = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setWaliForm({
        name: user.name,
        username: user.username,
        password: '',
        noHp: user.noHp || '',
        email: user.email || '',
        santriId: user.santriId || santriList[0]?.id || '',
        avatar: user.avatar || '',
      });
    } else {
      setSelectedUser(null);
      setWaliForm({
        name: '',
        username: '',
        password: '',
        noHp: '',
        email: '',
        santriId: santriList[0]?.id || '',
        avatar: '',
      });
    }
    setActiveModal('wali');
  };

  const handleOpenPhotoModal = (user: User) => {
    setPhotoUser(user);
    setPhotoAvatar(user.avatar || '');
    setPhotoAvatarUrlInput(user.avatar || '');
    setActiveModal('photo');
  };

  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, 6 * 1024 * 1024);
    if (!validation.valid) {
      showFeedback(validation.error || 'Format file foto tidak sesuai.');
      return;
    }

    setIsPhotoUploading(true);
    try {
      const result = await processImageFile(file, {
        maxWidth: 384,
        maxHeight: 384,
        quality: 0.9,
      });
      setPhotoAvatar(result.base64);
      setPhotoAvatarUrlInput(result.base64);
      showFeedback(`Foto profil diproses (${formatBytes(result.sizeBytes)}). Klik Simpan Foto.`);
    } catch (err: any) {
      showFeedback(err?.message || 'Gagal memproses gambar foto.');
    } finally {
      setIsPhotoUploading(false);
      e.target.value = '';
    }
  };

  const handleApplyPhotoUrl = () => {
    if (!photoAvatarUrlInput.trim()) {
      showFeedback('Masukkan URL foto profil terlebih dahulu.');
      return;
    }
    setPhotoAvatar(photoAvatarUrlInput.trim());
    showFeedback('URL foto diterapkan ke preview.');
  };

  const [guruAvatarUploading, setGuruAvatarUploading] = useState(false);
  const [waliAvatarUploading, setWaliAvatarUploading] = useState(false);

  const handleGuruAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file, 6 * 1024 * 1024);
    if (!validation.valid) {
      showFeedback(validation.error || 'Format file foto tidak sesuai.');
      return;
    }
    setGuruAvatarUploading(true);
    try {
      const res = await processImageFile(file, { maxWidth: 384, maxHeight: 384, quality: 0.9 });
      setGuruForm((prev) => ({ ...prev, avatar: res.base64 }));
      showFeedback(`Foto profil guru diproses (${formatBytes(res.sizeBytes)}).`);
    } catch (err: any) {
      showFeedback(err?.message || 'Gagal memproses gambar foto.');
    } finally {
      setGuruAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleWaliAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file, 6 * 1024 * 1024);
    if (!validation.valid) {
      showFeedback(validation.error || 'Format file foto tidak sesuai.');
      return;
    }
    setWaliAvatarUploading(true);
    try {
      const res = await processImageFile(file, { maxWidth: 384, maxHeight: 384, quality: 0.9 });
      setWaliForm((prev) => ({ ...prev, avatar: res.base64 }));
      showFeedback(`Foto profil wali diproses (${formatBytes(res.sizeBytes)}).`);
    } catch (err: any) {
      showFeedback(err?.message || 'Gagal memproses gambar foto.');
    } finally {
      setWaliAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleResetPhotoModal = () => {
    setPhotoAvatar('');
    setPhotoAvatarUrlInput('');
    showFeedback('Foto profil diatur ke inisial bawaan default.');
  };

  const handleSavePhotoModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUser) return;
    onUpdateUser({
      ...photoUser,
      avatar: photoAvatar,
    });
    showFeedback(`Foto profil untuk @${photoUser.username} berhasil disimpan dan disinkronkan ke Supabase.`);
    setActiveModal(null);
  };

  const handleSaveGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guruForm.name || !guruForm.username) return;

    if (selectedUser) {
      onUpdateUser({
        ...selectedUser,
        name: guruForm.name,
        displayName: guruForm.name,
        nip: guruForm.nip,
        mapel: guruForm.mapel,
        username: guruForm.username,
        password: guruForm.password || selectedUser.password,
        noHp: guruForm.noHp,
        email: guruForm.email,
        avatar: guruForm.avatar !== undefined ? guruForm.avatar : selectedUser.avatar,
      });
      showFeedback(`Akun dewan guru "${guruForm.name}" berhasil diperbarui.`);
    } else {
      const newUser: User = {
        id: `user_guru_${Date.now()}`,
        name: guruForm.name,
        displayName: guruForm.name,
        username: guruForm.username,
        password: guruForm.password || 'guru123',
        email: guruForm.email || `${guruForm.username}@raudhotulhidayah.ponpes.id`,
        role: 'guru',
        title: `Dewan Asatidz / Pengampu ${guruForm.mapel || 'Kitab'}`,
        nip: guruForm.nip,
        mapel: guruForm.mapel,
        noHp: guruForm.noHp,
        avatar: guruForm.avatar || '',
      };
      onAddUser(newUser);
      showFeedback(`Akun guru baru "${guruForm.name}" berhasil dibuat.`);
    }
    setActiveModal(null);
  };

  const handleSaveWali = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waliForm.name || !waliForm.username) return;
    const targetSantri = santriList.find((s) => s.id === waliForm.santriId);

    if (selectedUser) {
      onUpdateUser({
        ...selectedUser,
        name: waliForm.name,
        displayName: waliForm.name,
        username: waliForm.username,
        password: waliForm.password || selectedUser.password,
        noHp: waliForm.noHp,
        email: waliForm.email,
        santriId: targetSantri?.id,
        santriName: targetSantri?.nama,
        title: `Wali Santri dari ${targetSantri?.nama || 'Santri'}`,
        avatar: waliForm.avatar !== undefined ? waliForm.avatar : selectedUser.avatar,
      });
      showFeedback(`Akun wali santri "${waliForm.name}" berhasil diperbarui.`);
    } else {
      const newUser: User = {
        id: `user_wali_${Date.now()}`,
        name: waliForm.name,
        displayName: waliForm.name,
        username: waliForm.username,
        password: waliForm.password || 'wali123',
        email: waliForm.email || `${waliForm.username}@gmail.com`,
        role: 'wali',
        title: `Wali Santri dari ${targetSantri?.nama || 'Santri'}`,
        noHp: waliForm.noHp,
        santriId: targetSantri?.id,
        santriName: targetSantri?.nama,
        avatar: waliForm.avatar || '',
      };
      onAddUser(newUser);
      showFeedback(`Akun wali baru "${waliForm.name}" berhasil dibuat.`);
    }
    setActiveModal(null);
  };

  const handleResetPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (passForm.newPassword !== passForm.confirmPassword) {
      alert('Konfirmasi password tidak cocok.');
      return;
    }
    if (passForm.newPassword.length < 6) {
      alert('Password minimal 6 karakter.');
      return;
    }

    onUpdateUser({
      ...selectedUser,
      password: passForm.newPassword,
    });
    showFeedback(`Password untuk pengguna @${selectedUser.username} berhasil direset.`);
    setActiveModal(null);
    setPassForm({ newPassword: '', confirmPassword: '' });
  };

  const filteredUsers = usersList.filter((u) => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (
      searchQuery &&
      !u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.username.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-emerald-800" />
            <span>Manajemen Akun Pengguna &amp; Hak Akses Role</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Pengelolaan akun Dewan Guru / Asatidz, Akun Wali Santri terhubung ananda, dan pengaturan kata sandi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenGuruModal()}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Akun Guru</span>
          </button>
          <button
            onClick={() => handleOpenWaliModal()}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Akun Wali Santri</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{feedback}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="text-xs font-medium px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600"
          >
            <option value="all">Semua Peran (Admin, Guru, Wali)</option>
            <option value="admin">Administrator</option>
            <option value="guru">Dewan Asatidz / Guru</option>
            <option value="wali">Wali Santri</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama atau username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-emerald-600 w-60"
            />
          </div>
        </div>
      </div>

      {/* Users Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const roleBadge =
            user.role === 'admin'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : user.role === 'guru'
                ? 'bg-teal-100 text-teal-800 border-teal-300'
                : 'bg-amber-100 text-amber-800 border-amber-300';

          return (
            <div
              key={user.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5 hover:border-emerald-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => handleOpenPhotoModal(user)}
                      className="w-11 h-11 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-sm shadow-xs uppercase overflow-hidden shrink-0 border-2 border-emerald-700/60 cursor-pointer relative group"
                      title="Klik untuk ubah foto profil"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <span>{user.name.charAt(0)}</span>
                      )}
                      <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition rounded-full">
                        <Camera className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 leading-tight">
                        {user.name}
                      </h4>
                      <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadge} uppercase`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold block">
                      Jabatan / Keterangan:
                    </span>
                    <span className="font-semibold text-stone-800">{user.title}</span>
                  </div>

                  {user.santriName && (
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 mt-2">
                      <span className="text-amber-800 text-[10px] uppercase font-bold block">
                        Terhubung Santri:
                      </span>
                      <span className="font-bold text-amber-950">{user.santriName}</span>
                    </div>
                  )}

                  {user.mapel && (
                    <div>
                      <span className="text-stone-500">Mata Pelajaran:</span>{' '}
                      <span className="font-semibold text-stone-700">{user.mapel}</span>
                    </div>
                  )}

                  {user.noHp && (
                    <div className="text-stone-500">
                      WhatsApp: <span className="font-mono">{user.noHp}</span>
                    </div>
                  )}

                  {user.email && (
                    <div className="text-stone-500 truncate">
                      Email: <span className="font-mono">{user.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenPhotoModal(user)}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="Ubah Foto Profil Pengguna"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Ubah Foto</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setActiveModal('resetPass');
                    }}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    title="Atur Ulang Sandi Akun"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                    <span>Sandi</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {user.role === 'guru' && (
                    <button
                      onClick={() => handleOpenGuruModal(user)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-stone-100 cursor-pointer"
                      title="Edit Akun Guru"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {user.role === 'wali' && (
                    <button
                      onClick={() => handleOpenWaliModal(user)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-stone-100 cursor-pointer"
                      title="Edit Akun Wali"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {user.id !== currentUser.id && user.id !== 'user_admin' && (
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus akun "@${user.username}"?`)) {
                          onDeleteUser(user.id);
                          showFeedback(`Akun @${user.username} berhasil dihapus.`);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                      title="Hapus Akun"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL GURU */}
      {activeModal === 'guru' && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">
                {selectedUser ? 'Edit Akun Guru / Asatidz' : 'Tambah Akun Guru Baru'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGuru} className="space-y-3.5 text-xs">
              {/* Foto Profil Guru */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-sm overflow-hidden shrink-0 border border-emerald-600 shadow-2xs">
                    {guruForm.avatar ? (
                      <img src={guruForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{(guruForm.name || 'G').charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800 text-xs">Foto Profil Ustadz/Guru</div>
                    <div className="text-[11px] text-stone-500">Maks. 6 MB (JPG/PNG/WebP)</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <label className="px-2.5 py-1.5 bg-white border border-stone-300 hover:border-emerald-600 rounded-lg text-[11px] font-semibold text-stone-700 hover:text-emerald-800 cursor-pointer flex items-center gap-1 transition shadow-2xs">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleGuruAvatarFile}
                      className="hidden"
                      disabled={guruAvatarUploading}
                    />
                    {guruAvatarUploading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{guruAvatarUploading ? 'Memproses...' : 'Pilih Foto'}</span>
                  </label>
                  {guruForm.avatar && (
                    <button
                      type="button"
                      onClick={() => setGuruForm((prev) => ({ ...prev, avatar: '' }))}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                      title="Reset ke inisial default"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Lengkap &amp; Gelar Ustadz:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ustadz Ridwan Al-Bantani, Lc."
                  value={guruForm.name}
                  onChange={(e) => setGuruForm({ ...guruForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    NIP / No. Induk Asatidz:
                  </label>
                  <input
                    type="text"
                    placeholder="198504122010011002"
                    value={guruForm.nip}
                    onChange={(e) => setGuruForm({ ...guruForm, nip: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Mapel / Kitab Yang Diampu:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Nahwu & Fiqih"
                    value={guruForm.mapel}
                    onChange={(e) => setGuruForm({ ...guruForm, mapel: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Username Login:
                  </label>
                  <input
                    type="text"
                    placeholder="guru1"
                    value={guruForm.username}
                    onChange={(e) => setGuruForm({ ...guruForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Password {selectedUser && '(Kosongkan jika tidak diubah)'}:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={selectedUser ? 'Tetap gunakan yang lama' : 'Min. 6 karakter'}
                      value={guruForm.password}
                      onChange={(e) => setGuruForm({ ...guruForm, password: e.target.value })}
                      className="w-full px-3 py-2 pr-9 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nomor WhatsApp / HP:
                  </label>
                  <input
                    type="text"
                    placeholder="0812-3456-7890"
                    value={guruForm.noHp}
                    onChange={(e) => setGuruForm({ ...guruForm, noHp: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email:</label>
                  <input
                    type="email"
                    placeholder="guru@raudhotulhidayah.ponpes.id"
                    value={guruForm.email}
                    onChange={(e) => setGuruForm({ ...guruForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold cursor-pointer"
                >
                  {selectedUser ? 'Simpan Perubahan' : 'Buat Akun Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WALI */}
      {activeModal === 'wali' && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">
                {selectedUser ? 'Edit Akun Wali Santri' : 'Tambah Akun Wali Santri Baru'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWali} className="space-y-3.5 text-xs">
              {/* Foto Profil Wali */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-700 text-amber-100 font-bold flex items-center justify-center text-sm overflow-hidden shrink-0 border border-amber-500 shadow-2xs">
                    {waliForm.avatar ? (
                      <img src={waliForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{(waliForm.name || 'W').charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-stone-800 text-xs">Foto Profil Wali Santri</div>
                    <div className="text-[11px] text-stone-500">Maks. 6 MB (JPG/PNG/WebP)</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <label className="px-2.5 py-1.5 bg-white border border-stone-300 hover:border-amber-600 rounded-lg text-[11px] font-semibold text-stone-700 hover:text-amber-800 cursor-pointer flex items-center gap-1 transition shadow-2xs">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleWaliAvatarFile}
                      className="hidden"
                      disabled={waliAvatarUploading}
                    />
                    {waliAvatarUploading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{waliAvatarUploading ? 'Memproses...' : 'Pilih Foto'}</span>
                  </label>
                  {waliForm.avatar && (
                    <button
                      type="button"
                      onClick={() => setWaliForm((prev) => ({ ...prev, avatar: '' }))}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                      title="Reset ke inisial default"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Lengkap Orang Tua / Wali:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bpk. H. Syamsuddin Nur"
                  value={waliForm.name}
                  onChange={(e) => setWaliForm({ ...waliForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Pilih Ananda Santri (Hubungkan Akun):
                </label>
                <select
                  value={waliForm.santriId}
                  onChange={(e) => setWaliForm({ ...waliForm, santriId: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  required
                >
                  {santriList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nis} - {s.kamar})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-stone-400 mt-1">
                  Akun wali hanya akan bisa memantau kehadiran, perizinan, takzir, dan rapor santri yang dipilih.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Username Login:
                  </label>
                  <input
                    type="text"
                    placeholder="wali1"
                    value={waliForm.username}
                    onChange={(e) => setWaliForm({ ...waliForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Password {selectedUser && '(Kosongkan jika tidak diubah)'}:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={selectedUser ? 'Tetap gunakan yang lama' : 'Min. 6 karakter'}
                      value={waliForm.password}
                      onChange={(e) => setWaliForm({ ...waliForm, password: e.target.value })}
                      className="w-full px-3 py-2 pr-9 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nomor WhatsApp / Telepon:
                  </label>
                  <input
                    type="text"
                    placeholder="0812-9876-5432"
                    value={waliForm.noHp}
                    onChange={(e) => setWaliForm({ ...waliForm, noHp: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email:</label>
                  <input
                    type="email"
                    placeholder="wali@gmail.com"
                    value={waliForm.email}
                    onChange={(e) => setWaliForm({ ...waliForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  {selectedUser ? 'Simpan Perubahan' : 'Buat Akun Wali'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESET PASSWORD */}
      {activeModal === 'resetPass' && selectedUser && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <span>Reset Password Pengguna</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 mb-4 text-xs">
              <div>
                Nama: <strong>{selectedUser.name}</strong>
              </div>
              <div className="text-stone-500 font-mono mt-0.5">
                Username: @{selectedUser.username} ({selectedUser.role.toUpperCase()})
              </div>
            </div>

            <form onSubmit={handleResetPass} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Password Baru (Min. 6 Karakter):
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password baru"
                    value={passForm.newPassword}
                    onChange={(e) =>
                      setPassForm({ ...passForm, newPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 pr-9 bg-stone-50 border border-stone-300 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Konfirmasi Password Baru:
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ulangi password baru"
                  value={passForm.confirmPassword}
                  onChange={(e) =>
                    setPassForm({ ...passForm, confirmPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Reset &amp; Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UBAH FOTO PROFIL PENGGUNA */}
      {activeModal === 'photo' && photoUser && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-800 text-amber-300 shadow-2xs">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900 leading-tight">
                    Ubah Foto Profil Pengguna
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {photoUser.name} (@{photoUser.username}) • {photoUser.role.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhotoModal} className="space-y-4 text-xs">
              {/* Box Preview & Status */}
              <div className="p-4 rounded-2xl bg-linear-to-br from-emerald-50/60 via-stone-50 to-white border border-emerald-200/80 shadow-2xs">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Circular Avatar Preview */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-2xl uppercase overflow-hidden shrink-0 border-4 border-amber-400/50 shadow-md group relative">
                      {photoAvatar ? (
                        <img
                          src={photoAvatar}
                          alt={photoUser.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <span>{photoUser.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400 font-medium mt-1">
                      {photoAvatar ? 'Foto Kustom' : 'Inisial Default'}
                    </span>
                  </div>

                  {/* Actions for preview */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="font-bold text-stone-900 text-sm">
                        {photoUser.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          photoUser.role === 'admin'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : photoUser.role === 'guru'
                              ? 'bg-teal-100 text-teal-800 border border-teal-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {photoUser.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Foto profil ini akan ditampilkan pada Header, menu akun, daftar santri &amp; wali, serta panel navigasi.
                    </p>

                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewModalImg({
                            url:
                              photoAvatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                            title: photoUser.name,
                            subtitle: `@${photoUser.username} • ${photoUser.role.toUpperCase()}`,
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                        title="Buka tampilan foto resolusi penuh"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>Preview Penuh</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetPhotoModal}
                        disabled={!photoAvatar}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-40 disabled:pointer-events-none font-semibold flex items-center gap-1 cursor-pointer transition border border-rose-200/60"
                        title="Kembalikan foto ke inisial nama awal"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Default</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload File Section */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Unggah File Foto Baru (JPG, PNG, WebP):
                </label>
                <label className="border-2 border-dashed border-stone-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/40 p-4 rounded-xl cursor-pointer flex items-center gap-3 transition group">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handlePhotoFileUpload}
                    className="hidden"
                    disabled={isPhotoUploading}
                  />
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition flex items-center justify-center shrink-0 shadow-2xs">
                    {isPhotoUploading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-800">
                      {isPhotoUploading
                        ? 'Sedang mengompres & memproses gambar...'
                        : 'Klik untuk memilih berkas foto dari komputer / HP'}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Ukuran maksimal 6 MB. Foto otomatis dikonversi dan disimpan ke Supabase Cloud.
                    </div>
                  </div>
                </label>
              </div>

              {/* Direct Image URL */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Atau Tempelkan URL Tautan Gambar:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={photoAvatarUrlInput}
                    onChange={(e) => setPhotoAvatarUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPhotoUrl}
                    className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold transition cursor-pointer shrink-0"
                  >
                    Terapkan URL
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-900 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Foto yang disimpan akan otomatis disinkronkan ke Supabase database dan diperbarui pada semua sesi akun.
                </span>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Simpan Foto Profil</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW GAMBAR PENUH (ZOOM) */}
      {previewModalImg && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative flex flex-col items-center text-center">
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              title="Tutup Preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 w-full max-h-[360px] flex items-center justify-center overflow-hidden my-3">
              <img
                src={previewModalImg.url}
                alt={previewModalImg.title}
                className="max-h-[320px] max-w-full object-contain rounded-xl shadow-xs"
              />
            </div>

            <div className="w-full mt-2">
              <h4 className="font-bold text-stone-900 text-sm">
                {previewModalImg.title}
              </h4>
              {previewModalImg.subtitle && (
                <p className="text-xs text-stone-500 mt-0.5">
                  {previewModalImg.subtitle}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 w-full flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
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
