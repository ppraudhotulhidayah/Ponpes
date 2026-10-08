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
  ENTITY_KEYS,
  fetchAllEntitiesFromCloud,
  saveEntityToCloud,
  pushAllToCloud,
  setupRealtimeSyncListener,
  CompleteDatasets,
} from './services/cloudDatabaseService';

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

  // Auto-sync storage to local cache as fast fallback
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

  // Load from Supabase on start & setup Multi-Device Realtime Sync
  useEffect(() => {
    let mounted = true;

    // 1. Fetch all data from online cloud database
    fetchAllEntitiesFromCloud().then(({ data, fromCloud }) => {
      if (!mounted) return;
      if (fromCloud && data) {
        if (data[ENTITY_KEYS.USERS]) setUsersList(data[ENTITY_KEYS.USERS]);
        if (data[ENTITY_KEYS.SANTRI]) setSantriList(data[ENTITY_KEYS.SANTRI]);
        if (data[ENTITY_KEYS.ABSENSI]) setAbsensiList(data[ENTITY_KEYS.ABSENSI]);
        if (data[ENTITY_KEYS.JADWAL]) setJadwalMadrasahList(data[ENTITY_KEYS.JADWAL]);
        if (data[ENTITY_KEYS.RUTINITAS]) setRutinitasList(data[ENTITY_KEYS.RUTINITAS]);
        if (data[ENTITY_KEYS.PIKET]) setPiketList(data[ENTITY_KEYS.PIKET]);
        if (data[ENTITY_KEYS.SURAT_IZIN]) setSuratIzinList(data[ENTITY_KEYS.SURAT_IZIN]);
        if (data[ENTITY_KEYS.PELANGGARAN]) setPelanggaranList(data[ENTITY_KEYS.PELANGGARAN]);
        if (data[ENTITY_KEYS.IZIN_MENGAJAR]) setIzinMengajarList(data[ENTITY_KEYS.IZIN_MENGAJAR]);
        if (data[ENTITY_KEYS.JURNAL]) setJurnalList(data[ENTITY_KEYS.JURNAL]);
        if (data[ENTITY_KEYS.PENGUMUMAN]) setPengumumanList(data[ENTITY_KEYS.PENGUMUMAN]);
        if (data[ENTITY_KEYS.SETTINGS]) setSettings(data[ENTITY_KEYS.SETTINGS]);
        if (data[ENTITY_KEYS.MASTER_KELAS]) setMasterKelasList(data[ENTITY_KEYS.MASTER_KELAS]);
        if (data[ENTITY_KEYS.MASTER_KAMAR]) setMasterKamarList(data[ENTITY_KEYS.MASTER_KAMAR]);
      }
    });

    // 2. Fetch master classes and rooms
    fetchMasterKelasList().then((data) => {
      if (mounted && data && data.length > 0) setMasterKelasList(data);
    });
    fetchMasterKamarList().then((data) => {
      if (mounted && data && data.length > 0) setMasterKamarList(data);
    });

    // 3. Listen to real-time changes across devices
    const unsubscribe = setupRealtimeSyncListener((key, updatedData) => {
      if (!mounted || !updatedData) return;
      if (key === ENTITY_KEYS.SANTRI) setSantriList(updatedData);
      else if (key === ENTITY_KEYS.ABSENSI) setAbsensiList(updatedData);
      else if (key === ENTITY_KEYS.USERS) setUsersList(updatedData);
      else if (key === ENTITY_KEYS.SURAT_IZIN) setSuratIzinList(updatedData);
      else if (key === ENTITY_KEYS.PELANGGARAN) setPelanggaranList(updatedData);
      else if (key === ENTITY_KEYS.JADWAL) setJadwalMadrasahList(updatedData);
      else if (key === ENTITY_KEYS.RUTINITAS) setRutinitasList(updatedData);
      else if (key === ENTITY_KEYS.PIKET) setPiketList(updatedData);
      else if (key === ENTITY_KEYS.IZIN_MENGAJAR) setIzinMengajarList(updatedData);
      else if (key === ENTITY_KEYS.JURNAL) setJurnalList(updatedData);
      else if (key === ENTITY_KEYS.PENGUMUMAN) setPengumumanList(updatedData);
      else if (key === ENTITY_KEYS.SETTINGS) setSettings(updatedData);
      else if (key === ENTITY_KEYS.MASTER_KELAS) setMasterKelasList(updatedData);
      else if (key === ENTITY_KEYS.MASTER_KAMAR) setMasterKamarList(updatedData);

      showToast('Data otomatis tersinkronisasi dari perangkat lain.', 'info');
    });

    return () => {
      mounted = false;
      unsubscribe();
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
    saveEntityToCloud(ENTITY_KEYS.USERS, updatedUsers);
  };

  // User management
  const handleAddUser = (user: User) => {
    const updated = [user, ...usersList];
    setUsersList(updated);
    saveEntityToCloud(ENTITY_KEYS.USERS, updated);
  };

  const handleUpdateUser = (user: User) => {
    const updated = usersList.map((u) => (u.id === user.id ? user : u));
    setUsersList(updated);
    saveEntityToCloud(ENTITY_KEYS.USERS, updated);
    if (currentUser?.id === user.id) {
      setCurrentUser(user);
      try {
        localStorage.setItem('pesantren_current_user', JSON.stringify(user));
      } catch {}
    }
  };

  const handleDeleteUser = (id: string) => {
    const updated = usersList.filter((u) => u.id !== id);
    setUsersList(updated);
    saveEntityToCloud(ENTITY_KEYS.USERS, updated);
  };

  // Santri management
  const handleAddSantri = (santri: Santri) => {
    const updated = [santri, ...santriList];
    setSantriList(updated);
    saveEntityToCloud(ENTITY_KEYS.SANTRI, updated);
  };

  const handleUpdateSantri = (santri: Santri) => {
    const updated = santriList.map((s) => (s.id === santri.id ? santri : s));
    setSantriList(updated);
    saveEntityToCloud(ENTITY_KEYS.SANTRI, updated);
  };

  const handleDeleteSantri = (id: string) => {
    const updated = santriList.filter((s) => s.id !== id);
    setSantriList(updated);
    saveEntityToCloud(ENTITY_KEYS.SANTRI, updated);
  };

  // Master Kelas Handlers
  const handleAddKelas = async (item: MasterKelas) => {
    const updated = [item, ...masterKelasList];
    setMasterKelasList(updated);
    await saveMasterKelasItem(item);
    saveEntityToCloud(ENTITY_KEYS.MASTER_KELAS, updated);
    showToast(`Master kelas "${item.nama}" berhasil ditambahkan.`);
  };

  const handleUpdateKelas = async (item: MasterKelas) => {
    const updated = masterKelasList.map((k) => (k.id === item.id ? item : k));
    setMasterKelasList(updated);
    await saveMasterKelasItem(item);
    saveEntityToCloud(ENTITY_KEYS.MASTER_KELAS, updated);
    showToast(`Master kelas "${item.nama}" berhasil diperbarui.`);
  };

  const handleDeleteKelas = async (id: string) => {
    const updated = masterKelasList.filter((k) => k.id !== id);
    setMasterKelasList(updated);
    await deleteMasterKelasItem(id);
    saveEntityToCloud(ENTITY_KEYS.MASTER_KELAS, updated);
    showToast('Master kelas berhasil dihapus.');
  };

  // Master Kamar Handlers
  const handleAddKamar = async (item: MasterKamar) => {
    const updated = [item, ...masterKamarList];
    setMasterKamarList(updated);
    await saveMasterKamarItem(item);
    saveEntityToCloud(ENTITY_KEYS.MASTER_KAMAR, updated);
    showToast(`Master kamar "${item.nama}" berhasil ditambahkan.`);
  };

  const handleUpdateKamar = async (item: MasterKamar) => {
    const updated = masterKamarList.map((k) => (k.id === item.id ? item : k));
    setMasterKamarList(updated);
    await saveMasterKamarItem(item);
    saveEntityToCloud(ENTITY_KEYS.MASTER_KAMAR, updated);
    showToast(`Master kamar "${item.nama}" berhasil diperbarui.`);
  };

  const handleDeleteKamar = async (id: string) => {
    const updated = masterKamarList.filter((k) => k.id !== id);
    setMasterKamarList(updated);
    await deleteMasterKamarItem(id);
    saveEntityToCloud(ENTITY_KEYS.MASTER_KAMAR, updated);
    showToast('Master kamar berhasil dihapus.');
  };

  const handleSyncMasterData = async () => {
    showToast('Menyinkronkan data dengan database Supabase...', 'info');
    try {
      const [kls, kmr] = await Promise.all([fetchMasterKelasList(), fetchMasterKamarList()]);
      if (kls) {
        setMasterKelasList(kls);
        saveEntityToCloud(ENTITY_KEYS.MASTER_KELAS, kls);
      }
      if (kmr) {
        setMasterKamarList(kmr);
        saveEntityToCloud(ENTITY_KEYS.MASTER_KAMAR, kmr);
      }
      showToast('Master data berhasil disinkronkan dengan database.');
    } catch {
      showToast('Gagal menyinkronkan data dengan database.', 'error');
    }
  };

  // Surat Izin
  const handleAddSuratIzin = (surat: SuratIzinPulang) => {
    const updatedSurat = [surat, ...suratIzinList];
    setSuratIzinList(updatedSurat);
    saveEntityToCloud(ENTITY_KEYS.SURAT_IZIN, updatedSurat);

    const updatedSantri = santriList.map((s) =>
      s.id === surat.santriId ? { ...s, statusMukim: 'Izin Pulang' as const } : s
    );
    setSantriList(updatedSantri);
    saveEntityToCloud(ENTITY_KEYS.SANTRI, updatedSantri);

    showToast(`Surat izin pulang nomor ${surat.nomorSurat} berhasil diterbitkan.`);
  };

  const handleUpdateStatusSurat = (
    id: string,
    status: 'Sedang Di Luar' | 'Terlambat' | 'Sudah Kembali'
  ) => {
    const updatedSurat = suratIzinList.map((s) =>
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
    );
    setSuratIzinList(updatedSurat);
    saveEntityToCloud(ENTITY_KEYS.SURAT_IZIN, updatedSurat);

    const surat = suratIzinList.find((s) => s.id === id);
    if (surat && status === 'Sudah Kembali') {
      const updatedSantri = santriList.map((s) =>
        s.id === surat.santriId ? { ...s, statusMukim: 'Mukim' as const } : s
      );
      setSantriList(updatedSantri);
      saveEntityToCloud(ENTITY_KEYS.SANTRI, updatedSantri);
      showToast(`Santri "${surat.namaSantri}" dikonfirmasi telah kembali ke asrama.`);
    }
  };

  // Pelanggaran & Takzir
  const handleAddPelanggaran = (item: PelanggaranTakzir) => {
    const updatedList = [item, ...pelanggaranList];
    setPelanggaranList(updatedList);
    saveEntityToCloud(ENTITY_KEYS.PELANGGARAN, updatedList);

    const updatedSantri = santriList.map((s) =>
      s.id === item.santriId
        ? { ...s, poinPelanggaran: s.poinPelanggaran + item.poin }
        : s
    );
    setSantriList(updatedSantri);
    saveEntityToCloud(ENTITY_KEYS.SANTRI, updatedSantri);

    showToast(`Catatan pelanggaran santri "${item.namaSantri}" berhasil disimpan.`);
  };

  const handleUpdateStatusTakzir = (
    id: string,
    status: 'Belum Dilaksanakan' | 'Sedang Proses' | 'Selesai'
  ) => {
    const updatedList = pelanggaranList.map((p) =>
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
    );
    setPelanggaranList(updatedList);
    saveEntityToCloud(ENTITY_KEYS.PELANGGARAN, updatedList);
    showToast(`Status takzir berhasil diubah menjadi: ${status}.`);
  };

  // Izin Mengajar
  const handleAddIzinMengajar = (item: IzinMengajar) => {
    const updated = [item, ...izinMengajarList];
    setIzinMengajarList(updated);
    saveEntityToCloud(ENTITY_KEYS.IZIN_MENGAJAR, updated);
    showToast('Permohonan izin mengajar berhasil dikirimkan ke Admin.');
  };

  const handleUpdateStatusIzin = (
    id: string,
    status: 'Disetujui' | 'Ditolak',
    catatanAdmin?: string
  ) => {
    const updated = izinMengajarList.map((i) =>
      i.id === id
        ? {
            ...i,
            status,
            catatanAdmin: catatanAdmin || i.catatanAdmin,
          }
        : i
    );
    setIzinMengajarList(updated);
    saveEntityToCloud(ENTITY_KEYS.IZIN_MENGAJAR, updated);
    showToast(`Permohonan izin mengajar berhasil ${status.toLowerCase()}.`);
  };

  // Jurnal KBM
  const handleAddJurnal = (item: JurnalKBM) => {
    const updated = [item, ...jurnalList];
    setJurnalList(updated);
    saveEntityToCloud(ENTITY_KEYS.JURNAL, updated);
    showToast(`Jurnal KBM kitab "${item.kitab}" berhasil dicatat.`);
  };

  // Jadwal Madrasah
  const handleAddJadwalMadrasah = (item: JadwalMadrasah) => {
    const updated = [...jadwalMadrasahList, item];
    setJadwalMadrasahList(updated);
    saveEntityToCloud(ENTITY_KEYS.JADWAL, updated);
  };
  const handleUpdateJadwalMadrasah = (item: JadwalMadrasah) => {
    const updated = jadwalMadrasahList.map((j) => (j.id === item.id ? item : j));
    setJadwalMadrasahList(updated);
    saveEntityToCloud(ENTITY_KEYS.JADWAL, updated);
  };
  const handleDeleteJadwalMadrasah = (id: string) => {
    const updated = jadwalMadrasahList.filter((j) => j.id !== id);
    setJadwalMadrasahList(updated);
    saveEntityToCloud(ENTITY_KEYS.JADWAL, updated);
  };

  // Rutinitas
  const handleAddRutinitas = (item: RutinitasHarian) => {
    const updated = [...rutinitasList, item];
    setRutinitasList(updated);
    saveEntityToCloud(ENTITY_KEYS.RUTINITAS, updated);
  };
  const handleUpdateRutinitas = (item: RutinitasHarian) => {
    const updated = rutinitasList.map((r) => (r.id === item.id ? item : r));
    setRutinitasList(updated);
    saveEntityToCloud(ENTITY_KEYS.RUTINITAS, updated);
  };
  const handleDeleteRutinitas = (id: string) => {
    const updated = rutinitasList.filter((r) => r.id !== id);
    setRutinitasList(updated);
    saveEntityToCloud(ENTITY_KEYS.RUTINITAS, updated);
  };

  // Piket
  const handleAddPiket = (item: PiketSantri) => {
    const updated = [...piketList, item];
    setPiketList(updated);
    saveEntityToCloud(ENTITY_KEYS.PIKET, updated);
  };
  const handleUpdatePiket = (item: PiketSantri) => {
    const updated = piketList.map((p) => (p.id === item.id ? item : p));
    setPiketList(updated);
    saveEntityToCloud(ENTITY_KEYS.PIKET, updated);
  };
  const handleDeletePiket = (id: string) => {
    const updated = piketList.filter((p) => p.id !== id);
    setPiketList(updated);
    saveEntityToCloud(ENTITY_KEYS.PIKET, updated);
  };

  // Cloud Sync Handlers
  const handleSyncAllToCloud = async () => {
    const payload: CompleteDatasets = {
      users: usersList,
      santri: santriList,
      absensi: absensiList,
      jadwal: jadwalMadrasahList,
      rutinitas: rutinitasList,
      piket: piketList,
      suratIzin: suratIzinList,
      pelanggaran: pelanggaranList,
      izinMengajar: izinMengajarList,
      jurnal: jurnalList,
      pengumuman: pengumumanList,
      settings: settings,
      masterKelas: masterKelasList,
      masterKamar: masterKamarList,
    };
    const res = await pushAllToCloud(payload);
    if (res.success) {
      showToast('Seluruh data berhasil disinkronkan ke database online Supabase!');
    } else {
      showToast(res.error || 'Gagal menyinkronkan data ke cloud.', 'error');
    }
  };

  const handlePullAllFromCloud = async () => {
    const { data, fromCloud } = await fetchAllEntitiesFromCloud();
    if (fromCloud && data) {
      if (data[ENTITY_KEYS.USERS]) setUsersList(data[ENTITY_KEYS.USERS]);
      if (data[ENTITY_KEYS.SANTRI]) setSantriList(data[ENTITY_KEYS.SANTRI]);
      if (data[ENTITY_KEYS.ABSENSI]) setAbsensiList(data[ENTITY_KEYS.ABSENSI]);
      if (data[ENTITY_KEYS.JADWAL]) setJadwalMadrasahList(data[ENTITY_KEYS.JADWAL]);
      if (data[ENTITY_KEYS.RUTINITAS]) setRutinitasList(data[ENTITY_KEYS.RUTINITAS]);
      if (data[ENTITY_KEYS.PIKET]) setPiketList(data[ENTITY_KEYS.PIKET]);
      if (data[ENTITY_KEYS.SURAT_IZIN]) setSuratIzinList(data[ENTITY_KEYS.SURAT_IZIN]);
      if (data[ENTITY_KEYS.PELANGGARAN]) setPelanggaranList(data[ENTITY_KEYS.PELANGGARAN]);
      if (data[ENTITY_KEYS.IZIN_MENGAJAR]) setIzinMengajarList(data[ENTITY_KEYS.IZIN_MENGAJAR]);
      if (data[ENTITY_KEYS.JURNAL]) setJurnalList(data[ENTITY_KEYS.JURNAL]);
      if (data[ENTITY_KEYS.PENGUMUMAN]) setPengumumanList(data[ENTITY_KEYS.PENGUMUMAN]);
      if (data[ENTITY_KEYS.SETTINGS]) setSettings(data[ENTITY_KEYS.SETTINGS]);
      if (data[ENTITY_KEYS.MASTER_KELAS]) setMasterKelasList(data[ENTITY_KEYS.MASTER_KELAS]);
      if (data[ENTITY_KEYS.MASTER_KAMAR]) setMasterKamarList(data[ENTITY_KEYS.MASTER_KAMAR]);
      showToast('Data terbaru berhasil diunduh dari database online Supabase.');
    } else {
      showToast('Tidak ada data baru atau perangkat offline.', 'info');
    }
  };

  const handleImportData = (imported: Partial<CompleteDatasets>) => {
    if (imported.users) {
      setUsersList(imported.users);
      saveEntityToCloud(ENTITY_KEYS.USERS, imported.users);
    }
    if (imported.santri) {
      setSantriList(imported.santri);
      saveEntityToCloud(ENTITY_KEYS.SANTRI, imported.santri);
    }
    if (imported.absensi) {
      setAbsensiList(imported.absensi);
      saveEntityToCloud(ENTITY_KEYS.ABSENSI, imported.absensi);
    }
    if (imported.jadwal) {
      setJadwalMadrasahList(imported.jadwal);
      saveEntityToCloud(ENTITY_KEYS.JADWAL, imported.jadwal);
    }
    if (imported.rutinitas) {
      setRutinitasList(imported.rutinitas);
      saveEntityToCloud(ENTITY_KEYS.RUTINITAS, imported.rutinitas);
    }
    if (imported.piket) {
      setPiketList(imported.piket);
      saveEntityToCloud(ENTITY_KEYS.PIKET, imported.piket);
    }
    if (imported.suratIzin) {
      setSuratIzinList(imported.suratIzin);
      saveEntityToCloud(ENTITY_KEYS.SURAT_IZIN, imported.suratIzin);
    }
    if (imported.pelanggaran) {
      setPelanggaranList(imported.pelanggaran);
      saveEntityToCloud(ENTITY_KEYS.PELANGGARAN, imported.pelanggaran);
    }
    if (imported.izinMengajar) {
      setIzinMengajarList(imported.izinMengajar);
      saveEntityToCloud(ENTITY_KEYS.IZIN_MENGAJAR, imported.izinMengajar);
    }
    if (imported.jurnal) {
      setJurnalList(imported.jurnal);
      saveEntityToCloud(ENTITY_KEYS.JURNAL, imported.jurnal);
    }
    if (imported.pengumuman) {
      setPengumumanList(imported.pengumuman);
      saveEntityToCloud(ENTITY_KEYS.PENGUMUMAN, imported.pengumuman);
    }
    if (imported.settings) {
      setSettings(imported.settings);
      saveEntityToCloud(ENTITY_KEYS.SETTINGS, imported.settings);
    }
    if (imported.masterKelas) {
      setMasterKelasList(imported.masterKelas);
      saveEntityToCloud(ENTITY_KEYS.MASTER_KELAS, imported.masterKelas);
    }
    if (imported.masterKamar) {
      setMasterKamarList(imported.masterKamar);
      saveEntityToCloud(ENTITY_KEYS.MASTER_KAMAR, imported.masterKamar);
    }
    showToast('Data cadangan berhasil dipulihkan.');
  };

  const handleResetAllData = () => {
    setUsersList(initialUsers);
    setSantriList(initialSantri);
    setAbsensiList(initialAbsensi);
    setJadwalMadrasahList(initialJadwalMadrasah);
    setRutinitasList(initialRutinitas);
    setPiketList(initialPiket);
    setSuratIzinList(initialSuratIzin);
    setPelanggaranList(initialPelanggaran);
    setIzinMengajarList(initialIzinMengajar);
    setJurnalList(initialJurnal);
    setPengumumanList(initialPengumuman);
    setSettings(initialSettings);
    setMasterKelasList(initialMasterKelas);
    setMasterKamarList(initialMasterKamar);

    // Push default dataset to cloud as reset
    pushAllToCloud({
      users: initialUsers,
      santri: initialSantri,
      absensi: initialAbsensi,
      jadwal: initialJadwalMadrasah,
      rutinitas: initialRutinitas,
      piket: initialPiket,
      suratIzin: initialSuratIzin,
      pelanggaran: initialPelanggaran,
      izinMengajar: initialIzinMengajar,
      jurnal: initialJurnal,
      pengumuman: initialPengumuman,
      settings: initialSettings,
      masterKelas: initialMasterKelas,
      masterKamar: initialMasterKamar,
    });
    try {
      localStorage.clear();
    } catch {}
    showToast('Data telah diatur ulang ke kondisi awal pesantren.');
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
                saveEntityToCloud(ENTITY_KEYS.ABSENSI, records);
                showToast('Presensi santri berhasil diperbarui dan disinkronkan ke cloud.');
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
                saveEntityToCloud(ENTITY_KEYS.SETTINGS, s);
                showToast('Pengaturan lembaga berhasil disimpan.');
              }}
              userRole={currentUser.role}
              currentUser={currentUser}
              onUpdateAdminProfile={(prof) => {
                handleUpdateAdminProfile(prof);
                showToast(`Nama Admin berhasil diperbarui menjadi "${prof.name}".`);
              }}
              onNavigateToMaster={() => setActiveTab('kelola_master')}
              datasets={{
                users: usersList,
                santri: santriList,
                absensi: absensiList,
                jadwal: jadwalMadrasahList,
                rutinitas: rutinitasList,
                piket: piketList,
                suratIzin: suratIzinList,
                pelanggaran: pelanggaranList,
                izinMengajar: izinMengajarList,
                jurnal: jurnalList,
                pengumuman: pengumumanList,
                settings: settings,
                masterKelas: masterKelasList,
                masterKamar: masterKamarList,
              }}
              onSyncAllToCloud={handleSyncAllToCloud}
              onPullAllFromCloud={handlePullAllFromCloud}
              onImportData={handleImportData}
              onResetAllData={handleResetAllData}
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
