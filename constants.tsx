
import React from 'react';
import { 
  ShieldCheck, 
  MessageSquare, 
  Clock, 
  UserX, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  BarChart3, 
  LayoutDashboard, 
  Search, 
  PlusCircle, 
  LogOut, 
  UserCircle, 
  Paperclip, 
  Image as ImageIcon, 
  Video, 
  X, 
  Play, 
  Lock 
} from 'lucide-react';

export const APP_NAME = "Buzón Confiable";

export const ADMIN_CREDENTIALS = {
  user: "admin@grupoedm.com.mx",
  pass: "admin2026"
};

export const ICONS = {
  Security: <ShieldCheck className="w-5 h-5" />,
  Chat: <MessageSquare className="w-5 h-5" />,
  History: <Clock className="w-5 h-5" />,
  Anonymous: <UserX className="w-5 h-5" />,
  Alert: <AlertTriangle className="w-5 h-5" />,
  Check: <CheckCircle2 className="w-5 h-5" />,
  Report: <FileText className="w-5 h-5" />,
  Stats: <BarChart3 className="w-5 h-5" />,
  Dashboard: <LayoutDashboard className="w-5 h-5" />,
  Search: <Search className="w-5 h-5" />,
  Plus: <PlusCircle className="w-5 h-5" />,
  Exit: <LogOut className="w-5 h-5" />,
  User: <UserCircle className="w-5 h-5" />,
  Clip: <Paperclip className="w-5 h-5" />,
  Image: <ImageIcon className="w-5 h-5" />,
  Video: <Video className="w-5 h-5" />,
  Close: <X className="w-4 h-4" />,
  Play: <Play className="w-6 h-6" />,
  Lock: <Lock className="w-5 h-5" />,
};

export const DEPARTMENTS = [
  "Recursos Humanos",
  "Operaciones",
  "Finanzas",
  "Ventas / Comercial",
  "Tecnología / IT",
  "Legal y Cumplimiento",
  "Logística",
  "Marketing"
];

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
