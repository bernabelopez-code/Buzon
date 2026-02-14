
import React, { useState, useRef, useEffect } from 'react';
import { findReport, updateReport } from '../db';
import { CaseReport, CaseStatus, ChatMessage, Attachment } from '../types';
import { ICONS, fileToBase64 } from '../constants';

const TrackingView: React.FC = () => {
  const [folio, setFolio] = useState('');
  const [token, setToken] = useState('');
  const [caseData, setCaseData] = useState<CaseReport | null>(null);
  const [error, setError] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [caseData?.chat_mensajes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const result = findReport(folio.trim(), token.trim());
    if (result) {
      setCaseData(result);
      setError(false);
    } else {
      setError(true);
      setCaseData(null);
    }
  };

  const handleSendMessage = async (file?: Attachment) => {
    if (!newMessage.trim() && !file) return;
    if (!caseData) return;

    setSending(true);
    const msg: ChatMessage = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      remitente: 'Usuario',
      mensaje: newMessage,
      archivo: file
    };

    const updated = updateReport(caseData.folio, {
      chat_mensajes: [...caseData.chat_mensajes, msg]
    });
    setCaseData(updated);
    setNewMessage('');
    setSending(false);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const base64 = await fileToBase64(f);
      const at: Attachment = {
        name: f.name,
        type: f.type.startsWith('video') ? 'video' : 'image',
        data: base64,
        size: f.size
      };
      handleSendMessage(at);
    }
  };

  if (!caseData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 animate-in fade-in">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            {ICONS.Search} Seguimiento
          </h2>
          <p className="text-slate-500 mb-8">Ingresa tus credenciales para ver el estado de tu reporte.</p>
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Folio de Reporte</label>
              <input 
                type="text" 
                placeholder="BD-2026-XXXX"
                className="w-full p-4 rounded-xl border border-slate-200 font-mono font-bold outline-none focus:ring-2 focus:ring-blue-600"
                value={folio}
                onChange={e => setFolio(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Token de Seguridad</label>
              <input 
                type="text" 
                placeholder="XXXXX"
                className="w-full p-4 rounded-xl border border-slate-200 font-mono font-bold outline-none focus:ring-2 focus:ring-blue-600"
                value={token}
                onChange={e => setToken(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm font-medium">Credenciales inválidas.</p>}
            <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">
              Consultar Caso
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar Info */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900">Estado del Caso</h3>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
              caseData.estatus === CaseStatus.CERRADO ? 'bg-green-50 text-green-600 border-green-200' : 'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
              {caseData.estatus}
            </span>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Folio</p>
              <p className="font-mono font-bold">{caseData.folio}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Última Actualización</p>
              <p className="font-bold text-sm">{new Date(caseData.ultima_interaccion).toLocaleString()}</p>
            </div>
            {caseData.resultado_resolucion && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm italic">
                <strong>Resolución:</strong> {caseData.resultado_resolucion}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h4 className="font-bold mb-4">Acciones Tomadas</h4>
          <div className="space-y-4">
            {caseData.acciones_tomadas.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No hay acciones registradas aún.</p>
            ) : (
              caseData.acciones_tomadas.map((a, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{a.accion}</p>
                    <p className="text-[10px] text-slate-400">{new Date(a.fecha).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <button 
          onClick={() => setCaseData(null)}
          className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all"
        >
          Cerrar Sesión de Caso
        </button>
      </div>

      {/* Chat Section */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col h-[750px] overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              {ICONS.Chat} Chat de Seguimiento
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En Tiempo Real</p>
          </div>
          
          <div className="flex-grow p-8 overflow-y-auto space-y-6">
            {caseData.chat_mensajes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <div className="w-16 h-16 mb-4">{ICONS.Chat}</div>
                <p className="text-sm">Aún no hay mensajes. Un administrador responderá pronto.</p>
              </div>
            ) : (
              caseData.chat_mensajes.map(msg => (
                <div key={msg.id} className={`flex ${msg.remitente === 'Usuario' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] space-y-2`}>
                    <div className={`p-4 rounded-2xl shadow-sm ${
                      msg.remitente === 'Usuario' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.mensaje}</p>
                      {msg.archivo && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-white/20 bg-black/20">
                          {msg.archivo.type === 'image' ? (
                            <img src={msg.archivo.data} className="w-full h-32 object-cover" />
                          ) : (
                            <div className="p-4 flex items-center gap-2">
                              {ICONS.Video} <span className="text-[10px] font-bold">Archivo de Video</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className={`text-[9px] font-bold text-slate-400 ${msg.remitente === 'Usuario' ? 'text-right' : 'text-left'}`}>
                      {msg.remitente} • {new Date(msg.fecha).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="flex gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                {ICONS.Clip}
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={onFileChange} />
              <input 
                type="text"
                placeholder="Escribe un mensaje..."
                className="flex-grow p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={sending}
                className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {ICONS.Plus}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingView;
