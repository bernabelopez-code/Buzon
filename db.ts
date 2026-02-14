
import { CaseReport, CaseStatus, ReportType } from './types';

const STORAGE_KEY = 'buzon_digital_db';

const getNextFolio = (db: CaseReport[]): string => {
  const year = new Date().getFullYear();
  const count = db.filter(c => c.folio.startsWith(`BD-${year}`)).length + 1;
  return `BD-${year}-${count.toString().padStart(4, '0')}`;
};

const generateToken = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const getDB = (): CaseReport[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveDB = (db: CaseReport[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const createReport = (reportData: Partial<CaseReport>): CaseReport => {
  const db = getDB();
  const newReport: CaseReport = {
    folio: getNextFolio(db),
    token_seguimiento: generateToken(),
    fecha_levantamiento: new Date().toISOString(),
    ultima_interaccion: new Date().toISOString(),
    estatus: CaseStatus.ABIERTO,
    responsable_asignado: "Pendiente de Asignación",
    acciones_tomadas: [],
    chat_mensajes: [],
    archivos_adjuntos: [],
    canal: "QR",
    anonimato: true,
    desea_seguimiento: true,
    descripcion: "",
    tipo_reporte: ReportType.OTRO,
    area_departamento: "",
    ...reportData
  } as CaseReport;

  db.push(newReport);
  saveDB(db);
  return newReport;
};

export const findReport = (folio: string, token: string): CaseReport | undefined => {
  const db = getDB();
  return db.find(r => r.folio === folio && r.token_seguimiento === token);
};

export const updateReport = (folio: string, updates: Partial<CaseReport>): CaseReport => {
  const db = getDB();
  const idx = db.findIndex(r => r.folio === folio);
  if (idx === -1) throw new Error("Caso no encontrado");
  
  const updated = { ...db[idx], ...updates, ultima_interaccion: new Date().toISOString() };
  db[idx] = updated;
  saveDB(db);
  return updated;
};
