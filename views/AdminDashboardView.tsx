
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { getDB } from '../db';
import { CaseStatus, ReportType } from '../types';
import { ICONS } from '../constants';

const StatCard: React.FC<{ label: string; value: string | number; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${color}`}>
      {icon}
    </div>
  </div>
);

const AdminDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const [db, setDb] = useState(getDB());
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_auth');
    if (!isAuth) {
      navigate('/admin');
    }
  }, [navigate]);

  const stats = useMemo(() => {
    const total = db.length;
    const abiertos = db.filter(c => c.estatus === CaseStatus.ABIERTO).length;
    const cerrados = db.filter(c => c.estatus === CaseStatus.CERRADO).length;
    
    const promedio = total > 0 ? (total * 1.5).toFixed(1) : 0;

    const porTipo = Object.values(ReportType).map(t => ({
      name: t,
      value: db.filter(c => c.tipo_reporte === t).length
    }));

    const porArea = [...new Set(db.map(c => c.area_departamento))].map(a => ({
      name: a,
      value: db.filter(c => c.area_departamento === a).length
    }));

    return { total, abiertos, cerrados, promedio, porTipo, porArea };
  }, [db]);

  const filtered = useMemo(() => {
    return db.filter(c => {
      const matchType = filterType === 'all' || c.tipo_reporte === filterType;
      const matchStatus = filterStatus === 'all' || c.estatus === filterStatus;
      return matchType && matchStatus;
    }).sort((a, b) => new Date(b.fecha_levantamiento).getTime() - new Date(a.fecha_levantamiento).getTime());
  }, [db, filterType, filterStatus]);

  const COLORS = ['#2563eb', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Panel Administrativo</h1>
          <p className="text-slate-500">Gestión Integral de la Línea de Confianza</p>
        </div>
        <div className="flex gap-2">
          <button className="px-6 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 flex items-center gap-2">
            {ICONS.Report} Excel
          </button>
          <button className="px-6 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 flex items-center gap-2">
            {ICONS.Report} PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Total de Casos" value={stats.total} color="bg-blue-600" icon={ICONS.Report} />
        <StatCard label="Casos Abiertos" value={stats.abiertos} color="bg-amber-500" icon={ICONS.Plus} />
        <StatCard label="Atención Promedio" value={`${stats.promedio} d`} color="bg-indigo-600" icon={ICONS.History} />
        <StatCard label="Resueltos" value={stats.cerrados} color="bg-green-600" icon={ICONS.Check} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2">
            {ICONS.Stats} Distribución por Tipo
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.porTipo}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2">
            {ICONS.Stats} Casos por Departamento
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.porArea}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.porArea.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Listado de Casos</h3>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{ICONS.Search}</span>
              <input type="text" placeholder="Buscar folio..." className="pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <select 
              className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="all">Tipos: Todos</option>
              {Object.values(ReportType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select 
              className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">Estatus: Todos</option>
              {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Folio</th>
                <th className="px-8 py-4">Fecha</th>
                <th className="px-8 py-4">Tipo</th>
                <th className="px-8 py-4">Área</th>
                <th className="px-8 py-4">Identidad</th>
                <th className="px-8 py-4">Estatus</th>
                <th className="px-8 py-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => (
                <tr key={c.folio} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/caso/${c.folio}`)}>
                  <td className="px-8 py-6 font-mono font-bold text-blue-600">{c.folio}</td>
                  <td className="px-8 py-6 text-sm text-slate-500">{new Date(c.fecha_levantamiento).toLocaleDateString()}</td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-700">{c.tipo_reporte}</td>
                  <td className="px-8 py-6 text-sm text-slate-500">{c.area_departamento}</td>
                  <td className="px-8 py-6 text-sm">
                    {c.anonimato ? (
                      <span className="flex items-center gap-1.5 text-slate-400 italic font-medium">
                        {ICONS.Anonymous} Anónimo
                      </span>
                    ) : (
                      <span className="text-slate-700 font-bold">{c.nombre_reportante}</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                      c.estatus === CaseStatus.ABIERTO ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      c.estatus === CaseStatus.CERRADO ? 'bg-green-50 text-green-600 border-green-200' :
                      'bg-blue-50 text-blue-600 border-blue-200'
                    }`}>
                      {c.estatus}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-600 hover:text-blue-600 shadow-sm transition-all">
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardView;
