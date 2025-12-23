
import React, { useState } from 'react';
import { Shield, User, Lock, ArrowRight, Globe } from 'lucide-react';
import NeumorphicCard from './NeumorphicCard';
import { UserRole, AppUser } from '../types';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  onGuestAccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGuestAccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError('Username atau password salah.');
        setLoading(false);
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem. Coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#E0E5EC]">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-24 h-24 neu-button rounded-3xl flex items-center justify-center bg-white mb-6 shadow-xl p-3 overflow-hidden">
            <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">LPH UNISMA</h1>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 max-w-[300px] leading-relaxed">
            Management Information System
          </p>
        </div>

        <NeumorphicCard className="border border-white/40">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-12 pr-4 py-4 neu-inset rounded-2xl outline-none focus:ring-2 ring-indigo-200 transition-all font-bold text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-12 pr-4 py-4 neu-inset rounded-2xl outline-none focus:ring-2 ring-indigo-200 transition-all font-bold text-slate-700"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-rose-500 text-xs font-bold text-center animate-bounce">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black text-white bg-indigo-500 neu-button flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Memverifikasi...' : 'MASUK KE SISTEM'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/20">
            <button
              onClick={onGuestAccess}
              className="w-full py-3 rounded-2xl font-bold text-slate-500 neu-button flex items-center justify-center gap-2 hover:text-indigo-500"
            >
              <Globe size={18} />
              AKSES PUBLIK (GUEST)
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-4 font-medium italic">
              *Akses publik hanya dapat melihat data sertifikasi yang bersifat terbuka.
            </p>
          </div>
        </NeumorphicCard>

        <p className="text-center mt-8 text-xs text-slate-400 font-bold">
          &copy; {new Date().getFullYear()} LPH UNISMA MALANG. Semua Hak Dilindungi.
        </p>
      </div>
    </div>
  );
};

export default Login;
