export interface ProtocoloOperatorio {
  _a: DatosA;
  _c: DatosC;
  _d: DatosD;
  _e: DatosE; 
  _f: DatosF;
  _g: DatosG;
  _h: DatosH;
  _i: DatosI;
}

/* === Sección A === */
export interface DatosA {
  pk_protope: number;
  casalud_id_fk: number;
  fk_hcu: number;
  estado_protope: boolean;
  medico_usu_id_fk: number;
}

/* === Sección C === */
export interface DatosC {
  electiva: boolean;
  emergencia: boolean;
  urgencia: boolean;
  proyectado: string;
  realizado: string;
}

/* === Sección D === */
export interface DatosD {
  cirujano_1: string;
  cirujano_2: string;
  primer_ayudante: string;
  segundo_ayudante: string;
  tercer_ayudante: string;
  anestesiologo: string;
  instrumentista: string;
  circulante: string;
  ayudanteanesteciologia: string;
  otros: string;
}

/* === Sección E === */
// GE(General), RE(Regional), SE(Sedacion), OT(Otros)
export interface DatosE {
  general: boolean;
  regional: boolean;
  sedacion: boolean;
  otros: boolean;
}
/* === Sección F === */
export interface DatosF {
  fecha_operacion: string;      // YYYY-MM-DD
  hora_inicio: string;          // HH:mm
  hora_terminacion: string;     // HH:mm
  dieresis: string;
  exposicion: string;
  hallazgos: string;
  procedimiento: string;
}

/* === Sección G === */
export interface DatosG {
  observacion: string;
  perdida: number;
  sangrado: number;
  uso: 'SI' | 'NO';             // SI o NO
  descripcion: string;
}

/* === Sección H === */
export interface DatosH {
  transquirurgico: string;
  biopsia: 'SI' | 'NO';
  resultado: string;
  histopatologico: 'SI' | 'NO';
  muestra: string;
  medico_nombre:string;
}

/* === Sección I === */
export interface DatosI {
  diagrama_protope: string;
}

export interface ProtocoloOperatorioDiagnostico {
  pk_protope_diag: number;                  // serial PK
  fk_protope: number | null;                // FK protocolo operatorio
  fk_cie: number;                            // código CIE
  fecha_creacion_protope_diag: any | null;   // JSON en DB (puede ser objeto)
  fecha_modificacion_protope_diag: any | null;
  tipo_protope_diag: string;                 // texto: Preoperatorio, Postoperatorio, etc.
}


export interface ProtocoloOperatorioMedico {
  pk_protope_med: number;                    // serial PK
  fk_protope: number | null;                 // FK protocolo operatorio
  fecha_creacion_protope_med: any | null;    // JSON en DB (estructura depende de tu sistema)
  fecha_modificacion_protope_med: any | null;// JSON modificación
  medico_usu_id_fk: number;                  // ID del médico usuario
}

