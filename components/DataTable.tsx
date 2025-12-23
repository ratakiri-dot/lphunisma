
import React, { useState } from 'react';
import {
  Search, Plus, Download, Printer, Edit, Trash2,
  ExternalLink, Phone, Mail, MapPin, User, Building2, Tag
} from 'lucide-react';
import NeumorphicCard from './NeumorphicCard';
import { UserRole } from '../types';

interface DataTableProps<T,> {
  title: string;
  data: T[];
  columns: { key: keyof T; label: string; isPublic?: boolean }[];
  role: UserRole;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  accentColor?: string;
}

const DataTable = <T extends { id: string },>({
  title,
  data,
  columns,
  role,
  onAdd,
  onEdit,
  onDelete,
  accentColor = 'indigo'
}: DataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState("");

  const isPublic = role === UserRole.PUBLIC;
  const canModify = role === UserRole.ADMIN || role === UserRole.USER;
  const canDelete = role === UserRole.ADMIN;

  const filteredData = data.filter(item =>
    Object.values(item as object).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const displayedColumns = isPublic ? columns.filter(c => c.isPublic) : columns;

  // Primary Theme Colors
  const themeStyles: Record<string, { text: string; bg: string; border: string; row: string }> = {
    indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', row: 'bg-indigo-50/30' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', row: 'bg-emerald-50/30' },
    amber: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', row: 'bg-amber-50/30' },
    rose: { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', row: 'bg-rose-50/30' },
    blue: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', row: 'bg-blue-50/30' },
    violet: { text: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', row: 'bg-violet-50/30' },
    slate: { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', row: 'bg-slate-50/30' },
  };

  const currentTheme = themeStyles[accentColor] || themeStyles.indigo;

  // Logic to determine row color based on content (Semantic Coloring)
  const getRowStyle = (item: T, index: number) => {
    const itemStr = JSON.stringify(item);

    // Status-based coloring (Semantic)
    if (itemStr.includes('"Good"') || itemStr.includes('"Certified"')) return 'bg-emerald-50/60 hover:bg-emerald-100/80 border-l-emerald-400';
    if (itemStr.includes('"Broken"')) return 'bg-rose-50/60 hover:bg-rose-100/80 border-l-rose-400';
    if (itemStr.includes('"Maintenance"')) return 'bg-amber-50/60 hover:bg-amber-100/80 border-l-amber-400';
    if (itemStr.includes('"Audit Lapangan"') || itemStr.includes('"Incoming"')) return 'bg-sky-50/60 hover:bg-sky-100/80 border-l-sky-400';
    if (itemStr.includes('"Verifikasi Dokumen"') || itemStr.includes('"Outgoing"')) return 'bg-violet-50/60 hover:bg-violet-100/80 border-l-violet-400';
    if (itemStr.includes('"ADMIN"')) return 'bg-indigo-50/60 hover:bg-indigo-100/80 border-l-indigo-400';

    // Default Alternating Theme Color
    return index % 2 === 0
      ? `${currentTheme.row} hover:bg-white/80 border-l-transparent hover:border-l-${accentColor}-400`
      : `bg-transparent hover:bg-white/80 border-l-transparent hover:border-l-${accentColor}-400`;
  };

  const renderCell = (item: T, col: { key: keyof T; label: string }) => {
    const value = item[col.key];
    const valStr = String(value);

    // Badge Styling
    const badgeStyles: Record<string, string> = {
      'Good': 'bg-emerald-500 text-white',
      'Broken': 'bg-rose-500 text-white',
      'Maintenance': 'bg-amber-500 text-white',
      'Audit Lapangan': 'bg-sky-500 text-white',
      'Verifikasi Dokumen': 'bg-violet-500 text-white',
      'Incoming': 'bg-teal-500 text-white',
      'Outgoing': 'bg-orange-500 text-white',
      'ADMIN': 'bg-indigo-600 text-white',
      'USER': 'bg-slate-500 text-white',
    };

    if (['condition', 'status', 'type', 'role'].includes(col.key as string)) {
      const style = badgeStyles[valStr] || 'bg-slate-200 text-slate-600';
      return (
        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm ${style}`}>
          {valStr}
        </span>
      );
    }

    // Numbers & Finance
    if (['debit', 'credit', 'balance', 'estimatedValue'].includes(col.key as string)) {
      const num = Number(value);
      if (col.key === 'debit' && num > 0) return <span className="text-emerald-600 font-black">+{num.toLocaleString('id-ID')}</span>;
      if (col.key === 'credit' && num > 0) return <span className="text-rose-600 font-black">-{num.toLocaleString('id-ID')}</span>;
      return <span className="font-black text-slate-700">Rp {num.toLocaleString('id-ID')}</span>;
    }

    // Icons & Highlights
    if (['businessName', 'fullName', 'name', 'title'].includes(col.key as string)) {
      return (
        <div className="flex items-center gap-2">
          {col.key === 'businessName' ? <Building2 size={14} className="text-amber-500" /> : <Tag size={14} className={currentTheme.text} />}
          <span className={`font-black ${currentTheme.text}`}>{valStr}</span>
        </div>
      );
    }

    if (col.key === 'waNumber') return <div className="flex items-center gap-1 text-emerald-600 font-bold"><Phone size={12} />{valStr}</div>;
    if (col.key === 'email') return <div className="flex items-center gap-1 text-blue-500 text-xs"><Mail size={12} />{valStr}</div>;

    if (['address', 'location'].includes(col.key as string)) return <div className="flex items-center gap-1 text-slate-400 text-[11px] italic"><MapPin size={10} />{valStr}</div>;

    if (col.key === 'link') {
      const isValid = value && valStr && valStr !== '#' && valStr !== 'null' && valStr !== 'undefined' && valStr.trim() !== '';
      if (!isValid) return <span className="text-slate-300 italic text-[10px]">Tidak ada file</span>;

      let href = valStr;
      if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        href = `https://${href}`;
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${currentTheme.text} font-black hover:underline inline-flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-xl shadow-sm border border-white/40 text-[10px] uppercase tracking-wider`}
        >
          Lihat <ExternalLink size={12} />
        </a>
      );
    }

    if (col.key === 'createdBy' || col.key === 'updatedBy') {
      const creator = valStr || 'Sistem';
      const updater = (item as any).updatedBy;
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <div className="w-5 h-5 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
              <User size={10} className="text-indigo-600" />
            </div>
            <span className="font-black text-slate-700 text-[10px] truncate">{creator}</span>
          </div>
          {updater && updater !== creator && (
            <div className="flex items-center gap-1 opacity-50 pl-1.5 border-l border-slate-200 ml-2.5">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Edit: {updater}</span>
            </div>
          )}
        </div>
      );
    }

    return <span className="text-slate-600 font-medium">{valStr}</span>;
  };

  return (
    <NeumorphicCard className={`w-full overflow-hidden animate-in slide-in-from-bottom-4 duration-500 border-t-8 ${currentTheme.border}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl neu-button ${currentTheme.text}`}>
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{filteredData.length} Records</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Filter data..."
              className="neu-inset pl-9 pr-4 py-2 rounded-xl outline-none w-full md:w-48 text-xs font-bold focus:ring-2 ring-indigo-200 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {!isPublic && (
            <div className="flex gap-2">
              {onAdd && (
                <button onClick={onAdd} className="neu-button p-2 rounded-xl text-emerald-500 hover:scale-110 active:scale-95 transition-transform">
                  <Plus size={18} />
                </button>
              )}
              <button onClick={() => window.print()} className="neu-button p-2 rounded-xl text-slate-400 hover:scale-110 transition-transform">
                <Printer size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/60 shadow-inner">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white/40 backdrop-blur-md">
              {displayedColumns.map((col) => (
                <th key={String(col.key)} className="text-left py-4 px-6 font-black text-slate-400 uppercase text-[9px] tracking-[0.15em] border-b border-white">
                  {col.label}
                </th>
              ))}
              {!isPublic && (canModify || canDelete) && <th className="text-right py-4 px-6 border-b border-white font-black text-slate-400 uppercase text-[9px] tracking-[0.15em]">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {filteredData.map((item, rowIdx) => (
              <tr
                key={item.id}
                className={`group transition-all duration-300 border-l-4 ${getRowStyle(item, rowIdx)}`}
              >
                {displayedColumns.map((col, colIdx) => (
                  <td key={String(col.key)} className={`py-4 px-6 text-sm ${colIdx === 0 ? 'min-w-[150px]' : 'whitespace-nowrap'}`}>
                    {renderCell(item, col)}
                  </td>
                ))}
                {!isPublic && (canModify || canDelete) && (
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      {canModify && onEdit && (
                        <button onClick={() => onEdit(item)} className="p-1.5 bg-white/50 rounded-lg text-blue-500 hover:bg-white shadow-sm transition-colors border border-white/40">
                          <Edit size={14} />
                        </button>
                      )}
                      {canDelete && onDelete && (
                        <button onClick={() => onDelete(item)} className="p-1.5 bg-white/50 rounded-lg text-rose-500 hover:bg-white shadow-sm transition-colors border border-white/40">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="py-20 text-center bg-white/20">
            <Search size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Tidak ada data</p>
          </div>
        )}
      </div>
    </NeumorphicCard>
  );
};

export default DataTable;
