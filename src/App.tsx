import React, { useState, useEffect } from 'react';
import {
  User,
  Santri,
  JadwalMadrasah,
  RutinitasHarian,
  PiketSantri,
  IzinMengajar,
  JurnalKBM,
  SuratIzinPulang,
  PelanggaranTakzir,
  Pengumuman,
  AbsensiRecord,
  PesantrenSettings,
  MasterKelas,
  MasterKamar,
} from './types';
import {
  initialUsers,
  initialSantri,
  initialJadwalMadrasah,
  initialRutinitas,
  initialPiket,
  initialIzinMengajar,
  initialJurnal,
  initialSuratIzin,
  initialPelanggaran,
  initialPengumuman,
  initialAbsensi,
  initialSettings,
  initialMasterKelas,
  initialMasterKamar,
} from './data/mockData';

import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Absensi } from './components/Absensi';
import { Jadwal } from './components/Jadwal';
import { Pengajar } from './components/Pengajar';
import { SantriComponent } from './components/Santri';
import { SuratIzin } from './components/SuratIzin';
import { Kedisiplinan } from './components/Kedisiplinan';
import { Laporan } from './components/Laporan';
import { WaliPortal } from './components/WaliPortal';
import { KelolaPengguna } from './components/KelolaPengguna';
import { Pengaturan } from './components/Pengaturan';
import { MasterKelasKamar } from './components/MasterKelasKamar';
import {
  fetchMasterKelasList,
  saveMasterKelasItem,
  deleteMasterKelasItem,
  fetchMasterKamarList,
  saveMasterKamarItem,
  deleteMasterKamarItem,
} from './services/masterDataService';

import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  CalendarDays,
  Settings,
  HeartHandshake,
  UserCog,
  FileSpreadsheet,
  CheckCircle2,
  Info,
  LogOut,
} from 'lucide-react';

