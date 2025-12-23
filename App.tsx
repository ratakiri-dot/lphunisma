
import React, { useState, useEffect } from 'react';
import { NavItem, UserRole, PUCertified, PUOnProcess, PUProspect, FinanceRecord, Activity, AppUser, Asset, Documentation, Letter, InternalMember, Auditor, Partner } from './types';
import { MENU_ITEMS, MOCK_PU_CERTIFIED, MOCK_PU_ON_PROCESS, MOCK_PU_PROSPECT, MOCK_FINANCE, MOCK_SCHEDULE, MOCK_ASSETS, MOCK_DOCS, MOCK_LETTERS, MOCK_INTERNAL, MOCK_AUDITORS, MOCK_PARTNERS } from './constants';
import NeumorphicCard from './components/NeumorphicCard';
import Dashboard from './components/Dashboard';
import DataTable from './components/DataTable';
import Login from './components/Login';
import ChatWidget from './components/ChatWidget';
import { Shield, UserCircle, LogOut, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [activeTab, setActiveTab] = useState<NavItem>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Data States
  const [puCertified, setPuCertified] = useState<PUCertified[]>(MOCK_PU_CERTIFIED);
  const [puOnProcess, setPuOnProcess] = useState<PUOnProcess[]>(MOCK_PU_ON_PROCESS);
  const [puProspect, setPuProspect] = useState<PUProspect[]>(MOCK_PU_PROSPECT);
  const [finance, setFinance] = useState<FinanceRecord[]>(MOCK_FINANCE);
  const [schedule, setSchedule] = useState<Activity[]>(MOCK_SCHEDULE);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [docs, setDocs] = useState<Documentation[]>(MOCK_DOCS);
  const [letters, setLetters] = useState<Letter[]>(MOCK_LETTERS);
  const [internal, setInternal] = useState<InternalMember[]>(MOCK_INTERNAL);
  const [auditors, setAuditors] = useState<Auditor[]>(MOCK_AUDITORS);
  const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS);
  const [users, setUsers] = useState<AppUser[]>([
    { id: 'u1', username: 'ahmad_fauzi', role: UserRole.ADMIN, password: 'admin123' },
    { id: 'u2', username: 'staff_unisma', role: UserRole.USER, password: 'user123' },
  ]);

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
  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab('Dashboard');
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
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

  const handleDelete = (item: any) => {
    if (window.confirm('Hapus data ini secara permanen?')) {
      if (activeTab === 'PU Certified') setPuCertified(prev => prev.filter(i => i.id !== item.id));
      if (activeTab === 'PU On Process') setPuOnProcess(prev => prev.filter(i => i.id !== item.id));
      if (activeTab === 'PU Prospect') setPuProspect(prev => prev.filter(i => i.id !== item.id));
      if (activeTab === 'Internal') setInternal(prev => prev.filter(i => i.id !== item.id));
      if (activeTab === 'Auditor') setAuditors(prev => prev.filter(i => i.id !== item.id));
      if (activeTab === 'Partners') setPartners(prev => prev.filter(i => i.id !== item.id));
      if (activeTab === 'Finance') setFinance(prev => prev.filter(i => i.id !== item.id));
      if (activeTab === 'Schedule') setSchedule(prev => prev.filter(i => i.id !== item.id));
      if (activeTab === 'Assets') setAssets(prev => prev.filter(i => i.id !== item.id));
      if (activeTab === 'Docs') setDocs(prev => prev.filter(i => i.id !== item.id));
      if (activeTab === 'Letters') setLetters(prev => prev.filter(i => i.id !== item.id));
      if (activeTab === 'Settings') setUsers(prev => prev.filter(i => i.id !== item.id));
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

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const updateState = (prev: any[], updatedItem: any) => {
      if (editingItem) {
        return prev.map(i => i.id === editingItem.id ? { ...i, ...updatedItem } : i);
      }
      return [...prev, { id: Date.now().toString(), ...updatedItem }];
    };

    if (activeTab === 'PU Certified') setPuCertified(prev => updateState(prev, data));
    if (activeTab === 'PU On Process') setPuOnProcess(prev => updateState(prev, data));
    if (activeTab === 'PU Prospect') setPuProspect(prev => updateState(prev, data));
    if (activeTab === 'Internal') setInternal(prev => updateState(prev, data));
    if (activeTab === 'Auditor') setAuditors(prev => updateState(prev, data));
    if (activeTab === 'Partners') setPartners(prev => updateState(prev, data));
    if (activeTab === 'Finance') {
      const financeData = { ...data, debit: Number(data.debit) || 0, credit: Number(data.credit) || 0 };
      setFinance(prev => updateState(prev, financeData));
    }
    if (activeTab === 'Schedule') {
      const scheduleData = { ...data, delegates: (data.delegates as string).split(',') };
      setSchedule(prev => updateState(prev, scheduleData));
    }
    if (activeTab === 'Assets') setAssets(prev => updateState(prev, data));
    if (activeTab === 'Docs') setDocs(prev => updateState(prev, data));
    if (activeTab === 'Letters') setLetters(prev => updateState(prev, data));
    if (activeTab === 'Settings') setUsers(prev => updateState(prev, data));

    setIsModalOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <Dashboard role={role} />;
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
              { key: 'location', label: 'Tempat', isPublic: true },
            ]}
          />
        );
      case 'Finance':
        return <DataTable<FinanceRecord> title="Laporan Keuangan" data={finance} role={role} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} accentColor="emerald" columns={[{key:'date', label:'Tgl'}, {key:'description', label:'Ket'}, {key:'debit', label:'Debit'}, {key:'credit', label:'Kredit'}, {key:'balance', label:'Saldo'}]} />;
      case 'Assets':
        return <DataTable<Asset> title="Aset Kantor" data={assets} role={role} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} accentColor="slate" columns={[{key:'name', label:'Nama Aset'}, {key:'condition', label:'Kondisi'}]} />;
      case 'Settings':
        return <DataTable<AppUser> title="User Management" data={users} role={role} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} accentColor="slate" columns={[{key:'username', label:'User'}, {key:'role', label:'Role'}]} />;
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
    return <p className="text-center py-6 text-slate-400 font-bold italic">Formulir dasar untuk {activeTab}</p>;
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} onGuestAccess={handleGuestAccess} users={users} />;
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
              <div className="w-10 h-10 neu-button rounded-xl flex items-center justify-center bg-indigo-500 text-white shadow-lg"><Shield size={24} /></div>
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
                   <h1 className="text-2xl lg:text-3xl font-black text-slate-800">Assalamu'alaikum, {currentUser?.username}</h1>
                   <p className="text-slate-400 font-bold text-sm">LPH UNISMA - Management Information System</p>
                </div>
             </div>
             {renderContent()}
          </div>
        </section>

        {/* Floating Chat Widget */}
        <ChatWidget contextData={systemContext} />
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <NeumorphicCard className="w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingItem ? 'Edit' : 'Tambah'} {activeTab}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 neu-button rounded-xl text-rose-500"><X size={20}/></button>
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
