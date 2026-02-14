
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS, APP_NAME } from '../constants';

const HomeView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-700">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold mb-6">
          {ICONS.Security} Canal Confidencial y Seguro
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
          Tu voz cuenta para un <span className="text-blue-600">entorno ético.</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
          Disponible 24/7 para reportar incidencias de forma anónima y segura. 
          Garantizamos cero represalias y seguimiento puntual a cada caso.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => navigate('/reportar')}
            className="px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
          >
            {ICONS.Plus} Realizar un Reporte
          </button>
          <button 
            onClick={() => navigate('/seguimiento')}
            className="px-10 py-4 bg-white text-slate-700 border border-slate-200 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            {ICONS.Search} Seguimiento de Caso
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
        {[
          { icon: ICONS.Anonymous, title: "100% Anónimo", text: "Tú decides si compartir tus datos o no." },
          { icon: ICONS.History, title: "Seguimiento", text: "Usa tu folio para chatear con los responsables." },
          { icon: ICONS.Check, title: "Sin Represalias", text: "Política institucional de protección al denunciante." },
          { icon: ICONS.Report, title: "Formalidad", text: "Casos atendidos por expertos en cumplimiento." }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {item.icon}
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
            <p className="text-sm text-slate-500">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="text-3xl font-bold mb-4">Comprometidos con la Excelencia</h2>
          <p className="text-slate-400 max-w-xl">
            Nuestra plataforma cumple con los estándares internacionales de seguridad de la información y normativas locales de bienestar laboral.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm text-center">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Certificado</p>
            <p className="font-bold">ISO 27001</p>
          </div>
          <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm text-center">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Cumplimiento</p>
            <p className="font-bold">NOM-035</p>
          </div>
          <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm text-center">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Estándar</p>
            <p className="font-bold">LFT México</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
