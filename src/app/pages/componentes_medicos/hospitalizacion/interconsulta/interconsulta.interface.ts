export interface InterconsultaSolicitud {
  pk_intersol: number;                         // serial4 (PK)
  fecha_creacion_intersol: any;               // json NOT NULL
  fecha_modificacion_intersol: any | null;    // json NULL

  fecha_inicio: string;                       // date (YYYY-MM-DD)
  hora_inicio: string;                        // time (HH:mm:ss o HH:mm)

  fecha_fin: string | null;                   // date NULL
  hora_fin: string | null;                    // time NULL

  casalud_id_fk: number;                      // int8 NOT NULL
  fk_hcu: number;                             // int8 NOT NULL
  medico_usu_id_fk: number;                   // int8 NOT NULL

  caracteristicas_solicitud_intersol: any | null; // json NULL

  cuadro_clinico_intersol: string | null;     // text NULL
  resultados_examenes_intersol: string | null;// text NULL
  plan_terapeutico_intersol: string | null;   // text NULL
}


export interface InterconsultaRespuesta {
  pk_interresp: number;                        // serial4 (PK)

  fecha_creacion_interresp: any;               // json NOT NULL
  fecha_modificacion_interresp: any | null;    // json NULL

  fecha_inicio: string;                        // date (YYYY-MM-DD)
  hora_inicio: string;                         // time (HH:mm or HH:mm:ss)

  fecha_fin: string | null;                    // date NULL
  hora_fin: string | null;                     // time NULL

  casalud_id_fk: number;                       // int8 NOT NULL
  fk_hcu: number;                              // int8 NOT NULL
  medico_usu_id_fk: number;                    // int8 NOT NULL

  fk_intersol: number | null;                  // int8 (FK a interconsulta_solicitud)

  cuadro_clinico_interresp: string | null;     // text NULL
  resultados_criterio_interresp: string | null;// text NULL
  plan_diagnostico_interresp: string | null;   // text NULL
  plan_terapeutico_interresp: string | null;   // text NULL
}

export interface InterconsultaDiagnostico {
  pk_interdiag: number;                     // serial4 (PK)

  fk_interconsulta: number;                 // int8 NOT NULL  (FK a solicitud o respuesta)
  tipo_interconsulta: 'S' | 'R';            // text NOT NULL  CHECK (S = Solicitud, R = Respuesta)

  fk_cie: number;                           // int8 NOT NULL  (CIE-10)

  fecha_creacion_interdiag: any | null;     // json NULL
  fecha_modificacion_interdiag: any | null; // json NULL

  tipo_interdiag: string;                   // text NOT NULL (DP, DS, CE, etc.)
}
