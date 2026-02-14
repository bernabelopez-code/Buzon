
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_CREDENTIALS, ICONS } from '../constants';

const AdminLoginView: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === ADMIN_CREDENTIALS.user && pass === ADMIN_CREDENTIALS.pass) {
      sessionStorage.setItem('admin_auth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError(true);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 animate-in fade-in zoom-in">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
          {ICONS.Lock}
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Acceso Administrativo</h2>
        <p className="text-slate-500 text-center text-sm mb-8">Ingresa tus credenciales para gestionar el buzón.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Usuario</label>
            <input 
              type="email" 
              className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              placeholder="admin@grupoedm.com.mx"
              value={user}
              onChange={e => setUser(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Contraseña</label>
            <input 
              type="password" 
              className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              placeholder="••••••••"
              value={pass}
              onChange={e => setPass(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl text-center animate-shake">
              Credenciales incorrectas
            </div>
          )}

          <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all mt-4">
            Entrar al Panel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginView;
