
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDB, updateReport } from '../db';
import { CaseReport, CaseStatus, ChatMessage, Attachment, AccionTomada } from '../types';
import { ICONS, fileToBase64 } from '../constants';
import { analyzeCase } from '../services/geminiService';

const AdminCaseDetailView: React.FC = () => {
  const { folio } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseReport | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [nuevaAccion, setNuevaAccion] = useState('');
  const [resolucion, setResolucion] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_auth');
    if (!isAuth) {
      navigate('/admin');
      return;
    }

    const db = getDB();
    const found = db.find(c => c.folio === folio);
    if (found) {
      setCaseData(found);
      setResolucion(found.resultado_resolucion || '');
    }
  }, [folio, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [caseData?.chat_mensajes]);

  const handleUpdateStatus = (newStatus: CaseStatus) => {
    if (!caseData) return;
    const updated = updateReport(caseData.folio, { estatus: newStatus });
    setCaseData(updated);
  };

  const handleAddAccion = () => {
    if (!nuevaAccion.trim() || !caseData) return;
    const accion: AccionTomada = {
      fecha: new Date().toISOString(),
      accion: nuevaAccion,
      responsable: "Admin Principal"
    };
    const updated = updateReport(caseData.folio, {
      acciones_tomadas: [...caseData.acciones_tomadas, accion]
    });
    setCaseData(updated);
    setNuevaAccion('');
  };

  const handleSendMessage = async (file?: Attachment) => {
    if (!newMessage.trim() && !file) return;
    if (!caseData) return;

    const msg: ChatMessage = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      remitente: 'Admin',
      mensaje: newMessage,
      archivo: file
    };

    const updated = updateReport(caseData.folio, {
      chat_mensajes: [...caseData.chat_mensajes, msg]
    });
    setCaseData(updated);
    setNewMessage('');
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const base64 = await fileToBase64(f);
      const at: Attachment = { name: f.name, type: f.type.startsWith('video') ? 'video' : 'image', data: base64 };
      handleSendMessage(at);
    }
  };

  const handleFinalize = () => {
    if (!caseData) return;
    updateReport(caseData.folio, {
      resultado_resolucion: resolucion,
      estatus: CaseStatus.CERRADO,
      fecha_cierre: new Date().toISOString()
    });
    alert("Caso cerrado y resolución notificada.");
    navigate('/admin/dashboard');
  };

  const runAiAnalysis = async () => {
    if (!caseData) return;
    setAnalyzing(true);
    const res = await analyzeCase(caseData.descripcion);
    setAiAnalysis(res);
    setAnalyzing(false);
  };

  if (!caseData) return <div className="p-20 text-center">Cargando caso...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button onClick={() => navigate('/admin/dashboard')} className="text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2">
          {ICONS.Search} Regresar al Panel
        </button>
        <div className="flex gap-2">
          {Object.values(CaseStatus).map(s => (
            <button 
              key={s}
              onClick={() => handleUpdateStatus(s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${caseData.estatus === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6">Detalle del Reporte</h2>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Reportante</span>
                <p className="font-bold">{caseData.anonimato ? 'ANÓNIMO' : caseData.nombre_reportante}</p>
                {!caseData.anonimato && <p className="text-xs text-slate-500">{caseData.email} • {caseData.telefono}</p>}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Descripción Inicial</span>
                <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 leading-relaxed max-h-48 overflow-y-auto">
                  {caseData.descripcion}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Evidencia Inicial</span>
                <div className="grid grid-cols-2 gap-2">
                  {caseData.archivos_adjuntos.map((f, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                      {f.type === 'image' ? <img src={f.data} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-slate-400 bg-slate-900">{ICONS.Video}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900 rounded-[2.5rem] p-8 text-white shadow-xl">
            <h3 className="font-bold flex items-center gap-2 mb-4">{ICONS.Security} Asistente IA Gemini</h3>
            <button 
              onClick={runAiAnalysis}
              disabled={analyzing}
              className="w-full py-3 bg-white text-blue-900 font-bold rounded-xl shadow-lg hover:bg-blue-50 disabled:opacity-50"
            >
              {analyzing ? 'Analizando...' : 'Ejecutar Análisis'}
            </button>
            {aiAnalysis && (
              <div className="mt-6 space-y-3 animate-in zoom-in">
                <div className="p-3 bg-white/10 rounded-xl">
                  <p className="text-[10px] font-bold uppercase text-blue-300">Resumen</p>
                  <p className="text-xs italic">"{aiAnalysis.resumen}"</p>
                </div>
                <div className="p-3 bg-white/10 rounded-xl">
                  <p className="text-[10px] font-bold uppercase text-blue-300">Severidad</p>
                  <p className="font-bold text-sm">{aiAnalysis.severidad}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 bg-slate-50/50 border-b border-slate-50 font-bold flex justify-between items-center">
              <span>Chat de Comunicación Ética</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Seguro & Encriptado</span>
            </div>
            <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50/30">
              {caseData.chat_mensajes.map(m => (
                <div key={m.id} className={`flex ${m.remitente === 'Admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-2xl max-w-[80%] shadow-sm ${m.remitente === 'Admin' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-100 rounded-bl-none text-slate-800'}`}>
                    <p className="text-sm">{m.mensaje}</p>
                    {m.archivo && (
                      <div className="mt-2 p-2 bg-black/10 rounded-lg">
                        {m.archivo.type === 'image' ? (
                          <img src={m.archivo.data} className="w-full h-32 object-cover rounded" />
                        ) : (
                          <div className="flex items-center gap-2 text-[10px] font-bold">
                            {ICONS.Video} {m.archivo.name}
                          </div>
                        )}
                      </div>
                    )}
                    <span className="text-[9px] mt-1 block opacity-60 text-right">
                      {new Date(m.fecha).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-6 border-t border-slate-50 flex gap-4 bg-white">
              <input 
                type="text" 
                placeholder="Escribe una respuesta para el usuario..." 
                className="flex-grow p-4 bg-slate-50 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-blue-600 transition-all" 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()} 
              />
              <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-blue-600 transition-all">{ICONS.Clip}</button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={onFileChange} />
              <button onClick={() => handleSendMessage()} className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all">
                {ICONS.Plus}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h4 className="font-bold mb-6 flex items-center gap-2">{ICONS.History} Bitácora de Acciones</h4>
            <div className="space-y-4 mb-6">
              {caseData.acciones_tomadas.map((a, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{a.accion}</p>
                    <p className="text-[10px] text-slate-400">{new Date(a.fecha).toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">{a.responsable}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <input type="text" placeholder="Registrar nueva diligencia..." className="flex-grow p-4 bg-slate-50 rounded-2xl text-sm outline-none" value={nuevaAccion} onChange={e => setNuevaAccion(e.target.value)} />
              <button onClick={handleAddAccion} className="px-8 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all">Registrar</button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h4 className="font-bold mb-6 flex items-center gap-2">{ICONS.Check} Resolución Final</h4>
            <textarea 
              className="w-full p-4 rounded-2xl bg-slate-50 border-none min-h-[120px] mb-6 text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all"
              placeholder="Detalla aquí la resolución que el usuario verá en su panel de seguimiento..."
              value={resolucion}
              onChange={e => setResolucion(e.target.value)}
            />
            <button onClick={handleFinalize} className="w-full py-5 bg-green-600 text-white font-bold rounded-2xl shadow-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2">
              {ICONS.Check} Cerrar Caso y Notificar Resolución
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCaseDetailView;
