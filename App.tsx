
import React, { useState, useEffect } from 'react';
import { NavItem, UserRole, PUCertified, PUOnProcess, PUProspect, FinanceRecord, Activity, AppUser, Asset, Documentation, Letter, InternalMember, Auditor, Partner, UserTask } from './types';
import { MENU_ITEMS, MOCK_PU_CERTIFIED, MOCK_PU_ON_PROCESS, MOCK_PU_PROSPECT, MOCK_FINANCE, MOCK_SCHEDULE, MOCK_ASSETS, MOCK_DOCS, MOCK_LETTERS, MOCK_INTERNAL, MOCK_AUDITORS, MOCK_PARTNERS } from './constants';
import NeumorphicCard from './components/NeumorphicCard';
import Dashboard from './components/Dashboard';
import DataTable from './components/DataTable';
import Login from './components/Login';
import { dataService } from './services/dataService';
import { Shield, UserCircle, LogOut, Menu, X, Loader2, Bell, Pin, CheckCircle2, Plus, Trash2, RefreshCcw } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [activeTab, setActiveTab] = useState<NavItem>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Data States
  const [puCertified, setPuCertified] = useState<PUCertified[]>([]);
  const [puOnProcess, setPuOnProcess] = useState<PUOnProcess[]>([]);
  const [puProspect, setPuProspect] = useState<PUProspect[]>([]);
  const [finance, setFinance] = useState<FinanceRecord[]>([]);
  const [schedule, setSchedule] = useState<Activity[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [docs, setDocs] = useState<Documentation[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [internal, setInternal] = useState<InternalMember[]>([]);
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);

  // Fetch users for login on mount
  useEffect(() => {
    const initUsers = async () => {
      try {
        const userList = await dataService.getUsers();
        setUsers(userList);
      } catch (error) {
        console.error('Failed to fetch users for login:', error);
      }
    };
    initUsers();
  }, []);

  // Fetch restricted data on authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchTasks = async () => {
    try {
      const tasks = await dataService.getTasks();
      setUserTasks(tasks);
    } catch (err) {
      console.error('Fetch tasks error:', err);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const auth = await dataService.getUsers();
      setUsers(auth);

      const [certified, onProcess, prospect, financeData, scheduleData, assetsData, members, auditorsData, partnersData, docsData, lettersData] = await Promise.all([
        dataService.getPUCertified(),
        dataService.getPUOnProcess(),
        dataService.getPUProspect(),
        dataService.getFinance(),
        dataService.getActivities(),
        dataService.getAssets(),
        dataService.getInternal(),
        dataService.getAuditors(),
        dataService.getPartners(),
        dataService.getDocs(),
        dataService.getLetters()
      ]);
      setPuCertified(certified);
      setPuOnProcess(onProcess);
      setPuProspect(prospect);
      setFinance(financeData);
      setSchedule(scheduleData);
      setAssets(assetsData);
      setInternal(members);
      setAuditors(auditorsData);
      setPartners(partnersData);
      setDocs(docsData);
      setLetters(lettersData);
      fetchTasks(); // Fetch tasks separately
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh tasks every 60 seconds for sync across users
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(fetchTasks, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const role = currentUser?.role || UserRole.PUBLIC;

  // Aggregate context for AI with strict Role-Based Access Control (RBAC)
  const systemContext = {
    viewerRole: role,
    puCertified: puCertified, // Always public
    internal: internal,       // Publicly visible structure
    auditors: auditors,       // Publicly visible list
    schedule: schedule,       // Publicly visible calendar
    // Hidden from Guests
    puOnProcess: role === UserRole.PUBLIC ? 'ACCESS_DENIED_FOR_GUEST' : puOnProcess,
    puProspect: role === UserRole.PUBLIC ? 'ACCESS_DENIED_FOR_GUEST' : puProspect,
    finance: role === UserRole.PUBLIC ? 'ACCESS_DENIED_FOR_GUEST' : finance,
    partners: partners,
    // Admin only context
    assets: role === UserRole.ADMIN ? assets : 'ACCESS_DENIED_FOR_NON_ADMIN',
    letters: role === UserRole.ADMIN ? letters : 'ACCESS_DENIED_FOR_NON_ADMIN',
    docs: role === UserRole.ADMIN ? docs : 'ACCESS_DENIED_FOR_NON_ADMIN'
  };

  // Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Auth Handlers
  const handleLogin = async (username: string, password: string) => {
    try {
      const user = await dataService.verifyUser(username, password);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setActiveTab('Dashboard');
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login verification failed:", err);
      return false;
    }
  };

  const handleGuestAccess = () => {
    setCurrentUser({ id: 'guest', username: 'Guest', role: UserRole.PUBLIC, password: '' });
    setIsAuthenticated(true);
    setActiveTab('Dashboard');
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleLogout = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentUser(null);
    setActiveTab('Dashboard');
    setIsModalOpen(false);
    setEditingItem(null);
    setIsAuthenticated(false);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else if (isAuthenticated) setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isAuthenticated]);

  const handleTaskAction = async (action: 'add' | 'pin' | 'in_progress' | 'complete' | 'delete', taskData?: any) => {
    const username = currentUser?.fullName || currentUser?.username || 'System';
    try {
      if (action === 'add') {
        const newTask: Partial<UserTask> = {
          title: taskData.title,
          description: taskData.description,
          isPinned: false,
          status: 'Pending',
          createdBy: username
        };
        const saved = await dataService.upsertTask(newTask);
        setUserTasks(prev => [saved, ...prev]);
        setIsModalOpen(false);
      } else if (action === 'pin') {
        const updated = { ...taskData, isPinned: !taskData.isPinned };
        const saved = await dataService.upsertTask(updated);
        setUserTasks(prev => prev.map(t => t.id === saved.id ? saved : t));
      } else if (action === 'in_progress') {
        const updated: UserTask = {
          ...taskData,
          status: 'In Progress',
          inProgressBy: username,
          inProgressAt: new Date().toISOString()
        };
        const saved = await dataService.upsertTask(updated);
        setUserTasks(prev => prev.map(t => t.id === saved.id ? saved : t));
      } else if (action === 'complete') {
        const updated: UserTask = {
          ...taskData,
          status: 'Completed',
          completedBy: username,
          completedAt: new Date().toISOString()
        };
        const saved = await dataService.upsertTask(updated);
        setUserTasks(prev => prev.map(t => t.id === saved.id ? saved : t));
      } else if (action === 'delete') {
        if (!window.confirm('Hapus tugas ini?')) return;
        await dataService.deleteTask(taskData.id);
        setUserTasks(prev => prev.filter(t => t.id !== taskData.id));
      }
    } catch (err) {
      alert('Gagal memproses tugas');
    }
  };

  const handleDelete = async (item: any) => {
    if (window.confirm('Hapus data ini secara permanen?')) {
      try {
        if (activeTab === 'PU Certified') {
          await dataService.deletePUCertified(item.id);
          setPuCertified(prev => prev.filter(i => i.id !== item.id));
        }
        if (activeTab === 'PU On Process') {
          await dataService.deletePUOnProcess(item.id);
          setPuOnProcess(prev => prev.filter(i => i.id !== item.id));
        }
        if (activeTab === 'PU Prospect') {
          await dataService.deletePUProspect(item.id);
          setPuProspect(prev => prev.filter(i => i.id !== item.id));
        }
        if (activeTab === 'Internal') {
          await dataService.deleteInternal(item.id);
          setInternal(prev => prev.filter(i => i.id !== item.id));
        }
        if (activeTab === 'Auditor') {
          await dataService.deleteAuditor(item.id);
          setAuditors(prev => prev.filter(i => i.id !== item.id));
        }
        if (activeTab === 'Partners') {
          await dataService.deletePartner(item.id);
          setPartners(prev => prev.filter(i => i.id !== item.id));
        }
        if (activeTab === 'Finance') {
          await dataService.deleteFinance(item.id);
          setFinance(prev => prev.filter(i => i.id !== item.id));
        }
        if (activeTab === 'Schedule') {
          await dataService.deleteActivity(item.id);
          setSchedule(prev => prev.filter(i => i.id !== item.id));
        }
        if (activeTab === 'Assets') {
          await dataService.deleteAsset(item.id);
          setAssets(prev => prev.filter(i => i.id !== item.id));
        }
        if (activeTab === 'Docs') {
          await dataService.deleteDoc(item.id);
          setDocs(prev => prev.filter(i => i.id !== item.id));
        }
        if (activeTab === 'Letters') {
          await dataService.deleteLetter(item.id);
          setLetters(prev => prev.filter(i => i.id !== item.id));
        }
        if (activeTab === ('Tasks' as any)) {
          await dataService.deleteTask(item.id);
          setUserTasks(prev => prev.filter(i => i.id !== item.id));
        }
        if (activeTab === 'Settings') {
          await dataService.deleteUser(item.id);
          setUsers(prev => prev.filter(i => i.id !== item.id));
        }
      } catch (err) {
        alert('Gagal menghapus data');
      }
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const username = currentUser?.fullName || currentUser?.username || 'System';
    const auditData = editingItem ? { updatedBy: username } : { createdBy: username, updatedBy: username };

    try {
      if (activeTab === 'PU Certified') {
        const item = { ...data, ...auditData, id: editingItem?.id } as PUCertified;
        const saved = await dataService.upsertPUCertified(item);
        setPuCertified(prev => editingItem ? prev.map(i => i.id === saved.id ? saved : i) : [...prev, saved]);
      }
      if (activeTab === 'PU On Process') {
        const item = { ...data, ...auditData, id: editingItem?.id } as PUOnProcess;
        const saved = await dataService.upsertPUOnProcess(item);
        setPuOnProcess(prev => editingItem ? prev.map(i => i.id === saved.id ? saved : i) : [...prev, saved]);
      }
      if (activeTab === 'PU Prospect') {
        const item = { ...data, ...auditData, id: editingItem?.id } as PUProspect;
        const saved = await dataService.upsertPUProspect(item);
        setPuProspect(prev => editingItem ? prev.map(i => i.id === saved.id ? saved : i) : [...prev, saved]);
      }
      if (activeTab === 'Internal') {
        const item = { ...data, ...auditData, id: editingItem?.id } as InternalMember;
        const saved = await dataService.upsertInternal(item);
        setInternal(prev => editingItem ? prev.map(i => i.id === saved.id ? saved : i) : [...prev, saved]);
      }
      if (activeTab === 'Auditor') {
        const item = { ...data, ...auditData, id: editingItem?.id } as Auditor;
        const saved = await dataService.upsertAuditor(item);
        setAuditors(prev => editingItem ? prev.map(i => i.id === saved.id ? saved : i) : [...prev, saved]);
      }
      if (activeTab === 'Partners') {
        const item = { ...data, ...auditData, id: editingItem?.id } as Partner;
        const saved = await dataService.upsertPartner(item);
        setPartners(prev => editingItem ? prev.map(i => i.id === saved.id ? saved : i) : [...prev, saved]);
      }
      if (activeTab === 'Finance') {
        const lastBalance = finance.length > 0 ? finance[finance.length - 1].balance : 0;
        const newDebit = Number(data.debit) || 0;
        const newCredit = Number(data.credit) || 0;
        const calculatedBalance = lastBalance + newDebit - newCredit;

        const item = { ...data, ...auditData, id: editingItem?.id, debit: newDebit, credit: newCredit, balance: calculatedBalance } as FinanceRecord;
        const saved = await dataService.upsertFinance(item);
        setFinance(prev => editingItem ? prev.map(i => i.id === saved.id ? saved : i) : [...prev, saved]);
      }
      if (activeTab === 'Schedule') {
        const item = { ...data, ...auditData, id: editingItem?.id, delegates: (data.delegates as string).split(',').map(s => s.trim()) } as Activity;
        const saved = await dataService.upsertActivity(item);
        setSchedule(prev => editingItem ? prev.map(i => i.id === saved.id ? saved : i) : [...prev, saved]);
      }
      if (activeTab === 'Assets') {
        const item = { ...data, ...auditData, id: editingItem?.id, estimatedValue: Number(data.estimatedValue) || 0 } as Asset;
        const saved = await dataService.upsertAsset(item);
        setAssets(prev => editingItem ? prev.map(i => i.id === saved.id ? saved : i) : [...prev, saved]);
      }
      if (activeTab === 'Docs') {
        const item = { ...data, ...auditData, id: editingItem?.id } as Documentation;
        const saved = await dataService.upsertDoc(item);
        setDocs(prev => editingItem ? prev.map(i => i.id === saved.id ? saved : i) : [...prev, saved]);
      }
      if (activeTab === 'Letters') {
        const item = { ...data, ...auditData, id: editingItem?.id } as Letter;
        const saved = await dataService.upsertLetter(item);
        setLetters(prev => editingItem ? prev.map(i => i.id === saved.id ? saved : i) : [...prev, saved]);
      }
      if (activeTab === ('Tasks' as any)) {
        await handleTaskAction('add', data);
      }
      if (activeTab === 'Settings') {
        const updatedUser = { ...data, id: editingItem?.id } as AppUser;
        const saved = await dataService.upsertUser(updatedUser);
        setUsers(prev => editingItem ? prev.map(i => i.id === saved.id ? saved : i) : [...prev, saved]);

        // Update current user state if they edited themselves
        if (currentUser && currentUser.id === saved.id) {
          setCurrentUser(saved);
        }
      }

      setIsModalOpen(false);
    } catch (err) {
      alert('Gagal menyimpan data');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <Dashboard role={role} data={{ puCertified, puOnProcess, puProspect, internal, auditors, partners, finance }} />;
      case 'PU Certified':
        return (
          <DataTable<PUCertified>
            title="Pelaku Usaha Tersertifikasi"
            data={puCertified}
            role={role}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            accentColor="emerald"
            columns={[
              { key: 'regNo', label: 'No Pendaftaran', isPublic: true },
              { key: 'businessName', label: 'Nama Usaha', isPublic: true },
              { key: 'halalId', label: 'ID Halal', isPublic: true },
              { key: 'expiryDate', label: 'Berlaku Sampai', isPublic: true },
              { key: 'waNumber', label: 'WhatsApp' },
              { key: 'createdBy', label: 'Nama Penginput' },
            ]}
          />
        );
      case 'PU On Process':
        return (
          <DataTable<PUOnProcess>
            title="Proses Sertifikasi"
            data={puOnProcess}
            role={role}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            accentColor="blue"
            columns={[
              { key: 'regNo', label: 'No Reg', isPublic: true },
              { key: 'businessName', label: 'Usaha', isPublic: true },
              { key: 'status', label: 'Status', isPublic: true },
              { key: 'ownerName', label: 'Pemilik' },
              { key: 'createdBy', label: 'Nama Penginput' },
            ]}
          />
        );
      case 'PU Prospect':
        return (
          <DataTable<PUProspect>
            title="Prospek Pelaku Usaha"
            data={puProspect}
            role={role}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            accentColor="amber"
            columns={[
              { key: 'businessName', label: 'Nama Usaha', isPublic: true },
              { key: 'ownerName', label: 'Pemilik', isPublic: true },
              { key: 'followUpDate', label: 'Proyeksi Follow Up', isPublic: true },
              { key: 'notes', label: 'Keterangan', isPublic: true },
              { key: 'waNumber', label: 'WhatsApp' },
              { key: 'createdBy', label: 'Nama Penginput' },
            ]}
          />
        );
      case 'Internal':
        return (
          <DataTable<InternalMember>
            title="Struktur Internal"
            data={internal}
            role={role}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            accentColor="indigo"
            columns={[
              { key: 'fullName', label: 'Nama Lengkap', isPublic: true },
              { key: 'position', label: 'Jabatan', isPublic: true },
              { key: 'waNumber', label: 'WhatsApp' },
              { key: 'createdBy', label: 'Nama Penginput' },
            ]}
          />
        );
      case 'Auditor':
        return (
          <DataTable<Auditor>
            title="Daftar Auditor"
            data={auditors}
            role={role}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            accentColor="violet"
            columns={[
              { key: 'fullName', label: 'Nama', isPublic: true },
              { key: 'position', label: 'Bidang', isPublic: true },
              { key: 'certNumber', label: 'No Sertifikat' },
              { key: 'createdBy', label: 'Nama Penginput' },
            ]}
          />
        );
      case 'Partners':
        return (
          <DataTable<Partner>
            title="Daftar Partner & Kemitraan"
            data={partners}
            role={role}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            accentColor="orange"
            columns={[
              { key: 'fullName', label: 'Nama Instansi/Partner', isPublic: true },
              { key: 'position', label: 'Bidang Kerjasama', isPublic: true },
              { key: 'waNumber', label: 'Kontak', isPublic: true },
              { key: 'cert', label: 'Keterangan' },
              { key: 'createdBy', label: 'Nama Penginput' },
            ]}
          />
        );
      case 'Schedule':
        return (
          <DataTable<Activity>
            title="Agenda Kegiatan"
            data={schedule}
            role={role}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            accentColor="blue"
            columns={[
              { key: 'date', label: 'Tanggal', isPublic: true },
              { key: 'event', label: 'Kegiatan', isPublic: true },
              { key: 'delegates', label: 'Delegasi', isPublic: true },
              { key: 'location', label: 'Tempat', isPublic: true },
              { key: 'createdBy', label: 'Nama Penginput' },
            ]}
          />
        );
      case 'Finance':
        return <DataTable<FinanceRecord> title="Laporan Keuangan" data={finance} role={role} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} accentColor="emerald" columns={[{ key: 'date', label: 'Tgl' }, { key: 'description', label: 'Ket' }, { key: 'debit', label: 'Debit' }, { key: 'credit', label: 'Kredit' }, { key: 'balance', label: 'Saldo' }, { key: 'createdBy', label: 'Nama Penginput' }]} />;
      case 'Docs':
        return <DataTable<Documentation> title="Dokumentasi & SOP" data={docs} role={role} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} accentColor="blue" columns={[{ key: 'title', label: 'Judul Dokumentasi', isPublic: true }, { key: 'category', label: 'Kategori', isPublic: true }, { key: 'uploadDate', label: 'Tgl Unggah', isPublic: true }, { key: 'link', label: 'File', isPublic: true }, { key: 'createdBy', label: 'Nama Penginput' }]} />;
      case 'Letters':
        return <DataTable<Letter> title="Arsip Surat" data={letters} role={role} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} accentColor="indigo" columns={[{ key: 'date', label: 'Tanggal', isPublic: true }, { key: 'letterNumber', label: 'No Surat', isPublic: true }, { key: 'title', label: 'Perihal', isPublic: true }, { key: 'type', label: 'Jenis', isPublic: true }, { key: 'link', label: 'File', isPublic: true }, { key: 'createdBy', label: 'Nama Penginput' }]} />;
      case 'Assets':
        return <DataTable<Asset> title="Aset Kantor" data={assets} role={role} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} accentColor="slate" columns={[{ key: 'assetNo', label: 'No Aset' }, { key: 'name', label: 'Nama Aset' }, { key: 'condition', label: 'Kondisi' }, { key: 'createdBy', label: 'Nama Penginput' }]} />;
      case 'Tasks' as any:
        return (
          <DataTable<UserTask>
            title="Daftar Antrian Tugas"
            data={userTasks}
            role={role}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={role === UserRole.ADMIN ? handleDelete : undefined}
            accentColor="amber"
            columns={[
              { key: 'title', label: 'Tugas', isPublic: false },
              { key: 'description', label: 'Deskripsi', isPublic: false },
              { key: 'status', label: 'Status', isPublic: false },
              { key: 'createdBy', label: 'Pemberi Tugas' },
              { key: 'inProgressBy', label: 'Sedang Dikerjakan' },
              { key: 'completedBy', label: 'Penyelesai' },
            ]}
          />
        );
      case 'Settings':
        return <DataTable<AppUser> title="User Management" data={users} role={role} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} accentColor="slate" columns={[{ key: 'username', label: 'User' }, { key: 'fullName', label: 'Nama Lengkap' }, { key: 'role', label: 'Role' }]} />;
      default: return <div className="p-10 text-center font-bold text-slate-300 uppercase">Modul Tersedia Segera</div>;
    }
  };

  const renderFormFields = () => {
    if (activeTab === 'PU Certified') {
      return (
        <>
          <input name="regNo" defaultValue={editingItem?.regNo} placeholder="No Pendaftaran" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="businessName" defaultValue={editingItem?.businessName} placeholder="Nama Usaha" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="halalId" defaultValue={editingItem?.halalId} placeholder="ID Halal" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="expiryDate" type="date" defaultValue={editingItem?.expiryDate} className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="waNumber" defaultValue={editingItem?.waNumber} placeholder="WhatsApp" className="w-full p-4 neu-inset rounded-xl outline-none" required />
        </>
      );
    }
    if (activeTab === 'PU On Process') {
      return (
        <>
          <input name="regNo" defaultValue={editingItem?.regNo} placeholder="No Reg" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="businessName" defaultValue={editingItem?.businessName} placeholder="Usaha" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="ownerName" defaultValue={editingItem?.ownerName} placeholder="Pemilik" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="waNumber" defaultValue={editingItem?.waNumber} placeholder="WhatsApp" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="email" defaultValue={editingItem?.email} placeholder="Email" className="w-full p-4 neu-inset rounded-xl outline-none" />
          <input name="socialMedia" defaultValue={editingItem?.socialMedia} placeholder="Social Media" className="w-full p-4 neu-inset rounded-xl outline-none" />
          <input name="businessAddress" defaultValue={editingItem?.businessAddress} placeholder="Alamat Usaha" className="w-full p-4 neu-inset rounded-xl outline-none" />
          <input name="productionAddress" defaultValue={editingItem?.productionAddress} placeholder="Alamat Produksi" className="w-full p-4 neu-inset rounded-xl outline-none" />
          <input name="nib" defaultValue={editingItem?.nib} placeholder="NIB" className="w-full p-4 neu-inset rounded-xl outline-none" />
          <input name="status" defaultValue={editingItem?.status} placeholder="Status" className="w-full p-4 neu-inset rounded-xl outline-none" required />
        </>
      );
    }
    if (activeTab === 'PU Prospect') {
      return (
        <>
          <input name="businessName" defaultValue={editingItem?.businessName} placeholder="Nama Usaha" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="ownerName" defaultValue={editingItem?.ownerName} placeholder="Pemilik" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="waNumber" defaultValue={editingItem?.waNumber} placeholder="WhatsApp" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="followUpDate" type="date" defaultValue={editingItem?.followUpDate} className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <textarea name="notes" defaultValue={editingItem?.notes} placeholder="Catatan" className="w-full p-4 neu-inset rounded-xl outline-none h-24" required />
        </>
      );
    }
    if (activeTab === 'Internal') {
      return (
        <>
          <input name="fullName" defaultValue={editingItem?.fullName} placeholder="Nama Lengkap" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="position" defaultValue={editingItem?.position} placeholder="Jabatan" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="waNumber" defaultValue={editingItem?.waNumber} placeholder="WhatsApp" className="w-full p-4 neu-inset rounded-xl outline-none" required />
        </>
      );
    }
    if (activeTab === 'Auditor') {
      return (
        <>
          <input name="fullName" defaultValue={editingItem?.fullName} placeholder="Nama Auditor" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="position" defaultValue={editingItem?.position} placeholder="Bidang" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="certNumber" defaultValue={editingItem?.certNumber} placeholder="No Sertifikat" className="w-full p-4 neu-inset rounded-xl outline-none" required />
        </>
      );
    }
    if (activeTab === 'Partners') {
      return (
        <>
          <input name="fullName" defaultValue={editingItem?.fullName} placeholder="Nama Partner" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="position" defaultValue={editingItem?.position} placeholder="Posisi" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="cert" defaultValue={editingItem?.cert} placeholder="Sertifikat/Keterangan" className="w-full p-4 neu-inset rounded-xl outline-none" />
          <input name="address" defaultValue={editingItem?.address} placeholder="Alamat" className="w-full p-4 neu-inset rounded-xl outline-none" />
          <input name="waNumber" defaultValue={editingItem?.waNumber} placeholder="WhatsApp" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="email" defaultValue={editingItem?.email} placeholder="Email" className="w-full p-4 neu-inset rounded-xl outline-none" />
        </>
      );
    }
    if (activeTab === 'Schedule') {
      return (
        <>
          <input name="date" type="date" defaultValue={editingItem?.date} className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="event" defaultValue={editingItem?.event} placeholder="Kegiatan" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="location" defaultValue={editingItem?.location} placeholder="Tempat" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="delegates" defaultValue={editingItem?.delegates?.join(',')} placeholder="Delegasi (pisah koma)" className="w-full p-4 neu-inset rounded-xl outline-none" required />
        </>
      );
    }
    if (activeTab === 'Finance') {
      return (
        <>
          <input name="date" type="date" defaultValue={editingItem?.date} className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="description" defaultValue={editingItem?.description} placeholder="Keterangan" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="debit" type="number" defaultValue={editingItem?.debit} placeholder="Debit" className="w-full p-4 neu-inset rounded-xl outline-none" />
          <input name="credit" type="number" defaultValue={editingItem?.credit} placeholder="Kredit" className="w-full p-4 neu-inset rounded-xl outline-none" />
        </>
      );
    }
    if (activeTab === 'Assets') {
      return (
        <>
          <input name="assetNo" defaultValue={editingItem?.assetNo} placeholder="Nomor Aset" className="w-full p-4 neu-inset rounded-xl outline-none" />
          <input name="name" defaultValue={editingItem?.name} placeholder="Nama Aset" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <select name="condition" defaultValue={editingItem?.condition || 'Good'} className="w-full p-4 neu-inset rounded-xl outline-none bg-[#E0E5EC] cursor-pointer">
            <option value="Good">Bagus</option>
            <option value="Maintenance">Pemeliharaan</option>
            <option value="Broken">Rusak</option>
          </select>
        </>
      );
    }
    if (activeTab === 'Docs') {
      return (
        <>
          <input name="title" defaultValue={editingItem?.title} placeholder="Judul" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="category" defaultValue={editingItem?.category} placeholder="Kategori" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="uploadDate" type="date" defaultValue={editingItem?.uploadDate} className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="link" defaultValue={editingItem?.link} placeholder="Link/URL" className="w-full p-4 neu-inset rounded-xl outline-none" />
        </>
      );
    }
    if (activeTab === 'Letters') {
      return (
        <>
          <input name="title" defaultValue={editingItem?.title} placeholder="Perihal" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="letterNumber" defaultValue={editingItem?.letterNumber} placeholder="No Surat" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="date" type="date" defaultValue={editingItem?.date} className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <select name="type" defaultValue={editingItem?.type || 'Incoming'} className="w-full p-4 neu-inset rounded-xl outline-none bg-[#E0E5EC] cursor-pointer">
            <option value="Incoming">Surat Masuk</option>
            <option value="Outgoing">Surat Keluar</option>
          </select>
          <input name="link" defaultValue={editingItem?.link} placeholder="Link/URL" className="w-full p-4 neu-inset rounded-xl outline-none" />
        </>
      );
    }
    if (activeTab === 'Settings') {
      return (
        <>
          <input name="username" defaultValue={editingItem?.username} placeholder="Username" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <input name="fullName" defaultValue={editingItem?.fullName} placeholder="Nama Lengkap" className="w-full p-4 neu-inset rounded-xl outline-none" />
          <input name="password" defaultValue={editingItem?.password} placeholder="Password" id="user-password" type="text" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <select name="role" defaultValue={editingItem?.role || UserRole.USER} className="w-full p-4 neu-inset rounded-xl outline-none bg-[#E0E5EC] cursor-pointer">
            <option value={UserRole.ADMIN}>ADMIN</option>
            <option value={UserRole.USER}>USER</option>
          </select>
        </>
      );
    }
    if (activeTab === ('Tasks' as any)) {
      return (
        <>
          <input name="title" placeholder="Judul Tugas" className="w-full p-4 neu-inset rounded-xl outline-none" required />
          <textarea name="description" placeholder="Deskripsi Tugas (Opsional)" className="w-full p-4 neu-inset rounded-xl outline-none min-h-[100px]" />
        </>
      );
    }
    return <p className="text-center py-6 text-slate-400 font-bold italic">Formulir dasar untuk {activeTab}</p>;
  };

  const renderTaskPanel = () => {
    if (!isTaskPanelOpen) return null;
    const pendingTasks = userTasks.filter(t => t.status === 'Pending');
    const completedTasks = userTasks.filter(t => t.status === 'Completed');

    return (
      <div className="fixed top-24 right-6 lg:right-8 w-full max-w-sm z-[100] animate-in slide-in-from-top-4 duration-300">
        <NeumorphicCard className="flex flex-col max-h-[70vh]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-slate-700 flex items-center gap-2">
              <Bell size={18} className="text-indigo-500" /> DAFTAR TUGAS
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditingItem(null); setActiveTab('Tasks' as any); setIsModalOpen(true); }}
                className="p-2 neu-button rounded-lg text-indigo-600 active:scale-90"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={fetchTasks}
                className="p-2 neu-button rounded-lg text-slate-500 active:rotate-180 transition-transform duration-500"
                title="Refresh Tugas"
              >
                <RefreshCcw size={16} />
              </button>
              <button onClick={() => setIsTaskPanelOpen(false)} className="p-2 neu-button rounded-lg text-slate-400"><X size={16} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {pendingTasks.length === 0 && userTasks.filter(t => t.status === 'In Progress').length === 0 && completedTasks.length === 0 && (
              <p className="text-center py-8 text-slate-400 font-bold italic text-xs uppercase">Belum ada tugas</p>
            )}

            {[...userTasks.filter(t => t.status === 'Pending'), ...userTasks.filter(t => t.status === 'In Progress')].map(task => (
              <div key={task.id} className={`p-4 neu-inset rounded-2xl space-y-3 ${task.status === 'In Progress' ? 'border-l-4 border-indigo-500 bg-indigo-50/30' : ''}`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col">
                    <h4 className="font-black text-slate-700 text-sm leading-tight">{task.title}</h4>
                    {task.status === 'In Progress' && (
                      <span className="text-[8px] font-black text-indigo-500 uppercase mt-1 flex items-center gap-1 italic">
                        <Loader2 size={10} className="animate-spin" /> Sedang Dikerjakan oleh {task.inProgressBy}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleTaskAction('pin', task)} className={`p-1.5 rounded-lg transition-colors ${task.isPinned ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-slate-600'}`}>
                      <Pin size={12} fill={task.isPinned ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
                {task.description && <p className="text-[10px] text-slate-500 font-bold line-clamp-2">{task.description}</p>}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[9px] font-black text-indigo-400 uppercase">Input: {task.createdBy}</span>
                  <div className="flex gap-2">
                    {task.status === 'Pending' ? (
                      <button
                        onClick={() => handleTaskAction('in_progress', task)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-white text-[10px] font-black rounded-xl shadow-lg active:scale-95 transition-all"
                      >
                        KERJAKAN <RefreshCcw size={12} />
                      </button>
                    ) : (
                      task.inProgressBy === (currentUser?.fullName || currentUser?.username) && (
                        <button
                          onClick={() => handleTaskAction('complete', task)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black rounded-xl shadow-lg active:scale-95 transition-all"
                        >
                          SELESAI <CheckCircle2 size={12} />
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}

            {completedTasks.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Selesai</h4>
                {completedTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="p-3 opacity-60 flex justify-between items-center group">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-600 line-through truncate w-40">{task.title}</span>
                      <span className="text-[8px] font-black text-slate-400 italic">Oleh: {task.createdBy} | Selesai oleh: {task.completedBy}</span>
                    </div>
                    {role === UserRole.ADMIN && (
                      <button onClick={() => handleTaskAction('delete', task)} className="p-1.5 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </NeumorphicCard>
      </div>
    );
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} onGuestAccess={handleGuestAccess} />;
  }

  return (
    <div className={`flex h-screen w-full bg-[#E0E5EC] overflow-hidden ${role === UserRole.PUBLIC ? 'public-role' : ''}`}>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`fixed lg:relative z-[70] h-full transition-all duration-300 bg-[#E0E5EC] border-r border-white/20 shadow-2xl lg:shadow-none ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-20'} overflow-hidden`}>
        <div className="w-72 h-full p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 neu-button rounded-xl flex items-center justify-center bg-white overflow-hidden shadow-lg p-1">
                <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className={isSidebarOpen ? 'block' : 'hidden'}>
                <h1 className="font-black text-xl leading-none">LPH UNISMA</h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Management Information System</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 neu-button rounded-xl text-slate-400"><X size={20} /></button>
          </div>

          <nav className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
            {MENU_ITEMS.filter(item => {
              if (role === UserRole.PUBLIC && !['Dashboard', 'PU Certified', 'Internal', 'Auditor', 'Schedule'].includes(item.name)) return false;
              if (role === UserRole.USER && item.name === 'Settings') return false;
              return true;
            }).map((item) => (
              <button
                key={item.name}
                onClick={() => { setActiveTab(item.name); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${activeTab === item.name ? 'neu-inset text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {item.icon}
                <span className={`text-sm whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="mt-4 pt-4 border-t border-white/20">
            <button onClick={(e) => handleLogout(e)} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-black neu-button shadow-sm">
              <LogOut size={20} />
              <span className={isSidebarOpen ? 'block' : 'hidden'}>SIGN OUT</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {role === UserRole.PUBLIC && <div className="absolute inset-0 anti-screenshot-overlay z-[35] pointer-events-none opacity-50" />}

        <header className="h-20 flex items-center justify-between px-6 lg:px-8 bg-[#E0E5EC]/80 backdrop-blur-md sticky top-0 z-[50] border-b border-white/20 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 neu-button rounded-xl text-slate-500 transition-transform active:scale-90"><Menu size={20} /></button>
            <h2 className="hidden sm:block text-sm font-black text-slate-700 uppercase tracking-widest">{activeTab}</h2>
          </div>

          <div className="flex items-center gap-4">
            {role !== UserRole.PUBLIC && (
              <button
                onClick={() => setIsTaskPanelOpen(!isTaskPanelOpen)}
                className={`p-3 neu-button rounded-2xl relative transition-all active:scale-95 ${isTaskPanelOpen ? 'text-indigo-600 neu-inset' : 'text-slate-500'}`}
              >
                <Bell size={20} />
                {userTasks.filter(t => t.status === 'Pending').length > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-[#E0E5EC] animate-bounce">
                    {userTasks.filter(t => t.status === 'Pending').length}
                  </span>
                )}
              </button>
            )}
            <div className="flex items-center gap-3 px-4 py-2 neu-inset rounded-2xl">
              <UserCircle size={22} className="text-indigo-500" />
              <div className="hidden md:block">
                <p className="text-xs font-black leading-none">{currentUser?.username}</p>
                <span className="text-[9px] font-bold text-indigo-400 uppercase">{role}</span>
              </div>
            </div>
            <button onClick={(e) => handleLogout(e)} className="p-3 neu-button rounded-2xl text-rose-500 hover:text-rose-700 shadow-md transition-all active:scale-95 z-[100]"><LogOut size={20} /></button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth z-[10]">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-slate-800">Assalamu'alaikum, {currentUser?.fullName || currentUser?.username}</h1>
                <p className="text-slate-400 font-bold text-sm">LPH UNISMA - Management Information System</p>
              </div>
            </div>

            {/* Pinned Tasks - Sticky Notes */}
            {userTasks.filter(t => t.isPinned && t.status !== 'Completed').length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userTasks.filter(t => t.isPinned && t.status !== 'Completed').map(task => (
                  <div key={task.id} className={`relative group p-6 border-2 rounded-3xl shadow-sm transform hover:-rotate-1 transition-all duration-300 ${task.status === 'In Progress' ? 'bg-indigo-50 border-indigo-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className={`absolute top-4 right-4 ${task.status === 'In Progress' ? 'text-indigo-500' : 'text-amber-500'}`}><Pin size={18} fill="currentColor" /></div>
                    <h3 className={`${task.status === 'In Progress' ? 'text-indigo-900' : 'text-amber-900'} font-black text-lg mb-2 mr-6`}>{task.title}</h3>
                    <p className={`${task.status === 'In Progress' ? 'text-indigo-700/80' : 'text-amber-700/80'} text-sm font-bold leading-relaxed mb-4`}>{task.description}</p>
                    {task.status === 'In Progress' && (
                      <div className="mb-4 px-3 py-1.5 bg-indigo-500/10 rounded-xl flex items-center gap-2">
                        <Loader2 size={12} className="text-indigo-600 animate-spin" />
                        <span className="text-[10px] font-black text-indigo-600 uppercase italic">Sedang dikerjakan oleh {task.inProgressBy}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-black ${task.status === 'In Progress' ? 'text-indigo-600' : 'text-amber-600'} uppercase`}>Input: {task.createdBy}</span>
                      </div>
                      <div className="flex gap-2">
                        {task.status === 'Pending' ? (
                          <button
                            onClick={() => handleTaskAction('in_progress', task)}
                            className="p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 active:scale-95 transition-all shadow-sm flex items-center gap-2 font-black text-[10px]"
                          >
                            KERJAKAN <RefreshCcw size={14} />
                          </button>
                        ) : (
                          task.inProgressBy === (currentUser?.fullName || currentUser?.username) && (
                            <button
                              onClick={() => handleTaskAction('complete', task)}
                              className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 active:scale-95 transition-all shadow-sm flex items-center gap-2 font-black text-[10px]"
                            >
                              SELESAI <CheckCircle2 size={14} />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest">Memuat Data...</p>
              </div>
            ) : renderContent()}
          </div>
        </section>

        {/* Floating Chat Widget */}
        {renderTaskPanel()}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <NeumorphicCard className="w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingItem ? 'Edit' : 'Tambah'} {activeTab}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 neu-button rounded-xl text-rose-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              {renderFormFields()}
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 neu-button rounded-xl font-black text-slate-400 uppercase">Batal</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-500 text-white rounded-xl font-black neu-button uppercase shadow-lg">Simpan</button>
              </div>
            </form>
          </NeumorphicCard>
        </div>
      )}
    </div>
  );
};

export default App;