export default function App() {
  // Local storage helpers
  const loadStorage = <T,>(key: string, fallback: T): T => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  };

  const saveStorage = <T,>(key: string, data: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  };

  // Toast Notification State
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // State: Users & Settings
  const [usersList, setUsersList] = useState<User[]>(() =>
    loadStorage('pesantren_users', initialUsers)
  );

  const [settings, setSettings] = useState<PesantrenSettings>(() =>
    loadStorage('pesantren_settings', initialSettings)
  );

  // Authentication Gate State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const sessionToken = localStorage.getItem('pesantren_session_token');
      const savedUser = localStorage.getItem('pesantren_current_user');
      if (sessionToken && savedUser) {
        return JSON.parse(savedUser);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const sessionToken = localStorage.getItem('pesantren_session_token');
      const savedUser = localStorage.getItem('pesantren_current_user');
      return !!(sessionToken && savedUser);
    } catch {
      return false;
    }
  });

  // Data States
  const [santriList, setSantriList] = useState<Santri[]>(() =>
    loadStorage('pesantren_santri', initialSantri)
  );

  const [absensiList, setAbsensiList] = useState<AbsensiRecord[]>(() =>
    loadStorage('pesantren_absensi', initialAbsensi)
  );

  const [jadwalMadrasahList, setJadwalMadrasahList] = useState<JadwalMadrasah[]>(() =>
    loadStorage('pesantren_jadwal_madrasah', initialJadwalMadrasah)
  );

  const [rutinitasList, setRutinitasList] = useState<RutinitasHarian[]>(() =>
    loadStorage('pesantren_rutinitas', initialRutinitas)
  );

  const [piketList, setPiketList] = useState<PiketSantri[]>(() =>
    loadStorage('pesantren_piket', initialPiket)
  );

  const [izinMengajarList, setIzinMengajarList] = useState<IzinMengajar[]>(() =>
    loadStorage('pesantren_izin_mengajar', initialIzinMengajar)
  );

  const [jurnalList, setJurnalList] = useState<JurnalKBM[]>(() =>
    loadStorage('pesantren_jurnal', initialJurnal)
  );

  const [suratIzinList, setSuratIzinList] = useState<SuratIzinPulang[]>(() =>
    loadStorage('pesantren_surat_izin', initialSuratIzin)
  );

  const [pelanggaranList, setPelanggaranList] = useState<PelanggaranTakzir[]>(() =>
    loadStorage('pesantren_pelanggaran', initialPelanggaran)
  );

  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>(() =>
    loadStorage('pesantren_pengumuman', initialPengumuman)
  );

  const [masterKelasList, setMasterKelasList] = useState<MasterKelas[]>(() =>
    loadStorage('pesantren_master_kelas', initialMasterKelas)
  );

  const [masterKamarList, setMasterKamarList] = useState<MasterKamar[]>(() =>
    loadStorage('pesantren_master_kamar', initialMasterKamar)
  );

  const [activeTab, setActiveTab] = useState<string>(() =>
    currentUser?.role === 'wali' ? 'wali_portal' : 'dashboard'
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-sync storage
  useEffect(() => saveStorage('pesantren_users', usersList), [usersList]);
  useEffect(() => saveStorage('pesantren_santri', santriList), [santriList]);
  useEffect(() => saveStorage('pesantren_absensi', absensiList), [absensiList]);
  useEffect(() => saveStorage('pesantren_jadwal_madrasah', jadwalMadrasahList), [jadwalMadrasahList]);
  useEffect(() => saveStorage('pesantren_rutinitas', rutinitasList), [rutinitasList]);
  useEffect(() => saveStorage('pesantren_piket', piketList), [piketList]);
  useEffect(() => saveStorage('pesantren_izin_mengajar', izinMengajarList), [izinMengajarList]);
  useEffect(() => saveStorage('pesantren_jurnal', jurnalList), [jurnalList]);
  useEffect(() => saveStorage('pesantren_surat_izin', suratIzinList), [suratIzinList]);
  useEffect(() => saveStorage('pesantren_pelanggaran', pelanggaranList), [pelanggaranList]);
  useEffect(() => saveStorage('pesantren_pengumuman', pengumumanList), [pengumumanList]);
  useEffect(() => saveStorage('pesantren_settings', settings), [settings]);
  useEffect(() => saveStorage('pesantren_master_kelas', masterKelasList), [masterKelasList]);
  useEffect(() => saveStorage('pesantren_master_kamar', masterKamarList), [masterKamarList]);

  // Load from Supabase on start
  useEffect(() => {
    let mounted = true;
    fetchMasterKelasList().then((data) => {
      if (mounted && data && data.length > 0) setMasterKelasList(data);
    });
    fetchMasterKamarList().then((data) => {
      if (mounted && data && data.length > 0) setMasterKamarList(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Login handler
  const handleLoginSuccess = (user: User) => {
    const sessionToken = `pstr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    try {
      localStorage.setItem('pesantren_session_token', sessionToken);
      localStorage.setItem('pesantren_current_user', JSON.stringify(user));
    } catch (e) {
      console.error('Session persist error:', e);
    }
    setCurrentUser(user);
    setIsAuthenticated(true);

    if (user.role === 'wali') {
      setActiveTab('wali_portal');
    } else {
      setActiveTab('dashboard');
    }
    showToast(`Assalamu'alaikum! Selamat datang, ${user.displayName || user.name}.`);
  };

  // Logout handler
  const handleLogout = () => {
    try {
      localStorage.removeItem('pesantren_session_token');
      localStorage.removeItem('pesantren_current_user');
    } catch {}
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMobileMenuOpen(false);
    showToast('Anda telah keluar dari sistem.', 'info');
  };

  // Admin dynamic profile update
  const handleUpdateAdminProfile = (profile: {
    name: string;
    username: string;
    password?: string;
  }) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      name: profile.name,
      displayName: profile.name,
      username: profile.username,
      password: profile.password || currentUser.password,
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('pesantren_current_user', JSON.stringify(updatedUser));
    } catch {}

    const updatedUsers = usersList.map((u) =>
      u.role === 'admin'
        ? {
            ...u,
            name: profile.name,
            displayName: profile.name,
            username: profile.username,
            password: profile.password || u.password,
          }
        : u
    );
    setUsersList(updatedUsers);
  };

  // User management
  const handleAddUser = (user: User) => {
    setUsersList((prev) => [user, ...prev]);
  };

  const handleUpdateUser = (user: User) => {
    setUsersList((prev) => prev.map((u) => (u.id === user.id ? user : u)));
    if (currentUser?.id === user.id) {
      setCurrentUser(user);
      try {
        localStorage.setItem('pesantren_current_user', JSON.stringify(user));
      } catch {}
    }
  };

  const handleDeleteUser = (id: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== id));
  };

  // Santri management
  const handleAddSantri = (santri: Santri) => {
    setSantriList((prev) => [santri, ...prev]);
  };

  const handleUpdateSantri = (santri: Santri) => {
    setSantriList((prev) => prev.map((s) => (s.id === santri.id ? santri : s)));
  };

  const handleDeleteSantri = (id: string) => {
    setSantriList((prev) => prev.filter((s) => s.id !== id));
  };

  // Master Kelas Handlers
  const handleAddKelas = async (item: MasterKelas) => {
    setMasterKelasList((prev) => [item, ...prev]);
    await saveMasterKelasItem(item);
    showToast(`Master kelas "${item.nama}" berhasil ditambahkan.`);
  };

  const handleUpdateKelas = async (item: MasterKelas) => {
    setMasterKelasList((prev) => prev.map((k) => (k.id === item.id ? item : k)));
    await saveMasterKelasItem(item);
    showToast(`Master kelas "${item.nama}" berhasil diperbarui.`);
  };

  const handleDeleteKelas = async (id: string) => {
    setMasterKelasList((prev) => prev.filter((k) => k.id !== id));
    await deleteMasterKelasItem(id);
    showToast('Master kelas berhasil dihapus.');
  };

  // Master Kamar Handlers
  const handleAddKamar = async (item: MasterKamar) => {
    setMasterKamarList((prev) => [item, ...prev]);
    await saveMasterKamarItem(item);
    showToast(`Master kamar "${item.nama}" berhasil ditambahkan.`);
  };

  const handleUpdateKamar = async (item: MasterKamar) => {
    setMasterKamarList((prev) => prev.map((k) => (k.id === item.id ? item : k)));
    await saveMasterKamarItem(item);
    showToast(`Master kamar "${item.nama}" berhasil diperbarui.`);
  };

  const handleDeleteKamar = async (id: string) => {
    setMasterKamarList((prev) => prev.filter((k) => k.id !== id));
    await deleteMasterKamarItem(id);
    showToast('Master kamar berhasil dihapus.');
  };

  const handleSyncMasterData = async () => {
    showToast('Menyinkronkan data dengan database Supabase...', 'info');
    try {
      const [kls, kmr] = await Promise.all([fetchMasterKelasList(), fetchMasterKamarList()]);
      if (kls) setMasterKelasList(kls);
      if (kmr) setMasterKamarList(kmr);
      showToast('Master data berhasil disinkronkan dengan database.');
    } catch {
      showToast('Gagal menyinkronkan data dengan database.', 'error');
    }
  };

  // Surat Izin
  const handleAddSuratIzin = (surat: SuratIzinPulang) => {
    setSuratIzinList((prev) => [surat, ...prev]);
    setSantriList((prev) =>
      prev.map((s) => (s.id === surat.santriId ? { ...s, statusMukim: 'Izin Pulang' } : s))
    );
    showToast(`Surat izin pulang nomor ${surat.nomorSurat} berhasil diterbitkan.`);
  };

  const handleUpdateStatusSurat = (
    id: string,
    status: 'Sedang Di Luar' | 'Terlambat' | 'Sudah Kembali'
  ) => {
    setSuratIzinList((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              statusKepulangan: status,
              tanggalRealisasiKembali:
                status === 'Sudah Kembali'
                  ? `${new Date().toISOString().substring(0, 10)} 16:30`
                  : s.tanggalRealisasiKembali,
            }
          : s
      )
    );

    const surat = suratIzinList.find((s) => s.id === id);
    if (surat && status === 'Sudah Kembali') {
      setSantriList((prev) =>
        prev.map((s) => (s.id === surat.santriId ? { ...s, statusMukim: 'Mukim' } : s))
      );
      showToast(`Santri "${surat.namaSantri}" dikonfirmasi telah kembali ke asrama.`);
    }
  };

  // Pelanggaran & Takzir
  const handleAddPelanggaran = (item: PelanggaranTakzir) => {
    setPelanggaranList((prev) => [item, ...prev]);
    setSantriList((prev) =>
      prev.map((s) =>
        s.id === item.santriId
          ? { ...s, poinPelanggaran: s.poinPelanggaran + item.poin }
          : s
      )
    );
    showToast(`Catatan pelanggaran santri "${item.namaSantri}" berhasil disimpan.`);
  };

  const handleUpdateStatusTakzir = (
    id: string,
    status: 'Belum Dilaksanakan' | 'Sedang Proses' | 'Selesai'
  ) => {
    setPelanggaranList((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              statusTakzir: status,
              diselesaikanPada:
                status === 'Selesai'
                  ? new Date().toISOString().substring(0, 10)
                  : p.diselesaikanPada,
            }
          : p
      )
    );
    showToast(`Status takzir berhasil diubah menjadi: ${status}.`);
  };

  // Izin Mengajar
  const handleAddIzinMengajar = (item: IzinMengajar) => {
    setIzinMengajarList((prev) => [item, ...prev]);
    showToast('Permohonan izin mengajar berhasil dikirimkan ke Admin.');
  };

  const handleUpdateStatusIzin = (
    id: string,
    status: 'Disetujui' | 'Ditolak',
    catatanAdmin?: string
  ) => {
    setIzinMengajarList((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status,
              catatanAdmin: catatanAdmin || i.catatanAdmin,
            }
          : i
      )
    );
    showToast(`Permohonan izin mengajar berhasil ${status.toLowerCase()}.`);
  };

  // Jurnal KBM
  const handleAddJurnal = (item: JurnalKBM) => {
    setJurnalList((prev) => [item, ...prev]);
    showToast(`Jurnal KBM kitab "${item.kitab}" berhasil dicatat.`);
  };

  // Jadwal Madrasah
  const handleAddJadwalMadrasah = (item: JadwalMadrasah) => {
    setJadwalMadrasahList((prev) => [...prev, item]);
  };
  const handleUpdateJadwalMadrasah = (item: JadwalMadrasah) => {
    setJadwalMadrasahList((prev) => prev.map((j) => (j.id === item.id ? item : j)));
  };
  const handleDeleteJadwalMadrasah = (id: string) => {
    setJadwalMadrasahList((prev) => prev.filter((j) => j.id !== id));
  };

  // Rutinitas
  const handleAddRutinitas = (item: RutinitasHarian) => {
    setRutinitasList((prev) => [...prev, item]);
  };
  const handleUpdateRutinitas = (item: RutinitasHarian) => {
    setRutinitasList((prev) => prev.map((r) => (r.id === item.id ? item : r)));
  };
  const handleDeleteRutinitas = (id: string) => {
    setRutinitasList((prev) => prev.filter((r) => r.id !== id));
  };

  // Piket
  const handleAddPiket = (item: PiketSantri) => {
    setPiketList((prev) => [...prev, item]);
  };
  const handleUpdatePiket = (item: PiketSantri) => {
    setPiketList((prev) => prev.map((p) => (p.id === item.id ? item : p)));
  };
  const handleDeletePiket = (id: string) => {
    setPiketList((prev) => prev.filter((p) => p.id !== id));
  };

  // Badges count
  const counts = {
    suratIzinAktif: suratIzinList.filter((s) => s.statusKepulangan === 'Sedang Di Luar')
      .length,
    takzirAktif: pelanggaranList.filter((p) => p.statusTakzir !== 'Selesai').length,
    izinUstadzPending: izinMengajarList.filter((i) => i.status === 'Menunggu').length,
  };

  // Selected Santri for Wali
  const waliSantriObj =
    santriList.find((s) => s.id === (currentUser?.santriId || 'santri_1')) ||
    santriList[0];

  // =========================================================================
  // 1. AUTH GATE: Jika belum login, HANYA tampilkan halaman Login penuh (Full-Screen)
  // =========================================================================
  if (!isAuthenticated || !currentUser) {
    return (
      <>
        {toast && (
          <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-stone-900/90 text-white border border-stone-700 shadow-xl text-xs flex items-center gap-2.5 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            <Info className="w-4 h-4 text-amber-400" />
            <span>{toast.message}</span>
          </div>
        )}
        <LoginPage
          allUsers={usersList}
          onLoginSuccess={handleLoginSuccess}
          settings={settings}
        />
      </>
    );
  }

  // =========================================================================
  // 2. MAIN APPLICATION (Hanya tampil setelah login terverifikasi)
  // =========================================================================
  return (
    <div className="min-h-screen bg-stone-100/70 flex flex-col font-sans selection:bg-emerald-800 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md border animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'success'
              ? 'bg-emerald-950/95 text-emerald-100 border-emerald-700'
              : toast.type === 'error'
                ? 'bg-rose-950/95 text-rose-100 border-rose-700'
                : 'bg-stone-900/95 text-amber-200 border-stone-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Header Bar */}
      <Header
        currentUser={currentUser}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        settings={settings}
        onLogout={handleLogout}
      />

      {/* Main Layout Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={currentUser.role}
          counts={counts}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          settings={settings}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0 pb-20 lg:pb-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              currentUser={currentUser}
              santriList={santriList}
              absensiList={absensiList}
              suratIzinList={suratIzinList}
              pelanggaranList={pelanggaranList}
              rutinitasList={rutinitasList}
              pengumumanList={pengumumanList}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'absensi' && (
            <Absensi
              santriList={santriList}
              absensiList={absensiList}
              onSaveAbsensi={(records) => {
                setAbsensiList(records);
                showToast('Presensi santri berhasil diperbarui.');
              }}
              userRole={currentUser.role}
              userName={currentUser.displayName || currentUser.name}
              onNavigateToLaporan={() => setActiveTab('laporan')}
            />
          )}

          {activeTab === 'jadwal' && (
            <Jadwal
              jadwalMadrasahList={jadwalMadrasahList}
              rutinitasList={rutinitasList}
              piketList={piketList}
              userRole={currentUser.role}
              onAddJadwalMadrasah={handleAddJadwalMadrasah}
              onUpdateJadwalMadrasah={handleUpdateJadwalMadrasah}
              onDeleteJadwalMadrasah={handleDeleteJadwalMadrasah}
              onAddRutinitas={handleAddRutinitas}
              onUpdateRutinitas={handleUpdateRutinitas}
              onDeleteRutinitas={handleDeleteRutinitas}
              onAddPiket={handleAddPiket}
              onUpdatePiket={handleUpdatePiket}
              onDeletePiket={handleDeletePiket}
            />
          )}

          {activeTab === 'pengajar' && (
            <Pengajar
              currentUser={currentUser}
              izinMengajarList={izinMengajarList}
              onAddIzinMengajar={handleAddIzinMengajar}
              onUpdateStatusIzin={handleUpdateStatusIzin}
              jurnalList={jurnalList}
              onAddJurnal={handleAddJurnal}
              onNavigateToLaporan={() => setActiveTab('laporan')}
            />
          )}

          {activeTab === 'santri' && (
            <SantriComponent
              santriList={santriList}
              onAddSantri={(s) => {
                handleAddSantri(s);
                showToast(`Data santri "${s.nama}" berhasil ditambahkan.`);
              }}
              onUpdateSantri={(s) => {
                handleUpdateSantri(s);
                showToast(`Data santri "${s.nama}" berhasil diperbarui.`);
              }}
              onDeleteSantri={(id) => {
                handleDeleteSantri(id);
                showToast('Data santri berhasil dihapus.');
              }}
              userRole={currentUser.role}
              suratIzinList={suratIzinList}
              pelanggaranList={pelanggaranList}
              settings={settings}
              masterKelasList={masterKelasList}
              masterKamarList={masterKamarList}
              onNavigateToMaster={() => setActiveTab('kelola_master')}
            />
          )}

          {activeTab === 'kelola_master' && currentUser.role === 'admin' && (
            <MasterKelasKamar
              masterKelasList={masterKelasList}
              masterKamarList={masterKamarList}
              santriList={santriList}
              onAddKelas={handleAddKelas}
              onUpdateKelas={handleUpdateKelas}
              onDeleteKelas={handleDeleteKelas}
              onAddKamar={handleAddKamar}
              onUpdateKamar={handleUpdateKamar}
              onDeleteKamar={handleDeleteKamar}
              onRefreshFromSupabase={handleSyncMasterData}
            />
          )}

          {activeTab === 'surat_izin' && (
            <SuratIzin
              suratIzinList={suratIzinList}
              santriList={santriList}
              onAddSuratIzin={handleAddSuratIzin}
              onUpdateStatusSurat={handleUpdateStatusSurat}
              userRole={currentUser.role}
              userName={currentUser.displayName || currentUser.name}
              settings={settings}
            />
          )}

          {activeTab === 'kedisiplinan' && (
            <Kedisiplinan
              pelanggaranList={pelanggaranList}
              santriList={santriList}
              onAddPelanggaran={handleAddPelanggaran}
              onUpdateStatusTakzir={handleUpdateStatusTakzir}
              userRole={currentUser.role}
              userName={currentUser.displayName || currentUser.name}
              onNavigateToLaporan={() => setActiveTab('laporan')}
            />
          )}

          {activeTab === 'laporan' && (
            <Laporan
              santriList={santriList}
              absensiList={absensiList}
              jurnalList={jurnalList}
              pelanggaranList={pelanggaranList}
              suratIzinList={suratIzinList}
              userRole={currentUser.role}
              settings={settings}
            />
          )}

          {activeTab === 'wali_portal' && (
            <WaliPortal
              currentUser={currentUser}
              santri={waliSantriObj}
              absensiList={absensiList}
              suratIzinList={suratIzinList}
              pelanggaranList={pelanggaranList}
              jadwalList={jadwalMadrasahList}
              onNavigateToRapor={() => setActiveTab('laporan')}
            />
          )}

          {activeTab === 'kelola_pengguna' && currentUser.role === 'admin' && (
            <KelolaPengguna
              usersList={usersList}
              santriList={santriList}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'pengaturan' && currentUser.role === 'admin' && (
            <Pengaturan
              settings={settings}
              onUpdateSettings={(s) => {
                setSettings(s);
                showToast('Pengaturan lembaga berhasil disimpan.');
              }}
              userRole={currentUser.role}
              currentUser={currentUser}
              onUpdateAdminProfile={(prof) => {
                handleUpdateAdminProfile(prof);
                showToast(`Nama Admin berhasil diperbarui menjadi "${prof.name}".`);
              }}
              onNavigateToMaster={() => setActiveTab('kelola_master')}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Hidden on Print & Desktop) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 px-2 py-2 flex items-center justify-around shadow-lg no-print">
        {currentUser.role === 'wali' ? (
          <>
            <button
              onClick={() => setActiveTab('wali_portal')}
              className={`flex flex-col items-center gap-1 cursor-pointer ${
                activeTab === 'wali_portal'
                  ? 'text-amber-700 font-bold'
                  : 'text-stone-500'
              }`}
            >
              <HeartHandshake className="w-5 h-5" />
              <span className="text-[10px]">Portal Ananda</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[10px]">Keluar</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center gap-1 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'text-emerald-800 font-bold'
                  : 'text-stone-500'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px]">Beranda</span>
            </button>
            <button
              onClick={() => setActiveTab('absensi')}
              className={`flex flex-col items-center gap-1 cursor-pointer ${
                activeTab === 'absensi'
                  ? 'text-emerald-800 font-bold'
                  : 'text-stone-500'
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span className="text-[10px]">Absensi</span>
            </button>
            <button
              onClick={() => setActiveTab('surat_izin')}
              className={`flex flex-col items-center gap-1 cursor-pointer ${
                activeTab === 'surat_izin'
                  ? 'text-emerald-800 font-bold'
                  : 'text-stone-500'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px]">Surat Izin</span>
            </button>
            {currentUser.role === 'admin' ? (
              <button
                onClick={() => setActiveTab('kelola_pengguna')}
                className={`flex flex-col items-center gap-1 cursor-pointer ${
                  activeTab === 'kelola_pengguna'
                    ? 'text-emerald-800 font-bold'
                    : 'text-stone-500'
                }`}
              >
                <UserCog className="w-5 h-5" />
                <span className="text-[10px]">Pengguna</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('jadwal')}
                className={`flex flex-col items-center gap-1 cursor-pointer ${
                  activeTab === 'jadwal'
                    ? 'text-emerald-800 font-bold'
                    : 'text-stone-500'
                }`}
              >
                <CalendarDays className="w-5 h-5" />
                <span className="text-[10px]">Jadwal</span>
              </button>
            )}
            {currentUser.role === 'admin' ? (
              <button
                onClick={() => setActiveTab('pengaturan')}
                className={`flex flex-col items-center gap-1 cursor-pointer ${
                  activeTab === 'pengaturan'
                    ? 'text-emerald-800 font-bold'
                    : 'text-stone-500'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="text-[10px]">Pengaturan</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('laporan')}
                className={`flex flex-col items-center gap-1 cursor-pointer ${
                  activeTab === 'laporan'
                    ? 'text-emerald-800 font-bold'
                    : 'text-stone-500'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span className="text-[10px]">Laporan</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
