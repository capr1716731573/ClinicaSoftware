export interface AnamnesisHosp {
  pk_anam: number;

  fecha_creacion_anam: any;           // JSON en BD
  fecha_modificacion_anam: any | null;

  fecha_inicio: string;               // YYYY-MM-DD
  hora_inicio: string;                // HH:mm
  fecha_fin: string | null;           // YYYY-MM-DD
  hora_fin: string | null;            // HH:mm

  casalud_id_fk: number;
  fk_hcu: number;
  medico_usu_id_fk: number;

  estado_anam: boolean;

  motivo_consulta_anam: string | null;

  antec_personales_anam: any | null;   // JSON
  antec_familiares_anam: any | null;   // JSON

  enfermedad_problema_anam: string | null;

  revision_orgsis_anam: any | null;    // JSON
  signos_vitales_anam: any | null;     // JSON
  examen_fisico_anam: any | null;      // JSON

  analisis_anam: string | null;
  plan_tratamiento_anam: string | null;
}


export interface AnamnesisDiagnostico {
  pk_anamdiag: number;

  fk_anam_hosp: number | null;     // puede ser NULL
  fk_anam_ce: number | null;       // puede ser NULL

  fk_cie: number;                  // siempre requerido

  fecha_creacion_anamdiag: any | null;
  fecha_modificacion_anamdiag: any | null;

  tipo_anamdiag: string;           // texto: DP, DS, CE, etc.
}
