
export enum ReportType {
  DENUNCIA = 'Denuncia',
  ACOSO_LABORAL = 'Acoso Laboral',
  ACOSO_SEXUAL = 'Acoso Sexual',
  DISCRIMINACION = 'Discriminación',
  QUEJA = 'Queja',
  INICIATIVA = 'Iniciativa',
  OTRO = 'Otro'
}

export enum CaseStatus {
  ABIERTO = 'Abierto',
  EN_INVESTIGACION = 'En Investigación',
  EN_SEGUIMIENTO = 'En Seguimiento',
  CERRADO = 'Cerrado'
}

export interface Attachment {
  name: string;
  type: string; // 'image' | 'video'
  data: string; // base64
  size?: number;
}

export interface ChatMessage {
  id: string;
  fecha: string;
  remitente: 'Usuario' | 'Admin';
  mensaje: string;
  archivo?: Attachment;
}

export interface AccionTomada {
  fecha: string;
  accion: string;
  responsable: string;
}

export interface CaseReport {
  folio: string;
  token_seguimiento: string;
  fecha_levantamiento: string;
  tipo_reporte: ReportType;
  area_departamento: string;
  canal: string; // "QR"
  anonimato: boolean;
  descripcion: string;
  fecha_incidente?: string;
  lugar?: string;
  personas_involucradas?: string[];
  archivos_adjuntos: Attachment[];
  nombre_reportante?: string;
  email?: string;
  telefono?: string;
  desea_seguimiento: boolean;
  estatus: CaseStatus;
  responsable_asignado: string;
  fecha_inicio?: string;
  ultima_interaccion: string;
  fecha_cierre?: string;
  acciones_tomadas: AccionTomada[];
  resultado_resolucion?: string;
  chat_mensajes: ChatMessage[];
}
