
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS, DEPARTMENTS, fileToBase64 } from '../constants';
import { ReportType, Attachment, CaseReport } from '../types';
import { createReport } from '../db';

const ReportFormView: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<CaseReport>>({
    tipo_reporte: ReportType.DENUNCIA,
    descripcion: '',
    area_departamento: DEPARTMENTS[0],
    fecha_incidente: '',
    lugar: '',
    anonimato: true,
    nombre_reportante: '',
    email: '',
    telefono: '',
    desea_seguimiento: true,
    archivos_adjuntos: [],
    personas_involucradas: []
  });

  const [result, setResult] = useState<{ folio: string, token: string } | null>(null);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 7));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newAt: Attachment[] = [];
      for (const f of files) {
        const base64 = await fileToBase64(f);
        newAt.push({ 
          name: f.name, 
          type: f.type.startsWith('video') ? 'video' : 'image', 
          data: base64,
          size: f.size
        });
      }
      setFormData(prev => ({ ...prev, archivos_adjuntos: [...(prev.archivos_adjuntos || []), ...newAt] }));
    }
  };

  const submit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000)); // Simulación de carga
    const res = createReport(formData);
    setResult({ folio: res.folio, token: res.token_seguimiento });
    setLoading(false);
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-in zoom-in">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            {ICONS.Check}
          </div>
          <h2 className="text-3xl font-bold mb-4">Reporte Exitoso</h2>
          <p className="text-slate-500 mb-10">Tu reporte ha sido procesado. Guarda esta información para dar seguimiento.</p>
          
          <div className="space-y-4 mb-10">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Folio Único</span>
              <span className="text-3xl font-mono font-bold text-blue-600">{result.folio}</span>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Token de Seguridad</span>
              <span className="text-3xl font-mono font-bold text-blue-600">{result.token}</span>
            </div>
          </div>

          <button onClick={() => navigate('/')} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">
            Regresar al Inicio
          </button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch(step) {
      case 1: return (
        <div className="animate-in fade-in slide-in-from-right-4">
          <h3 className="text-xl font-bold mb-6">1. ¿Qué deseas reportar?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.values(ReportType).map(t => (
              <button 
                key={t}
                onClick={() => { setFormData({...formData, tipo_reporte: t}); nextStep(); }}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.tipo_reporte === t ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-blue-200'}`}
              >
                <p className="font-bold">{t}</p>
              </button>
            ))}
          </div>
        </div>
      );
      case 2: return (
        <div className="animate-in fade-in slide-in-from-right-4">
          <h3 className="text-xl font-bold mb-4">2. Descripción detallada</h3>
          <p className="text-sm text-slate-500 mb-4">Describe los hechos con la mayor claridad posible. Involucrados, tiempos y contexto.</p>
          <textarea 
            className="w-full p-4 rounded-2xl border border-slate-200 min-h-[250px] outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Escribe aquí..."
            maxLength={2000}
            value={formData.descripcion}
            onChange={e => setFormData({...formData, descripcion: e.target.value})}
          />
          <div className="text-right text-[10px] font-bold text-slate-400 mt-2">
            {formData.descripcion?.length}/2000 CARACTERES
          </div>
        </div>
      );
      case 3: return (
        <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
          <h3 className="text-xl font-bold mb-4">3. Datos del incidente</h3>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Área o Departamento</label>
            <select 
              className="w-full p-4 rounded-2xl border border-slate-200"
              value={formData.area_departamento}
              onChange={e => setFormData({...formData, area_departamento: e.target.value})}
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Fecha Aproximada</label>
              <input type="date" className="w-full p-4 rounded-2xl border border-slate-200" value={formData.fecha_incidente} onChange={e => setFormData({...formData, fecha_incidente: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Lugar / Ubicación</label>
              <input type="text" className="w-full p-4 rounded-2xl border border-slate-200" placeholder="Ej. Almacén A, Oficina 2..." value={formData.lugar} onChange={e => setFormData({...formData, lugar: e.target.value})} />
            </div>
          </div>
        </div>
      );
      case 4: return (
        <div className="animate-in fade-in slide-in-from-right-4">
          <h3 className="text-xl font-bold mb-4">4. Personas involucradas</h3>
          <p className="text-sm text-slate-500 mb-4">Menciona nombres de personas que participaron o presenciaron los hechos.</p>
          <textarea 
            className="w-full p-4 rounded-2xl border border-slate-200 min-h-[150px]"
            placeholder="Nombre de personas involucradas..."
            value={formData.personas_involucradas?.join(', ')}
            onChange={e => setFormData({...formData, personas_involucradas: e.target.value.split(',').map(s => s.trim())})}
          />
        </div>
      );
      case 5: return (
        <div className="animate-in fade-in slide-in-from-right-4">
          <h3 className="text-xl font-bold mb-4">5. Evidencia</h3>
          <div 
            className="border-4 border-dashed border-slate-100 rounded-[2rem] p-12 text-center cursor-pointer hover:border-blue-100 hover:bg-slate-50/50 transition-all mb-6"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {ICONS.Plus}
            </div>
            <p className="font-bold text-slate-700">Haz clic para subir archivos</p>
            <p className="text-xs text-slate-400 mt-2">Imágenes o videos (Máx 10MB c/u)</p>
            <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {formData.archivos_adjuntos?.map((f, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                <img src={f.type === 'image' ? f.data : ''} className="w-full h-full object-cover bg-slate-900" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-[8px] uppercase">
                  {f.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      case 6: return (
        <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
          <h3 className="text-xl font-bold mb-4">6. Identidad</h3>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-slate-800">¿Deseas identificarte?</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={!formData.anonimato} onChange={e => setFormData({...formData, anonimato: !e.target.checked})} />
                <div className="w-14 h-7 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
            {!formData.anonimato && (
              <div className="space-y-4 animate-in fade-in">
                <input type="text" placeholder="Nombre completo" className="w-full p-4 rounded-xl border border-slate-200" value={formData.nombre_reportante} onChange={e => setFormData({...formData, nombre_reportante: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="email" placeholder="Email" className="w-full p-4 rounded-xl border border-slate-200" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input type="tel" placeholder="Teléfono" className="w-full p-4 rounded-xl border border-slate-200" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                </div>
              </div>
            )}
          </div>
        </div>
      );
      case 7: return (
        <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
          <h3 className="text-xl font-bold">7. Confirmación y Seguimiento</h3>
          <div className="bg-blue-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-xl mb-4">Canal Seguro</h4>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                Al enviar este reporte, un equipo especializado revisará la información. 
                Si deseas recibir actualizaciones y chatear con los responsables, activa el seguimiento.
              </p>
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox" 
                  className="w-6 h-6 rounded-lg bg-white/10 border-white/20" 
                  checked={formData.desea_seguimiento} 
                  onChange={e => setFormData({...formData, desea_seguimiento: e.target.checked})} 
                />
                <span className="font-bold">Activar seguimiento del caso</span>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-500 flex gap-4">
            <div className="text-blue-600">{ICONS.Alert}</div>
            <p>Al hacer clic en enviar, confirmas que la información proporcionada es verídica y se ajusta a nuestro código de ética.</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 w-full">
          <div 
            className="h-full bg-blue-600 transition-all duration-500" 
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>
        
        <div className="p-8 flex-grow">
          {renderStep()}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 disabled:opacity-30"
          >
            Anterior
          </button>
          
          <div className="flex gap-4">
            {step < 7 ? (
              <button 
                onClick={nextStep}
                disabled={step === 2 && !formData.descripcion}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Continuar
              </button>
            ) : (
              <button 
                onClick={submit}
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? 'Enviando...' : 'Finalizar y Enviar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportFormView;
