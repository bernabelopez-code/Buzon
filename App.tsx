
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ICONS, APP_NAME } from './constants';
import HomeView from './views/HomeView';
import ReportFormView from './views/ReportFormView';
import TrackingView from './views/TrackingView';
import AdminLoginView from './views/AdminLoginView';
import AdminDashboardView from './views/AdminDashboardView';
import AdminCaseDetailView from './views/AdminCaseDetailView';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const logout = () => {
    sessionStorage.removeItem('admin_auth');
    window.location.href = '#/admin';
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-700">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            {ICONS.Security}
          </div>
          <span className="hidden sm:inline">{APP_NAME}</span>
        </Link>
        <div className="flex gap-4">
          {!isAdmin ? (
            <Link 
              to="/admin" 
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors"
            >
              {ICONS.Dashboard}
              Acceso Admin
            </Link>
          ) : (
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
            >
              {ICONS.Exit}
              Cerrar Sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-slate-900 text-slate-400 py-12 mt-auto border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
      <div>
        <h3 className="text-white font-bold mb-4 flex items-center gap-2 justify-center md:justify-start">
          {ICONS.Security} {APP_NAME}
        </h3>
        <p className="text-sm">
          Canal ético seguro y confidencial disponible 24/7. Tu voz cuenta para construir un mejor entorno.
        </p>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Información Legal</h4>
        <ul className="text-sm space-y-2">
          <li className="hover:text-white cursor-pointer transition-colors">Aviso de Privacidad</li>
          <li className="hover:text-white cursor-pointer transition-colors">Política de No Represalias</li>
          <li className="hover:text-white cursor-pointer transition-colors">Manual de Ética</li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Cumplimiento Normativo</h4>
        <p className="text-sm">Sistema auditado bajo estándares internacionales.</p>
        <p className="text-sm mt-2 text-blue-400 font-bold">En cumplimiento con NOM-035</p>
      </div>
    </div>
  </footer>
);

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col pt-16 bg-slate-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/reportar" element={<ReportFormView />} />
            <Route path="/seguimiento" element={<TrackingView />} />
            <Route path="/admin" element={<AdminLoginView />} />
            <Route path="/admin/dashboard" element={<AdminDashboardView />} />
            <Route path="/admin/caso/:folio" element={<AdminCaseDetailView />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
