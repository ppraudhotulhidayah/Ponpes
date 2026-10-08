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
} from 'lucide-react';
import { User, Santri } from '../types';

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
  const [activeModal, setActiveModal] = useState<'guru' | 'wali' | 'resetPass' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Teacher Form State
  const [guruForm, setGuruForm] = useState({
    name: '',
    nip: '',
    mapel: '',
    username: '',
    password: '',
    noHp: '',
    email: '',
  });

  // Guardian Form State
  const [waliForm, setWaliForm] = useState({
    name: '',
    username: '',
    password: '',
    noHp: '',
    email: '',
    santriId: santriList[0]?.id || '',
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
      });
    }
    setActiveModal('wali');
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
        avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80`,
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
        avatar: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80`,
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
                    <div className="w-10 h-10 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-sm shadow-xs uppercase">
                      {user.name.charAt(0)}
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

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setActiveModal('resetPass');
                  }}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                  <span>Reset Sandi</span>
                </button>

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
    </div>
  );
};
